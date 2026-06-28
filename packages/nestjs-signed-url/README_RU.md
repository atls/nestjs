# ATLS NestJS Signed URL

[![Signed URL Docs EN](https://img.shields.io/badge/Signed%20URL%20Docs-EN-1f8a70)](README.md)
[![Signed URL Docs RU](https://img.shields.io/badge/Signed%20URL%20Docs-RU-0b5fff)](README_RU.md)

<!-- sync:root-what -->

## Что это

@atls/nestjs-signed-url даёт NestJS-сервисам единый вход для выдачи
подписанных ссылок к объектному хранилищу. Код приложения запрашивает ссылку на
чтение или запись по контейнеру, имени объекта и типизированным параметрам;
пакет передаёт провайдерскую часть адаптерам GCS или S3.

Пакет намеренно ограничен подписью. Он собирает провайдеры NestJS, переводит
общие параметры в формат SDK и оставляет создание клиентов
[@atls/nestjs-gcs-client](../nestjs-gcs-client),
[@atls/nestjs-s3-client](../nestjs-s3-client) или провайдеру приложения.

<!-- sync:root-audience -->

## Для кого

- Для сервисов, которые отдают браузеру, мобильному клиенту или фоновому
  обработчику прямую ссылку на загрузку и скачивание, не прокачивая файл через
  NestJS-приложение
- Для приложений на GCS через
  [@atls/nestjs-gcs-client](../nestjs-gcs-client), S3 через
  [@atls/nestjs-s3-client](../nestjs-s3-client) или другом S3-совместимом
  клиенте, которым нужен один способ внедрять подпись ссылок в NestJS
- Для команд, которые держат учётные данные и настройку SDK в клиентских
  модулях, а правила загрузки и скачивания — в доменных сервисах

<!-- sync:root-capabilities -->

## Роль пакета

- Превращает контейнер, имя объекта, срок действия, тип содержимого и параметры
  ответа в подписанную ссылку на чтение или запись
- Позволяет доменным сервисам зависеть от SignedUrlSigner; для провайдерских
  параметров доступны GcsSignedUrlSigner и S3SignedUrlSigner
- Держит данные SDK для GCS и S3 внутри явных групп gcs и s3, не смешивая
  их с общими параметрами подписи
- Поддерживает собственный шлюз подписи для приложений, которые подписывают
  ссылки через CDN, внутренний сервис хранилища или другого провайдера
- Поддерживает Cloudflare R2 через S3-совместимый клиент

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

### Собственный шлюз

Используйте register, если в приложении уже есть реализация шлюза подписи:

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

Внедряйте SignedUrlSigner там, где приложению нужны URL:

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

Используйте registerAsync, если шлюз создаётся из провайдера другого модуля:

В примере ниже StorageGatewayModule экспортирует STORAGE_SIGNED_URL_GATEWAY:

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

SignedUrlModule.gcsAsync принимает экземпляр Google Cloud Storage Storage.
Рекомендуемый путь — оставить создание клиента в @atls/nestjs-gcs-client и
передать готовый клиент в этот пакет:

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

Используйте GcsSignedUrlSigner, когда нужны типизированные параметры GCS:

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

SignedUrlModule.s3Async принимает S3Client. Рекомендуемый путь — оставить
регион, учётные данные, адрес и настройку S3-совместимого клиента в
@atls/nestjs-s3-client:

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

Для Cloudflare R2 используйте тот же S3-клиент, передав S3-совместимый адрес и
учётные данные в S3ClientModule:

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

Используйте S3SignedUrlSigner, когда нужны типизированные параметры команды
S3 или параметры подписи:

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

Общие параметры подписи:

| Параметр            | Область               | Описание                                                                                  |
| ------------------- | --------------------- | ----------------------------------------------------------------------------------------- |
| expiresAt           | чтение и запись       | Абсолютное время истечения как Date или метка времени в миллисекундах                     |
| expiresInSeconds    | чтение и запись       | Относительное время жизни в секундах; по умолчанию 900 секунд                             |
| responseDisposition | чтение и запись       | Значение Content-Disposition, которое переносится в параметр ответа провайдера            |
| headers             | общие параметры и GCS | Заголовки, подписываемые провайдерами с такой формой; GCS переносит их в extensionHeaders |
| contentType         | только запись         | Обязательный тип содержимого для URL записи                                               |

Параметры GCS:

| Параметр | Область         | Описание                                                                                                                               |
| -------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| gcs      | чтение и запись | Дополнительные значения GCS GetSignedUrlConfig, кроме общих полей: action, contentType, expires, extensionHeaders, responseDisposition |

Параметры S3:

| Параметр   | Область         | Описание                                                                                                    |
| ---------- | --------------- | ----------------------------------------------------------------------------------------------------------- |
| s3.command | чтение и запись | Дополнительные значения GetObjectCommandInput или PutObjectCommandInput, кроме Bucket, Key и общих полей    |
| s3.presign | чтение и запись | Дополнительные параметры функции подписи AWS, кроме expiresIn, которым владеют expiresAt и expiresInSeconds |

Типы параметров чтения и записи S3 намеренно не открывают общее поле headers.
При записи contentType переносится в ContentType и подписывается через
механизм подписи S3.

<!-- sync:root-limitations -->

## Ограничения

- Пакет только подписывает ссылки. Он не загружает, не скачивает, не удаляет
  объекты и не создаёт контейнеры
- Пакет не создаёт клиенты GCS или S3. Используйте
  [@atls/nestjs-gcs-client](../nestjs-gcs-client),
  [@atls/nestjs-s3-client](../nestjs-s3-client) или передайте уже настроенный
  клиент
- Учётные данные, регионы, адреса, имена контейнеров и политика повторных
  попыток SDK остаются в настроенном клиенте хранилища
- Подпись для GCS, S3 и R2 сейчас возвращает { url, fields: [] }; поля
  браузерной POST-политики здесь не реализованы
- R2 поддерживается через S3-совместимый клиент, а не через отдельный R2-модуль
- Данные конкретного SDK живут внутри групп параметров gcs и s3

<!-- sync:root-read-more -->

## Что читать дальше

- EN: [README.md](README.md)
- RU: [README_RU.md](README_RU.md)
- Журнал изменений пакета: [CHANGELOG.md](CHANGELOG.md)
- Пакет GCS-клиента: [@atls/nestjs-gcs-client](../nestjs-gcs-client)
- Пакет S3-клиента: [@atls/nestjs-s3-client](../nestjs-s3-client)
