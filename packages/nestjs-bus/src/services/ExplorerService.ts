import { InstanceWrapper }          from '@nestjs/core/injector/instance-wrapper'
import { Module }                   from '@nestjs/core/injector/module'
import { ModulesContainer }         from '@nestjs/core/injector/modules-container'

import { Injectable, Type }         from '@nestjs/common'

import { HANDLES_MESSAGE_METADATA } from '../decorators/constants'

@Injectable()
export class ExplorerService {
  constructor(private readonly modulesContainer: ModulesContainer) {}

  explore(): any {
    const modules = [...(this.modulesContainer as any).values()]
    const events = this.flatMap(modules, instance =>
      this.filterProvider(instance, HANDLES_MESSAGE_METADATA)
    )
    return { events }
  }

  flatMap<T>(
    modules: Module[],
    callback: (instance: InstanceWrapper) => Type<any> | undefined
  ): Type<T>[] {
    const items: any[] = modules
      .map(module => [...(module.providers as any).values()].map(callback))
      .reduce((a, b) => a.concat(b), [])

    return items.filter(element => !!element)
  }

  filterProvider(wrapper: InstanceWrapper, metadataKey: string): Type<any> | undefined {
    const { instance } = wrapper

    if (!instance) {
      return undefined
    }

    return this.extractMetadata(instance, metadataKey)
  }

  extractMetadata(instance: Object, metadataKey: string): Type<any> | undefined {
    if (!instance.constructor) {
      return undefined
    }
    const metadata = Reflect.getMetadata(metadataKey, instance.constructor)
    return metadata ? (instance.constructor as any) : undefined
  }
}
