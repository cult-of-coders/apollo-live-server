import { MongoCollection, Events } from './defs';
import { pubsub, eventEmitter } from './pubsub';

const uuid = require('uuid/v4'); // Because `module.exports` gets weirdly transformed by typescript
let observers = {};

export function createAsyncIterator(
  this: MongoCollection,
  filters = {},
  options = {},
  channel?: string
): AsyncIterator<object> {
  channel = channel || uuid();

  const cursor = this.find(filters, options);
  const type = this.getTypename();

  let initialAdd = true;
  observers[channel] = cursor.observeChanges({
    added(_id, doc) {
      !initialAdd &&
        pubsub.publish(channel, {
          _id,
          doc,
          type,
          event: Events.ADDED,
        });
    },
    changed(_id, fields) {
      pubsub.publish(channel, {
        _id,
        doc: fields,
        type,
        event: Events.CHANGED,
      });
    },
    removed(_id) {
      pubsub.publish(channel, {
        _id,
        type,
        event: Events.REMOVED,
      });
    },
  });

  initialAdd = false;

  eventEmitter.on('removeListener', _channel => {
    if (_channel === channel) {
      if (observers[channel]) {
        observers[channel].stop();
        delete observers[channel];
      }
    }
  });

  return pubsub.asyncIterator(channel);
}
