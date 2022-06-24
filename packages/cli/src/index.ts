import inquirer from 'inquirer'
import { CliMode, Transport } from './domain/questions.js'
import { runServer } from './server.js'
import { CliChat } from './client.js'
import { program } from 'commander'

const { verbose }: { verbose: boolean } = program
  .option('--verbose')
  .parse()
  .opts()

const main = async () => {
  const { mode, transport, host, port } = await inquirer.prompt<{
    mode: CliMode
    transport: Transport
    host: string
    port: number
  }>([
    {
      name: 'mode',
      message: 'Host your own chat server or join an existing one',
      type: 'list',
      choices: [
        { value: CliMode.Client, name: 'Join' },
        { value: CliMode.Server, name: 'Host' },
      ],
    },
    {
      name: 'transport',
      message: 'How are we doing this?',
      type: 'list',
      choices: [
        { value: Transport.Tcp, name: 'TCP' },
        { value: Transport.WebSockets, name: 'Web Sockets' },
      ],
    },
    {
      name: 'host',
      message: ({ mode }) =>
        `Host to ${mode === CliMode.Client ? 'connect' : 'listen'} to`,
      type: 'input',
      default: 'localhost',
    },
    {
      name: 'port',
      message: ({ mode }) =>
        `Port to ${mode === CliMode.Client ? 'connect' : 'listen'} to`,
      type: 'input',
      filter: Number,
      validate: (number) =>
        !Number.isNaN(number) && number > 0
          ? true
          : 'Please provide a valid port number',
      default: 3000,
    },
  ])

  if (mode === CliMode.Server) {
    await runServer(transport, host, port, verbose)
  } else if (mode === CliMode.Client) {
    await new CliChat(transport, host, port, verbose).start()
  } else {
    throw new Error('Unknown mode ' + mode)
  }
}

main()
