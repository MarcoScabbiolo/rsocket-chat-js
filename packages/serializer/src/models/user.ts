import { Field, Message, Type } from 'protobufjs'
import { User } from '@rsocket-chat-js/core'

@Type.d('User')
export class UserModel extends Message<UserModel> {
  @Field.d(1, 'string', 'required')
  public id = ''

  @Field.d(2, 'string', 'required')
  public name = ''

  public toDomain(): User {
    return {
      id: this.id,
      name: this.name,
    }
  }
}
