import EventEmitter from '@/app/common/event-emitter';
import State from '@/app/common/state';
import BaseComponent from '@/app/components/base-component';
import ButtonComponent from '@/app/components/button/button';
import { input } from '@/app/components/tags';
import CustomEventName from '@/app/custom-events';

export default class DialogueFormComponent extends BaseComponent<HTMLFormElement> {
  private input: BaseComponent<HTMLInputElement>;

  private button: BaseComponent<HTMLButtonElement>;

  constructor() {
    super({ className: 'dialogue__form', tag: 'form' });

    this.input = input({ className: 'dialogue__input', type: 'text', placeholder: 'Message', required: true });
    this.button = ButtonComponent({ className: 'dialogue__button button', textContent: 'Send', buttonType: 'submit' });

    this.button.getNode().disabled = true;

    this.appendChildren([this.input, this.button]);

    this.button.addListener('click', (evt) => {
      evt.preventDefault();
      EventEmitter.emit(CustomEventName.SEND_BTN_CLICK, this.input.getNode().value);
      this.input.getNode().value = '';
      this.input.getNode().focus();
    });

    this.input.addListener('input', () => {
      const message = this.input.getNode().value;

      this.button.getNode().disabled = !message;
    });

    EventEmitter.on(CustomEventName.SELECTED_LOGIN_CHANGED, this.initForm);
    window.addEventListener(
      'popstate',
      () => {
        EventEmitter.on(CustomEventName.SELECTED_LOGIN_CHANGED, this.initForm);
      },
      { once: true },
    );
  }

  private initForm = (): void => {
    this.input.getNode().value = '';
    this.button.setAttribute('disabled', '');

    if (State.getSelectedContactLogin()) {
      this.input.removeAttribute('disabled');
      this.input.getNode().focus();
    } else {
      this.input.setAttribute('disabled', '');
    }
  };
}
