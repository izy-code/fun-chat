import BaseComponent from '@/app/components/base-component';
import { div, span } from '@/app/components/tags';

export default class ChatContactComponent extends BaseComponent<HTMLLIElement> {
  public isOnline = false;

  public count = 0;

  public login = '';

  constructor(login: string, isActive: boolean, count: number) {
    super({ className: 'chat-page__contact', tag: 'li' });

    this.count = count;
    this.isOnline = isActive;
    this.login = login;

    const indicatorComponent = div({ className: 'chat-page__contact-indicator' });
    const loginComponent = span({ className: 'chat-page__contact-name', textContent: login });
    const counterComponent = span({ className: 'chat-page__contact-counter', textContent: count.toString() });

    this.setAttribute('data-login', login);

    if (this.isOnline) {
      indicatorComponent.addClass('chat-page__contact-indicator--online');
    }

    if (this.count > 0) {
      counterComponent.addClass('chat-page__contact-counter--shown');
    }

    this.appendChildren([indicatorComponent, loginComponent, counterComponent]);
  }
}
