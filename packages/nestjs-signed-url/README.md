# ATLS NestJS Signed URL

[![Signed URL Docs EN](https://img.shields.io/badge/Signed%20URL%20Docs-EN-1f8a70)](README.md)
[![Signed URL Docs RU](https://img.shields.io/badge/Signed%20URL%20Docs-RU-0b5fff)](README_RU.md)

<!-- sync:root-what -->

## What this is

`@atls/nestjs-signed-url` is a NestJS package for generating signed read and write URLs through a provider-neutral signing boundary

The package owns URL signing, NestJS module wiring, and provider option mapping. Cloud SDK client construction stays in the client packages such as `@atls/nestjs-gcs-client` and `@atls/nestjs-s3-client`

<!-- sync:root-audience -->

## Who it is for

- NestJS services that need short-lived upload or download URLs for object storage
- Projects that want one signing API over GCS, S3, and S3-compatible providers such as Cloudflare R2
- Teams that already configure storage clients through NestJS DI and do not want signing code to own credentials, endpoints, or SDK setup

<!-- sync:root-capabilities -->

## What the package can do

- Provide `SignedUrlModule.register` and `SignedUrlModule.registerAsync` for custom signing gateways
- Provide `SignedUrlModule.gcs` and `SignedUrlModule.gcsAsync` for Google Cloud Storage signing over an injected `Storage` client
- Provide `SignedUrlModule.s3` and `SignedUrlModule.s3Async` for AWS S3 and S3-compatible signing over an injected `S3Client`
- Generate read URLs through `generateReadUrl(bucket, filename, options)`
- Generate write URLs through `generateWriteUrl(bucket, filename, options)`
- Keep provider-specific options in `gcs` and `s3` option bags instead of leaking them into the common signing options

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

### Provider-neutral gateway

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

`SignedUrlModule.gcsAsync` consumes a Google Cloud Storage `Storage` instance. The recommended path is to let `@atls/nestjs-gcs-client` own client construction and pass the created client into signed-url:

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

`SignedUrlModule.s3Async` consumes an `S3Client`. The recommended path is to let `@atls/nestjs-s3-client` own region, credentials, endpoint, and S3-compatible client setup:

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

Common options:

| Option                | Scope                            | Description                                                                              |
| --------------------- | -------------------------------- | ---------------------------------------------------------------------------------------- |
| `expiresAt`           | read and write                   | Absolute expiration as `Date` or millisecond timestamp                                   |
| `expiresInSeconds`    | read and write                   | Relative expiration in seconds; default is `900` seconds                                 |
| `responseDisposition` | read and write                   | Response disposition mapped to the provider-specific response header option              |
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

S3 read and write option types intentionally do not expose the common `headers` field. Write `contentType` is mapped to `ContentType` and signed through the S3 presigner path

<!-- sync:root-limitations -->

## Limitations

- This package does not create GCS or S3 clients. Use `@atls/nestjs-gcs-client`, `@atls/nestjs-s3-client`, or pass an already configured client
- This package does not own credentials, regions, endpoints, buckets, or SDK retry configuration
- GCS signing returns `{ url, fields: [] }`
- S3 and R2 signing returns `{ url, fields: [] }`
- R2 is supported through the S3-compatible client path, not through a separate R2 module
- Provider-specific SDK payloads stay inside `gcs` and `s3` option bags

<!-- sync:root-migration -->

## Migration from `@atlantis-lab/nestjs-signed-url`

Use the new package name:

```typescript
import { SignedUrlModule } from '@atls/nestjs-signed-url'
import { SignedUrlSigner } from '@atls/nestjs-signed-url'
```

Expected migration changes:

- Replace the old package name with `@atls/nestjs-signed-url`
- Use `contentType` for write URL content type instead of legacy `type` naming
- Move GCS client options to `@atls/nestjs-gcs-client`
- Move S3, R2, region, endpoint, and credential options to `@atls/nestjs-s3-client`
- Use provider-specific signers only when provider-specific options are needed: `GcsSignedUrlSigner` for `gcs` options and `S3SignedUrlSigner` for `s3` options

<!-- sync:root-read-more -->

## Where to read next

- EN: [README.md](README.md)
- RU: [README_RU.md](README_RU.md)
- Package changelog: [CHANGELOG.md](CHANGELOG.md)
- GCS client package: [`@atls/nestjs-gcs-client`](../nestjs-gcs-client)
- S3 client package: [`@atls/nestjs-s3-client`](../nestjs-s3-client)
