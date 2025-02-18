import State from '../common/state';
import SocketMessageType from '../enums';
import type { Payload, SocketMessage } from '../interfaces';

type ConstructorOf<T> = { new (...args: unknown[]): T; prototype: T };

export function assertIsDefined<T>(value: T): asserts value is NonNullable<T> {
  if (value === undefined) {
    throw new Error(`Value not defined`);
  }

  if (value === null) {
    throw new Error(`Value is null`);
  }
}

export function isNotNull<T>(value: T): value is NonNullable<T> {
  return value != null;
}

export function assertObjectType<T>(object: unknown, expectedType: ConstructorOf<T>): asserts object is NonNullable<T> {
  assertIsDefined(object);

  if (!(object instanceof expectedType)) {
    throw new TypeError(`Wrong object type`);
  }
}

export const queryElement = <T extends Element>(
  container: Element | Document | DocumentFragment,
  selector: string,
  expectedType: ConstructorOf<T>,
): T => {
  const queriedElement = container.querySelector<T>(selector);

  assertObjectType(queriedElement, expectedType);

  return queriedElement;
};

export const getClosestFromEventTarget = (evt: Event | Touch, closestSelectors: string): HTMLElement | null => {
  const { target } = evt;

  if (!(target instanceof HTMLElement)) {
    return null;
  }

  return target.closest(closestSelectors);
};

export const createSocketMessage = (payload: Payload | null, type: SocketMessageType): SocketMessage => ({
  id: crypto.randomUUID(),
  type,
  payload,
});

export const createMsgSendRequest = (message: string): SocketMessage =>
  createSocketMessage(
    {
      message: {
        to: State.getSelectedContactLogin(),
        text: message,
      },
    },
    SocketMessageType.MSG_SEND,
  );

export const createMsgFromUserRequest = (userLogin: string): SocketMessage =>
  createSocketMessage(
    {
      user: {
        login: userLogin,
      },
    },
    SocketMessageType.MSG_FROM_USER,
  );

export const createMsgReadRequest = (messageId: string): SocketMessage =>
  createSocketMessage(
    {
      message: {
        id: messageId,
      },
    },
    SocketMessageType.MSG_READ,
  );

export const createMsgDeleteRequest = (messageId: string): SocketMessage =>
  createSocketMessage(
    {
      message: {
        id: messageId,
      },
    },
    SocketMessageType.MSG_DELETE,
  );

export const createMsgEditRequest = (messageId: string, editedText: string): SocketMessage =>
  createSocketMessage(
    {
      message: {
        id: messageId,
        text: editedText,
      },
    },
    SocketMessageType.MSG_EDIT,
  );
