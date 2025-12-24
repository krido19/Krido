import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables for local testing
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function keepAlive() {
    console.log('Starting keep-alive query...');

    // We use a simple query on the 'profiles' table which we know exists from schema analysis
    // or a raw query if the client supports it. 
    // For standard supabase-js, let's just select a single row from a known table.
    const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);

    if (error) {
        console.error('Error executing keep-alive query:', error.message);
        process.exit(1);
    }

    console.log('Keep-alive query successful. Database is awake.');
    process.exit(0);
}

keepAlive();
