import EventEmitter from '@/app/common/event-emitter';
import State from '@/app/common/state';
import BaseComponent from '@/app/components/base-component';
import { p } from '@/app/components/tags';
import CustomEventName from '@/app/custom-events';

const ACTIVITY_STATUS = {
  ONLINE: 'Online',
  OFFLINE: 'Offline',
};

export default class DialogueHeaderComponent extends BaseComponent<HTMLDivElement> {
  private login: BaseComponent<HTMLParagraphElement>;

  private activity: BaseComponent<HTMLParagraphElement>;

  constructor() {
    super({ className: 'dialogue__header', tag: 'div' });

    this.login = p({ className: 'dialogue__login', textContent: 'No contact selected' });
    this.activity = p({ className: 'dialogue__activity' });

    this.appendChildren([this.login, this.activity]);

    EventEmitter.on(CustomEventName.SELECTED_LOGIN_CHANGED, this.updateLogin);
    EventEmitter.on(CustomEventName.SELECTED_ACTIVITY_CHANGED, this.updateActivity);
    window.addEventListener(
      'popstate',
      () => {
        EventEmitter.off(CustomEventName.SELECTED_LOGIN_CHANGED, this.updateLogin);
        EventEmitter.off(CustomEventName.SELECTED_ACTIVITY_CHANGED, this.updateActivity);
      },
      { once: true },
    );

    this.updateActivity(State.getSelectedContactActivity());
    this.updateLogin(State.getSelectedContactLogin());
  }

  private updateLogin = (login: string | null): void => {
    if (login) {
      this.login.setTextContent(login);
      this.activity.removeClass('dialogue__activity--hidden');
    } else {
      this.login.setTextContent('No contact selected');
      this.activity.addClass('dialogue__activity--hidden');
    }
  };

  private updateActivity = (isOnline: boolean): void => {
    const activityStatus = isOnline ? ACTIVITY_STATUS.ONLINE : ACTIVITY_STATUS.OFFLINE;

    this.activity.setTextContent(activityStatus);

    if (isOnline) {
      this.activity.addClass('dialogue__activity--online');
    } else {
      this.activity.removeClass('dialogue__activity--online');
    }
  };
}
