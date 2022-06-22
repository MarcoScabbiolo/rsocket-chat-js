import { UserModel } from '../models/user.js'
import { codecForModel } from './generic.js'

export * from './text.js'

export const userCodec = codecForModel(UserModel)
