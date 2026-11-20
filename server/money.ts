import { num, str, ValidationError } from "./validate";

export interface LineItem {
  description: string;
  qty: number;
  unitPrice: number;
  amount: number;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Validates line items and recomputes every total on the server. */
export function priceLines(rawItems: any, taxRatePct: any) {
  if (!Array.isArray(rawItems) || rawItems.length === 0) throw new ValidationError("Add at least one line item.");
  if (rawItems.length > 100) throw new ValidationError("Too many line items (max 100).");
  const lineItems: LineItem[] = rawItems.map((li: any, i: number) => {
    const description = str(li?.description, `Line ${i + 1} description`, { required: true, max: 300 });
    const qty = num(li?.qty ?? 1, `Line ${i + 1} quantity`, { min: 0, max: 100000 });
    const unitPrice = num(li?.unitPrice, `Line ${i + 1} price`, { required: true, min: 0, max: 10_000_000 });
    return { description, qty, unitPrice: round2(unitPrice), amount: round2(qty * unitPrice) };
  });
  const taxRate = num(taxRatePct ?? 0, "Tax rate", { min: 0, max: 25 });
  const subtotal = round2(lineItems.reduce((s, li) => s + li.amount, 0));
  const tax = round2((subtotal * taxRate) / 100);
  const total = round2(subtotal + tax);
  if (total > 10_000_000) throw new ValidationError("Total is too large.");
  return { lineItems, taxRate, subtotal, tax, total };
}

export function toCents(dollars: number) {
  return Math.round(dollars * 100);
}

export function usd(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n || 0);
}

export function docNumber(prefix: string) {
  const d = new Date();
  const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `${prefix}-${ymd}-${Math.floor(1000 + Math.random() * 9000)}`;
}
