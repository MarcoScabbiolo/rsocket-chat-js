import { ResponseType } from '@rsocket-chat-js/core'

export const serializeResponseType = (responseType: ResponseType): Buffer => {
  const buffer = Buffer.allocUnsafe(1)
  buffer.writeUint8(responseType)
  return buffer
}
