enum CustomEventName {
  SOCKET_STATE_CHANGE = 'socketStateChange',
  SOCKET_MSG_SENT = 'socketMsgSent',
  SOCKET_MSG_RECEIVED = 'socketMsgReceived',
  MODAL_ERROR = 'modalError',
  CONTACTS_UPDATED = 'contactsUpdated',

  CONTACT_SELECTION_CLICK = 'contactSelectionClick',
  SEND_BTN_CLICK = 'sendBtnClick',

  SELECTED_LOGIN_CHANGED = 'selectedLoginChanged',
  SELECTED_ACTIVITY_CHANGED = 'selectedActivityChanged',
  MSG_CONTENT_UPDATED = 'msgContentUpdated',
}

export default CustomEventName;
