import { db } from './database';

export const createTables = async () => {
    await db.execAsync(`
    CREATE TABLE IF NOT EXISTS inspecoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT,
      responsavel TEXT,
      data TEXT,
      status_sync TEXT
    );
  `);

    await db.execAsync(`
    CREATE TABLE IF NOT EXISTS fotos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      inspecao_id INTEGER,
      path TEXT
    );
  `);
};