// src/config/database.js
const { PrismaClient } = require('@prisma/client');

let prisma;

async function connectDatabase() {
  prisma = new PrismaClient({
    log: ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });

  // Pool controlado vía DATABASE_URL connection_limit param
  await prisma.$connect();
}

function getPrisma() {
  return prisma;
}

module.exports = { connectDatabase, getPrisma };