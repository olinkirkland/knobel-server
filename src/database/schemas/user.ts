import { model, Schema } from 'mongoose';

export default model(
  'User',
  new Schema({
    id: {
      type: String,
      required: true
    },
    isRegistered: {
      type: Boolean,
      required: true
    },
    email: {
      type: String,
      required: false
    },
    password: {
      type: String,
      required: false
    },
    name: {
      type: String,
      required: true
    },
    inventory: {
      type: Array,
      required: true
    },
    gold: {
      type: Number,
      required: true
    },
    level: {
      type: Number,
      required: true
    },
    experience: {
      type: Number,
      required: true
    }
  })
);

export function toPublicUserData(user) {
  return {
    id: user.id,
    name: user.name,
    level: user.level
  };
}

export function toPersonalUserData(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    inventory: user.inventory,
    gold: user.gold,
    level: user.level,
    experience: user.experience
  };
}
