export enum OathkeeperErrorMessage {
  DECISION_HOST_REQUIRED = 'Oathkeeper decision host is required',
  DECISION_REQUEST_FAILED = 'Oathkeeper decision request failed',
  MODULE_ASYNC_OPTIONS_REQUIRED = 'OathkeeperModule requires useExisting, useClass, or useFactory',
  MODULE_ASYNC_OPTIONS_CLASS_REQUIRED = 'OathkeeperModule requires useClass when useExisting/useFactory not provided',
}
