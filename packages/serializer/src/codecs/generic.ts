import { Codec } from 'rsocket-messaging'
import { Mapper } from '../domain/mapper.js'
import { serialize } from '../generic.js'
import { PROTOBUF_MIME_TYPE } from './const.js'

export const codecForModel = <Domain, Model extends object>(
  Model: Mapper<Domain, Model>
): Codec<Domain> => ({
  mimeType: PROTOBUF_MIME_TYPE,
  encode: (entity) => serialize(Model.fromDomain(entity)),
  decode: (buffer) => Model.toDomain(Model.decode(buffer) as Model),
})
