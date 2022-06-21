import { User } from './user'

export interface Message {
  from: User
  content: string
}
