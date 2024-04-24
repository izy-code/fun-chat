import CustomEventName from '../custom-events';
import type { SocketMessage } from '../interfaces';
import EventEmitter from './event-emitter';
import State from './state';

const BASE_URL = 'ws://127.0.0.1:4000';
const RESEND_DELAY_MS = 1500;

export default class SocketHandler {
  private static singleInstance = new SocketHandler();

  private socket: WebSocket | null = null;

  private unsentMessages = new Array<SocketMessage>();

  private resendingIntervalId: NodeJS.Timeout | null = this.setResendingInterval();

  private constructor() {
    this.initSocket();
  }

  public static getInstance = (): SocketHandler => SocketHandler.singleInstance;

  public send = (request: SocketMessage): boolean => {
    if (this.socket !== null && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(request));
      EventEmitter.emit(CustomEventName.SOCKET_MSG_SENT, request);

      return true;
    }

    this.unsentMessages.push(request);

    if (!this.resendingIntervalId) {
      this.resendingIntervalId = this.setResendingInterval();
    }

    return false;
  };

  private setResendingInterval(): NodeJS.Timeout {
    return setInterval(() => {
      this.unsentMessages = this.unsentMessages.filter((message) => this.send(message) === false);

      if (this.resendingIntervalId !== null && this.unsentMessages.length === 0) {
        clearInterval(this.resendingIntervalId);
        this.resendingIntervalId = null;
      }
    }, RESEND_DELAY_MS);
  }

  private addListenersToOpenedSocket = (openedSocket: WebSocket): void => {
    openedSocket.addEventListener('message', (response: MessageEvent<string>) => {
      const parsedResponse = JSON.parse(response.data) as SocketMessage;

      EventEmitter.emit(CustomEventName.SOCKET_MSG_RECEIVED, parsedResponse);
    });
    openedSocket.addEventListener('close', () => {
      SocketHandler.handleSocketStateChange(false);

      this.initSocket();
    });
  };

  private initSocket = (): void => {
    const socket = new WebSocket(BASE_URL);

    socket.addEventListener('open', () => {
      this.socket = socket;
      this.addListenersToOpenedSocket(socket);

      SocketHandler.handleSocketStateChange(true);
    });
    socket.addEventListener('error', () => {
      SocketHandler.handleSocketStateChange(false);

      this.initSocket();
    });
  };

  private static handleSocketStateChange = (isOpened: boolean): void => {
    State.clear();
    EventEmitter.emit(CustomEventName.SOCKET_STATE_CHANGE, isOpened);
  };
}
