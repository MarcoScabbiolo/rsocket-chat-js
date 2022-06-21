import { ChatServer, ResponseType, User } from '@rsocket-chat-js/core'
import {
  serialize,
  serializeResponseType,
  UserModel,
} from '@rsocket-chat-js/serializer'
import {
  Cancellable,
  Closeable,
  OnExtensionSubscriber,
  OnNextSubscriber,
  OnTerminalSubscriber,
  Payload,
  RSocketServer,
  ServerTransport,
} from 'rsocket-core'
import { noop } from 'rxjs'
import { v4 as uuid } from 'uuid'

type ResponderStream = OnTerminalSubscriber &
  OnNextSubscriber &
  OnExtensionSubscriber

export class RSocketChatServer implements ChatServer {
  private server: RSocketServer
  private stopper?: Closeable

  private identifiedUsers = new Map<string, User>()

  constructor(transport: ServerTransport) {
    this.server = new RSocketServer({
      transport,
      acceptor: {
        accept: async () => ({
          requestResponse: (payload, responderStream) => {
            const responseType = payload.metadata?.readUint8(0)
            if (!responseType) {
              throw new Error('Must provide a request-resonse type')
            }

            switch (responseType) {
              case ResponseType.Identify:
                return this.identifyUser(payload, responderStream)
              default:
                throw new Error('unknown response type')
            }
          },
        }),
      },
    })
  }

  async start(): Promise<void> {
    this.stopper = await this.server.bind()
  }

  stop(): void {
    this.stopper?.close()
  }

  private identifyUser(
    payload: Payload,
    responderStream: ResponderStream
  ): Cancellable & OnExtensionSubscriber {
    const name = payload.data?.toString('utf-8')
    if (!name) {
      throw new Error('Must provide a name')
    }
    const user: User = {
      id: uuid(),
      name,
    }
    responderStream.onNext(
      {
        data: serialize(UserModel.fromObject(user)),
        metadata: serializeResponseType(ResponseType.Identify),
      },
      true
    )

    return {
      cancel: noop,
      onExtension: noop,
    }
  }
}
