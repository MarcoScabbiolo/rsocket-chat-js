import { Observable, Subject, Subscription } from 'rxjs'
import { Message, User } from './domain/index.js'

export abstract class ChatClient {
  private subscription = new Subscription()
  private incomingGlobalSubject = new Subject<Message>()
  private outgoingGlobalSubject = new Subject<string>()
  private infoSubject = new Subject<string>()
  private me?: User

  constructor() {
    this.global = this.incomingGlobalSubject
    this.info = this.infoSubject
  }

  global: Observable<Message>
  info: Observable<string>

  protected abstract initiateTransport(): Promise<void>
  protected abstract requestIdentify(name: string): Promise<User>
  protected abstract requestInfo(userId: string): Observable<string>
  protected abstract subscribeToGlobal(
    userId: string,
    outgoing: Observable<string>
  ): Observable<Message>

  async connect(name: string): Promise<void> {
    await this.initiateTransport()
    this.me = await this.requestIdentify(name)
    this.subscription.add(
      this.requestInfo(this.me.id).subscribe(this.infoSubject)
    )
    this.subscription.add(
      this.subscribeToGlobal(this.me.id, this.outgoingGlobalSubject).subscribe(
        this.incomingGlobalSubject
      )
    )
  }

  sendMessage(message: string): void {
    this.outgoingGlobalSubject?.next(message)
  }

  validateName(name: string): boolean {
    return /^([a-zA-Z0-9]|-)+$/.test(name)
  }
}
