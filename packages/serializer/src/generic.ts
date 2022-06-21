import { Message } from 'protobufjs'

export const serialize = <T extends object>(model: Message<T>): Buffer =>
  Buffer.from(model.$type.encode(model).finish())
