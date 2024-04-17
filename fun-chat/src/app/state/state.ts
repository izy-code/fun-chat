import type { SocketMessage } from '../interfaces';

export default class State {
  public static isSocketOpened = false;

  private static sentSocketMessages = new Array<SocketMessage>();

  private static receivedSocketMessages = new Array<SocketMessage>();

  public static saveSentMessage = (message: SocketMessage): void => {
    State.sentSocketMessages.push(message);
  };

  public static saveReceivedMessage = (message: SocketMessage): void => {
    State.receivedSocketMessages.push(message);
  };
}
