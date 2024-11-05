import type { ServiceType } from '@bufbuild/protobuf'

export class CustomMetadataStore {
  private static instance: CustomMetadataStore

  private customMetadata: Map<string, ServiceType> = new Map()

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static getInstance(): CustomMetadataStore {
    if (!CustomMetadataStore.instance) {
      CustomMetadataStore.instance = new CustomMetadataStore()
    }
    return CustomMetadataStore.instance
  }

  set(key: string, value: ServiceType): void {
    this.customMetadata.set(key, value)
  }

  get(key: string): ServiceType | undefined {
    return this.customMetadata.get(key) ?? undefined
  }
}
