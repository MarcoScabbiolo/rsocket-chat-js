import RSocketChatClient from '@rsocket-chat-js/client'
import inquirer from 'inquirer'
import { ClientTransport } from 'rsocket-core'
import { TcpClientTransport } from 'rsocket-tcp-client'
import { WebsocketClientTransport } from 'rsocket-websocket-client'
import { Transport } from './domain/questions.js'

export class CliChat {
  private client: RSocketChatClient

  constructor(transport: Transport, host: string, port: number) {
    let transporter: ClientTransport

    if (transport === Transport.Tcp) {
      transporter = new TcpClientTransport({
        connectionOptions: {
          host,
          port,
        },
      })
    } else if (transport === Transport.WebSockets) {
      transporter = new WebsocketClientTransport({
        url: `ws://${host}:${port}`,
      })
    } else {
      throw new Error('Unknown transport ' + transport)
    }

    this.client = new RSocketChatClient(transporter)
  }

  async start(): Promise<void> {
    const { name } = await inquirer.prompt<{ name: string }>({
      name: 'name',
      message: 'What is your username?',
      validate: (name) =>
        /$([a-zA-Z0-9]|(-))+/.test(name)
          ? true
          : 'Only letters, numbers or "-"s allowed',
    })

    await this.client.connect(name)
  }
}
