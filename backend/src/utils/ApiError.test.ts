import { ApiError } from './ApiError';

describe('ApiError', () => {
  it('should create an ApiError instance with correct properties', () => {
    const error = new ApiError(400, 'Custom error', [{ field: 'email', message: 'Invalid' }]);
    
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe('Custom error');
    expect(error.isOperational).toBe(true);
    expect(error.errors).toHaveLength(1);
    expect(error.errors[0]).toEqual({ field: 'email', message: 'Invalid' });
  });

  it('should create a Bad Request error via static method', () => {
    const error = ApiError.badRequest('Missing field');
    
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe('Missing field');
    expect(error.isOperational).toBe(true);
  });

  it('should create an Unauthorized error via static method', () => {
    const error = ApiError.unauthorized();
    
    expect(error.statusCode).toBe(401);
    expect(error.message).toBe('Unauthorized');
  });

  it('should create a Not Found error via static method', () => {
    const error = ApiError.notFound('User not found');
    
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe('User not found');
  });

  it('should create an Internal Server Error that is not operational', () => {
    const error = ApiError.internal('Database connection failed');
    
    expect(error.statusCode).toBe(500);
    expect(error.message).toBe('Database connection failed');
    expect(error.isOperational).toBe(false);
  });
});
