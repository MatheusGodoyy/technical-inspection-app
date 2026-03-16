import { db } from "../database/database";

export const salvarInspecao = async (titulo, responsavel, data) => {
    await db.runAsync(
        `INSERT INTO inspecoes (titulo, responsavel, data, status_sync)
     VALUES (?, ?, ?, ?)`,
        [titulo, responsavel, data, "pending"]
    );
};

export const listarInspecoes = async () => {
    const result = await db.getAllAsync(`SELECT * FROM inspecoes`);
    return result;
};