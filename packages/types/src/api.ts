export interface ApiErrorBody {
  readonly error: {
    readonly code: string;
    readonly message: string;
    readonly details?: unknown;
  };
}

export interface ApiSuccess<T> {
  readonly data: T;
}

export interface Paginated<T> {
  readonly items: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly hasMore: boolean;
}

export interface HealthStatus {
  readonly status: 'ok' | 'degraded' | 'down';
  readonly service: string;
  readonly version: string;
  readonly uptimeSeconds: number;
  readonly timestamp: string;
  readonly checks: Readonly<Record<string, 'ok' | 'fail'>>;
}
