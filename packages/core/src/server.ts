import { filter, map, Observable, startWith, Subject, Subscription } from 'rxjs'
import { v4 as uuid } from 'uuid'
import { Message, User } from './domain/index.js'

export abstract class ChatServer {
  abstract start(): Promise<void>
  abstract stop(): void

  private subscription = new Subscription()
  private identifiedUsers = new Map<string, User>()
  private info = new Map<string, Subject<string>>()
  private globalSubject = new Subject<Message>()

  global: Observable<Message>

  constructor(private verbose: boolean = false) {
    this.subscribeToInfo = this.subscribeToInfo.bind(this)
    this.subscribeToGlobal = this.subscribeToGlobal.bind(this)
    this.global = this.globalSubject

    if (this.verbose) {
      this.subscription.add(
        this.global.subscribe((message) => {
          this.log(`Message from ${message.from.id}: ${message.content}`)
        })
      )
    }
  }

  protected identifyUser(name: string): User {
    const user: User = {
      id: uuid(),
      name,
    }

    this.log(`User ${user.id} identified as ${name}`)
    this.identifiedUsers.set(user.id, user)
    return user
  }

  protected subscribeToInfo(userId: string): Observable<string> {
    const subject = new Subject<string>()
    this.info.set(userId, subject)
    this.log(`User ${userId} subscribed to info`)
    return subject.pipe(startWith('Welcome to the chat!'))
  }

  protected subscribeToGlobal(
    userId: string,
    incoming: Observable<string>
  ): Observable<Message> {
    const user = this.identifiedUsers.get(userId)
    if (!user) {
      throw new Error(`User ${userId} not identified`)
    }
    this.subscription.add(
      incoming
        .pipe(map((content): Message => ({ content, from: user })))
        .subscribe(this.globalSubject)
    )

    this.log(`User ${userId} subscribed to global`)
    return this.global.pipe(filter((message) => message.from.id !== userId))
  }

  protected log(message: string): void {
    if (this.verbose) {
      console.log(message)
    }
  }
}
