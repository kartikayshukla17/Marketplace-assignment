// Prisma Database Seed Script
// Run with: npx prisma db seed
// This creates demo data for deployment/testing

import { PrismaClient } from '../generated/prisma/client.js';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ==========================================
// SEED DATA CONFIGURATION
// ==========================================

const CATEGORIES = [
    'Web Development',
    'Mobile Development',
    'UI/UX Design',
    'Data Science',
    'DevOps',
    'Digital Marketing',
    'Video Production',
    'Content Writing',
    'Consulting',
    'Training',
];

const TEST_USERS = [
    { name: 'Alice Johnson', email: 'alice@test.com', password: 'password123', role: 'USER' },
    { name: 'Bob Smith', email: 'bob@test.com', password: 'password123', role: 'USER' },
    { name: 'Charlie Brown', email: 'charlie@test.com', password: 'password123', role: 'USER' },
    { name: 'Diana Prince', email: 'diana@test.com', password: 'password123', role: 'USER' },
    { name: 'Edward Blake', email: 'edward@test.com', password: 'password123', role: 'USER' },
    { name: 'Fiona Green', email: 'fiona@test.com', password: 'password123', role: 'USER' },
];

const ADMINS = [
    { name: 'Admin One', email: 'admin1@test.com', password: 'admin123', role: 'ADMIN' },
    { name: 'Admin Two', email: 'admin2@test.com', password: 'admin123', role: 'ADMIN' },
];

// Listing templates for each user (4 FIXED + 2 QUOTE per user)
const LISTING_TEMPLATES = [
    { title: 'Custom Website Development', type: 'FIXED', price: 1500, category: 'Web Development' },
    { title: 'E-commerce Store Setup', type: 'FIXED', price: 2500, category: 'Web Development' },
    { title: 'React Dashboard Development', type: 'FIXED', price: 1800, category: 'Web Development' },
    { title: 'API Integration Service', type: 'FIXED', price: 800, category: 'DevOps' },
    { title: 'Full Stack Consultation', type: 'QUOTE', price: null, category: 'Consulting' },
    { title: 'Custom Enterprise Solution', type: 'QUOTE', price: null, category: 'Consulting' },
];

// ==========================================
// SEED FUNCTIONS
// ==========================================

async function seedCategories() {
    console.log('🏷️  Seeding categories...');

    for (const name of CATEGORIES) {
        await prisma.category.upsert({
            where: { name },
            update: {},
            create: { name },
        });
    }

    console.log(`   ✅ Created ${CATEGORIES.length} categories`);
    return await prisma.category.findMany();
}

async function seedUsers() {
    console.log('👥 Seeding users...');

    const allUsers = [...TEST_USERS, ...ADMINS];
    const createdUsers = [];

    for (const user of allUsers) {
        const hashedPassword = await bcrypt.hash(user.password, 12);

        const created = await prisma.user.upsert({
            where: { email: user.email },
            update: {},
            create: {
                name: user.name,
                email: user.email,
                passwordHash: hashedPassword,
                role: user.role as 'USER' | 'ADMIN',
            },
        });

        createdUsers.push(created);
    }

    console.log(`   ✅ Created ${TEST_USERS.length} users + ${ADMINS.length} admins`);
    return createdUsers;
}

async function seedListings(users: any[], categories: any[]) {
    console.log('📦 Seeding listings...');

    // Only create listings for regular users (not admins)
    const regularUsers = users.filter(u => u.role === 'USER');
    let totalListings = 0;

    for (const user of regularUsers) {
        for (let i = 0; i < LISTING_TEMPLATES.length; i++) {
            const template = LISTING_TEMPLATES[i];
            const category = categories.find(c => c.name === template.category) || categories[0];

            await prisma.listing.create({
                data: {
                    title: `${template.title} by ${user.name.split(' ')[0]}`,
                    description: `Professional ${template.title.toLowerCase()} service offered by ${user.name}. Contact for more details and custom requirements.`,
                    categoryId: category.id,
                    listingType: template.type as 'FIXED' | 'QUOTE',
                    price: template.price,
                    currency: 'USD',
                    status: 'ACTIVE',
                    images: [],
                    sellerId: user.id,
                },
            });
            totalListings++;
        }
    }

    console.log(`   ✅ Created ${totalListings} listings (${LISTING_TEMPLATES.length} per user)`);
}

// ==========================================
// MAIN SEED RUNNER
// ==========================================

async function main() {
    console.log('\n🌱 Starting database seed...\n');

    try {
        const categories = await seedCategories();
        const users = await seedUsers();
        await seedListings(users, categories);

        console.log('\n✨ Seed completed successfully!\n');
        console.log('📋 Test Credentials:');
        console.log('   Users: alice@test.com ... fiona@test.com (password: password123)');
        console.log('   Admins: admin1@test.com, admin2@test.com (password: admin123)\n');

    } catch (error) {
        console.error('❌ Seed failed:', error);
        throw error;
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
