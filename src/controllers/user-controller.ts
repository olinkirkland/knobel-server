import User from '../database/schemas/user';
import { v4 as uuid } from 'uuid';
import { generateGuestName } from '../util';

export async function registerUser(
  id: string,
  email: string,
  password: string
) {
  // Register an account
  console.log(id);
  const user = await getUserById(id);
  if (!user || user.isRegistered) {
    console.log(user);
    return false;
  }

  user.isRegistered = true;
  user.email = email;
  user.password = password;
  await user.save();

  return true;
}

export async function createGuestUser() {
  // Create a guest user
  const user = await new User({
    id: uuid(),
    isRegistered: false,
    name: generateGuestName(),
    note: 'This user prefers to keep an air of mystery about them.',
    avatar: 'inmQ-K0Zd',
    wallpaper: 'nbKnDUBgYwiQcUJjI8gYG',
    inventory: [
      'inmQ-K0Zd', // Anon (Avatar)
      'nbKnDUBgYwiQcUJjI8gYG', // Prism (Wallpaper)
      'KgkdXnvuUjgFg9mFsF_o1' // Embroidery (Wallpaper)
    ],
    gold: Math.floor(Math.random() * 100),
    level: Math.floor(Math.random() * 10) + 1,
    experience: Math.floor(Math.random() * 100)
  }).save();
  console.log('👻', 'Guest user', user.id.substring(0, 4), 'created');
  return user;
}

export async function getUserById(id: string) {
  return await User.findOne({ id: id });
}

export async function getUserByEmail(email: string) {
  return await User.findOne({ email: email });
}
