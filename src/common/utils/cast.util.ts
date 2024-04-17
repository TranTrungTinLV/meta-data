interface ToNumberOptions {
  default?: number;
  min?: number;
  max?: number;
}

export function toLowerCase(value: string): string {
  return value.toLowerCase();
}

export function trim(value: string): string {
  if (typeof value === 'string') {
    return value.trim();
  }
}

export function toDate(value: string): Date {
  return new Date(value);
}

export function toBoolean(value: string): boolean {
  value = value.toString().toLowerCase();

  return value === 'true' || value === '1' ? true : false;
}

export function toStringArray(value: string): string[] {
  return value.split(',').filter(Boolean);
}

export function toNumber(value: string, opts: ToNumberOptions = {}): number {
  const newValue: number = Number.parseInt(value);
  return newValue;
}
