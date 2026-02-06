import app from './app.js';
import { prisma } from './lib/prisma.js';

const PORT = process.env.PORT || 5001;

async function main() {
    try {
        // Check DB connection
        await prisma.$connect();
        console.log('Database connected successfully');

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
}

main();
