import { AppError } from './AppError';

export const errorLogger = {
  log(error: Error | AppError, context?: Record<string, unknown>) {
    if (__DEV__) {
      console.error('[PlanScanRx]', error.message, context ?? '');
    }
    // Production: send to Sentry/Crashlytics
    // crashlytics().recordError(error);
  },
};
