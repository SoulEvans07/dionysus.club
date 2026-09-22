import type { ZodError } from 'zod';

export type FieldErrors = Record<string, string>;

// Flattens zod issues into { 'recipe.0.quantity': 'Enter an amount' }, keeping the first message per path.
export function fieldErrors(error: ZodError): FieldErrors {
  const errors: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.');
    errors[key] ??= issue.message;
  }
  return errors;
}

// Fields use their error key as their element id, so the first invalid one can be found by it.
export function focusFirstError(errors: FieldErrors) {
  const [first] = Object.keys(errors);
  if (first) document.getElementById(first)?.focus();
}

export function moveItem<T>(list: T[], from: number, to: number) {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

let nextRowKey = 0;
// Stable React keys for rows the user can reorder or remove.
export const newRowKey = () => `row-${nextRowKey++}`;
