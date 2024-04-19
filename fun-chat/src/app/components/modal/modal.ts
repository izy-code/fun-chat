import './modal.scss';
import BaseComponent from '@/app/components/base-component';
import { div, h2 } from '@/app/components/tags';
import ButtonComponent from '@/app/components/button/button';
import EventEmitter from '@/app/common/event-emitter';
import CustomEventName from '@/app/custom-events';

const OPACITY_TRANSITION_TIME_MS = 600;
const OPACITY_DELAY_MS = 10;

export default class ModalComponent extends BaseComponent {
  private confirmButton: BaseComponent<HTMLButtonElement>;

  private contentComponent: BaseComponent<HTMLDivElement>;

  private description: BaseComponent<HTMLHeadingElement>;

  constructor() {
    super({ className: 'modal modal--closed' });

    this.description = h2('modal__description', '');

    this.confirmButton = ButtonComponent({
      className: 'modal__button button',
      textContent: 'OK',
      buttonType: 'button',
      clickHandler: this.closeModal,
    });

    this.contentComponent = div({ className: 'modal__content' }, this.description, this.confirmButton);

    this.append(this.contentComponent);

    EventEmitter.on(CustomEventName.SOCKET_STATE_CHANGE, this.onSocketDisconnect);
    EventEmitter.on(CustomEventName.MODAL_ERROR, this.onAuthError);
  }

  private onSocketDisconnect = (isSocketOpened: boolean): void => {
    if (!isSocketOpened) {
      this.description.setTextContent('Server connection lost. Reconnecting...');
      this.confirmButton.getNode().style.display = 'none';
      this.contentComponent.addClass('modal__content--reconnect');

      this.showModal();
    } else {
      this.closeModal();
    }
  };

  private onAuthError = (errorText: string): void => {
    if (!this.contentComponent.hasClass('modal__content--reconnect')) {
      const capitalizedText = errorText.charAt(0).toUpperCase() + errorText.slice(1);

      this.description.setTextContent(capitalizedText);
      this.confirmButton.getNode().style.display = '';
      this.confirmButton.getNode().focus();

      document.addEventListener('keydown', this.onDocumentEscapeKeydown);
      this.getNode().addEventListener('click', this.onModalClick);

      this.showModal();
    }
  };

  private showModal = (): void => {
    setTimeout(() => {
      this.addClass('modal--opaque');
    }, OPACITY_DELAY_MS);

    this.removeClass('modal--closed');
    document.body.classList.add('no-scroll');
  };

  private closeModal = (): void => {
    this.removeClass('modal--opaque');

    setTimeout(() => {
      this.addClass('modal--closed');
      document.body.classList.remove('no-scroll');
      this.contentComponent.removeClass('modal__content--reconnect');
      document.removeEventListener('keydown', this.onDocumentEscapeKeydown);
      this.getNode().removeEventListener('click', this.onModalClick);
    }, OPACITY_TRANSITION_TIME_MS);
  };

  private onDocumentEscapeKeydown = (evt: KeyboardEvent): void => {
    if (evt.key === 'Escape') {
      this.closeModal();
    }
  };

  private onModalClick = (evt: Event): void => {
    if (!evt.composedPath().includes(this.contentComponent.getNode())) {
      this.closeModal();
    }
  };
}
