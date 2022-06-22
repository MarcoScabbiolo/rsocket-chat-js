import protobuf from 'protobufjs'

export interface ToDomainMapper<Domain, Model> {
  toDomain: (model: Model) => Domain
}

export interface FromDomainMapper<Domain, Model> {
  fromDomain: (domain: Domain) => Model
}

export type Mapper<
  Domain,
  Model extends object
> = typeof protobuf.Message<Model> &
  ToDomainMapper<Domain, Model> &
  FromDomainMapper<Domain, protobuf.Message<Model>>
