import EventEmitter from '@/app/common/event-emitter';
import State from '@/app/common/state';
import BaseComponent from '@/app/components/base-component';
import ButtonComponent from '@/app/components/button/button';
import { input } from '@/app/components/tags';
import CustomEventName from '@/app/custom-events';

export default class DialogueFormComponent extends BaseComponent<HTMLFormElement> {
  private input: BaseComponent<HTMLInputElement>;

  private sendButton: BaseComponent<HTMLButtonElement>;

  private closeButton: BaseComponent<HTMLButtonElement>;

  private editedMessageId: string | null = null;

  constructor() {
    super({ className: 'dialogue__form', tag: 'form' });

    this.input = input({ className: 'dialogue__input', type: 'text', placeholder: 'Message', required: true });
    this.sendButton = ButtonComponent({
      className: 'dialogue__button button',
      textContent: 'Send',
      buttonType: 'submit',
    });
    this.closeButton = ButtonComponent({
      className: 'dialogue__close-button button button--cancel',
      textContent: 'X',
      buttonType: 'button',
    });

    this.sendButton.getNode().disabled = true;

    this.appendChildren([this.input, this.closeButton, this.sendButton]);

    this.sendButton.addListener('click', (evt) => {
      evt.preventDefault();

      if (this.editedMessageId) {
        EventEmitter.emit(CustomEventName.SEND_EDITED_BTN_CLICK, {
          id: this.editedMessageId,
          text: this.input.getNode().value,
        });
      } else {
        EventEmitter.emit(CustomEventName.SEND_BTN_CLICK, this.input.getNode().value);
      }

      this.initForm();
    });

    this.initForm();
    this.addListeners();
  }

  private addListeners = (): void => {
    this.input.addListener('input', () => {
      const message = this.input.getNode().value;

      this.sendButton.getNode().disabled = !message;
    });
    this.closeButton.addListener('click', this.initForm);
    EventEmitter.on(CustomEventName.SELECTED_LOGIN_CHANGED, this.initForm);
    EventEmitter.on(CustomEventName.EDIT_BTN_CLICK, this.editModeInit);
    window.addEventListener(
      'popstate',
      () => {
        EventEmitter.off(CustomEventName.SELECTED_LOGIN_CHANGED, this.initForm);
        EventEmitter.off(CustomEventName.EDIT_BTN_CLICK, this.editModeInit);
      },
      { once: true },
    );
  };

  private initForm = (): void => {
    this.input.getNode().value = '';
    this.sendButton.setAttribute('disabled', '');
    this.closeButton.removeClass('dialogue__close-button--shown');
    this.editedMessageId = null;

    if (State.getSelectedContactLogin()) {
      this.input.removeAttribute('disabled');
      this.input.getNode().focus();
    } else {
      this.input.setAttribute('disabled', '');
    }
  };

  private editModeInit = ({ id, text }: { id: string; text: string }): void => {
    this.closeButton.addClass('dialogue__close-button--shown');
    this.editedMessageId = id;
    this.input.getNode().value = text;
    this.input.getNode().focus();
  };
}
