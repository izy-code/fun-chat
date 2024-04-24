import CustomEventName from '../custom-events';
import type { ContactData, Message } from '../interfaces';
import deepMerge from '../utils/deep-merge';
import EventEmitter from './event-emitter';
import SessionStorage from './session-storage';

export default class State {
  private static selectedContactLogin: string | null = null;

  private static isSelectedContactOnline = false;

  private static contactsData = new Map<string, ContactData>();

  public static getSelectedContactLogin = (): string | null => State.selectedContactLogin;

  public static getSelectedContactActivity = (): boolean => State.isSelectedContactOnline;

  public static setSelectedContactActivity = (isOnline: boolean): void => {
    State.isSelectedContactOnline = isOnline;
    EventEmitter.emit(CustomEventName.SELECTED_ACTIVITY_CHANGED, isOnline);
  };

  public static getSelectedContactData = (): ContactData | null => {
    if (State.selectedContactLogin) {
      return State.contactsData.get(State.selectedContactLogin) || null;
    }

    return null;
  };

  public static setContactData = (login: string, data: ContactData): void => {
    if (!State.contactsData.has(login)) {
      State.contactsData.set(login, { ...data, unreadMessagesCount: 0, messages: [] });
    } else {
      State.contactsData.set(login, { ...State.contactsData.get(login), ...data });
    }
  };

  public static getContactsData = (): Map<string, ContactData> => State.contactsData;

  public static setSelectedContact = (login: string | null): void => {
    const startingState = State.selectedContactLogin;

    if (State.selectedContactLogin && !State.contactsData.has(State.selectedContactLogin)) {
      State.selectedContactLogin = null;
    } else {
      State.selectedContactLogin = login;
    }

    if (State.selectedContactLogin !== startingState) {
      EventEmitter.emit(CustomEventName.SELECTED_LOGIN_CHANGED, State.selectedContactLogin);

      if (State.selectedContactLogin) {
        State.setSelectedContactActivity(State.contactsData.get(State.selectedContactLogin)!.isOnline);
      }
    }
  };

  public static clear = (): void => {
    State.contactsData.clear();
    State.setSelectedContact(null);
    State.setSelectedContactActivity(false);
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

    if (login === State.selectedContactLogin) {
      EventEmitter.emit(CustomEventName.MSG_CONTENT_UPDATED);
    }
  };

  public static updateMessage = (updateMsgData: Message, sentMessage = true): void => {
    const contactsDataKeys = [...State.contactsData.keys()];

    for (let i = 0; i < contactsDataKeys.length; i += 1) {
      const login = contactsDataKeys[i]!;
      const contactData = State.contactsData.get(login)!;
      const messages = contactData.messages || [];

      for (let j = 0; j < messages.length; j += 1) {
        const foundMsg = messages[j]!;

        if (foundMsg.id === updateMsgData.id) {
          deepMerge(foundMsg, updateMsgData);

          if (login === State.selectedContactLogin && sentMessage) {
            EventEmitter.emit(CustomEventName.MSG_CONTENT_UPDATED);
          }

          return;
        }
      }
    }
  };

  public static updateMessagesOnRead(readMessages: Message[]): void {
    readMessages.forEach((message) => {
      State.updateMessage(message, false);
    });
    EventEmitter.emit(CustomEventName.MSG_CONTENT_UPDATED);
  }

  public static replaceContactMessages = (login: string, messages: Message[]): void => {
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

    if (login === State.selectedContactLogin) {
      EventEmitter.emit(CustomEventName.MSG_CONTENT_UPDATED);
    }
  };

  public static deleteMessage = (deletedMessage: Message): void => {
    const contactsDataKeys = [...State.contactsData.keys()];

    for (let i = 0; i < contactsDataKeys.length; i += 1) {
      const login = contactsDataKeys[i]!;
      const contactData = State.contactsData.get(login)!;
      const messages = contactData.messages || [];

      for (let j = 0; j < messages.length; j += 1) {
        const foundMsg = messages[j]!;

        if (foundMsg.id === deletedMessage.id) {
          messages.splice(j, 1);

          if (login === State.selectedContactLogin) {
            EventEmitter.emit(CustomEventName.MSG_CONTENT_UPDATED);
          }

          if (!foundMsg.status?.isReaded) {
            contactData.unreadMessagesCount! -= 1;
            EventEmitter.emit(CustomEventName.CONTACTS_UPDATED);
          }

          return;
        }
      }
    }
  };
}
