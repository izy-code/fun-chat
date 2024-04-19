import './about-page.scss';
import '@/app/components/button/button.scss';
import { a, h1, main, p } from '@/app/components/tags';
import type Router from '@/app/router/router';
import Pages from '@/app/router/pages';
import PageComponent from '@/app/components/page-component';
import ModalComponent from '@/app/components/modal/modal';
import ButtonComponent from '@/app/components/button/button';
import SessionStorage from '@/app/common/session-storage';

export default class AboutPageComponent extends PageComponent {
  constructor(router: Router) {
    super(router);

    this.addClass('about-page');

    const heading = h1('about-page__heading', 'Fun chat');

    const description = p({
      className: 'about-page__description',
      textContent:
        'The application is a client for a chat service that operates over WebSocket. The client application enables users to send messages, view chat history, and also allows senders to delete and edit messages.\nPlease note, chat also requires a separate local server to be running for its functionality. This server handles chat features, message storage, and user management.',
    });

    const gitLink = a({
      className: 'about-page__git-link',
      href: 'https://github.com/izy-code',
      textContent: `izy-code`,
      target: '_blank',
    });

    const returnLink = ButtonComponent({
      className: 'about-page__return-button button button--continue',
      textContent: `Return to previous page`,
      buttonType: 'button',
      clickHandler: this.onReturnButtonClick,
    });

    const mainComponent = main({ className: 'about-page__main' }, heading, description, gitLink, returnLink);

    const modal = new ModalComponent();

    this.appendChildren([mainComponent, modal]);
  }

  private onReturnButtonClick = (): void => {
    if (SessionStorage.getAuthData()) {
      this.router.navigate(`#${Pages.CHAT}`);
    } else {
      this.router.navigate(`#${Pages.LOGIN}`);
    }
  };
}
