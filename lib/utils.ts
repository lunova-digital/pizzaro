export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

export function cn(
  ...classes: (string | boolean | undefined | null)[]
): string {
  return classes.filter(Boolean).join(" ");
}
