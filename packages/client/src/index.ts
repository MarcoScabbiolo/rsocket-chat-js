import { ChatClient, ResponseType, User } from '@rsocket-chat-js/core'
import { UserModel, serializeResponseType } from '@rsocket-chat-js/serializer'
import { ClientTransport, RSocket, RSocketConnector } from 'rsocket-core'
import { noop } from 'rxjs'

export default class RSocketChatClient extends ChatClient {
  private connector: RSocketConnector
  private socketInstance: RSocket | undefined

  private get socket(): RSocket {
    const instance = this.socketInstance
    if (!instance) {
      throw new Error('No socket instance')
    }
    return instance
  }

  constructor(transport: ClientTransport) {
    super()
    this.connector = new RSocketConnector({
      setup: {
        keepAlive: 100,
        lifetime: 10000,
      },
      transport,
    })
  }

  protected async initiateTransport(): Promise<void> {
    this.socketInstance = await this.connector.connect()
  }

  protected requestIdentify(name: string): Promise<User> {
    return new Promise((resolve, reject) => {
      this.socket.requestResponse(
        {
          data: Buffer.from(name),
          metadata: serializeResponseType(ResponseType.Identify),
        },
        {
          onError: reject,
          onNext: (response) => {
            const data = response.data
            if (!data) {
              reject(new Error('No data'))
              return
            }
            resolve(UserModel.decode(data).toDomain())
          },
          onComplete: noop,
          onExtension: noop,
        }
      )
    })
  }
}
