import { Injectable, Type }         from '@nestjs/common'
import { InstanceWrapper }          from '@nestjs/core/injector/instance-wrapper'
import { Module }                   from '@nestjs/core/injector/module'
import { ModulesContainer }         from '@nestjs/core/injector/modules-container'

import { HANDLES_MESSAGE_METADATA } from '../decorators/constants'

@Injectable()
export class ExplorerService {
  constructor(private readonly modulesContainer: ModulesContainer) {}

  explore(): any {
    // @ts-ignore
    const modules = [...this.modulesContainer.values()]

    const events = this.flatMap<any>(modules, (instance) =>
      this.filterProvider(instance, HANDLES_MESSAGE_METADATA)
    )

    return { events }
  }

  flatMap<T>(
    modules: Module[],
    callback: (instance: InstanceWrapper) => Type<any> | undefined
  ): Type<T>[] {
    const items = modules
      // @ts-ignore
      .map((module) => [...module.providers.values()].map(callback))
      .reduce((a, b) => a.concat(b), [])
    return items.filter((element) => !!element) as Type<T>[]
  }

  filterProvider(wrapper: InstanceWrapper, metadataKey: string): Type<any> | undefined {
    const { instance } = wrapper
    if (!instance) {
      return undefined
    }
    return this.extractMetadata(instance, metadataKey)
  }

  extractMetadata(instance: Object, metadataKey: string): Type<any> {
    if (!instance.constructor) {
      return
    }
    const metadata = Reflect.getMetadata(metadataKey, instance.constructor)
    return metadata ? (instance.constructor as Type<any>) : undefined
  }
}
