import './chat-main.scss';
import BaseComponent from '@/app/components/base-component';
import { section } from '@/app/components/tags';

export default class ChatMainComponent extends BaseComponent {
  constructor() {
    super({ className: 'chat-page__main', tag: 'main' });

    const users = section({ className: 'chat-page__users' });
    const dialogue = section({ className: 'chat-page__dialogue' });

    this.appendChildren([users, dialogue]);
  }
}
