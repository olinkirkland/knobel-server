import User from '../database/schemas/user';
import { v4 as uuid } from 'uuid';

export async function registerUser(
  id: string,
  email: string,
  password: string
) {
  // Register an account
  const user = await getUserById(id);
  if (!user || user.isRegistered) {
    return;
  }

  user.isRegistered = true;
  user.email = email;
  user.password = password;
  user.save();
}

export async function createGuestUser() {
  return await new User({
    id: uuid(),
    isRegistered: false,
    name: 'abcdefg',
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
