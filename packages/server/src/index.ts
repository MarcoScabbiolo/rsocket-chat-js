import { ChatServer, ResponseType } from '@rsocket-chat-js/core'
import {
  serializeResponseType,
  userCodec,
  textCodec,
  messageCodec,
  decodeChannelMetadata,
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
          requestChannel: (payload, ...rest) => {
            const metadata = payload.metadata

            if (!metadata) {
              throw new Error('No metadata found')
            }

            const userIdBuffer = decodeChannelMetadata(metadata)?.[0]?.content

            if (!userIdBuffer) {
              throw new Error('Must provide a user id')
            }
            const userId = textCodec.decode(userIdBuffer)

            return RxRespondersFactory.requestChannel(
              (incoming) => this.subscribeToGlobal(userId, incoming),
              {
                inputCodec: textCodec,
                outputCodec: messageCodec,
              }
            )(payload, ...rest)
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
