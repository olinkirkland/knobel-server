import User from '../database/schemas/user';
import { v4 as uuid } from 'uuid';

export async function addNewUser(email: string, password: string) {
  await new User({
    id: uuid(),
    email: email,
    password: password,
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
