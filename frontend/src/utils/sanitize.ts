export const sanitizeInput = (input: string): string => {
  const sanitized = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+="[^"]*"/g, '')
    .replace(/on\w+='[^']*'/g, '')
    .replace(/on\w+=[^ >]+/g, '');
  
  return sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

export const sanitizeUrl = (url: string): string => {
  if (!url.match(/^https?:\/\//i)) {
    return '';
  }
  
  return url.replace(/[<>'"]/g, '');
};

export const sanitizeNumber = (value: string | number): number => {
  const num = Number(value);
  return isNaN(num) ? 0 : Math.max(0, Math.min(num, 100));
}; 