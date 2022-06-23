# RSocket Chat JS

A centralized (1 server, many clients) chat implemented using RSocket, RxJS and Protobuf, with a CLI UI powered by InquirerJS.
Made it mainly to try RSocket out

## DONE list:

- Working server
- Working client
- Working CLI that can act as both a server and a client
- TCP transport
- User identification
- Broadcasts from server
- Broadcasts from users (general chat)

## TODO list:

- BUG: some of the first messages are ignored
- WebSockets transport (should work, didnt test it)
- 1-1 messages (PMs)
- Channel self-management by users (create, join, leave, destroy)
- Read-only channels
- Channel privacy (non-viewable channels, invites only)
- Gracious exit (client fire-and-forget)
- Make a good, useful and fancy README
- Maybe write some tests?
- Security (? ... who cares)
- Repeat everything in Rust!


### "Architecture"

Layered monorepo:

- UI & Networking `cli`
  - `inquirer`
  - `rsocket-tcp-server`
  - `rsocket-tcp-client`
  - `rsocket-websocket-server`
  - `rsocket-websocket-client`
- Protocol `client`, `server`
  - `rsocket-core`
  - `rsocket-rxjs-adapter`
- Data `serializer`
  - `protobufjs`
  - `rsocket-messaging`
- Application `core`
  - `rxjs`

All modules use ESM

### Tooling
- Turborepo
- pnpm
- Typescript
- ESLint
- Prettier