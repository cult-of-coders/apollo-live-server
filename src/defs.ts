export enum Events {
  ADDED = 'added',
  CHANGED = 'changed',
  REMOVED = 'removed',
}

export interface SetupConfig {
  Collection: { prototype: MongoCollection };
}

export interface ObserverStore {
  [uuid: string]: ObserveHandler;
}

export interface ObserveHandler {
  stop(): void;
}

export interface MongoCursor {
  observeChanges(observer: object): ObserveHandler;
}

export interface MongoCollection {
  find(filters?: object, options?: object): MongoCursor;
  asyncIterator(filters?: object, options?: object): AsyncIterator<object>;
  getTypename(): string;
  setTypename(name: string): void;
}
