export interface ApiResponseData<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export class ApiResponse {
  static success<T>(data: T, message = 'Success'): ApiResponseData<T> {
    return {
      success: true,
      message,
      data,
    };
  }

  static paginated<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
    message = 'Success',
  ): ApiResponseData<T[]> {
    return {
      success: true,
      message,
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static created<T>(data: T, message = 'Created successfully'): ApiResponseData<T> {
    return {
      success: true,
      message,
      data,
    };
  }

  static noContent(message = 'Deleted successfully'): ApiResponseData {
    return {
      success: true,
      message,
    };
  }
}
