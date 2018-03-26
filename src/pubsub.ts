import { PubSub } from 'graphql-subscriptions';
import { EventEmitter } from 'events';

export const eventEmitter = new EventEmitter();

export const pubsub = new PubSub({
  eventEmitter,
});
