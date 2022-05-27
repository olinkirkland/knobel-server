import { getUserById } from './user-controller';

export enum ItemType {
  NAME_CHANGE = 'x8d0-fb9v'
}

export async function addGold(id: string, amount: number) {
  const user = await getUserById(id);
  if (!user) return false;

  user.gold += amount;
  await user.save();
  return true;
}

export async function addExperience(id: string, amount: number) {
  const user = await getUserById(id);
  if (!user) return false;

  user.experience += amount;
  await user.save();
  return true;
}

export async function addItem(id: string, item: string) {
  const user = await getUserById(id);
  if (!user) return false;

  user.inventory.push(item);
  await user.save();
  return true;
}

export async function removeItem(id: string, item: string) {
  const user = await getUserById(id);
  if (!user) return false;

  // Does the user have this item?
  if (!user.inventory.includes(item)) return false;

  user.inventory.splice(user.inventory.indexOf(item), 1);
  await user.save();
  return true;
}

export async function addWelcomeItems(id: string) {
  const user = await getUserById(id);
  if (!user) return false;

  user.inventory.push(ItemType.NAME_CHANGE);
  user.inventory.push(ItemType.NAME_CHANGE);
  user.inventory.push(ItemType.NAME_CHANGE);
  await addGold(id, 100);
  await user.save();
  return true;
}