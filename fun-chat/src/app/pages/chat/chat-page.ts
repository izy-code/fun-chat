import './chat-page.scss';
import PageComponent from '@/app/components/page-component';
import type Router from '@/app/router/router';
import type SessionStorage from '@/app/utils/session-storage';
import ChatHeaderComponent from './header/chat-header';
import ChatMainComponent from './main/chat-main';
import ChatFooterComponent from './footer/chat-footer';

export default class ChatPageComponent extends PageComponent {
  constructor(router: Router, storage: SessionStorage) {
    super(router, storage);

    this.addClass('chat-page');

    const header = new ChatHeaderComponent(storage);
    const main = new ChatMainComponent();
    const footer = new ChatFooterComponent();

    this.appendChildren([header, main, footer]);
  }
}
