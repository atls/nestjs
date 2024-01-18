import { FileToCopy } from 'testcontainers/build/types'

export const KETO_MIGRATE_COMMAND = ['migrate', 'up', '--yes']

export const KETO_START_COMMAND = ['serve']

export const KETO_INIT_COMMAND = [
  'keto',
  'relation-tuple',
  'create',
  '/home/ory/relationships',
  '--insecure-disable-transport-security',
  '--insecure-skip-hostname-verification',
]

export const DB_ENVIRONMENT = {
  POSTGRESQL_PASSWORD: 'password',
  POSTGRESQL_DATABASE: 'db',
  POSTGRESQL_USER: 'postgres',
}

export const DB_PORT = 5432

export const KETO_ENVIRONMENT = {
  KETO_WRITE_REMOTE: 'localhost:4467',
  KETO_READ_REMOTE: 'localhost:4466',
  LOG_LEVEL: 'debug',
  DSN: `postgres://${DB_ENVIRONMENT.POSTGRESQL_USER}:${DB_ENVIRONMENT.POSTGRESQL_PASSWORD}@${
    DB_ENVIRONMENT.POSTGRESQL_DATABASE
  }:${DB_PORT.toString()}/db?sslmode=disable&max_conns=20&max_idle_conns=4`,
}

export const KETO_READ_PORT = 4466

export const KETO_WRITE_PORT = 4467

const PROJECT_PATH = __dirname

export const KETO_FILES: FileToCopy[] = [
  {
    source: `${PROJECT_PATH}/keto.yml`,
    target: '/home/ory/keto.yml',
  },
  {
    source: `${PROJECT_PATH}/namespaces.keto.ts`,
    target: '/home/ory/namespaces.keto.ts',
  },
  {
    source: `${PROJECT_PATH}/relationships.json`,
    target: '/home/ory/relationships/relationships.json',
  },
]
export const APP_PORT = 3000
