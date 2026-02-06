export type ErrorPayload = {
  code: string;
  message: string;
  details?: unknown | null;
};

export class AppError extends Error {
  public readonly httpStatus: number;
  public readonly payload: ErrorPayload;

  constructor(httpStatus: number, code: string, message: string, details: unknown | null = null) {
    super(message);
    this.httpStatus = httpStatus;
    this.payload = { code, message, details };
  }
}

export function toErrorResponse(err: AppError) {
  return { error: { code: err.payload.code, message: err.payload.message, details: err.payload.details ?? null } };
}

// Parse MySQL trigger SIGNAL message: "<CODE>: <message>"
export function parseTriggerMessage(msg: string): { code: string; message: string } {
  const idx = msg.indexOf(':');
  if (idx === -1) return { code: 'CONFLICT', message: msg };
  const code = msg.slice(0, idx).trim() || 'CONFLICT';
  const message = msg.slice(idx + 1).trim() || msg;
  return { code, message };
}
