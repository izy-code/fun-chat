import BaseComponent from '@/app/components/base-component';
import ButtonComponent from '@/app/components/button/button';
import { a, div, h1, p, span } from '@/app/components/tags';
import Page from '@/app/router/pages';
import AuthController from '@/app/common/auth-controller';
import SessionStorage from '@/app/common/session-storage';

export default class ChatHeaderComponent extends BaseComponent {
  constructor() {
    super({ className: 'chat-page__header', tag: 'header' });

    const userName = span({ className: 'chat-page__user-name', textContent: SessionStorage.getAuthData()?.login });
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
      clickHandler: ChatHeaderComponent.onLogoutButtonClick,
    });
    const buttons = div({ className: 'chat-page__buttons' }, aboutLink, logoutButton);

    this.appendChildren([userInfo, heading, buttons]);
  }

  private static onLogoutButtonClick = (): void => {
    AuthController.logoutHandler();
  };
}
