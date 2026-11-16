// Small input validators. Every value a browser sends is checked here before
// it reaches the database.

export class ValidationError extends Error {}

export function str(v: any, label: string, opts: { required?: boolean; max?: number } = {}): string {
  if (v === undefined || v === null || v === "") {
    if (opts.required) throw new ValidationError(`${label} is required.`);
    return "";
  }
  if (typeof v !== "string" && typeof v !== "number") throw new ValidationError(`${label} must be text.`);
  const s = String(v).trim();
  if (opts.required && !s) throw new ValidationError(`${label} is required.`);
  const max = opts.max ?? 2000;
  if (s.length > max) throw new ValidationError(`${label} is too long (max ${max} characters).`);
  return s;
}

export function email(v: any, label: string, opts: { required?: boolean } = {}): string {
  const s = str(v, label, { required: opts.required, max: 254 }).toLowerCase();
  if (s && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) throw new ValidationError(`${label} doesn't look like an email address.`);
  return s;
}

export function num(v: any, label: string, opts: { required?: boolean; min?: number; max?: number } = {}): number {
  if (v === undefined || v === null || v === "") {
    if (opts.required) throw new ValidationError(`${label} is required.`);
    return 0;
  }
  const n = Number(v);
  if (!Number.isFinite(n)) throw new ValidationError(`${label} must be a number.`);
  if (opts.min !== undefined && n < opts.min) throw new ValidationError(`${label} must be at least ${opts.min}.`);
  if (opts.max !== undefined && n > opts.max) throw new ValidationError(`${label} must be at most ${opts.max}.`);
  return n;
}

export function oneOf<T extends string>(v: any, allowed: readonly T[], label: string): T {
  if (!allowed.includes(v)) throw new ValidationError(`${label} must be one of: ${allowed.join(", ")}.`);
  return v;
}

export function isoDate(v: any, label: string, opts: { required?: boolean } = {}): string {
  const s = str(v, label, { required: opts.required, max: 40 });
  if (s && Number.isNaN(Date.parse(s))) throw new ValidationError(`${label} must be a valid date.`);
  return s;
}

export function bool(v: any): boolean {
  return v === true || v === "true" || v === 1;
}
