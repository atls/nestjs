# ATLS NestJS Signed URL

[![Signed URL Docs EN](https://img.shields.io/badge/Signed%20URL%20Docs-EN-1f8a70)](README.md)
[![Signed URL Docs RU](https://img.shields.io/badge/Signed%20URL%20Docs-RU-0b5fff)](README_RU.md)

<!-- sync:root-what -->

## What this is

`@atls/nestjs-signed-url` gives NestJS services one way to generate signed
object-storage URLs. Application code asks for a read or write URL by bucket,
object name, and typed options; the package delegates provider-specific signing
to GCS or S3 adapters.

The package deliberately stops at signing. It wires NestJS providers, maps common
options to provider SDK payloads, and leaves storage client construction to
`@atls/nestjs-gcs-client`, `@atls/nestjs-s3-client`, or an application-owned
provider.

<!-- sync:root-audience -->

## Who it is for

- Services that let browsers, mobile clients, or workers upload and download
  objects directly without proxying file bytes through the NestJS application
- Applications that use GCS, S3, or S3-compatible storage and want the same
  NestJS provider model for URL signing
- Teams that keep credentials and SDK setup in storage-client modules while
  keeping upload and download policy in domain services

<!-- sync:root-capabilities -->

## Core role

- Turns bucket, object name, expiration, content type, and response metadata into
  provider-signed read or write URLs
- Lets domain services depend on `SignedUrlSigner`, with `GcsSignedUrlSigner` and
  `S3SignedUrlSigner` available when provider-specific options are required
- Keeps GCS and S3 SDK payloads inside explicit `gcs` and `s3` option bags
  instead of mixing provider details into common signing options
- Supports custom signing gateways for applications that sign through a CDN,
  internal storage service, or another provider
- Supports Cloudflare R2 through the S3-compatible client

<!-- sync:root-install -->

## Installation

```bash
yarn add @atls/nestjs-signed-url
```

For GCS-backed signing, install and configure the GCS client package in the same application:

```bash
yarn add @atls/nestjs-gcs-client
```

For S3 or R2-backed signing, use the S3 client package:

```bash
yarn add @atls/nestjs-s3-client
```

<!-- sync:root-quickstart -->

## Quickstart

### Custom gateway

Use `register` when the application already has a signing gateway implementation:

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

Inject `SignedUrlSigner` where the application needs URLs:

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

### Async gateway registration

Use `registerAsync` when the gateway is created from another module provider:

The example assumes that `StorageGatewayModule` exports `STORAGE_SIGNED_URL_GATEWAY`:

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

## GCS usage

`SignedUrlModule.gcsAsync` consumes a Google Cloud Storage `Storage` instance.
The recommended path is to let `@atls/nestjs-gcs-client` own client construction
and pass the created client into this package:

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

Use `GcsSignedUrlSigner` when you need typed GCS options:

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

## S3 and R2 usage

`SignedUrlModule.s3Async` consumes an `S3Client`. The recommended path is to let
`@atls/nestjs-s3-client` own region, credentials, endpoint, and S3-compatible
client setup:

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

Use the same S3 path for Cloudflare R2 by passing an S3-compatible endpoint and credentials to `S3ClientModule`:

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

Use `S3SignedUrlSigner` when you need typed S3 command or presigner options:

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

## Signed URL options

Common signing options:

| Option                | Scope                            | Description                                                                              |
| --------------------- | -------------------------------- | ---------------------------------------------------------------------------------------- |
| `expiresAt`           | read and write                   | Absolute expiration as `Date` or millisecond timestamp                                   |
| `expiresInSeconds`    | read and write                   | Relative expiration in seconds; default is `900` seconds                                 |
| `responseDisposition` | read and write                   | Response `Content-Disposition` mapped to the provider-specific response header option    |
| `headers`             | provider-neutral and GCS options | Headers signed by providers that support this shape; GCS maps them to `extensionHeaders` |
| `contentType`         | write only                       | Required write content type                                                              |

GCS options:

| Option | Scope          | Description                                                                                                                                                         |
| ------ | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `gcs`  | read and write | Extra GCS `GetSignedUrlConfig` values except fields owned by the common contract: `action`, `contentType`, `expires`, `extensionHeaders`, and `responseDisposition` |

S3 options:

| Option       | Scope          | Description                                                                                               |
| ------------ | -------------- | --------------------------------------------------------------------------------------------------------- |
| `s3.command` | read and write | Extra `GetObjectCommandInput` or `PutObjectCommandInput` values except `Bucket`, `Key`, and common fields |
| `s3.presign` | read and write | Extra AWS presigner options except `expiresIn`, which is owned by `expiresAt` or `expiresInSeconds`       |

S3 read and write option types intentionally do not expose the common `headers`
field. Write `contentType` is mapped to `ContentType` and signed through the S3
presigner path.

<!-- sync:root-limitations -->

## Limitations

- This package signs URLs only. It does not upload, download, delete objects, or
  create buckets
- This package does not create GCS or S3 clients. Use `@atls/nestjs-gcs-client`,
  `@atls/nestjs-s3-client`, or pass an already configured client
- Credentials, regions, endpoints, bucket names, and SDK retry policy stay with
  the configured storage client
- GCS, S3, and R2 signing currently return `{ url, fields: [] }`; browser POST
  policy fields are not implemented here
- R2 is supported through the S3-compatible client path, not through a separate
  R2 module
- Provider-specific SDK payloads stay inside `gcs` and `s3` option bags

<!-- sync:root-read-more -->

## Where to read next

- EN: [README.md](README.md)
- RU: [README_RU.md](README_RU.md)
- Package changelog: [CHANGELOG.md](CHANGELOG.md)
- GCS client package: [`@atls/nestjs-gcs-client`](../nestjs-gcs-client)
- S3 client package: [`@atls/nestjs-s3-client`](../nestjs-s3-client)
