import db from "../database/database";
import * as Network from "expo-network";
import * as FileSystem from "expo-file-system/legacy";


const URL_FLUXO = "https://defaulteb4154c51e814c3c9e5da8a547806c.8e.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/ec9dfc3a7c914e06bc5d89b81831b7a6/triggers/manual/paths/invoke?api-version=1";

let sincronizando = false;


export const buscarPendentes = async () => {
    const result = await db.getAllAsync(
        `SELECT * FROM inspecoes WHERE status_sync = 'pending'`
    );

    return result;
};

export const enviarInspecao = async (inspecao) => {
    try {

        const base64 = await FileSystem.readAsStringAsync(inspecao.path_pdf, {
            encoding: FileSystem.EncodingType.Base64,
        });

        // 🔹 converter escopos do SQLite (string) para array
        const escopos = JSON.parse(inspecao.escopos || "[]");

        const itensConforme = escopos.filter(
            (i) => i.status === "conforme"
        ).length;

        const itensNaoConforme = escopos.filter(
            (i) => i.status === "nao_conforme"
        ).length;

        const totalItens = escopos.length;

        const escoposFormatados = escopos.map((item) => ({
            item: item.tituloItem,
            status: item.status,
            observacao: item.status === "conforme" ? item.observacao : null,
            razao_nao_conformidade:
                item.status === "nao_conforme" ? item.observacao : null,
            recomendacao:
                item.status === "nao_conforme" ? item.recomendacao : null
        }));

        const response = await fetch(URL_FLUXO, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({

                titulo_inspecao: inspecao.titulo_inspecao,
                tipo_inspecao: inspecao.tipo_inspecao,
                data_inspecao: inspecao.data_inspecao,
                proxima_inspecao: inspecao.proxima_inspecao,
                responsavel: inspecao.responsavel,

                equipamento: {
                    fn: inspecao.equipamento_fn,
                    nome: inspecao.equipamento_nome,
                    local: inspecao.equipamento_local,
                    plano: inspecao.equipamento_plano,
                    lista_tarefas: inspecao.equipamento_lista_tarefas
                },

                itens_conforme: itensConforme,
                itens_nao_conforme: itensNaoConforme,
                total_itens: totalItens,

                escopos: escoposFormatados,

                pdf: base64

            }),
        });
        console.log("STATUS RESPOSTA:", response.status);

        if (!response.ok) {
            throw new Error("Erro ao enviar inspeção");
        }

        console.log("INSPEÇÃO ENVIADA COM SUCESSO");

        return true;

    } catch (error) {

        console.log("Erro no envio:", error);
        return false;

    }
};

export const marcarComoSincronizado = async (id) => {
    await db.runAsync(
        `UPDATE inspecoes SET status_sync = 'synced' WHERE id = ?`,
        [id]
    );
};

export const marcarComoEnviando = async (id) => {
    await db.runAsync(
        `UPDATE inspecoes SET status_sync = 'sending' WHERE id = ?`,
        [id]
    );
};

export const marcarComoErro = async (id) => {
    await db.runAsync(
        `UPDATE inspecoes SET status_sync = 'error' WHERE id = ?`,
        [id]
    );
};

export const sincronizar = async () => {

    if (sincronizando) {
        console.log("Sincronização já em andamento...");
        return;
    }

    sincronizando = true;

    try {

        const pendentes = await buscarPendentes();

        for (const inspecao of pendentes) {

            await marcarComoEnviando(inspecao.id);

            const sucesso = await enviarInspecao(inspecao);

            if (sucesso) {
                await marcarComoSincronizado(inspecao.id);
            } else {
                await marcarComoErro(inspecao.id);
            }

        }

    } catch (error) {
        console.log("Erro na sincronização:", error);
    } finally {

        sincronizando = false;

    }

};

export const temInternet = async () => {
    const state = await Network.getNetworkStateAsync();
    return state.isConnected;
};