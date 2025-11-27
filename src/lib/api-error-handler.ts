import { NextResponse } from 'next/server';
import { z } from 'zod';

export interface ApiErrorResponse {
  error: string;
  details?: unknown;
  code?: string;
}

export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  console.error('API Error:', error);

  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { 
        error: 'Invalid input. Please check your data.', 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        details: (error as any).errors,
        code: 'VALIDATION_ERROR'
      },
      { status: 400 }
    );
  }

  if (error instanceof Error) {
    // Handle specific error types if needed
    if (error.message.includes('Unauthorized') || error.message.includes('unauthorized')) {
      return NextResponse.json(
        { error: 'Please log in to continue.', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    if (error.message.includes('Forbidden') || error.message.includes('forbidden')) {
      return NextResponse.json(
        { error: "You don't have permission to do that.", code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    if (error.message.includes('Not found') || error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Not found.', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }
  }

  // Default 500 error
  return NextResponse.json(
    { error: "Server error. We're working on it.", code: 'INTERNAL_SERVER_ERROR' },
    { status: 500 }
  );
}

export class ApiError extends Error {
  public statusCode: number;
  public code?: string;

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = 'ApiError';
  }
}
