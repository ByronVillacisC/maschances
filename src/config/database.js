// src/config/database.js
const { PrismaClient } = require('@prisma/client');

let prisma;

function createPrismaClient() {
  return new PrismaClient({
    log: ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });
}

async function connectDatabase() {
  if (!prisma) {
    prisma = createPrismaClient();
  }
  await prisma.$connect();
  return prisma;
}

function getPrisma() {
  if (!prisma) {
    prisma = createPrismaClient();
  }
  return prisma;
}

module.exports = { connectDatabase, getPrisma };
