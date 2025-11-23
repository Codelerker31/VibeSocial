const { Client } = require('pg');

const connectionString = "postgresql://postgres.qislehkmmwmpcamlcmsg:adamNICHOLI19_31@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true";

console.log("Testing connection to:", connectionString.replace(/:[^:@]+@/, ':****@'));

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }, // Try lenient SSL
});

async function test() {
  try {
    await client.connect();
    console.log("Successfully connected to database!");
    const res = await client.query('SELECT NOW()');
    console.log("Current time from DB:", res.rows[0]);
    await client.end();
  } catch (err) {
    console.error("Connection error:", err);
  }
}

test();
