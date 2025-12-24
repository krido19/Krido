import { supabase } from '../supabaseClient';
import { DB_SCHEMA } from './dbSchema';

const TABLES = [
    'profiles',
    'portfolio',
    'activities',
    'app_releases',
    'services',
    'contacts',
    'site_stats'
];

const formatValue = (val, colName, currentUserId) => {
    // Smart Mapping: Replace current User ID with a subquery for easier migration
    if (val === currentUserId && (colName === 'user_id' || colName === 'id' || colName === 'owner')) {
        return "(SELECT id FROM auth.users LIMIT 1)";
    }

    if (val === null || val === undefined) return 'NULL';
    if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
    if (typeof val === 'number') return val;
    if (Array.isArray(val)) {
        // Services table uses JSONB for features
        if (colName && colName.startsWith('features_')) {
            return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
        }
        if (val.length === 0) return "ARRAY[]::text[]";
        const arrayStr = val.map(v => formatValue(v, null, null)).join(', ');
        return `ARRAY[${arrayStr}]`;
    }
    if (typeof val === 'object') {
        return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
    }
    return `'${String(val).replace(/'/g, "''")}'`;
};

export const exportToSQL = async () => {
    // Get current user ID for smart mapping
    const { data: { user } } = await supabase.auth.getUser();
    const currentUserId = user?.id;

    let sqlDump = `-- SUPABASE SMART MIGRATION BACKUP
-- EXECUTED ON: ${new Date().toISOString()}

/* 
  ✨ SMART MIGRATION ENABLED:
  This script automatically maps your data to the user account in your new project.
  
  ⚠️ CRITICAL: You MUST sign up in the new project BEFORE running this script!
*/

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM auth.users) THEN 
        RAISE EXCEPTION 'MIGRATION ERROR: No users found in auth.users. Please Sign Up in your new project first, then run this script again.'; 
    END IF; 
END $$;

` + DB_SCHEMA + '\n\n-- DATA BACKUP\n';

    for (const table of TABLES) {
        console.log(`Fetching data for table: ${table}`);
        const { data, error } = await supabase.from(table).select('*');

        if (error) {
            console.error(`Error fetching data for ${table}:`, error);
            sqlDump += `\n-- Error fetching data for ${table}: ${error.message}\n`;
            continue;
        }

        if (data && data.length > 0) {
            sqlDump += `\n-- Data for ${table}\n`;
            const columns = Object.keys(data[0]);

            data.forEach(row => {
                const values = columns.map(col => formatValue(row[col], col, currentUserId)).join(', ');
                sqlDump += `INSERT INTO public.${table} (${columns.join(', ')}) VALUES (${values}) ON CONFLICT DO NOTHING;\n`;
            });
        } else {
            sqlDump += `\n-- No data found for ${table}\n`;
        }
    }

    // Create a blob and trigger download
    const blob = new Blob([sqlDump], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `krido_smart_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.sql`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return true;
};
