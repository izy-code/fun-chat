import CustomEventName from '../custom-events';
import type { ContactData, SocketMessage } from '../interfaces';
import EventEmitter from './event-emitter';

export default class State {
  private static isSocketOpened = false;

  private static sentSocketMessages = new Array<SocketMessage>();

  private static receivedSocketMessages = new Array<SocketMessage>();

  private static contactsData = new Map<string, ContactData>();

  private static unsentData = new Map<string, string>();

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
  };

  public static clearUnsentData = (): void => {
    State.unsentData.clear();
  };
}
