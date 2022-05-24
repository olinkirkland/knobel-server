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
  console.log('👻', 'Guest user was created');
  return await new User({
    id: uuid(),
    isRegistered: false,
    name: generateGuestName(),
    inventory: [],
    gold: 0,
    level: 0,
    experience: 0
  }).save();
}

export async function getUserById(id: string) {
  return await User.findOne({ id: id });
}

export async function getUserByEmail(email: string) {
  return await User.findOne({ email: email });
}
