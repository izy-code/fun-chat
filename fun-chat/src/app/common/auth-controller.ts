import CustomEventName from '../custom-events';
import SocketMessageType from '../enums';
import type { SocketMessage } from '../interfaces';
import Page from '../router/pages';
import { createSocketMessage } from '../utils/helpers';
import SessionStorage from './session-storage';
import EventEmitter from './event-emitter';
import SocketHandler from './socket-handler';
import ContactsController from './contacts-controller';

const socketHandler = SocketHandler.getInstance();

export default class AuthController {
  public static loginHandler = (authRequest: SocketMessage): void => {
    const authResponseHandler = AuthController.createAuthResponseHandler(authRequest);

    EventEmitter.on(CustomEventName.SOCKET_MSG_RECEIVED, authResponseHandler);
    socketHandler.send(authRequest);
  };

  public static logoutHandler = (): void => {
    const authData = SessionStorage.getAuthData();

    if (authData) {
      const logoutRequest = createSocketMessage({ user: authData }, SocketMessageType.LOGOUT_CURRENT);
      const logoutResponseHandler = AuthController.createLogoutResponseHandler(logoutRequest);

      EventEmitter.on(CustomEventName.SOCKET_MSG_RECEIVED, logoutResponseHandler);
      socketHandler.send(logoutRequest);
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

  private static createAuthResponseHandler = (authRequest: SocketMessage): ((msg: SocketMessage) => void) =>
    function authReceiveHandler(response: SocketMessage) {
      if (response.id === authRequest.id) {
        EventEmitter.off(CustomEventName.SOCKET_MSG_RECEIVED, authReceiveHandler);

        if (response.type === SocketMessageType.ERROR) {
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

          EventEmitter.emit(CustomEventName.MODAL_ERROR, response.payload?.error);
        } else {
          const authData = authRequest.payload?.user;

          if (authData) {
            SessionStorage.setAuthData(authData);

            if (window.location.hash === `#${Page.LOGIN}`) {
              window.location.hash = `#${Page.CHAT}`;
            }

            ContactsController.contactsRequestHandler();
          }
        }
      }
    };

  private static createLogoutResponseHandler = (logoutRequest: SocketMessage): ((msg: SocketMessage) => void) =>
    function logoutReceiveHandler(response: SocketMessage) {
      if (response.id === logoutRequest.id) {
        EventEmitter.off(CustomEventName.SOCKET_MSG_RECEIVED, logoutReceiveHandler);

        if (response.type === SocketMessageType.ERROR) {
          EventEmitter.emit(CustomEventName.MODAL_ERROR, response.payload?.error);
        } else {
          SessionStorage.clearAppData();
          window.location.hash = `#${Page.LOGIN}`;
        }
      }
    };
}

EventEmitter.on(CustomEventName.SOCKET_STATE_CHANGE, AuthController.socketOpenedHandler);
