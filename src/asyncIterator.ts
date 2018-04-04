import { Observable, Event, AsyncIteratorConfig } from './defs';
import { pubsub, eventEmitter } from './pubsub';

// Because `module.exports` gets weirdly transformed by typescript
const uuid = require('uuid/v4');
let observers = {};

/**
 * This method transforms an Observable into an asyncIterator
 * These observables can be Mongo.Cursor from Meteor mongo package, or anything that respects the interface
 *
 * @param observable
 * @param config
 */
export function asyncIterator(
  observable: Observable,
  config: AsyncIteratorConfig = {}
) {
  config = Object.assign(
    {
      channel: uuid(),
      events: [Event.ADDED, Event.CHANGED, Event.REMOVED],
    },
    config
  );

  const channel = config.channel;
  /**
   * We may or may not send the initial blast of adds
   * We use this proxy object so the observer we create can read from it
   */
  let proxy = {
    shouldSendAdds: config.sendInitialAdds || false,
  };

  const publish = function(event, doc) {
    pubsub.publish(config.channel, { doc, event });
  };

  const observer = createObserver(config.events, publish, proxy);

  observers[channel] = observable.observeChanges(observer);

  // After this initial add has been completed
  proxy.shouldSendAdds = true;

  handleStop(channel);

  return pubsub.asyncIterator(channel);
}

export function createObserver(events, publish, proxy: any) {
  let observer: any = {};
  if (events.includes(Event.ADDED)) {
    observer.added = (_id, doc) => {
      Object.assign(doc, { _id });
      proxy.shouldSendAdds && publish(Event.ADDED, doc);
    };
  }

  if (events.includes(Event.CHANGED)) {
    observer.changed = (_id, doc) => {
      Object.assign(doc, { _id });
      publish(Event.CHANGED, doc);
    };
  }

  if (events.includes(Event.REMOVED)) {
    observer.removed = _id => {
      publish(Event.REMOVED, { _id });
    };
  }

  return observer;
}

export function handleStop(channel) {
  // When we remove the event for channel from this event emitter
  // We also have to stop our observer
  const stopObserver = _channel => {
    if (_channel === channel) {
      if (observers[channel]) {
        observers[channel].stop();
        delete observers[channel];
      }

      eventEmitter.removeListener('removeListener', stopObserver);
    }
  };

  eventEmitter.on('removeListener', stopObserver);
}
