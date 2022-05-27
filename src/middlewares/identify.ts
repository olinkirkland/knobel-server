import { getUserById } from '../controllers/user-controller';

export default async function identify(req, res, next) {
  const user = await getUserById(req.id);
  if (!user) return res.sendStatus(404);
  req.user = user;

  next();
}
