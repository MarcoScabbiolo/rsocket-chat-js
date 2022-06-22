import { Observable, Subject, Subscription } from 'rxjs'
import { Message, User } from '../domain/index.js'

export abstract class ChatClient {
  private subscription = new Subscription()
  private globalSubject = new Subject<Message>()
  private infoSubject = new Subject<string>()
  private me?: User

  constructor() {
    this.global = this.globalSubject
    this.info = this.infoSubject
  }

  global: Observable<Message>
  info: Observable<string>

  protected abstract initiateTransport(): Promise<void>
  protected abstract requestIdentify(name: string): Promise<User>
  protected abstract requestInfo(userId: string): Observable<string>

  async connect(name: string): Promise<void> {
    await this.initiateTransport()
    this.me = await this.requestIdentify(name)
    this.subscription.add(
      this.requestInfo(this.me.id).subscribe(this.infoSubject)
    )
  }

  sendMessage(mesasge: string): void {
    throw new Error('Method not implemented.')
  }

  validateName(name: string): boolean {
    return /^([a-zA-Z0-9]|-)+$/.test(name)
  }
}
