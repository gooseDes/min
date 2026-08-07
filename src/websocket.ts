import { io, Socket } from "socket.io-client";
import { WebSocketEvent, WebSocketOnlyReceiveEvent, WebSocketSubscribeOptions } from "./types";

export class Subscription {
  private id: number;
  public event: WebSocketEvent | WebSocketOnlyReceiveEvent;
  public callback: (data: any) => void;
  private socket: WebSocketClient;

  constructor(
    id: number,
    socket: WebSocketClient,
    event: WebSocketEvent | WebSocketOnlyReceiveEvent,
    callback: (data: any) => void,
  ) {
    this.id = id;
    this.socket = socket;
    this.event = event;
    this.callback = callback;
  }

  remove() {
    this.socket.removeSubscription(this.id);
  }
}

export class WebSocketClient {
  private socket: Socket | undefined;
  private url: string;
  public subscriptions = new Map<number, Subscription>();
  private lastSubscriptionId: number = 0;
  private connectionPromise: Promise<void> | undefined;
  private resolveConnection: (() => void) | undefined;
  private rejectConnection: ((reason?: any) => void) | undefined;
  private isConnected: boolean = false;
  private connectError: Error | undefined;

  constructor(url: string) {
    this.url = url;
  }

  init(token: string): void {
    const isTestEnv = process.env.NODE_ENV === "test";
    this.socket = io(this.url, {
      auth: { token },
      ...(isTestEnv ? { transports: ["websocket"], reconnection: false, forceNew: true } : {}),
    });

    this.connectionPromise = new Promise((resolve, reject) => {
      this.resolveConnection = resolve;
      this.rejectConnection = reject;
    });

    this.socket.on("connect", () => {
      this.isConnected = true;
      this.resolveConnection?.();
    });

    this.socket.on("connect_error", error => {
      this.isConnected = false;
      this.connectError = error;
      this.rejectConnection?.(error);
    });
  }

  subscribeToConnectionSuccess(callback: () => void): void {
    if (this.isConnected) {
      callback();
    } else {
      this.socket?.on("connect", () => callback());
    }
  }

  subscribeToConnectionError(callback: (error: Error) => void): void {
    if (this.connectError) {
      callback(this.connectError);
    } else {
      this.socket?.on("connect_error", error => callback(error));
    }
  }

  async waitForSocket(): Promise<void> {
    while (!this.socket) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    if (!this.socket.connected) {
      await this.connectionPromise;
    }
  }

  subscribe(
    event: WebSocketEvent | WebSocketOnlyReceiveEvent,
    callback: (data: any) => void,
    options?: WebSocketSubscribeOptions,
  ): Subscription {
    const { once = false } = options ?? {};

    let newCallback: typeof callback;

    const id = this.lastSubscriptionId++;

    if (once) {
      const wrapper = (data: any) => {
        if (!this.subscriptions.has(id)) return;
        this.subscriptions.delete(id);
        callback(data);
      };
      newCallback = wrapper;
      this.waitForSocket().then(() => {
        if (this.socket) this.socket.once(event, wrapper);
      });
    } else {
      newCallback = callback;
      this.waitForSocket().then(() => {
        if (this.socket) this.socket.on(event, newCallback);
      });
    }

    const subscription = new Subscription(id, this, event, newCallback);
    this.subscriptions.set(id, subscription);

    return subscription;
  }

  removeSubscription(id: number): void {
    if (this.subscriptions.has(id)) {
      const subscription = this.subscriptions.get(id)!;
      this.subscriptions.delete(id);
      this.waitForSocket().then(() => {
        if (this.socket) this.socket.off(subscription.event, subscription.callback);
      });
    }
  }

  emit(event: WebSocketEvent | WebSocketOnlyReceiveEvent, data: any): void {
    this.waitForSocket().then(() => {
      if (this.socket) this.socket.emit(event, data);
    });
  }

  close(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
    this.isConnected = false;
    this.connectError = undefined;
    this.connectionPromise = undefined;
    this.resolveConnection = undefined;
    this.rejectConnection = undefined;
  }

  reset(): void {
    for (const subscription of this.subscriptions.values()) {
      subscription.remove();
    }

    try {
      this.close();
    } catch (e) {
      console.error("WebSocketClient: error during disconnect", e);
    }

    this.isConnected = false;
    this.connectError = undefined;
    this.socket = undefined;
    this.subscriptions.clear();
    this.lastSubscriptionId = 0;
  }
}
