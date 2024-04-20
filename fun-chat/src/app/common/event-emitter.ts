import type CustomEventName from '@/app/custom-events';

type Handler<T extends unknown[] = unknown[]> = (...args: T) => void | Promise<unknown>;

export default class EventEmitter {
  private static handlers: Record<string, Handler[]> = {};

  public static on<T extends unknown[] = unknown[]>(evt: CustomEventName, handler: Handler<T>): void {
    const currentEventHandlers = this.handlers[evt] || [];

    if (currentEventHandlers.length === 0) {
      this.handlers[evt] = currentEventHandlers;
    }

    currentEventHandlers.push(handler as Handler);
  }

  public static off<T extends unknown[] = unknown[]>(evt: CustomEventName, handler: Handler<T>): void {
    const currentEventHandlers = this.handlers[evt];

    if (!currentEventHandlers) {
      return;
    }

    for (let i = 0; i < currentEventHandlers.length; i += 1) {
      if (currentEventHandlers[i] === handler) {
        currentEventHandlers.splice(i, 1);
        i -= 1;
      }
    }
  }

  public static emit<T>(evt: CustomEventName, details?: T): void {
    const currentEventHandlers = this.handlers[evt];

    if (!currentEventHandlers) {
      return;
    }

    currentEventHandlers.forEach((handler) => handler(details));
  }
}
