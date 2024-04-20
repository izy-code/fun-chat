import './chat-main.scss';
import BaseComponent from '@/app/components/base-component';
import ChatContactsComponent from './contacts/chat-contacts';
import ChatDialogueComponent from './dialogue/chat-dialogue';

export default class ChatMainComponent extends BaseComponent {
  constructor() {
    super({ className: 'chat-page__main', tag: 'main' });

    const users = new ChatContactsComponent();
    const dialogue = new ChatDialogueComponent();

    this.appendChildren([users, dialogue]);
  }
}
