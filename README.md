## Apollo Live Server

This package is mostly for Meteor applications, however you can roll your own integration, as long you respect the interfaces

```js
// make sure you run this before instantiating any collection
// otherwise reactivity may not work for you
import { setup } from 'apollo-live-server';

setup({
  collection: Mongo.Collection,
});
```

### Prerequisites

* Add GraphQLJSON scalar to your schema.
* Add ReactiveEvent type from this package

```js
import { ReactiveEventType } from 'apollo-live-server';
```

## Usage

```js
type Query {
  items: [Item],
  item(_id: ID!): Item
}

type Subscription {
  items: ReactiveEvent,
  item(_id: ID!): ReactiveEvent
}
```

```js
Items.setTypename('Item');

const resolvers = {
  Query: {
    items() {
      return Items.find().fetch()
    }
    item(_, {_id}) {
      return Items.findOne(_id);
    }
  },
  Subscription: {
    items: {
      resolve: payload => payload,
      subscribe() {
        return Items.asyncIterator() // it accepts filters and options as arguments
      }
    },
    items: {
      resolve: payload => payload,
      subscribe(_, {_id}) {
        return Items.asyncIterator({_id})
      }
    }
  }
}
```

Now when you subscribe to `items` or `item` the subscription will send as payload a ReactiveEvent containing:

```js
{
  event: 'added' | 'changed' | 'removed',
  type: 'Item'
  _id: 'XXX',
  doc: { ... }
}
```

Based on these events you can process and update your query. To learn how to do this please checkout: `apollo-live-client` package which is suited for `React` and this `ReactiveEvent`
