import { Codec } from 'rsocket-messaging'

export class TextCodec implements Codec<string> {
  mimeType = 'text/plain'
  encode(entity: string): Buffer {
    return Buffer.from(entity)
  }
  decode(buffer: Buffer): string {
    return buffer.toString('utf-8')
  }
}

export const textCodec = new TextCodec()
