import CustomEventName from '../custom-events';
import SocketMessageType from '../enums';
import type { SocketMessage } from '../interfaces';
import { createMsgFromUserRequest, createMsgReadRequest, createMsgSendRequest } from '../utils/helpers';
import EventEmitter from './event-emitter';
import SessionStorage from './session-storage';
import SocketHandler from './socket-handler';
import State from './state';

const socketHandler = SocketHandler.getInstance();

export default class DialogueController {
  public static sendBtnClickHandler = (message: string): void => {
    const request = createMsgSendRequest(message);
    const messageSentHandler = DialogueController.createMessageSentHandler(request);

    EventEmitter.on(CustomEventName.SOCKET_MSG_RECEIVED, messageSentHandler);
    socketHandler.send(request);
  };

  private static createMessageSentHandler = (request: SocketMessage): ((msg: SocketMessage) => void) =>
    function messageSentHandler(response: SocketMessage) {
      if (response.id === request.id) {
        EventEmitter.off(CustomEventName.SOCKET_MSG_RECEIVED, messageSentHandler);
      }
    };

  public static messageSendHandler = (response: SocketMessage): void => {
    if (response.type === SocketMessageType.MSG_SEND) {
      const message = response.payload?.message;
      const login = message?.from === SessionStorage.getAuthData()?.login ? message?.to : message?.from;

      State.saveMessage(login!, message!);
    }
  };

  public static messageResponseHandler = (response: SocketMessage): void => {
    let defaultCaseTriggered = false;

    switch (response.type) {
      case SocketMessageType.MSG_DELIVERED:
      case SocketMessageType.MSG_READ:
        break;
      default:
        defaultCaseTriggered = true;
        break;
    }

    if (!defaultCaseTriggered) {
      const message = response.payload?.message;

      if (message && message.from) {
        State.updateMessageStatus(message!);
      }
    }
  };

  public static fetchUserHistory = (userLogin: string): void => {
    const request = createMsgFromUserRequest(userLogin);
    const responseHandler = DialogueController.createHistoryResponseHandler(request, userLogin);

    EventEmitter.on(CustomEventName.SOCKET_MSG_RECEIVED, responseHandler);
    socketHandler.send(request);
  };

  public static fetchAllUsersHistory = (): void => {
    const contactsData = State.getContactsData();

    [...contactsData.keys()].forEach((login) => {
      DialogueController.fetchUserHistory(login);
    });

    EventEmitter.emit(CustomEventName.CONTACTS_UPDATED);
  };

  public static messageReadRequestHandler = (messageId: string): void => {
    const request = createMsgReadRequest(messageId);

    socketHandler.send(request);
  };

  private static createHistoryResponseHandler = (
    request: SocketMessage,
    userLogin: string,
  ): ((msg: SocketMessage) => void) =>
    function historyResponseHandler(response: SocketMessage) {
      if (response.id === request.id) {
        EventEmitter.off(CustomEventName.SOCKET_MSG_RECEIVED, historyResponseHandler);

        const messages = response.payload?.messages;

        if (messages) {
          State.refillContactMsgHistory(userLogin, messages);
        }
      }
    };
}

EventEmitter.on(CustomEventName.SEND_BTN_CLICK, DialogueController.sendBtnClickHandler);
EventEmitter.on(CustomEventName.SOCKET_MSG_RECEIVED, DialogueController.messageResponseHandler);
EventEmitter.on(CustomEventName.SOCKET_MSG_RECEIVED, DialogueController.messageSendHandler);
