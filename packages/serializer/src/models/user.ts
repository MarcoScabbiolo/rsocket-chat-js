import protobuf from 'protobufjs'
import { User } from '@rsocket-chat-js/core'

const { Field, Type } = protobuf

@Type.d('User')
export class UserModel extends protobuf.Message<UserModel> {
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
