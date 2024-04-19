import './chat-page.scss';
import PageComponent from '@/app/components/page-component';
import type Router from '@/app/router/router';
import ChatHeaderComponent from './header/chat-header';
import ChatMainComponent from './main/chat-main';
import ChatFooterComponent from './footer/chat-footer';
import ModalComponent from '@/app/components/modal/modal';

export default class ChatPageComponent extends PageComponent {
  constructor(router: Router) {
    super(router);

    this.addClass('chat-page');

    const header = new ChatHeaderComponent();
    const main = new ChatMainComponent();
    const footer = new ChatFooterComponent();
    const modal = new ModalComponent();

    this.appendChildren([header, main, footer, modal]);
  }
}
