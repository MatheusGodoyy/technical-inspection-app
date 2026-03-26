import { db } from './database';

export const createTables = async () => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS inspecoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  titulo_inspecao TEXT,
  tipo_inspecao TEXT,
  unidade TEXT,

  data_inspecao TEXT,
  proxima_inspecao TEXT,
  responsavel TEXT,

  equipamento_fn TEXT,
  equipamento_nome TEXT,
  equipamento_local TEXT,
  equipamento_plano TEXT,
  equipamento_lista_tarefas TEXT,

  itens_conforme INTEGER,
  itens_nao_conforme INTEGER,
  total_itens INTEGER,

  escopos TEXT,

  path_pdf TEXT,
  status_sync TEXT
);
  `);
};