import RSocketChatServer from '@rsocket-chat-js/server'
import { ServerTransport } from 'rsocket-core'
import { TcpServerTransport } from 'rsocket-tcp-server'
import { WebsocketServerTransport } from 'rsocket-websocket-server'
import { Transport } from './domain/questions.js'

export const runServer = async (
  transport: Transport,
  host: string,
  port: number,
  verbose: boolean
) => {
  let transporter: ServerTransport

  if (transport === Transport.Tcp) {
    transporter = new TcpServerTransport({
      listenOptions: {
        host,
        port,
      },
    })
  } else if (transport === Transport.WebSockets) {
    transporter = new WebsocketServerTransport({
      host,
      port,
    })
  } else {
    throw new Error('Unknown transport ' + transport)
  }

  const server = new RSocketChatServer(transporter, verbose)

  await server.start()

  let shouldExit = false
  process.on('SIGINT', function () {
    shouldExit = true
  })

  // Non-blocking async while(true) {}
  await new Promise<void>((resolve) => {
    const wait = () =>
      setTimeout(() => {
        if (shouldExit) {
          resolve()
        } else {
          wait()
        }
      }, 0)

    wait()
  })

  server.stop()
  process.exit()
}
