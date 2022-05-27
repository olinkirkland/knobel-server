import express from 'express';
const prices = require('../../../data/prices.json');
const sales = require('../../../data/sales.json');
import authenticate from '../../middlewares/authenticate';
import identify from '../../middlewares/identify';

const router = express.Router();

export default router;

router.get('/', authenticate, identify, async (req, res) => {
  const user = req.user;
  if (!user) return res.sendStatus(404);

  // Customize the shop for this user
  const shop = { prices: prices, sales: sales };

  console.log('shop:', shop);
  res.send(shop);
});
