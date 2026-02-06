// Prisma Client Instance
// Following official Prisma MongoDB documentation pattern

import 'dotenv/config';
import { PrismaClient } from '../../generated/prisma/client.js';

const prisma = new PrismaClient();

export { prisma };
