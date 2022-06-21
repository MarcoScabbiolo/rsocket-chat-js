import { Observable, Subject } from 'rxjs'
import { Message, User } from '../domain'

export abstract class ChatClient {
  private globalSubject = new Subject<Message>()
  private me?: User

  constructor() {
    this.global = this.globalSubject
  }

  global: Observable<Message>

  protected abstract initiateTransport(): Promise<void>
  protected abstract requestIdentify(name: string): Promise<User>

  async connect(name: string): Promise<void> {
    await this.initiateTransport()
    this.me = await this.requestIdentify(name)
  }

  sendMessage(mesasge: string): void {
    throw new Error('Method not implemented.')
  }
}
