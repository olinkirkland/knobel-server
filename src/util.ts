export function generateGuestName(): string {
  let name: string = 'LameGuest ';
  for (let i = 0; i < 5; i++) name += Math.floor(Math.random() * 9);
  return name;
}
