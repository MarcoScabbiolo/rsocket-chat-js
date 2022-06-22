import protobuf from 'protobufjs'
import { User } from '@rsocket-chat-js/core'
import { FromDomainMapper, ToDomainMapper } from '../domain/mapper.js'

const { Field, Type } = protobuf

@Type.d('User')
export class UserModel extends protobuf.Message<UserModel> {
  @Field.d(1, 'string', 'required')
  public id = ''

  @Field.d(2, 'string', 'required')
  public name = ''

  public static toDomain(model: UserModel): User {
    return {
      id: model.id,
      name: model.name,
    }
  }

  public static fromDomain(domain: User): UserModel {
    return UserModel.fromObject(domain)
  }
}
