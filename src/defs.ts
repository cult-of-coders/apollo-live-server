export enum Event {
  ADDED = 'added',
  CHANGED = 'changed',
  REMOVED = 'removed',
}

export interface ObserverStore {
  [uuid: string]: ObserveHandler;
}

export interface ObserveHandler {
  stop(): void;
}

export type AsyncIteratorConfig = {
  events?: Event[];
  sendInitialAdds?: boolean;
  channel?: string;
};

export interface Observable {
  observeChanges(observer: object): ObserveHandler;
}
