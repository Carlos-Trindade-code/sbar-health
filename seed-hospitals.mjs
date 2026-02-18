import { readFileSync } from 'fs';
import { createConnection } from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

async function main() {
  // Parse DATABASE_URL
  const url = new URL(DATABASE_URL);
  const connection = await createConnection({
    host: url.hostname,
    port: parseInt(url.port) || 3306,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
    ssl: { rejectUnauthorized: false },
  });

  console.log('Connected to database');

  // Read hospital data
  const hospitalsData = JSON.parse(readFileSync('./shared/hospitals_seed.json', 'utf-8'));
  
  // Check existing hospitals
  const [existingRows] = await connection.execute('SELECT code FROM hospitals');
  const existingCodes = new Set(existingRows.map(r => r.code));
  
  let inserted = 0;
  let skipped = 0;
  
  for (const hospital of hospitalsData) {
    if (existingCodes.has(hospital.code)) {
      skipped++;
      continue;
    }
    
    try {
      await connection.execute(
        `INSERT INTO hospitals (name, code, city, state, type, isPreRegistered, active) 
         VALUES (?, ?, ?, ?, ?, true, true)`,
        [hospital.name, hospital.code, hospital.city, hospital.state, hospital.type]
      );
      inserted++;
    } catch (err) {
      // If duplicate code, try with suffix
      if (err.code === 'ER_DUP_ENTRY') {
        const newCode = `${hospital.code}${Math.floor(Math.random() * 99)}`;
        try {
          await connection.execute(
            `INSERT INTO hospitals (name, code, city, state, type, isPreRegistered, active) 
             VALUES (?, ?, ?, ?, ?, true, true)`,
            [hospital.name, newCode, hospital.city, hospital.state, hospital.type]
          );
          inserted++;
        } catch (err2) {
          console.error(`Failed to insert ${hospital.name}: ${err2.message}`);
        }
      } else {
        console.error(`Failed to insert ${hospital.name}: ${err.message}`);
      }
    }
  }
  
  console.log(`Done: ${inserted} inserted, ${skipped} skipped (already exist)`);
  
  // Verify
  const [countRows] = await connection.execute('SELECT COUNT(*) as total FROM hospitals WHERE isPreRegistered = true');
  console.log(`Total pre-registered hospitals in DB: ${countRows[0].total}`);
  
  await connection.end();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
