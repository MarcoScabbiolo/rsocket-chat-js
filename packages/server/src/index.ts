import { ChatServer, ResponseType } from '@rsocket-chat-js/core'
import {
  serializeResponseType,
  userCodec,
  textCodec,
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
import { RxRespondersFactory } from 'rsocket-adapter-rxjs'

type ResponderStream = OnTerminalSubscriber &
  OnNextSubscriber &
  OnExtensionSubscriber

export default class RSocketChatServer extends ChatServer {
  private server: RSocketServer
  private stopper?: Closeable

  constructor(transport: ServerTransport) {
    super()
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
                return this.handleIdentifyUser(payload, responderStream)
              default:
                throw new Error('unknown response type')
            }
          },
          requestStream: RxRespondersFactory.requestStream(
            this.subscribeToInfo,
            { inputCodec: textCodec, outputCodec: textCodec }
          ),
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

  private handleIdentifyUser(
    payload: Payload,
    responderStream: ResponderStream
  ): Cancellable & OnExtensionSubscriber {
    const name = payload.data?.toString('utf-8')
    if (!name) {
      throw new Error('Must provide a name')
    }
    const user = this.identifyUser(name)
    responderStream.onNext(
      {
        data: userCodec.encode(user),
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
