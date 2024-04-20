import CustomEventName from '../custom-events';
import SocketMessageType from '../enums';
import type { SocketMessage } from '../interfaces';
import { createSocketMessage } from '../utils/helpers';
import EventEmitter from './event-emitter';
import SessionStorage from './session-storage';
import SocketHandler from './socket-handler';
import State from './state';

const NEEDED_USERS_RESPONSES = 2;

const socketHandler = SocketHandler.getInstance();
let usersResponseCount = 0;

export default class ContactsController {
  public static contactsRequestHandler = (): void => {
    usersResponseCount = 0;

    const activeUsersRequest = createSocketMessage(null, SocketMessageType.ACTIVE_USERS);
    const inactiveUsersRequest = createSocketMessage(null, SocketMessageType.INACTIVE_USERS);
    const activeUsersHandler = ContactsController.createUsersResponseHandler(activeUsersRequest);
    const inactiveUsersHandler = ContactsController.createUsersResponseHandler(inactiveUsersRequest);

    EventEmitter.on(CustomEventName.SOCKET_MSG_RECEIVED, activeUsersHandler);
    socketHandler.send(activeUsersRequest);
    EventEmitter.on(CustomEventName.SOCKET_MSG_RECEIVED, inactiveUsersHandler);
    socketHandler.send(inactiveUsersRequest);
  };

  public static externalUserHandler = (response: SocketMessage): void => {
    if (response.type === SocketMessageType.LOGIN_EXTERNAL || response.type === SocketMessageType.LOGOUT_EXTERNAL) {
      const userData = response.payload?.user;

      if (userData) {
        State.setContactData(userData.login, { isOnline: userData.isLogined! });

        if (userData.login === State.getSelectedContactLogin()) {
          State.setSelectedContactActivity(userData.isLogined!);
        }
      }

      EventEmitter.emit(CustomEventName.CONTACTS_UPDATED);
    }
  };

  private static createUsersResponseHandler = (request: SocketMessage): ((msg: SocketMessage) => void) =>
    function usersResponseHandler(response: SocketMessage) {
      if (response.id === request.id) {
        EventEmitter.off(CustomEventName.SOCKET_MSG_RECEIVED, usersResponseHandler);

        const users = response.payload?.users || [];

        users.forEach((user) => {
          if (user.login !== SessionStorage.getAuthData()?.login) {
            State.setContactData(user.login, { isOnline: user.isLogined! });
          }
        });

        EventEmitter.emit(CustomEventName.CONTACTS_UPDATED);
        usersResponseCount += 1;

        if (usersResponseCount === NEEDED_USERS_RESPONSES) {
          ContactsController.contactSelectionHandler(State.getSelectedContactLogin());
        }
      }
    };

  public static contactSelectionHandler = (login: string | null): void => {
    State.setSelectedContact(login);
  };
}

EventEmitter.on(CustomEventName.SOCKET_MSG_RECEIVED, ContactsController.externalUserHandler);
EventEmitter.on(CustomEventName.CONTACT_SELECTION_CLICK, ContactsController.contactSelectionHandler);
