import { MessageProtocol } from './message-protocol';

export interface PluginAPI {
  id: string | number;
  handleMessage(message: MessageProtocol): void;
  subscribeToEvent<T extends any>(eventType: string, handler: (event: T) => void): void;
  unsubscribeFromEvent<T extends any>(eventType: string, handler: (event: T) => void): void;
}

type Handler<T extends any> = (event: T) => void;
const readonly: { [key: string]: readonly [Handler<any>] } = {};

export class BasePlugin implements PluginAPI {
  public readonly id: string | number;
  private readonly eventHandlers: Record<string, readonly [Handler<any>]> = {};

  constructor(id: string | number) {
    this.id = id;
  }

  public handleMessage<T extends any>(message: MessageProtocol): void {
    console.log(`Received message from APIManager: ${JSON.stringify(message)}`);
  }

  public subscribeToEvent<T extends any>(eventType: string, handler: (event: T) => void): void {
    if (!this.eventHandlers[eventType]) {
      this.eventHandlers[eventType] = readonly [];
    }

    const eventHandlersArray: readonly [Handler<T>] = [handler];
    this.eventHandlers[eventType] = eventHandlersArray;
  }

  public unsubscribeFromEvent<T extends any>(eventType: string, handler: (event: T) => void): void {
    if (!this.eventHandlers[eventType]) {
      return;
    }

    for (let i = 0; i < this.eventHandlers[eventType].length; i++) {
      if (this.eventHandlers[eventType][i] === handler) {
        this.eventHandlers[eventType].splice(i, 1);
      }
    }
  }
}
