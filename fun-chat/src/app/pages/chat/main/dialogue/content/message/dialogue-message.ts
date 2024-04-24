import './dialogue-message.scss';
import State from '@/app/common/state';
import BaseComponent from '@/app/components/base-component';
import { div, span } from '@/app/components/tags';
import type { Message } from '@/app/interfaces';

export default class DialogueMessageComponent extends BaseComponent<HTMLLIElement> {
  private message: Message;

  constructor(message: Message) {
    super({ className: 'dialogue__item message-item', tag: 'li' });

    this.message = message;

    const fromContent = message.from === State.getSelectedContactLogin() ? message.from : 'You';
    const dateContent = new Date(message.datetime!).toLocaleString();
    const editedContent = message.status?.isEdited ? 'edited' : '';
    let statusContent = 'sent';

    if (message.status?.isReaded) {
      statusContent = 'read';
    } else if (message.status?.isDelivered) {
      statusContent = 'delivered';
    }

    const from = span({ className: 'message-item__from', textContent: fromContent! });
    const time = span({ className: 'message-item__time', textContent: dateContent! });
    const header = div({ className: 'message-item__header' }, from, time);

    const text = div({ className: 'message-item__text', textContent: message.text! });

    const edited = span({ className: 'message-item__edited', textContent: editedContent });
    const status = span({ className: 'message-item__status', textContent: statusContent });
    const footer = div({ className: 'message-item__footer' }, edited, status);
    const container = div({ className: 'message-item__container' }, header, text, footer);

    if (message.to === State.getSelectedContactLogin()) {
      status.addClass('message-item__status--shown');
      this.addClass('message-item--sent');
    }

    this.append(container);

    this.setAttribute('data-id', message.id!);
  }
}
