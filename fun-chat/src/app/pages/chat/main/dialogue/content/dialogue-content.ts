import EventEmitter from '@/app/common/event-emitter';
import State from '@/app/common/state';
import BaseComponent from '@/app/components/base-component';
import CustomEventName from '@/app/custom-events';
import DialogueMessageComponent from './message/dialogue-message';
import { li, span } from '@/app/components/tags';
import type { Message } from '@/app/interfaces';
import { getClosestFromEventTarget } from '@/app/utils/helpers';
import DialoguePopoverComponent from './popover/dialogue-popover';

const SCROLL_DELAY_MS = 800;
const SCROLL_INTO_VIEW_DELAY_MS = 50;
const SCROLL_THROTTLE_DELAY_MS = 1500;

export default class DialogueContentComponent extends BaseComponent<HTMLUListElement> {
  private divider: BaseComponent<HTMLLIElement>;

  private isDividerVisible = false;

  private isReadOnScrollBlocked = false;

  private popover: DialoguePopoverComponent | null = null;

  private filler: BaseComponent<HTMLLIElement>;

  private isMouseOverDialogue = false;

  constructor() {
    super({ className: 'dialogue__content', tag: 'ul' });

    this.divider = li({ className: 'dialogue__divider' });
    this.filler = li({ className: 'dialogue__filler' });

    this.updateContent();

    EventEmitter.on(CustomEventName.MSG_CONTENT_UPDATED, this.updateContent);
    EventEmitter.on(CustomEventName.SELECTED_LOGIN_CHANGED, this.updateContent);
    EventEmitter.on(CustomEventName.MESSAGE_SENT, this.scrollToLastMessage);
    EventEmitter.on(CustomEventName.MESSAGE_RECEIVED, this.scrollToLastMessage);
    window.addEventListener(
      'popstate',
      () => {
        EventEmitter.off(CustomEventName.MSG_CONTENT_UPDATED, this.updateContent);
        EventEmitter.off(CustomEventName.SELECTED_LOGIN_CHANGED, this.updateContent);
        EventEmitter.off(CustomEventName.MESSAGE_SENT, this.scrollToLastMessage);
        EventEmitter.off(CustomEventName.MESSAGE_RECEIVED, this.scrollToLastMessage);
      },
      { once: true },
    );

    this.addListener('click', () => {
      EventEmitter.emit(CustomEventName.DIALOGUE_CLICK);
      this.popover?.removeNode();
    });
    this.addListener('scroll', this.userScrollHandler, { passive: true });
    this.addListener('wheel', this.userScrollHandler, { passive: true });
    this.addListener('contextmenu', this.contextMenuHandler);
    setTimeout(() => {
      this.scrollToLastMessage();
    }, SCROLL_DELAY_MS);
    this.addListener('mouseenter', () => {
      this.isMouseOverDialogue = true;
    });
    this.addListener('mouseleave', () => {
      this.isMouseOverDialogue = false;
    });
  }

  private createDivider = (): void => {
    const dividerText = span({ className: 'dialogue__divider-text', textContent: 'New messages' });

    this.divider.append(dividerText);
  };

  private handleMessages = (messages: Message[]): void => {
    const messageComponents: BaseComponent[] = [];
    let isFirstUnreadMessageAdded = false;

    messages.forEach((message) => {
      if (!isFirstUnreadMessageAdded && !message.status?.isReaded && message.from === State.getSelectedContactLogin()) {
        this.createDivider();
        messageComponents.push(this.divider);
        isFirstUnreadMessageAdded = true;
        this.isDividerVisible = true;
      }
      messageComponents.push(new DialogueMessageComponent(message));
    });

    this.appendChildren(messageComponents);
    this.scrollToLastMessage(true);
  };

  private updateContent = (): void => {
    this.removeChildren();
    this.append(this.filler);
    this.isDividerVisible = false;
    this.isMouseOverDialogue = this.getNode().matches(':hover');

    if (!State.getSelectedContactLogin()) {
      const greeting = li({ className: 'dialogue__greeting', textContent: 'Select contact to start conversation' });

      this.append(greeting);
    } else {
      const messages = State.getSelectedContactData()?.messages;

      if (messages && messages.length) {
        this.handleMessages(messages);
      } else {
        const greeting = li({ className: 'dialogue__greeting', textContent: 'No messages here yet...' });

        this.append(greeting);
      }
    }
  };

  private scrollToLastMessage = (isInstant = true): void => {
    const behavior = isInstant ? 'instant' : 'smooth';
    const lastMessage = this.getNode().lastElementChild;

    if (lastMessage && !this.isDividerVisible) {
      this.scrollIntoViewWrapper(lastMessage as HTMLElement, { behavior, block: 'start' });
    } else if (lastMessage && this.isDividerVisible) {
      this.scrollIntoViewWrapper(this.divider.getNode(), { behavior, block: 'start' });
    }
  };

  private scrollIntoViewWrapper = (element: HTMLElement, options: ScrollIntoViewOptions): void => {
    this.isReadOnScrollBlocked = true;

    element.scrollIntoView(options);

    setTimeout(() => {
      this.isReadOnScrollBlocked = false;
    }, SCROLL_INTO_VIEW_DELAY_MS);
  };

  private userScrollHandler = ((): (() => void) => {
    let isScrollThrottled = false;

    const throttledHandler = (): void => {
      if (!this.isReadOnScrollBlocked && !isScrollThrottled && this.isMouseOverDialogue) {
        EventEmitter.emit(CustomEventName.USER_SCROLL);
        isScrollThrottled = true;
        setTimeout(() => {
          isScrollThrottled = false;
        }, SCROLL_THROTTLE_DELAY_MS);
      }
    };

    return throttledHandler;
  })();

  private contextMenuHandler = (evt: Event): void => {
    evt.preventDefault();

    if (this.popover) {
      this.popover.removeNode();
      this.popover = null;
    }

    const closestMessage = getClosestFromEventTarget(evt, '.message-item__container');

    if (closestMessage && closestMessage.parentElement?.classList.contains('message-item--sent')) {
      this.popover = new DialoguePopoverComponent(closestMessage.parentElement!);
      closestMessage.parentElement!.append(this.popover.getNode());
      this.scrollIntoViewWrapper(this.popover.getNode(), { behavior: 'smooth', block: 'start' });
    }
  };
}
