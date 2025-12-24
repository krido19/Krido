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

const formatValue = (val) => {
    if (val === null || val === undefined) return 'NULL';
    if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
    if (typeof val === 'number') return val;
    if (Array.isArray(val)) {
        const arrayStr = val.map(v => formatValue(v)).join(', ');
        return `ARRAY[${arrayStr}]`;
    }
    if (typeof val === 'object') {
        return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
    }
    return `'${String(val).replace(/'/g, "''")}'`;
};

export const exportToSQL = async () => {
    let sqlDump = DB_SCHEMA + '\n\n-- DATA BACKUP\n';

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
                const values = columns.map(col => formatValue(row[col])).join(', ');
                sqlDump += `INSERT INTO public.${table} (${columns.join(', ')}) VALUES (${values});\n`;
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
    link.download = `krido_database_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.sql`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return true;
};
