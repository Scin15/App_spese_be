// importo qui dotenv/config e non più negli altri moduli perchè è già stata aggiunta la props .env all'oggetto process
import "dotenv/config";
import { PrismaClient } from '../generated/prisma/client.js';
import { withAccelerate } from '@prisma/extension-accelerate';

export default new PrismaClient({
    accelerateUrl: process.env.DATABASE_URL
}).$extends(withAccelerate());
