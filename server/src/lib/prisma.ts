// Prisma Client Instance
// Following official Prisma MongoDB documentation pattern

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export { prisma };
