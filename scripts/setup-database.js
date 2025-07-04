#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env.local
try {
  require('dotenv').config({ path: '.env.local' });
} catch (error) {
  console.log('💡 Note: dotenv not installed. Make sure environment variables are set manually.');
}

async function setupDatabase() {
  console.log('🚀 Starting Supabase database setup...');
  
  try {
    // Check if required environment variables are set
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables must be set. Please check your .env.local file.');
    }

    console.log('📡 Connecting to Supabase...');
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    console.log('✅ Supabase connection established!');
    console.log('');
    console.log('📋 Expected table structure for "swaps":');
    console.log('');
    console.log('CREATE TABLE swaps (');
    console.log('  swap_id TEXT PRIMARY KEY,');
    console.log('  file1_url TEXT,');
    console.log('  file1_name VARCHAR(255),');
    console.log('  file1_size BIGINT,');
    console.log('  file2_url TEXT,');
    console.log('  file2_name VARCHAR(255),');
    console.log('  file2_size BIGINT,');
    console.log('  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),');
    console.log('  expires_at TIMESTAMP WITH TIME ZONE NOT NULL');
    console.log(');');
    console.log('');
    console.log('-- Recommended indexes:');
    console.log('CREATE INDEX idx_swaps_expires_at ON swaps(expires_at);');
    console.log('CREATE INDEX idx_swaps_created_at ON swaps(created_at);');
    console.log('');

    // Test the connection by trying to query the table
    console.log('🔍 Testing table access...');
    const { data, error } = await supabase
      .from('swaps')
      .select('count(*)')
      .limit(1);

    if (error) {
      if (error.code === '42P01') {
        console.log('⚠️  Table "swaps" does not exist yet.');
        console.log('');
        console.log('📝 To create the table, run this SQL in your Supabase SQL Editor:');
        console.log('');
        console.log('CREATE TABLE swaps (');
        console.log('  swap_id TEXT PRIMARY KEY,');
        console.log('  file1_url TEXT,');
        console.log('  file1_name VARCHAR(255),');
        console.log('  file1_size BIGINT,');
        console.log('  file2_url TEXT,');
        console.log('  file2_name VARCHAR(255),');
        console.log('  file2_size BIGINT,');
        console.log('  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),');
        console.log('  expires_at TIMESTAMP WITH TIME ZONE NOT NULL');
        console.log(');');
        console.log('');
        console.log('CREATE INDEX idx_swaps_expires_at ON swaps(expires_at);');
        console.log('CREATE INDEX idx_swaps_created_at ON swaps(created_at);');
      } else {
        throw new Error(`Table access failed: ${error.message}`);
      }
    } else {
      console.log('✅ Table "swaps" exists and is accessible!');
      console.log('🎉 Database setup verification completed successfully!');
    }

    console.log('');
    console.log('🔧 Environment variables configured:');
    console.log('- NEXT_PUBLIC_SUPABAS