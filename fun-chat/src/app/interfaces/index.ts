import type SocketMessageType from '../enums';

export interface User {
  login: string;
  password?: string;
  isLogined?: boolean;
}

export interface Message {
  id: string | null;
  from: string | null;
  to: string | null;
  text: string;
  datetime: number;
  status: MessageStatus;
}

export interface MessageStatus {
  isDelivered: boolean;
  isReaded: boolean;
  isEdited: boolean;
}

export interface SocketMessage {
  id: string;
  type: SocketMessageType;
  payload: {
    user?: User;
    users?: User[];
    message?: Message;
    messages?: Message[];
    error?: string;
  } | null;
}
