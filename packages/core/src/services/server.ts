import { v4 as uuid } from 'uuid'
import { User } from '../domain'

export abstract class ChatServer {
  abstract start(): Promise<void>
  abstract stop(): void

  private identifiedUsers = new Map<string, User>()

  protected identifyUser(name: string): User {
    const user: User = {
      id: uuid(),
      name,
    }

    this.identifiedUsers.set(user.id, user)
    return user
  }
}
