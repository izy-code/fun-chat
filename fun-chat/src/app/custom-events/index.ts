enum CustomEventName {
  SOCKET_STATE_CHANGE = 'socketStateChange',
  SOCKET_MSG_SENT = 'socketMsgSent',
  SOCKET_MSG_RECEIVED = 'socketMsgReceived',
  MODAL_ERROR = 'modalError',
  CONTACTS_UPDATED = 'contactsUpdated',
  MESSAGE_SENT = 'messageSent',
  MESSAGE_RECEIVED = 'messageReceived',

  CONTACT_SELECTION_CLICK = 'contactSelectionClick',
  SEND_BTN_CLICK = 'sendBtnClick',
  SEND_EDITED_BTN_CLICK = 'sendEditedBtnClick',
  DIALOGUE_CLICK = 'dialogueClick',
  USER_SCROLL = 'userScroll',
  EDIT_BTN_CLICK = 'editBtnClick',
  DELETE_BTN_CLICK = 'deleteBtnClick',

  SELECTED_LOGIN_CHANGED = 'selectedLoginChanged',
  SELECTED_ACTIVITY_CHANGED = 'selectedActivityChanged',
  MSG_CONTENT_UPDATED = 'msgContentUpdated',
}

export default CustomEventName;
