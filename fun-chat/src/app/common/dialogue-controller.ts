import CustomEventName from '../custom-events';
import SocketMessageType from '../enums';
import type { Message, SocketMessage } from '../interfaces';
import {
  createMsgDeleteRequest,
  createMsgEditRequest,
  createMsgFromUserRequest,
  createMsgReadRequest,
  createMsgSendRequest,
} from '../utils/helpers';
import EventEmitter from './event-emitter';
import SessionStorage from './session-storage';
import SocketHandler from './socket-handler';
import State from './state';

const socketHandler = SocketHandler.getInstance();
let messagesReadCount = 0;
let readMessages: Message[] = [];

export default class DialogueController {
  public static fetchUserHistory = (userLogin: string): void => {
    const request = createMsgFromUserRequest(userLogin);
    const responseHandler = DialogueController.createUserHistoryResponseHandler(request, userLogin);

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

  private static createUserHistoryResponseHandler = (
    request: SocketMessage,
    userLogin: string,
  ): ((response: SocketMessage) => void) =>
    function userHistoryResponseHandler(response: SocketMessage) {
      if (response.id === request.id) {
        EventEmitter.off(CustomEventName.SOCKET_MSG_RECEIVED, userHistoryResponseHandler);

        const messages = response.payload?.messages;

        if (messages) {
          State.replaceContactMessages(userLogin, messages);
        }
      }
    };

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

  public static messageReadHandler = (): void => {
    const contactData = State.getSelectedContactData();

    messagesReadCount = 0;
    readMessages = [];

    if (contactData) {
      const { messages } = contactData;

      messagesReadCount =
        messages?.filter((message) => !message.status?.isReaded && message.to === SessionStorage.getAuthData()?.login)
          .length || 0;

      if (messagesReadCount > 0) {
        messages?.forEach((message) => {
          if (message.status && !message.status?.isReaded && message.to === SessionStorage.getAuthData()?.login) {
            DialogueController.sendMsgReadRequest(message.id!);
          }
        });

        State.setContactData(State.getSelectedContactLogin()!, { ...contactData, unreadMessagesCount: 0 });
        EventEmitter.emit(CustomEventName.CONTACTS_UPDATED);
      }
    }
  };

  private static sendMsgReadRequest = (messageId: string): void => {
    const request = createMsgReadRequest(messageId);

    socketHandler.send(request);
  };

  public static sendMsgDeleteRequest = (messageId: string): void => {
    const request = createMsgDeleteRequest(messageId);

    socketHandler.send(request);
  };

  public static sendMsgEditRequest = ({ id, text }: { id: string; text: string }): void => {
    const request = createMsgEditRequest(id, text);

    socketHandler.send(request);
  };

  public static msgSendResponseHandler = (response: SocketMessage): void => {
    if (response.type === SocketMessageType.MSG_SEND) {
      const message = response.payload?.message;
      const login = message?.from === SessionStorage.getAuthData()?.login ? message?.to : message?.from;

      State.saveMessage(login!, message!);

      if (message?.from === SessionStorage.getAuthData()?.login) {
        EventEmitter.emit(CustomEventName.MESSAGE_SENT, response);
      } else if (State.getSelectedContactLogin() === message?.from) {
        EventEmitter.emit(CustomEventName.MESSAGE_RECEIVED, response);
      }
    }
  };

  public static msgDeliveryResponseHandler = (response: SocketMessage): void => {
    if (response.type === SocketMessageType.MSG_DELIVERED) {
      const message = response.payload?.message;

      if (message) {
        State.updateMessage(message);
      }
    }
  };

  public static msgReadResponseHandler = (response: SocketMessage): void => {
    if (response.type === SocketMessageType.MSG_READ) {
      if (messagesReadCount > 0) {
        messagesReadCount -= 1;

        const message = response.payload?.message;

        readMessages.push(message!);

        if (messagesReadCount === 0) {
          State.updateMessagesOnRead(readMessages);
        }
      } else {
        const message = response.payload?.message;

        State.updateMessage(message!);
      }
    }
  };

  public static msgDeleteResponseHandler = (response: SocketMessage): void => {
    if (response.type === SocketMessageType.MSG_DELETE && response.payload?.message) {
      State.deleteMessage(response.payload?.message);
    }
  };

  public static msgEditResponseHandler = (response: SocketMessage): void => {
    if (response.type === SocketMessageType.MSG_EDIT && response.payload?.message) {
      State.updateMessage(response.payload?.message);
    }
  };
}

EventEmitter.on(CustomEventName.SEND_BTN_CLICK, DialogueController.sendBtnClickHandler);
EventEmitter.on(CustomEventName.DIALOGUE_CLICK, DialogueController.messageReadHandler);
EventEmitter.on(CustomEventName.USER_SCROLL, DialogueController.messageReadHandler);
EventEmitter.on(CustomEventName.SEND_BTN_CLICK, DialogueController.messageReadHandler);
EventEmitter.on(CustomEventName.SEND_EDITED_BTN_CLICK, DialogueController.sendMsgEditRequest);
EventEmitter.on(CustomEventName.DELETE_BTN_CLICK, DialogueController.sendMsgDeleteRequest);
EventEmitter.on(CustomEventName.SOCKET_MSG_RECEIVED, DialogueController.msgSendResponseHandler);
EventEmitter.on(CustomEventName.SOCKET_MSG_RECEIVED, DialogueController.msgDeliveryResponseHandler);
EventEmitter.on(CustomEventName.SOCKET_MSG_RECEIVED, DialogueController.msgReadResponseHandler);
EventEmitter.on(CustomEventName.SOCKET_MSG_RECEIVED, DialogueController.msgDeleteResponseHandler);
EventEmitter.on(CustomEventName.SOCKET_MSG_RECEIVED, DialogueController.msgEditResponseHandler);
