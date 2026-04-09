import { AppError, NetworkError, AuthError, APIError, ValidationError } from '../AppError';

describe('AppError', () => {
  it('sets all properties from params', () => {
    const err = new AppError({
      code: 'TEST_ERROR',
      statusCode: 400,
      isRetryable: false,
      displayMessage: 'Something went wrong',
      technicalMessage: 'Test failed at line 42',
    });

    expect(err.code).toBe('TEST_ERROR');
    expect(err.statusCode).toBe(400);
    expect(err.isRetryable).toBe(false);
    expect(err.displayMessage).toBe('Something went wrong');
    expect(err.technicalMessage).toBe('Test failed at line 42');
    expect(err.name).toBe('AppError');
    expect(err.message).toBe('Test failed at line 42');
  });

  it('is an instance of Error', () => {
    const err = new AppError({
      code: 'TEST',
      isRetryable: false,
      displayMessage: 'test',
      technicalMessage: 'test',
    });
    expect(err).toBeInstanceOf(Error);
  });

  it('allows statusCode to be undefined', () => {
    const err = new AppError({
      code: 'TEST',
      isRetryable: true,
      displayMessage: 'test',
      technicalMessage: 'test',
    });
    expect(err.statusCode).toBeUndefined();
  });
});

describe('NetworkError', () => {
  it('sets correct code', () => {
    const err = new NetworkError();
    expect(err.code).toBe('NETWORK_ERROR');
  });

  it('is retryable', () => {
    const err = new NetworkError();
    expect(err.isRetryable).toBe(true);
  });

  it('has user-friendly display message', () => {
    const err = new NetworkError();
    expect(err.displayMessage).toContain('No internet connection');
  });

  it('has name "NetworkError"', () => {
    const err = new NetworkError();
    expect(err.name).toBe('NetworkError');
  });

  it('is an instance of AppError and Error', () => {
    const err = new NetworkError();
    expect(err).toBeInstanceOf(AppError);
    expect(err).toBeInstanceOf(Error);
  });

  it('has no statusCode', () => {
    const err = new NetworkError();
    expect(err.statusCode).toBeUndefined();
  });
});

describe('AuthError', () => {
  it('sets the status code', () => {
    const err = new AuthError(401);
    expect(err.statusCode).toBe(401);
  });

  it('is not retryable', () => {
    const err = new AuthError(401);
    expect(err.isRetryable).toBe(false);
  });

  it('has correct code', () => {
    const err = new AuthError(401);
    expect(err.code).toBe('AUTH_ERROR');
  });

  it('includes detail in technical message', () => {
    const err = new AuthError(401, 'Token expired');
    expect(err.technicalMessage).toContain('Token expired');
  });

  it('handles missing detail', () => {
    const err = new AuthError(403);
    expect(err.technicalMessage).toContain('403');
  });

  it('has name "AuthError"', () => {
    const err = new AuthError(401);
    expect(err.name).toBe('AuthError');
  });

  it('has user-friendly display message about session', () => {
    const err = new AuthError(401);
    expect(err.displayMessage).toContain('session');
  });

  it('is an instance of AppError', () => {
    const err = new AuthError(401);
    expect(err).toBeInstanceOf(AppError);
  });
});

describe('APIError', () => {
  it('is retryable for 5xx errors', () => {
    expect(new APIError(500).isRetryable).toBe(true);
    expect(new APIError(502).isRetryable).toBe(true);
    expect(new APIError(503).isRetryable).toBe(true);
  });

  it('is not retryable for 4xx errors', () => {
    expect(new APIError(400).isRetryable).toBe(false);
    expect(new APIError(404).isRetryable).toBe(false);
    expect(new APIError(422).isRetryable).toBe(false);
  });

  it('shows server message for 5xx errors', () => {
    const err = new APIError(500);
    expect(err.displayMessage).toContain('servers');
  });

  it('shows server message for 4xx with custom message', () => {
    const err = new APIError(400, 'Invalid drug ID');
    expect(err.displayMessage).toBe('Invalid drug ID');
  });

  it('uses default message for 4xx without server message', () => {
    const err = new APIError(400);
    expect(err.displayMessage).toBe('Something went wrong.');
  });

  it('includes status code in technical message', () => {
    const err = new APIError(422, 'Validation failed');
    expect(err.technicalMessage).toContain('422');
    expect(err.technicalMessage).toContain('Validation failed');
  });

  it('has correct code', () => {
    expect(new APIError(500).code).toBe('API_ERROR');
  });

  it('has name "APIError"', () => {
    expect(new APIError(500).name).toBe('APIError');
  });

  it('sets statusCode', () => {
    expect(new APIError(404).statusCode).toBe(404);
  });
});

describe('ValidationError', () => {
  const fieldErrors = {
    planId: 'Plan ID is required',
    drugId: 'Drug ID must be a number',
  };

  it('stores field errors', () => {
    const err = new ValidationError(fieldErrors);
    expect(err.fieldErrors).toEqual(fieldErrors);
  });

  it('is not retryable', () => {
    const err = new ValidationError(fieldErrors);
    expect(err.isRetryable).toBe(false);
  });

  it('has correct code', () => {
    const err = new ValidationError(fieldErrors);
    expect(err.code).toBe('VALIDATION_ERROR');
  });

  it('has user-friendly display message', () => {
    const err = new ValidationError(fieldErrors);
    expect(err.displayMessage).toContain('highlighted fields');
  });

  it('includes field errors in technical message', () => {
    const err = new ValidationError(fieldErrors);
    expect(err.technicalMessage).toContain('planId');
    expect(err.technicalMessage).toContain('drugId');
  });

  it('has name "ValidationError"', () => {
    const err = new ValidationError(fieldErrors);
    expect(err.name).toBe('ValidationError');
  });

  it('is an instance of AppError', () => {
    const err = new ValidationError(fieldErrors);
    expect(err).toBeInstanceOf(AppError);
  });

  it('works with empty field errors', () => {
    const err = new ValidationError({});
    expect(err.fieldErrors).toEqual({});
  });
});
