import mysql from 'mysql2/promise';
import 'dotenv/config';

async function resetDatabase() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  // Get all tables
  const [tables] = await connection.query('SHOW TABLES');
  const tableNames = tables.map(t => Object.values(t)[0]);
  
  console.log('Found tables:', tableNames);
  
  // Disable foreign key checks
  await connection.query('SET FOREIGN_KEY_CHECKS = 0');
  
  // Drop all tables
  for (const table of tableNames) {
    console.log(`Dropping table: ${table}`);
    await connection.query(`DROP TABLE IF EXISTS \`${table}\``);
  }
  
  // Re-enable foreign key checks
  await connection.query('SET FOREIGN_KEY_CHECKS = 1');
  
  console.log('All tables dropped successfully!');
  await connection.end();
}

resetDatabase().catch(console.error);
