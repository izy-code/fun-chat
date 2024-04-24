import type SocketMessageType from '../enums';

export interface User {
  login: string;
  password?: string;
  isLogined?: boolean;
}

export interface Message {
  id?: string | null;
  from?: string | null;
  to?: string | null;
  text?: string;
  datetime?: number;
  status?: MessageStatus;
}

export interface MessageStatus {
  isDelivered: boolean;
  isReaded: boolean;
  isEdited: boolean;
  isDeleted: boolean;
}

export interface Payload {
  user?: User;
  users?: User[];
  message?: Message;
  messages?: Message[];
  error?: string;
}

export interface SocketMessage {
  id: string;
  type: SocketMessageType;
  payload: Payload | null;
}

export interface ContactData {
  isOnline: boolean;
  unreadMessagesCount?: number;
  messages?: Message[];
}
