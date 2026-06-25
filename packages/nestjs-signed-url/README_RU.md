# ATLS NestJS Signed URL

[![Signed URL Docs EN](https://img.shields.io/badge/Signed%20URL%20Docs-EN-1f8a70)](README.md)
[![Signed URL Docs RU](https://img.shields.io/badge/Signed%20URL%20Docs-RU-0b5fff)](README_RU.md)

<!-- sync:root-what -->

## Что это

`@atls/nestjs-signed-url` — NestJS-пакет для генерации подписанных URL на чтение и запись через единый слой подписи

Пакет отвечает за подпись URL, подключение NestJS-модуля и сопоставление параметров провайдеров. Создание клиентов облачных SDK остаётся в клиентских пакетах, например `@atls/nestjs-gcs-client` и `@atls/nestjs-s3-client`

<!-- sync:root-audience -->

## Для кого

- Для NestJS-сервисов, которым нужны короткоживущие URL загрузки и скачивания для объектного хранилища
- Для проектов, которым нужен один API подписи поверх GCS, S3 и S3-совместимых провайдеров, например Cloudflare R2
- Для команд, которые уже настраивают клиенты хранилищ через NestJS DI и не хотят, чтобы код подписи владел учётными данными, адресами или настройкой SDK

<!-- sync:root-capabilities -->

## Что умеет пакет

- Даёт `SignedUrlModule.register` и `SignedUrlModule.registerAsync` для собственных шлюзов подписи
- Даёт `SignedUrlModule.gcs` и `SignedUrlModule.gcsAsync` для подписи Google Cloud Storage поверх внедрённого клиента `Storage`
- Даёт `SignedUrlModule.s3` и `SignedUrlModule.s3Async` для AWS S3 и S3-совместимой подписи поверх внедрённого `S3Client`
- Генерирует URL чтения через `generateReadUrl(bucket, filename, options)`
- Генерирует URL записи через `generateWriteUrl(bucket, filename, options)`
- Держит параметры конкретных провайдеров в группах `gcs` и `s3`, не протаскивая их в общие параметры подписи

<!-- sync:root-install -->

## Установка

```bash
yarn add @atls/nestjs-signed-url
```

Для подписи через GCS установите и настройте пакет GCS-клиента в том же приложении:

```bash
yarn add @atls/nestjs-gcs-client
```

Для подписи через S3 или R2 используйте пакет S3-клиента:

```bash
yarn add @atls/nestjs-s3-client
```

<!-- sync:root-quickstart -->

## Быстрый старт

### Провайдер-независимый шлюз

Используйте `register`, если в приложении уже есть реализация шлюза подписи:

```typescript
import type { SignedUrlGateway } from '@atls/nestjs-signed-url'

import { Module }                from '@nestjs/common'

import { SignedUrlModule }       from '@atls/nestjs-signed-url'

class AssetsSignedUrlGateway implements SignedUrlGateway {
  async generateReadUrl(bucket: string, filename: string) {
    return {
      url: `https://cdn.example.com/${bucket}/${filename}`,
      fields: [],
    }
  }

  async generateWriteUrl(bucket: string, filename: string) {
    return {
      url: `https://upload.example.com/${bucket}/${filename}`,
      fields: [],
    }
  }
}

@Module({
  imports: [
    SignedUrlModule.register({
      useClass: AssetsSignedUrlGateway,
    }),
  ],
})
export class AssetsModule {}
```

Внедряйте `SignedUrlSigner` там, где приложению нужны URL:

```typescript
import { Injectable }      from '@nestjs/common'

import { SignedUrlSigner } from '@atls/nestjs-signed-url'

@Injectable()
export class AssetsService {
  constructor(private readonly signer: SignedUrlSigner) {}

  createReadUrl() {
    return this.signer.generateReadUrl('assets', 'avatar.png', {
      expiresInSeconds: 300,
      responseDisposition: 'inline',
    })
  }

  createWriteUrl() {
    return this.signer.generateWriteUrl('assets', 'avatar.png', {
      contentType: 'image/png',
      expiresInSeconds: 300,
    })
  }
}
```

### Асинхронная регистрация шлюза

Используйте `registerAsync`, если шлюз создаётся из провайдера другого модуля:

В примере ниже `StorageGatewayModule` экспортирует `STORAGE_SIGNED_URL_GATEWAY`:

```typescript
import type { SignedUrlGateway } from '@atls/nestjs-signed-url'

import { Module }                from '@nestjs/common'

import { SignedUrlModule }       from '@atls/nestjs-signed-url'

@Module({
  imports: [
    SignedUrlModule.registerAsync<[SignedUrlGateway]>({
      imports: [StorageGatewayModule],
      inject: [STORAGE_SIGNED_URL_GATEWAY],
      useFactory: (gateway: SignedUrlGateway) => gateway,
    }),
  ],
})
export class AssetsModule {}
```

<!-- sync:root-gcs -->

## Использование GCS

`SignedUrlModule.gcsAsync` принимает экземпляр Google Cloud Storage `Storage`. Рекомендуемый путь — оставить создание клиента в `@atls/nestjs-gcs-client` и передать готовый клиент в signed-url:

```typescript
import type { Storage }     from '@atls/nestjs-gcs-client'

import { Module }           from '@nestjs/common'

import { GcsClientFactory } from '@atls/nestjs-gcs-client'
import { GcsClientModule }  from '@atls/nestjs-gcs-client'
import { SignedUrlModule }  from '@atls/nestjs-signed-url'

@Module({
  imports: [
    SignedUrlModule.gcsAsync<[GcsClientFactory]>({
      imports: [
        GcsClientModule.register({
          keyFilename: process.env.GCS_KEY_FILENAME,
          apiEndpoint: process.env.GCS_API_ENDPOINT,
        }),
      ],
      inject: [GcsClientFactory],
      useFactory: (factory: GcsClientFactory): Storage => factory.create(),
    }),
  ],
})
export class AssetsModule {}
```

Используйте `GcsSignedUrlSigner`, когда нужны типизированные параметры GCS:

```typescript
import { Injectable }         from '@nestjs/common'

import { GcsSignedUrlSigner } from '@atls/nestjs-signed-url'

@Injectable()
export class GcsAssetsService {
  constructor(private readonly signer: GcsSignedUrlSigner) {}

  createUploadUrl() {
    return this.signer.generateWriteUrl('assets', 'avatar.png', {
      contentType: 'image/png',
      expiresInSeconds: 300,
      headers: {
        'x-goog-meta-origin': 'profile',
      },
      responseDisposition: 'inline',
      gcs: {
        virtualHostedStyle: true,
      },
    })
  }
}
```

<!-- sync:root-s3 -->

## Использование S3 и R2

`SignedUrlModule.s3Async` принимает `S3Client`. Рекомендуемый путь — оставить регион, учётные данные, endpoint и настройку S3-совместимого клиента в `@atls/nestjs-s3-client`:

```typescript
import type { S3Client }   from '@atls/nestjs-s3-client'

import { Module }          from '@nestjs/common'

import { S3ClientFactory } from '@atls/nestjs-s3-client'
import { S3ClientModule }  from '@atls/nestjs-s3-client'
import { SignedUrlModule } from '@atls/nestjs-signed-url'

@Module({
  imports: [
    SignedUrlModule.s3Async<[S3ClientFactory]>({
      imports: [
        S3ClientModule.register({
          region: process.env.S3_REGION,
          endpoint: process.env.S3_ENDPOINT,
        }),
      ],
      inject: [S3ClientFactory],
      useFactory: (factory: S3ClientFactory): S3Client => factory.create(),
    }),
  ],
})
export class AssetsModule {}
```

Для Cloudflare R2 используйте тот же S3-путь, передав S3-совместимый endpoint и учётные данные в `S3ClientModule`:

```typescript
S3ClientModule.register({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})
```

Используйте `S3SignedUrlSigner`, когда нужны типизированные параметры S3 command или presigner:

```typescript
import { Injectable }        from '@nestjs/common'

import { S3SignedUrlSigner } from '@atls/nestjs-signed-url'

@Injectable()
export class S3AssetsService {
  constructor(private readonly signer: S3SignedUrlSigner) {}

  createUploadUrl() {
    return this.signer.generateWriteUrl('assets', 'avatar.png', {
      contentType: 'image/png',
      expiresInSeconds: 300,
      s3: {
        command: {
          Metadata: {
            source: 'profile',
          },
        },
        presign: {
          unhoistableHeaders: new Set(['x-amz-meta-source']),
        },
      },
    })
  }
}
```

<!-- sync:root-options -->

## Параметры подписанных URL

Общие параметры:

| Параметр              | Область                    | Описание                                                                                    |
| --------------------- | -------------------------- | ------------------------------------------------------------------------------------------- |
| `expiresAt`           | чтение и запись            | Абсолютное время истечения как `Date` или timestamp в миллисекундах                         |
| `expiresInSeconds`    | чтение и запись            | Относительное время жизни в секундах; по умолчанию `900` секунд                             |
| `responseDisposition` | чтение и запись            | Значение response disposition, которое переносится в параметр заголовка ответа провайдера   |
| `headers`             | общий слой и параметры GCS | Заголовки, подписываемые провайдерами с такой формой; GCS переносит их в `extensionHeaders` |
| `contentType`         | только запись              | Обязательный тип содержимого для URL записи                                                 |

Параметры GCS:

| Параметр | Область         | Описание                                                                                                                                                 |
| -------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `gcs`    | чтение и запись | Дополнительные значения GCS `GetSignedUrlConfig`, кроме полей общего слоя: `action`, `contentType`, `expires`, `extensionHeaders`, `responseDisposition` |

Параметры S3:

| Параметр     | Область         | Описание                                                                                                         |
| ------------ | --------------- | ---------------------------------------------------------------------------------------------------------------- |
| `s3.command` | чтение и запись | Дополнительные значения `GetObjectCommandInput` или `PutObjectCommandInput`, кроме `Bucket`, `Key` и общих полей |
| `s3.presign` | чтение и запись | Дополнительные параметры AWS presigner, кроме `expiresIn`, которым владеют `expiresAt` и `expiresInSeconds`      |

Типы параметров чтения и записи S3 намеренно не открывают общее поле `headers`. При записи `contentType` переносится в `ContentType` и подписывается через S3 presigner path

<!-- sync:root-limitations -->

## Ограничения

- Пакет не создаёт клиенты GCS или S3. Используйте `@atls/nestjs-gcs-client`, `@atls/nestjs-s3-client` или передайте уже настроенный клиент
- Пакет не владеет учётными данными, регионами, endpoints, buckets или настройкой retry в SDK
- GCS-подпись возвращает `{ url, fields: [] }`
- S3- и R2-подпись возвращает `{ url, fields: [] }`
- R2 поддерживается через S3-совместимый клиентский путь, а не через отдельный R2 module
- Данные конкретного SDK живут внутри групп параметров `gcs` и `s3`

<!-- sync:root-migration -->

## Миграция с `@atlantis-lab/nestjs-signed-url`

Используйте новое имя пакета:

```typescript
import { SignedUrlModule } from '@atls/nestjs-signed-url'
import { SignedUrlSigner } from '@atls/nestjs-signed-url'
```

Ожидаемые изменения при миграции:

- Заменить старое имя пакета на `@atls/nestjs-signed-url`
- Использовать `contentType` для типа содержимого URL записи вместо старого имени `type`
- Перенести параметры GCS-клиента в `@atls/nestjs-gcs-client`
- Перенести параметры S3, R2, region, endpoint и учётных данных в `@atls/nestjs-s3-client`
- Использовать signers конкретных провайдеров только когда нужны их параметры: `GcsSignedUrlSigner` для `gcs` options и `S3SignedUrlSigner` для `s3` options

<!-- sync:root-read-more -->

## Что читать дальше

- EN: [README.md](README.md)
- RU: [README_RU.md](README_RU.md)
- Changelog пакета: [CHANGELOG.md](CHANGELOG.md)
- Пакет GCS-клиента: [`@atls/nestjs-gcs-client`](../nestjs-gcs-client)
- Пакет S3-клиента: [`@atls/nestjs-s3-client`](../nestjs-s3-client)
