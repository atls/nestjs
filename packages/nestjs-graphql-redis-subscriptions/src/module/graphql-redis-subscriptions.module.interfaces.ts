/* eslint-disable @typescript-eslint/no-empty-interface */

import type { PubSubRedisOptions } from 'graphql-redis-subscriptions/dist/redis-pubsub.js'

export interface GraphQLRedisSubscriptionsModuleOptions
  extends Omit<PubSubRedisOptions, 'connection' | 'publisher' | 'subscriber'> {}
