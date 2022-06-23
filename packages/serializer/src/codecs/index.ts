import { MessageModel, UserModel } from '../models/index.js'
import { codecForModel } from './generic.js'

export * from './text.js'

export const userCodec = codecForModel(UserModel)
export const messageCodec = codecForModel(MessageModel)
