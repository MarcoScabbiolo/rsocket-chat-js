import { Observable, startWith, Subject } from 'rxjs'
import { v4 as uuid } from 'uuid'
import { User } from '../domain/index.js'

export abstract class ChatServer {
  abstract start(): Promise<void>
  abstract stop(): void

  private identifiedUsers = new Map<string, User>()
  private info = new Map<string, Subject<string>>()

  constructor() {
    this.subscribeToInfo = this.subscribeToInfo.bind(this)
  }

  protected identifyUser(name: string): User {
    const user: User = {
      id: uuid(),
      name,
    }

    this.identifiedUsers.set(user.id, user)
    return user
  }

  protected subscribeToInfo(userId: string): Observable<string> {
    const subject = new Subject<string>()
    this.info.set(userId, subject)
    return subject.pipe(startWith('Welcome to the chat!'))
  }
}
