import CustomEventName from '../custom-events';
import type { SocketMessage } from '../interfaces';
import EventEmitter from './event-emitter';

export default class State {
  private static isSocketOpened = false;

  private static sentSocketMessages = new Array<SocketMessage>();

  private static receivedSocketMessages = new Array<SocketMessage>();

  public static changeSocketState = (isOpened: boolean): void => {
    State.isSocketOpened = isOpened;
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
}
