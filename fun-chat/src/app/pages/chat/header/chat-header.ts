import BaseComponent from '@/app/components/base-component';
import ButtonComponent from '@/app/components/button/button';
import { a, div, h1, p, span } from '@/app/components/tags';
import type SessionStorage from '@/app/utils/session-storage';
import Page from '@/app/router/pages';

export default class ChatHeaderComponent extends BaseComponent {
  private storage: SessionStorage;

  constructor(storage: SessionStorage) {
    super({ className: 'chat-page__header', tag: 'header' });

    this.storage = storage;

    const userName = span({ className: 'chat-page__user-name', textContent: storage.getAuthData()?.login });
    const userInfo = p({ className: 'chat-page__user-info', textContent: 'User:' }, userName);

    const heading = h1('chat-page__heading', 'Fun chat');

    const aboutLink = a({
      className: 'chat-page__about-link button button--continue',
      href: `#${Page.ABOUT}`,
      textContent: `About`,
    });
    const logoutButton = ButtonComponent({
      className: 'chat-page__logout-button button button--cancel',
      textContent: 'Logout',
      buttonType: 'button',
      clickHandler: this.onLogoutButtonClick,
    });
    const buttons = div({ className: 'chat-page__buttons' }, aboutLink, logoutButton);

    this.appendChildren([userInfo, heading, buttons]);
  }

  private onLogoutButtonClick = (): void => {
    this.storage.clearAppData();
    window.location.hash = `#${Page.LOGIN}`;
  };
}
