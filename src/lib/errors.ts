interface SupabaseErrorLike {
  message?: string;
  status?: number;
}

export function logDevError(message: string, error: unknown): void {
  if (import.meta.env.DEV) {
    console.error(message, error);
  }
}

export function getErrorMessage(error: unknown, fallback = "Ein unerwarteter Fehler ist aufgetreten."): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "object" && error !== null) {
    const typedError = error as SupabaseErrorLike;
    if (typedError.message) {
      return typedError.message;
    }
  }

  return fallback;
}

export function assertSuccess<T>(
  result: { data: T | null; error: { message: string } | null },
  fallback: string,
): T {
  if (result.error || result.data === null) {
    throw new Error(result.error?.message ?? fallback);
  }

  return result.data;
}
