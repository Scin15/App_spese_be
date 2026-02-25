import "dotenv/config";
import { PrismaClient } from '../generated/prisma/client.js';
import { withAccelerate } from '@prisma/extension-accelerate';

export default new PrismaClient({
    accelerateUrl: process.env.DATABASE_URL
}).$extends(withAccelerate());
