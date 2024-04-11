import type CustomEventName from '@/app/events';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Handler<T extends any[] = any[]> = (...args: T) => void | Promise<any>;

export default class EventEmitter {
  private handlers: Record<string, Handler[]> = {};

  public on(evt: CustomEventName, handler: Handler): void {
    const currentEventHandlers = this.handlers[evt] || [];

    if (currentEventHandlers.length === 0) {
      this.handlers[evt] = currentEventHandlers;
    }

    currentEventHandlers.push(handler);
  }

  public off(evt: CustomEventName, handler: Handler): void {
    const currentEventHandlers = this.handlers[evt];

    if (!currentEventHandlers) {
      return;
    }

    for (let i = 0; i < currentEventHandlers.length; i += 1) {
      if (currentEventHandlers[i] === handler) {
        currentEventHandlers.splice((i -= 1), 1);
      }
    }
  }

  public emit(evt: CustomEventName, details?: unknown): void {
    const currentEventHandlers = this.handlers[evt];

    if (!currentEventHandlers) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    currentEventHandlers.forEach((handler) => handler(details));
  }
}
