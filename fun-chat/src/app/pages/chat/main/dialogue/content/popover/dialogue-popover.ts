import EventEmitter from '@/app/common/event-emitter';
import BaseComponent from '@/app/components/base-component';
import ButtonComponent from '@/app/components/button/button';
import CustomEventName from '@/app/custom-events';

export default class DialoguePopoverComponent extends BaseComponent<HTMLDivElement> {
  private deleteButton: BaseComponent<HTMLButtonElement>;

  private editButton: BaseComponent<HTMLButtonElement>;

  private parentElement: HTMLElement;

  constructor(parentElement: HTMLElement) {
    super({ className: 'dialogue__popover', tag: 'div' });

    this.parentElement = parentElement;

    this.deleteButton = ButtonComponent({
      className: 'dialogue__delete-button button button--cancel',
      textContent: 'Delete',
      buttonType: 'button',
      clickHandler: this.onDeleteButtonClick,
    });
    this.editButton = ButtonComponent({
      className: 'dialogue__edit-button button',
      textContent: 'Edit',
      buttonType: 'button',
      clickHandler: this.onEditButtonClick,
    });

    this.getNode().style.top = `${parentElement.offsetTop - parentElement.offsetTop}px`;

    this.appendChildren([this.editButton, this.deleteButton]);
  }

  private onEditButtonClick = (): void => {
    const messageText = this.parentElement.querySelector('.message-item__text')?.textContent;

    EventEmitter.emit(CustomEventName.EDIT_BTN_CLICK, { id: this.parentElement.dataset.id, text: messageText });
    this.removeNode();
  };

  private onDeleteButtonClick = (): void => {
    EventEmitter.emit(CustomEventName.DELETE_BTN_CLICK, this.parentElement.dataset.id);
    this.removeNode();
  };
}
