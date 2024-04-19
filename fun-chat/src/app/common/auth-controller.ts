import CustomEventName from '../custom-events';
import SocketMessageType from '../enums';
import type { SocketMessage } from '../interfaces';
import Page from '../router/pages';
import { createSocketMessage } from '../utils/helpers';
import SessionStorage from './session-storage';
import EventEmitter from './event-emitter';
import SocketHandler from './socket-handler';

const socketHandler = SocketHandler.getInstance();

export default class AuthController {
  public static loginHandler = (authSocketMessage: SocketMessage): void => {
    const authReceiveHandler = AuthController.createAuthReceiveHandler(authSocketMessage);

    EventEmitter.on(CustomEventName.SOCKET_MSG_RECEIVED, authReceiveHandler);
    socketHandler.send(authSocketMessage);
  };

  public static logoutHandler = (): void => {
    const authData = SessionStorage.getAuthData();

    if (authData) {
      const logoutSocketMessage = createSocketMessage({ user: authData }, SocketMessageType.LOGOUT_CURRENT);
      const logoutReceiveHandler = AuthController.createLogoutReceiveHandler(logoutSocketMessage);

      EventEmitter.on(CustomEventName.SOCKET_MSG_RECEIVED, logoutReceiveHandler);
      socketHandler.send(logoutSocketMessage);
    }
  };

  public static socketOpenedHandler = (isSocketOpened: boolean): void => {
    if (isSocketOpened) {
      const authData = SessionStorage.getAuthData();

      if (authData) {
        AuthController.loginHandler(createSocketMessage({ user: authData }, SocketMessageType.LOGIN_CURRENT));
      } else if (window.location.hash === `#${Page.CHAT}`) {
        window.location.hash = `#${Page.LOGIN}`;
      }
    }
  };

  private static createAuthReceiveHandler = (authSocketMessage: SocketMessage): ((msg: SocketMessage) => void) =>
    function authReceiveHandler(receivedMessage: SocketMessage) {
      if (receivedMessage.id === authSocketMessage.id) {
        EventEmitter.off(CustomEventName.SOCKET_MSG_RECEIVED, authReceiveHandler);

        if (receivedMessage.type === SocketMessageType.ERROR) {
          if (SessionStorage.getAuthData()) {
            SessionStorage.clearAppData();
            setTimeout(
              () =>
                EventEmitter.emit(
                  CustomEventName.MODAL_ERROR,
                  'After tab duplication, you need to log\u00A0in again.\nTwo clients cannot have the\u00A0same\u00A0login.',
                ),
              600,
            );
          }

          if (window.location.hash === `#${Page.CHAT}`) {
            window.location.hash = `#${Page.LOGIN}`;
          }

          EventEmitter.emit(CustomEventName.MODAL_ERROR, receivedMessage.payload?.error);
        } else {
          const authData = authSocketMessage.payload?.user;

          if (authData) {
            SessionStorage.setAuthData(authData);

            if (window.location.hash === `#${Page.LOGIN}`) {
              window.location.hash = `#${Page.CHAT}`;
            }
          }
        }
      }
    };

  private static createLogoutReceiveHandler = (logoutSocketMessage: SocketMessage): ((msg: SocketMessage) => void) =>
    function logoutReceiveHandler(receivedMessage: SocketMessage) {
      if (receivedMessage.id === logoutSocketMessage.id) {
        EventEmitter.off(CustomEventName.SOCKET_MSG_RECEIVED, logoutReceiveHandler);

        if (receivedMessage.type === SocketMessageType.ERROR) {
          EventEmitter.emit(CustomEventName.MODAL_ERROR, receivedMessage.payload?.error);
        } else {
          SessionStorage.clearAppData();
          window.location.hash = `#${Page.LOGIN}`;
        }
      }
    };
}

EventEmitter.on(CustomEventName.SOCKET_STATE_CHANGE, AuthController.socketOpenedHandler);
