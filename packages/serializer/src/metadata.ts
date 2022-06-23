import { decodeCompositeMetadata } from 'rsocket-composite-metadata'

export const decodeChannelMetadata = (metadata: Buffer) =>
  Array.from(decodeCompositeMetadata(metadata))
