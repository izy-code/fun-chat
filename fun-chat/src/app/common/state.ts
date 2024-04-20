import CustomEventName from '../custom-events';
import type { ContactData, SocketMessage } from '../interfaces';
import EventEmitter from './event-emitter';

export default class State {
  private static isSocketOpened = false;

  private static selectedContact: string | null = null;

  private static isSelectedContactOnline = false;

  private static sentSocketMessages = new Array<SocketMessage>();

  private static receivedSocketMessages = new Array<SocketMessage>();

  private static contactsData = new Map<string, ContactData>();

  public static getContactsData = (): Map<string, ContactData> => State.contactsData;

  public static changeSocketState = (isOpened: boolean): void => {
    State.isSocketOpened = isOpened;
    State.clear();
    EventEmitter.emit(CustomEventName.SOCKET_STATE_CHANGE, isOpened);
  };

  public static saveSentMessage = (message: SocketMessage): void => {
    State.sentSocketMessages.push(message);
    EventEmitter.emit(CustomEventName.SOCKET_MSG_SENT, message);
  };

  public static saveReceivedMessage = (message: SocketMessage): void => {
    State.receivedSocketMessages.push(message);
    EventEmitter.emit(CustomEventName.SOCKET_MSG_RECEIVED, message);
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
    State.sentSocketMessages = [];
    State.receivedSocketMessages = [];
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

  public static getSelectedContactLogin = (): string | null => State.selectedContact;

  public static setSelectedContactActivity = (isOnline: boolean): void => {
    this.isSelectedContactOnline = isOnline;
    EventEmitter.emit(CustomEventName.SELECTED_ACTIVITY_CHANGED, isOnline);
  };

  public static getSelectedContactActivity = (): boolean => State.isSelectedContactOnline;
}
