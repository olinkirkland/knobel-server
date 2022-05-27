export function generateGuestName(): string {
  let name: string = 'LameGuest ';
  for (let i = 0; i < 5; i++) name += Math.floor(Math.random() * 9);
  return name;
}

export function generateVerifyCode(): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZ';
  let code: string = '';
  for (let i = 0; i < 6; i++)
    code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export function experienceNeededFromLevel(level: number): number {
  return Math.round(100 + (level - 1) * 7);
}
