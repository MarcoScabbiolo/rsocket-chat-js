import { Message } from '@rsocket-chat-js/core'
import protobuf from 'protobufjs'
import { UserModel } from './user.js'

const { Type, Field } = protobuf

@Type.d('Message')
export class MessageModel extends protobuf.Message<MessageModel> {
  @Field.d(1, UserModel, 'required')
  from: UserModel = new UserModel()

  @Field.d(2, 'string', 'required')
  content = ''

  static toDomain(model: MessageModel): Message {
    return {
      from: UserModel.toDomain(model.from),
      content: model.content,
    }
  }

  static fromDomain(message: Message): MessageModel {
    return MessageModel.fromObject({
      from: UserModel.fromDomain(message.from),
      content: message.content,
    })
  }
}
