import type { SocketMessage } from '../interfaces';
import State from '../state/state';

const BASE_URL = 'ws://127.0.0.1:4000';
const RESEND_DELAY_MS = 1500;

export default class SocketHandler {
  private singleInstance = new SocketHandler();

  private socket: WebSocket | null = null;

  private unsentMessages = new Array<SocketMessage>();

  private resendingIntervalId: NodeJS.Timeout | null = this.setResendingInterval();

  private constructor() {
    this.initSocket();
  }

  public getInstance = (): SocketHandler => this.singleInstance;

  public send = (message: SocketMessage): boolean => {
    if (this.socket !== null && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
      State.saveSentMessage(message);

      return true;
    }

    this.unsentMessages.push(message);

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
    openedSocket.addEventListener('message', (message: MessageEvent<string>) => {
      const parsedMessage = JSON.parse(message.data) as SocketMessage;

      State.saveReceivedMessage(parsedMessage);
    });
    openedSocket.addEventListener('close', () => {
      State.isSocketOpened = false;

      this.initSocket();
    });
  };

  private initSocket = (): void => {
    const socket = new WebSocket(BASE_URL);

    socket.addEventListener('open', () => {
      this.socket = socket;
      this.addListenersToOpenedSocket(socket);

      State.isSocketOpened = true;
    });
    socket.addEventListener('error', () => {
      State.isSocketOpened = false;

      this.initSocket();
    });
  };
}
