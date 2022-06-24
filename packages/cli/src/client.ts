import RSocketChatClient from '@rsocket-chat-js/client'
import inquirer from 'inquirer'
import { ClientTransport } from 'rsocket-core'
import { TcpClientTransport } from 'rsocket-tcp-client'
import { WebsocketClientTransport } from 'rsocket-websocket-client'
import { Transport } from './domain/questions.js'
import { map, merge, Subscription } from 'rxjs'
import readline from 'node:readline'
import chalk from 'chalk'
import { Message } from '@rsocket-chat-js/core'

const formatMessage = (message: Message): string =>
  `${chalk.bold(message.from.name)}: ${message.content}`

export class CliChat {
  private client: RSocketChatClient
  private subscription = new Subscription()
  private running = true

  constructor(
    transport: Transport,
    host: string,
    port: number,
    verbose: boolean
  ) {
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

    this.client = new RSocketChatClient(transporter, verbose)

    this.wire()
  }

  wire(): void {
    this.subscription.add(
      merge(
        this.client.debug.pipe(map((text) => chalk.dim(text))),
        this.client.info.pipe(map((text) => chalk.inverse(` ${text} `))),
        this.client.global.pipe(map(formatMessage))
      ).subscribe(console.log)
    )
  }

  async start(): Promise<void> {
    const { name } = await inquirer.prompt<{ name: string }>({
      name: 'name',
      message: 'What is your username?',
      validate: (name) =>
        this.client.validateName(name) ||
        'Only letters, numbers or "-"s allowed',
    })

    await this.client.connect(name)

    const rl = readline.createInterface(process.stdin)

    const read = () =>
      rl.question('', (message) => {
        readline.moveCursor(process.stdout, 0, -1)
        this.client.sendMessage(message)
        console.log(formatMessage({ content: message, from: { name, id: '' } }))
        if (this.running) {
          read()
        }
      })

    read()
  }
}
