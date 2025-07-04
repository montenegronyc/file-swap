#!/usr/bin/env node

const { sql } = require('@vercel/postgres');

// Load environment variables from .env.local
try {
  require('dotenv').config({ path: '.env.local' });
} catch (error) {
  console.log('💡 Note: dotenv not installed. Make sure environment variables are set manually.');
}

async function setupDatabase() {
  console.log('🚀 Starting database setup...');
  
  try {
    // Check if required environment variables are set
    if (!process.env.POSTGRES_URL) {
      throw new Error('POSTGRES_URL environment variable is not set. Please check your .env.local file.');
    }

    console.log('📡 Connecting to Vercel Postgres...');
    
    // Drop existing table if it exists (for clean setup)
    console.log('🗑️  Dropping existing swaps table if it exists...');
    await sql`DROP TABLE IF EXISTS swaps;`;
    
    // Create the swaps table with the new schema
    console.log('🏗️  Creating swaps table...');
    await sql`
      CREATE TABLE swaps (
        id VARCHAR(255) PRIMARY KEY,
        file1_url TEXT,
        file1_name VARCHAR(255),
        file1_size BIGINT,
        file2_url TEXT,
        file2_name VARCHAR(255),
        file2_size BIGINT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL
      );
    `;

    // Create an index on expires_at for efficient cleanup queries
    console.log('🔍 Creating index on expires_at...');
    await sql`CREATE INDEX idx_swaps_expires_at ON swaps(expires_at);`;

    // Create an index on created_at for efficient queries
    console.log('🔍 Creating index on created_at...');
    await sql`CREATE INDEX idx_swaps_created_at ON swaps(created_at);`;

    // Verify the table was created successfully
    console.log('✅ Verifying table structure...');
    const result = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'swaps'
      ORDER BY ordinal_position;
    `;

    console.log('📊 Table structure:');
    console.table(result.rows);

    console.log('🎉 Database setup completed successfully!');
    console.log('');
    console.log('Table "swaps" created with the following structure:');
    console.log('- id (VARCHAR(255), PRIMARY KEY)');
    console.log('- file1_url (TEXT, nullable)');
    console.log('- file1_name (VARCHAR(255), nullable)');
    console.log('- file1_size (BIGINT, nullable)');
    console.log('- file2_url (TEXT, nullable)');
    console.log('- file2_name (VARCHAR(255), nullable)');
    console.log('- file2_size (BIGINT, nullable)');
    console.log('- created_at (TIMESTAMP WITH TIME ZONE, default NOW())');
    console.log('- expires_at (TIMESTAMP WITH TIME ZONE, required)');
    console.log('');
    console.log('✨ Your database is ready to use!');

  } catch (error) {
    console.error('❌ Database setup failed:');
    console.error(error.message);
    
    if (error.message.includes('POSTGRES_URL')) {
      console.log('');
      console.log('💡 Setup instructions:');
      console.log('1. Create a Vercel Postgres database');
      console.log('2. Copy the connection string to your .env.local file');
      console.log('3. Make sure POSTGRES_URL is set in .env.local');
      console.log('4. Run this script again');
    }
    
    process.exit(1);
  }
}

// Run the setup function
setupDatabase();