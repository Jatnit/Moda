export function sanitizeText(input: string): string {
  return input.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '').trim();
}

