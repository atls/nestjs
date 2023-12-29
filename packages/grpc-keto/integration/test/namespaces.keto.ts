/* eslint-disable */

// @ts-ignore
class User implements Namespace {}

// @ts-ignore
class Group implements Namespace {
  related: {
    members: User[]
  }
}
