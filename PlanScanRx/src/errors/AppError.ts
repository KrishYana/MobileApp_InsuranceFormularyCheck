type AppErrorParams = {
  code: string;
  statusCode?: number;
  isRetryable: boolean;
  displayMessage: string;
  technicalMessage: string;
};

export class AppError extends Error {
  readonly code: string;
  readonly statusCode?: number;
  readonly isRetryable: boolean;
  readonly displayMessage: string;
  readonly technicalMessage: string;

  constructor(params: AppErrorParams) {
    super(params.technicalMessage);
    this.name = 'AppError';
    this.code = params.code;
    this.statusCode = params.statusCode;
    this.isRetryable = params.isRetryable;
    this.displayMessage = params.displayMessage;
    this.technicalMessage = params.technicalMessage;
  }
}

export class NetworkError extends AppError {
  constructor() {
    super({
      code: 'NETWORK_ERROR',
      isRetryable: true,
      displayMessage: 'No internet connection. Check your network and try again.',
      technicalMessage: 'Network request failed — device offline or DNS resolution failed',
    });
    this.name = 'NetworkError';
  }
}

export class AuthError extends AppError {
  constructor(statusCode: number, detail?: string) {
    super({
      code: 'AUTH_ERROR',
      statusCode,
      isRetryable: false,
      displayMessage: 'Your session has expired. Please sign in again.',
      technicalMessage: `Auth failed: ${statusCode} ${detail ?? ''}`,
    });
    this.name = 'AuthError';
  }
}

export class APIError extends AppError {
  constructor(statusCode: number, serverMessage?: string) {
    super({
      code: 'API_ERROR',
      statusCode,
      isRetryable: statusCode >= 500,
      displayMessage:
        statusCode >= 500
          ? 'Our servers are experiencing issues. Try again in a few minutes.'
          : serverMessage ?? 'Something went wrong.',
      technicalMessage: `API ${statusCode}: ${serverMessage ?? 'no message'}`,
    });
    this.name = 'APIError';
  }
}

export class ValidationError extends AppError {
  readonly fieldErrors: Record<string, string>;

  constructor(fieldErrors: Record<string, string>) {
    super({
      code: 'VALIDATION_ERROR',
      isRetryable: false,
      displayMessage: 'Please check the highlighted fields.',
      technicalMessage: `Validation: ${JSON.stringify(fieldErrors)}`,
    });
    this.name = 'ValidationError';
    this.fieldErrors = fieldErrors;
  }
}
