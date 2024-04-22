import CustomEventName from '../custom-events';
import type { ContactData, Message } from '../interfaces';
import deepMerge from '../utils/deep-merge';
import EventEmitter from './event-emitter';
import SessionStorage from './session-storage';

export default class State {
  private static isSocketOpened = false;

  private static selectedContact: string | null = null;

  private static isSelectedContactOnline = false;

  private static contactsData = new Map<string, ContactData>();

  public static getContactsData = (): Map<string, ContactData> => State.contactsData;

  public static getSelectedContactData = (): ContactData | null => {
    if (State.selectedContact) {
      return State.contactsData.get(State.selectedContact) || null;
    }

    return null;
  };

  public static getSelectedContactLogin = (): string | null => State.selectedContact;

  public static setSelectedContactActivity = (isOnline: boolean): void => {
    this.isSelectedContactOnline = isOnline;
    EventEmitter.emit(CustomEventName.SELECTED_ACTIVITY_CHANGED, isOnline);
  };

  public static getSelectedContactActivity = (): boolean => State.isSelectedContactOnline;

  public static changeSocketState = (isOpened: boolean): void => {
    State.isSocketOpened = isOpened;
    State.clear();
    EventEmitter.emit(CustomEventName.SOCKET_STATE_CHANGE, isOpened);
  };

  public static setContactData = (login: string, data: ContactData): void => {
    if (!State.contactsData.has(login)) {
      State.contactsData.set(login, data);
    } else {
      State.contactsData.set(login, { ...State.contactsData.get(login), ...data });
    }
  };

  public static clear = (): void => {
    State.contactsData.clear();
    State.selectedContact = null;
    State.isSelectedContactOnline = false;
  };

  public static setSelectedContact = (login: string | null): void => {
    const startingState = State.selectedContact;

    if (State.selectedContact && !State.contactsData.has(State.selectedContact)) {
      State.selectedContact = null;
    } else {
      State.selectedContact = login;
    }

    if (State.selectedContact !== startingState) {
      EventEmitter.emit(CustomEventName.SELECTED_LOGIN_CHANGED, State.selectedContact);

      if (State.selectedContact) {
        State.setSelectedContactActivity(State.contactsData.get(State.selectedContact)!.isOnline);
      }
    }
  };

  public static saveMessage = (login: string, savedMessage: Message): void => {
    const contactData = State.contactsData.get(login);

    if (contactData) {
      const { messages } = contactData;
      const insertionIndex = messages?.findIndex((msg) => msg.datetime! > savedMessage.datetime!);

      if (insertionIndex !== -1) {
        messages?.splice(insertionIndex!, 0, savedMessage);
      } else {
        messages?.push(savedMessage);
      }

      if (savedMessage.status?.isReaded === false && savedMessage.to === SessionStorage.getAuthData()?.login) {
        contactData.unreadMessagesCount! += 1;
        EventEmitter.emit(CustomEventName.CONTACTS_UPDATED);
      }
    }

    if (login === State.selectedContact) {
      EventEmitter.emit(CustomEventName.MSG_CONTENT_UPDATED);
    }
  };

  public static updateMessageStatus = (updateMsgData: Message): void => {
    const contactsDataKeys = Object.keys(State.contactsData);

    for (let i = 0; i < contactsDataKeys.length; i += 1) {
      const login = contactsDataKeys[i]!;
      const contactData = State.contactsData.get(login)!;
      const messages = contactData.messages || [];

      for (let j = 0; j < messages.length; j += 1) {
        const foundMsg = messages[j]!;

        if (foundMsg.id === updateMsgData.id) {
          deepMerge(foundMsg, updateMsgData);

          if (foundMsg.status?.isReaded !== updateMsgData.status?.isReaded) {
            contactData.unreadMessagesCount! += updateMsgData.status?.isReaded ? -1 : 1;
            EventEmitter.emit(CustomEventName.CONTACTS_UPDATED);
          }

          if (login === State.selectedContact) {
            EventEmitter.emit(CustomEventName.MSG_CONTENT_UPDATED);
          }

          return;
        }
      }
    }
  };

  public static refillContactMsgHistory = (login: string, messages: Message[]): void => {
    const contactData = State.contactsData.get(login);

    if (contactData) {
      const unreadMessagesCount = messages.filter(
        (message) => !message.status?.isReaded && message.from === login,
      ).length;

      contactData.messages = messages;

      if (unreadMessagesCount !== contactData.unreadMessagesCount) {
        contactData.unreadMessagesCount = unreadMessagesCount;
        EventEmitter.emit(CustomEventName.CONTACTS_UPDATED);
      }
    }

    if (login === State.selectedContact) {
      EventEmitter.emit(CustomEventName.MSG_CONTENT_UPDATED);
    }
  };
}
