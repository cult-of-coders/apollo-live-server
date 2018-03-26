import { SetupConfig } from './defs';
import { createAsyncIterator } from './createAsyncIterator';

export function setup(config: SetupConfig) {
  Object.assign(config.Collection.prototype, {
    setTypename(str) {
      this.__typename = str;
    },

    getTypename() {
      if (!this.__typename) {
        throw 'This collection does not have a typename set. Please use Collection.setTypename(string)';
      }
      return this.__typename;
    },

    asyncIterator(...args) {
      try {
        return createAsyncIterator.call(this, ...args);
      } catch (e) {
        console.error(e);
        throw e;
      }
    },
  });
}
