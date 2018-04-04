## Apollo Live Server

This project is sponsored by [Cult of Coders](https://www.cultofcoders.com)

The interfaces have been crafted to suit `Meteor` applications, however you can easily roll your own implementation for it.

React integration: [`apollo-live-client`](https://github.com/cult-of-coders/apollo-live-client)
Meteor integration: https://github.com/cult-of-coders/apollo

Read more about GraphQL Subscriptions here: https://github.com/apollographql/graphql-subscriptions

### Defining Subscription Type

```gql
type Subscription {
  notifications(options: JSON): ReactiveEventNotifications
}

type ReactiveEventNotifications {
  event: String
  doc: Notification
}
```

### Creating Subscriptions

A simple, common example:

```js
import { asyncIterator } from 'apollo-live-server';

{
  Subscription: {
    notifications: {
      resolve: payload => payload,
      subscribe(_, args, { db }, ast) {
        // We assume that you inject `db` context with all your collections
        // If you are using Meteor, db.notifications is an instance of Mongo.Collection
        const observable = db.notifications.find();

        return asyncIterator(observable);
      }
    }
  }
}
```

The current limitation is that the reactive events dispatched by this publication are only at `Notification` level
in the database, but what happens when we want to also send down the pipe nested info, such as, `Task` linked to `Notification`, how can we handle this ?

We hook into the resolver:

```js
import { Event } from 'apollo-live-server';

{
  notifications: {
    resolve: ({event, doc}, args, { db }, ast) => {
      // The doc in here represents only the changeset

      if (event === Event.ADDED) {
        // Feel free to create a server-only client that would allow you to do an actual GraphQL request
        Object.assign(doc, {
          task: db.tasks.findOne(doc.taskId);
        })
      }
      // You can also apply the same concepts for example when a certain relation is changing.

      return {event, doc};
    },
    subscribe() { ... }
  }
}
```

Now, when we subscribe, we have the ability to subscribe only to certain fields, let's try to do that in our subscription as well:

```js
import { asyncIterator, astToFields } from 'apollo-live-server';

{
  Subscription: {
    notifications: {
      resolve: payload => payload,
      subscribe(_, args, { db }, ast) {
        const observable = db.notifications.find({}, {
          // This will extract the fields from fields specified under doc
          // in the subscription "query" to GraphQL
          fields: astToFields(ast)
        })

        return asyncIterator(observable);
      }
    }
  }
}
```

You have the ability to listen only to some events and in the same breath, notify the client about something being added without the dataset, only the event. For example you have a newsfeed, and you notify the user that new things have been added:

```js
import { Event } from 'apollo-live-server';

{
  Subscription: {
    notifications: {
      resolve: payload => ({ event: payload.event })
      subscribe(_, args, {db}) {
        const observable = db.feed.find({}, {
          fields: {_id}
        })

        return asyncIterator(observable, {
          events: [Event.ADDED]
        })
      }
    }
  }
}
```

## Options

```js
asyncIterator(observer, options);
```

```js
type Options = {
  // You can listen only to some custom events
  events?: Event[],

  // Sends the initial image of your observer down the pipe
  sendInitialAdds?: boolean,
};
```
