export function isSuccessMessage(message: string): boolean {
  if (!message) return false;
  return /(success|successfully)/i.test(message);
}
