/* eslint-disable */

import './patch-long-js'

// @ts-ignore
import { StoreProxy }                                      from '@graphql-mesh/store'
// @ts-ignore
import { GetMeshSourceOptions }                            from '@graphql-mesh/types'
// @ts-ignore
import { MeshHandler }                                     from '@graphql-mesh/types'
// @ts-ignore
import { YamlConfig }                                      from '@graphql-mesh/types'
import { ChannelCredentials }                              from '@grpc/grpc-js'
import { ClientReadableStream }                            from '@grpc/grpc-js'
import { ClientUnaryCall }                                 from '@grpc/grpc-js'
import { Metadata }                                        from '@grpc/grpc-js'
import { ChannelOptions }                                  from '@grpc/grpc-js'
import { ConnectivityState }                               from '@grpc/grpc-js/build/src/connectivity-state.js'
// @ts-ignore
import { withCancel }                                      from '@graphql-mesh/utils'
import { credentials }                                     from '@grpc/grpc-js'
import { loadPackageDefinition }                           from '@grpc/grpc-js'
import { loadFileDescriptorSetFromObject }                 from '@grpc/proto-loader'
import { GraphQLEnumTypeConfig }                           from 'graphql'
import { ObjectTypeComposerFieldConfigAsObjectDefinition } from 'graphql-compose'
import { SchemaComposer }                                  from 'graphql-compose'
import { GraphQLBigInt }                                   from 'graphql-scalars'
import { GraphQLByte }                                     from 'graphql-scalars'
import { GraphQLUnsignedInt }                              from 'graphql-scalars'
import { GraphQLVoid }                                     from 'graphql-scalars'
import { GraphQLJSON }                                     from 'graphql-scalars'
import { AnyNestedObject }                                 from 'protobufjs'
import { IParseOptions }                                   from 'protobufjs'
import { Message }                                         from 'protobufjs'
import { Constructor }                                     from 'protobufjs'
import { IFileDescriptorSet }                              from 'protobufjs/ext/descriptor'
import { promises as fsPromises }                          from 'fs'
import { globby }                                          from 'globby'
import { specifiedDirectives }                             from 'graphql'
import { isAbsolute }                                      from 'path'
import { join }                                            from 'path'
import { promisify }                                       from 'util'
import _                                                   from 'lodash'
import protobufjs                                          from 'protobufjs'
import descriptor                                          from 'protobufjs/ext/descriptor/index.js'

import { ClientMethod }                                    from './utils.js'
import { addIncludePathResolver }                          from './utils.js'
import { addMetaDataToCall }                               from './utils.js'
import { getTypeName }                                     from './utils.js'

const { readFile } = fsPromises

const { Root } = protobufjs

interface LoadOptions extends IParseOptions {
  includeDirs?: string[]
}

type DecodedDescriptorSet = Message<IFileDescriptorSet> & IFileDescriptorSet

type RootJsonAndDecodedDescriptorSet = {
  rootJson: protobufjs.INamespace
  decodedDescriptorSet: DecodedDescriptorSet
}

interface GrpcHandlerOptions extends GetMeshSourceOptions<YamlConfig.GrpcHandler> {
  channelOptions?: Partial<ChannelOptions>
}

export default class GrpcHandler implements MeshHandler {
  private config: YamlConfig.GrpcHandler
  private baseDir: string
  private rootJsonAndDecodedDescriptorSet: StoreProxy<RootJsonAndDecodedDescriptorSet>

  constructor(private readonly options: GrpcHandlerOptions) {
    // @ts-ignore
    if (!options.config) {
      throw new Error('Config not specified!')
    }
    // @ts-ignore
    this.config = options.config
    // @ts-ignore
    this.baseDir = options.baseDir
    // @ts-ignore
    this.rootJsonAndDecodedDescriptorSet = options.store.proxy('descriptorSet.proto', {
      // @ts-ignore
      codify: ({ rootJson, decodedDescriptorSet }) =>
        `
const { FileDescriptorSet } = require('protobufjs/ext/descriptor/index.js');
module.exports = {
  decodedDescriptorSet: FileDescriptorSet.fromObject(${JSON.stringify(
    decodedDescriptorSet.toJSON(),
    null,
    2
  )}),
  rootJson: ${JSON.stringify(rootJson, null, 2)},
};
`.trim(),
      validate: () => {},
    })
  }

  getCachedDescriptorSet(creds: ChannelCredentials) {
    return this.rootJsonAndDecodedDescriptorSet.getWithSet(async () => {
      const root = new Root()
      const appendRoot = (additionalRoot: protobufjs.Root) => {
        if (additionalRoot.nested) {
          for (const namespace in additionalRoot.nested) {
            if (Object.prototype.hasOwnProperty.call(additionalRoot.nested, namespace)) {
              root.add(additionalRoot.nested[namespace])
            }
          }
        }
      }
      // @ts-expect-error
      if (this.config.descriptorSetFilePath) {
        let fileName: string
        let options: LoadOptions
        // @ts-expect-error
        if (typeof this.config.descriptorSetFilePath === 'object') {
          // @ts-expect-error
          fileName = this.config.descriptorSetFilePath.file
          options = {
            // @ts-expect-error
            ...this.config.descriptorSetFilePath.load,
            // @ts-ignore
            includeDirs: this.config.descriptorSetFilePath.load.includeDirs?.map((includeDir) =>
              isAbsolute(includeDir) ? includeDir : join(this.baseDir, includeDir)),
          }
          if (options.includeDirs) {
            if (!Array.isArray(options.includeDirs)) {
              return Promise.reject(new Error('The includeDirs option must be an array'))
            }
            addIncludePathResolver(root, options.includeDirs)
          }
        } else {
          // @ts-expect-error
          fileName = this.config.descriptorSetFilePath
        }
        const absoluteFilePath = isAbsolute(fileName) ? fileName : join(this.baseDir, fileName)
        const descriptorSetBuffer = await readFile(absoluteFilePath)
        let decodedDescriptorSet: DecodedDescriptorSet
        if (absoluteFilePath.endsWith('json')) {
          const descriptorSetJSON = JSON.parse(descriptorSetBuffer.toString())
          decodedDescriptorSet = descriptor.FileDescriptorSet.fromObject(
            descriptorSetJSON
          ) as DecodedDescriptorSet
        } else {
          decodedDescriptorSet = descriptor.FileDescriptorSet.decode(
            descriptorSetBuffer
          ) as DecodedDescriptorSet
        }
        // @ts-ignore
        const rootFromDescriptor = (Root as Constructor).fromDescriptor(decodedDescriptorSet)
        appendRoot(rootFromDescriptor)
      }

      // @ts-expect-error
      if (this.config.protoFilePath) {
        let protoRoot = new Root()
        let fileGlob: string
        let options: LoadOptions = {}
        // @ts-expect-error
        if (typeof this.config.protoFilePath === 'object') {
          // @ts-expect-error
          fileGlob = this.config.protoFilePath.file
          options = {
            // @ts-expect-error
            ...this.config.protoFilePath.load,
            // @ts-ignore
            includeDirs: this.config.protoFilePath.load.includeDirs?.map((includeDir) =>
              isAbsolute(includeDir) ? includeDir : join(this.baseDir, includeDir)),
          }
          if (options.includeDirs) {
            if (!Array.isArray(options.includeDirs)) {
              return Promise.reject(new Error('The includeDirs option must be an array'))
            }
            addIncludePathResolver(protoRoot, options.includeDirs)
          }
        } else {
          // @ts-expect-error
          fileGlob = this.config.protoFilePath
        }

        const fileNames = await globby(fileGlob, {
          cwd: this.baseDir,
        })
        protoRoot = await protoRoot.load(
          fileNames.map((filePath) =>
            isAbsolute(filePath) ? filePath : join(this.baseDir, filePath)),
          options
        )
        appendRoot(protoRoot)
      }

      root.resolveAll()

      return {
        rootJson: root.toJSON({
          keepComments: true,
        }),
        // @ts-ignore
        decodedDescriptorSet: root.toDescriptor('proto3'),
      }
    })
  }

  async getMeshSource() {
    let creds: ChannelCredentials
    if (this.config.credentialsSsl) {
      // @ts-ignore
      const absolutePrivateKeyPath = isAbsolute(this.config.credentialsSsl.privateKey)
        ? this.config.credentialsSsl.privateKey
        : // @ts-ignore
          join(this.baseDir, this.config.credentialsSsl.privateKey)
      // @ts-ignore
      const absoluteCertChainPath = isAbsolute(this.config.credentialsSsl.certChain)
        ? this.config.credentialsSsl.certChain
        : // @ts-ignore
          join(this.baseDir, this.config.credentialsSsl.certChain)

      // @ts-ignore
      const sslFiles = [readFile(absolutePrivateKeyPath), readFile(absoluteCertChainPath)]
      if (this.config.credentialsSsl.rootCA !== 'rootCA') {
        // @ts-ignore
        const absoluteRootCAPath = isAbsolute(this.config.credentialsSsl.rootCA)
          ? this.config.credentialsSsl.rootCA
          : // @ts-ignore
            join(this.baseDir, this.config.credentialsSsl.rootCA)
        // @ts-ignore
        sslFiles.unshift(readFile(absoluteRootCAPath))
      }
      const [rootCA, privateKey, certChain] = await Promise.all(sslFiles)
      // @ts-ignore
      creds = credentials.createSsl(rootCA, privateKey, certChain)
    } else if (this.config.useHTTPS) {
      creds = credentials.createSsl()
    } else {
      creds = credentials.createInsecure()
    }

    this.config.requestTimeout = this.config.requestTimeout || 200000

    const schemaComposer = new SchemaComposer()
    schemaComposer.add(GraphQLBigInt)
    schemaComposer.add(GraphQLByte)
    schemaComposer.add(GraphQLUnsignedInt)
    schemaComposer.add(GraphQLVoid)
    schemaComposer.add(GraphQLJSON)
    schemaComposer.createEnumTC({
      name: 'ConnectivityState',
      values: Object.entries(ConnectivityState).reduce((values, [key, value]) => {
        if (typeof value === 'number') {
          // @ts-ignore
          values[key] = { value }
        }
        return values
      }, {}),
    })

    const { rootJson, decodedDescriptorSet } = await this.getCachedDescriptorSet(creds)

    const packageDefinition = loadFileDescriptorSetFromObject(decodedDescriptorSet)

    const grpcObject = loadPackageDefinition(packageDefinition)

    const walkToFindTypePath = (pathWithName: string[], baseTypePath: string[]) => {
      const currentWalkingPath = [...pathWithName]
      while (!_.has(rootJson.nested, currentWalkingPath.concat(baseTypePath).join('.nested.'))) {
        if (!currentWalkingPath.length) {
          break
        }
        currentWalkingPath.pop()
      }
      return currentWalkingPath.concat(baseTypePath)
    }

    const visit = async (nested: AnyNestedObject, name: string, currentPath: string[]) => {
      const pathWithName = [...currentPath, ...name.split('.')].filter(Boolean)
      if ('nested' in nested) {
        await Promise.all(
          // @ts-ignore
          Object.keys(nested.nested).map(async (key: string) => {
            // @ts-ignore
            const currentNested = nested.nested[key]
            await visit(currentNested, key, pathWithName)
          })
        )
      }
      const typeName = pathWithName.join('_')
      if ('values' in nested) {
        const enumTypeConfig: GraphQLEnumTypeConfig = {
          name: typeName,
          values: {},
          description: (nested as any).comment,
        }
        const commentMap = (nested as any).comments
        for (const [key, value] of Object.entries(nested.values)) {
          // @ts-ignore
          enumTypeConfig.values[key] = {
            value,
            description: commentMap?.[key],
          }
        }
        // @ts-ignore
        schemaComposer.createEnumTC(enumTypeConfig)
      } else if ('fields' in nested) {
        const inputTypeName = typeName + '_Input'
        const outputTypeName = typeName
        const description = (nested as any).comment
        const fieldEntries = Object.entries(nested.fields)
        if (fieldEntries.length) {
          const inputTC = schemaComposer.createInputTC({
            name: inputTypeName,
            description,
            fields: {},
          })
          const outputTC = schemaComposer.createObjectTC({
            name: outputTypeName,
            description,
            fields: {},
          })
          await Promise.all(
            fieldEntries.map(async ([fieldName, { type, rule, comment }]: any[]) => {
              const baseFieldTypePath = type.split('.')
              inputTC.addFields({
                [fieldName]: {
                  type: () => {
                    const fieldTypePath = walkToFindTypePath(pathWithName, baseFieldTypePath)
                    const fieldInputTypeName = getTypeName(schemaComposer, fieldTypePath, true)
                    return rule === 'repeated' ? `[${fieldInputTypeName}]` : fieldInputTypeName
                  },
                  description: comment,
                },
              })
              outputTC.addFields({
                [fieldName]: {
                  type: () => {
                    const fieldTypePath = walkToFindTypePath(pathWithName, baseFieldTypePath)
                    const fieldTypeName = getTypeName(schemaComposer, fieldTypePath, false)
                    return rule === 'repeated' ? `[${fieldTypeName}]` : fieldTypeName
                  },
                  description: comment,
                },
              })
            })
          )
        } else {
          // @ts-ignore
          schemaComposer.createScalarTC({
            ...GraphQLJSON.toConfig(),
            name: inputTypeName,
            description,
          })
          // @ts-ignore
          schemaComposer.createScalarTC({
            ...GraphQLJSON.toConfig(),
            name: outputTypeName,
            description,
          })
        }
      } else if ('methods' in nested) {
        const objPath = pathWithName.join('.')
        const ServiceClient = _.get(grpcObject, objPath)
        if (typeof ServiceClient !== 'function') {
          throw new Error(`Object at path ${objPath} is not a Service constructor`)
        }
        const client = new ServiceClient(this.config.endpoint, creds, this.options.channelOptions)
        const methods = nested.methods
        await Promise.all(
          Object.entries(methods).map(async ([methodName, method]) => {
            const rootFieldName = [...pathWithName, methodName].join('_')
            const fieldConfig: ObjectTypeComposerFieldConfigAsObjectDefinition<any, any> = {
              type: () => {
                const baseResponseTypePath = method.responseType?.split('.')
                if (baseResponseTypePath) {
                  const responseTypePath = walkToFindTypePath(pathWithName, baseResponseTypePath)
                  return getTypeName(schemaComposer, responseTypePath, false)
                }
                return 'Void'
              },
              description: method.comment,
            }
            fieldConfig.args = {
              // @ts-ignore
              input: () => {
                const baseRequestTypePath = method.requestType?.split('.')
                if (baseRequestTypePath) {
                  const requestTypePath = walkToFindTypePath(pathWithName, baseRequestTypePath)
                  const requestTypeName = getTypeName(schemaComposer, requestTypePath, true)
                  return requestTypeName
                }
                return undefined
              },
            }
            if (method.responseStream) {
              // @ts-expect-error
              const clientMethod: ClientMethod = (input: unknown = {}, metaData?: Metadata) => {
                const responseStream = client[methodName](
                  input,
                  metaData
                ) as ClientReadableStream<any>
                let isCancelled = false
                const responseStreamWithCancel = withCancel(responseStream, () => {
                  if (!isCancelled) {
                    responseStream.call?.cancelWithStatus(0, 'Cancelled by GraphQL Mesh')
                    isCancelled = true
                  }
                })
                return responseStreamWithCancel
              }
              schemaComposer.Subscription.addFields({
                [rootFieldName]: {
                  ...fieldConfig,
                  subscribe: (
                    __,
                    args: Record<string, unknown>,
                    context: Record<string, unknown>
                  ) => addMetaDataToCall(clientMethod, args.input, context, this.config.metaData!),
                  resolve: (payload: unknown) => payload,
                },
              })
            } else {
              const clientMethod = promisify<ClientUnaryCall>(
                client[methodName].bind(client) as ClientMethod
              )
              if (
                methodName.toLowerCase().startsWith('get') ||
                methodName.toLowerCase().startsWith('list')
              ) {
                schemaComposer.Query.addFields({
                  [rootFieldName]: {
                    ...fieldConfig,
                    resolve: (_, args: Record<string, unknown>, context: Record<string, unknown>) =>
                      addMetaDataToCall(
                        clientMethod,
                        args.input || {},
                        context,
                        this.config.metaData!
                      ),
                  },
                })
              } else {
                schemaComposer.Mutation.addFields({
                  [rootFieldName]: {
                    ...fieldConfig,
                    resolve: (_, args: Record<string, unknown>, context: Record<string, unknown>) =>
                      addMetaDataToCall(
                        clientMethod,
                        args.input || {},
                        context,
                        this.config.metaData!
                      ),
                  },
                })
              }
            }
          })
        )
        const connectivityStateFieldName = pathWithName.join('_') + '_connectivityState'
        schemaComposer.Query.addFields({
          [connectivityStateFieldName]: {
            type: 'ConnectivityState',
            args: {
              tryToConnect: {
                type: 'Boolean',
              },
            },
            resolve: (_, { tryToConnect }) =>
              client.getChannel().getConnectivityState(tryToConnect),
          },
        })
      }
    }
    await visit(rootJson, '', [])

    // graphql-compose doesn't add @defer and @stream to the schema
    specifiedDirectives.forEach((directive) => schemaComposer.addDirective(directive))

    const schema = schemaComposer.buildSchema()

    return {
      schema,
    }
  }
}
