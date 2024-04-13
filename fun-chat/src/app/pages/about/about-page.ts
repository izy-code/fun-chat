import './about-page.scss';
import '@/app/components/button/button.scss';
import { a, h1, main, p } from '@/app/components/tags';
import type LocalStorage from '@/app/utils/session-storage';
import type Router from '@/app/router/router';
import Pages from '@/app/router/pages';
import PageComponent from '@/app/components/page-component';

export default class AboutPageComponent extends PageComponent {
  constructor(router: Router, storage: LocalStorage) {
    super(router, storage);

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

    const returnLink = a({
      className: 'about-page__return-link button button--continue',
      href: `#${Pages.EMPTY}`,
      textContent: `Return to previous page`,
    });

    const mainComponent = main({ className: 'about-page__main' }, heading, description, gitLink, returnLink);

    this.append(mainComponent);
  }
}
