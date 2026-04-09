export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (password.length < 8) errors.push('At least 8 characters');
  if (!/[a-zA-Z]/.test(password)) errors.push('At least one letter');
  if (!/[0-9]/.test(password)) errors.push('At least one number');
  if (/^(.)\1+$/.test(password)) errors.push('Cannot be all the same character');
  const common = ['12345678', 'password', 'qwerty123', 'abc12345', '11111111'];
  if (common.includes(password.toLowerCase())) errors.push('Password is too common');
  return { valid: errors.length === 0, errors };
}

export function getPasswordStrength(password: string): { level: 'weak' | 'medium' | 'strong'; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-zA-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  if (score <= 2) return { level: 'weak', color: '#ef4444' };
  if (score <= 3) return { level: 'medium', color: '#f59e0b' };
  return { level: 'strong', color: '#22c55e' };
}