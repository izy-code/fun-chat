import State from '@/app/common/state';
import './chat-contacts.scss';
import BaseComponent from '@/app/components/base-component';
import { input, ul } from '@/app/components/tags';
import ChatContactComponent from './contact/chat-contact';
import EventEmitter from '@/app/common/event-emitter';
import CustomEventName from '@/app/custom-events';

export default class ChatContactsComponent extends BaseComponent {
  public list: BaseComponent<HTMLUListElement>;

  public search: BaseComponent<HTMLInputElement>;

  constructor() {
    super({ className: 'chat-page__contacts', tag: 'section' });

    this.search = input({ className: 'chat-page__search', type: 'text', placeholder: 'Search' });
    this.list = ul({ className: 'chat-page__contacts-list' });

    this.appendChildren([this.search, this.list]);

    EventEmitter.on(CustomEventName.CONTACTS_UPDATED, this.updateContacts);
    this.search.addListener('input', this.updateContacts);
    window.addEventListener(
      'popstate',
      () => {
        EventEmitter.off(CustomEventName.CONTACTS_UPDATED, this.updateContacts);
      },
      { once: true },
    );

    this.updateContacts();
  }

  public updateContacts = (): void => {
    const contactsData = State.getContactsData();
    const contacts = [...contactsData.entries()].map(
      ([login, contactData]) =>
        new ChatContactComponent(login, contactData.isOnline, contactData.unreadMessagesCount || 0),
    );

    let filteredContacts = contacts;

    if (this.search.getNode().value) {
      const filter = this.search.getNode().value.toLowerCase();

      filteredContacts = contacts.filter((contact) => contact.login.toLowerCase().startsWith(filter));
    }

    const sortedContacts = filteredContacts.sort((a, b) => {
      if (a.isOnline === b.isOnline) {
        return a.login.localeCompare(b.login);
      }
      return a.isOnline ? -1 : 1;
    });

    this.list.removeChildren();
    this.list.appendChildren(sortedContacts);
  };
}
