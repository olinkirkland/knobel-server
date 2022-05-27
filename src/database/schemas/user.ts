import { model, Schema } from 'mongoose';

export default model(
  'User',
  new Schema({
    socket: {
      type: String,
      required: false
    },
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
    verifyCode: {
      type: String,
      required: false
    },
    isVerified: {
      type: Boolean,
      required: true
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
    },
    avatar: {
      type: String,
      required: true
    },
    wallpaper: {
      type: String,
      required: true
    },
    note: {
      type: String,
      required: false
    }
  })
);

export function toPublicUserData(user) {
  const packedUser = {
    id: user.id,
    name: user.name,
    avatar: user.avatar,
    note: user.note,
    level: user.level,
    isRegistered: user.isRegistered
  };

  return packedUser;
}

export function toPersonalUserData(user) {
  const packedUser = toPublicUserData(user);

  Object.assign(packedUser, {
    email: user.email,
    inventory: user.inventory,
    gold: user.gold,
    experience: user.experience,
    wallpaper: user.wallpaper,
    isVerified: user.isVerified
  });

  return packedUser;
}
