// src/modules/cart/cart.service.js
const { getPrisma } = require('../../config/database');

async function _getOrCreateCart(userId) {
  const prisma = getPrisma();
  let cart = await prisma.cart.findUnique({
    where: { userId: Number(userId) },
    include: {
      items: {
        include: { raffle: { select: { id: true, title: true, ticketPrice: true, currency: true, status: true } } }
      }
    }
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId: Number(userId) },
      include: {
        items: {
          include: { raffle: { select: { id: true, title: true, ticketPrice: true, currency: true, status: true } } }
        }
      }
    });
  }

  return cart;
}

async function getCart(userId) {
  const cart = await _getOrCreateCart(userId);
  return { cart };
}

async function addItem(userId, data) {
  const prisma = getPrisma();

  const raffle = await prisma.raffle.findUnique({ where: { id: data.raffleId } });
  if (!raffle || raffle.status !== 'active') {
    throw { status: 400, message: 'El sorteo no está disponible o no existe' };
  }

  const cart = await _getOrCreateCart(userId);

  const existing = await prisma.cartItem.findUnique({
    where: { cartId_raffleId: { cartId: cart.id, raffleId: data.raffleId } }
  });

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + data.quantity }
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, raffleId: data.raffleId, quantity: data.quantity }
    });
  }

  return getCart(userId);
}

async function updateItem(userId, cartItemId, data) {
  const prisma = getPrisma();
  const cart = await _getOrCreateCart(userId);

  const item = await prisma.cartItem.findFirst({
    where: { id: Number(cartItemId), cartId: cart.id }
  });
  if (!item) throw { status: 404, message: 'Ítem no encontrado en el carrito' };

  await prisma.cartItem.update({
    where: { id: item.id },
    data: { quantity: data.quantity }
  });

  return getCart(userId);
}

async function removeItem(userId, cartItemId) {
  const prisma = getPrisma();
  const cart = await _getOrCreateCart(userId);

  const item = await prisma.cartItem.findFirst({
    where: { id: Number(cartItemId), cartId: cart.id }
  });
  if (!item) throw { status: 404, message: 'Ítem no encontrado en el carrito' };

  await prisma.cartItem.delete({ where: { id: item.id } });
  return getCart(userId);
}

async function clearCart(userId) {
  const prisma = getPrisma();
  const cart = await prisma.cart.findUnique({ where: { userId: Number(userId) } });
  if (cart) {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  }
  return { cart: { items: [] } };
}

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };