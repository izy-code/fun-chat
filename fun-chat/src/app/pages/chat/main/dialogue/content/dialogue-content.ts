import EventEmitter from '@/app/common/event-emitter';
import State from '@/app/common/state';
import BaseComponent from '@/app/components/base-component';
import CustomEventName from '@/app/custom-events';
import DialogueMessageComponent from './message/dialogue-message';
import { li } from '@/app/components/tags';

export default class DialogueContentComponent extends BaseComponent<HTMLUListElement> {
  constructor() {
    super({ className: 'dialogue__content', tag: 'ul' });

    if (State.getSelectedContactLogin()) {
      this.updateContent();
    }

    EventEmitter.on(CustomEventName.MSG_CONTENT_UPDATED, this.updateContent);
    EventEmitter.on(CustomEventName.SELECTED_LOGIN_CHANGED, this.updateContent);
    window.addEventListener(
      'popstate',
      () => {
        EventEmitter.off(CustomEventName.MSG_CONTENT_UPDATED, this.updateContent);
        EventEmitter.off(CustomEventName.SELECTED_LOGIN_CHANGED, this.updateContent);
      },
      { once: true },
    );
  }

  private updateContent = (): void => {
    this.removeChildren();

    if (!State.getSelectedContactLogin()) {
      const message = li({ className: 'dialogue__greeting', textContent: 'Select contact to start conversation' });

      this.append(message);
    } else {
      const messages = State.getSelectedContactData()?.messages;

      if (messages && messages.length) {
        const messageComponents = messages.map((message) => new DialogueMessageComponent(message));

        this.appendChildren(messageComponents);
      } else if (messages && !messages.length) {
        const message = li({ className: 'dialogue__greeting', textContent: 'No messages here yet...' });

        this.append(message);
      }
    }
  };
}
