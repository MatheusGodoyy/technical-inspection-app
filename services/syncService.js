import * as FileSystem from "expo-file-system/legacy";
import * as Network from "expo-network";
import db from "../database/database";

const formatarData = (dataBR) => {
  if (!dataBR) return null;

  const [dia, mes, ano] = dataBR.split("/");

  return `${ano}-${mes}-${dia}`; // formato aceito pelo Power Automate
};

const converterDataSegura = (dataBR) => {
  if (!dataBR || typeof dataBR !== "string") {
    throw new Error("Data inválida: valor vazio");
  }

  const regex = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!regex.test(dataBR)) {
    throw new Error(`Formato inválido: ${dataBR}`);
  }

  const [dia, mes, ano] = dataBR.split("/").map(Number);

  if (mes < 1 || mes > 12) {
    throw new Error(`Mês inválido: ${dataBR}`);
  }

  const ultimoDiaMes = new Date(ano, mes, 0).getDate();
  if (dia < 1 || dia > ultimoDiaMes) {
    throw new Error(`Dia inválido: ${dataBR}`);
  }

  if (ano < 2000 || ano > 2100) {
    throw new Error(`Ano inválido: ${dataBR}`);
  }

  return `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
};

const URL_FLUXO =
  "";

let sincronizando = false;

export const buscarPendentes = async () => {
  const result = await db.getAllAsync(`SELECT * FROM inspecoes WHERE status_sync in ('pending', 'error')`);

  return result;
};

export const enviarInspecao = async (inspecao) => {

  try {

    const fileInfo = await FileSystem.getInfoAsync(inspecao.path_pdf);

    if (!fileInfo.exists) {
      await marcarComoSincronizado(inspecao.id);

      return true;
    }

    const base64 = await FileSystem.readAsStringAsync(
      inspecao.path_pdf,
      {
        encoding: FileSystem.EncodingType.Base64,
      }
    );

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
      observacao:
        item.status === "conforme"
          ? item.observacao
          : null,

      razao_nao_conformidade:
        item.status === "nao_conforme"
          ? item.observacao
          : null,

      recomendacao:
        item.status === "nao_conforme"
          ? item.recomendacao
          : null,
    }));

    let dataInspecaoFormatada;
    let proximaInspecaoFormatada;

    try {

      dataInspecaoFormatada = converterDataSegura(
        inspecao.data_inspecao
      );

      proximaInspecaoFormatada = converterDataSegura(
        inspecao.proxima_inspecao
      );

    } catch (erro) {

      console.log("ERRO DE DATA:", erro.message);

      return false;
    }

    const response = await fetch(URL_FLUXO, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({

        titulo_inspecao: inspecao.titulo_inspecao,
        tipo_inspecao: inspecao.tipo_inspecao,
        unidade: inspecao.unidade,

        data_inspecao: dataInspecaoFormatada,
        proxima_inspecao: proximaInspecaoFormatada,

        responsavel: inspecao.responsavel,

        equipamento: {
          fn: inspecao.equipamento_fn,
          nome: inspecao.equipamento_nome,
          local: inspecao.equipamento_local,
          plano: inspecao.equipamento_plano,
          lista_tarefas: inspecao.equipamento_lista_tarefas,
        },

        itens_conforme: itensConforme,
        itens_nao_conforme: itensNaoConforme,
        total_itens: totalItens,

        escopos: escoposFormatados,

        pdf: base64,
      }),
    });

    console.log("STATUS RESPOSTA:", response.status);

    if (!response.ok) {
      throw new Error("Erro ao enviar inspeção");
    }

    console.log("INSPEÇÃO ENVIADA COM SUCESSO");

    return true;

  } catch (error) {

    return false;
  }
};
export const marcarComoSincronizado = async (id) => {
  await db.runAsync(`UPDATE inspecoes SET status_sync = 'synced' WHERE id = ?`, [id]);
};

export const marcarComoEnviando = async (id) => {
  await db.runAsync(`UPDATE inspecoes SET status_sync = 'sending' WHERE id = ?`, [id]);
};

export const marcarComoErro = async (id) => {
  await db.runAsync(`UPDATE inspecoes SET status_sync = 'error' WHERE id = ?`, [id]);
};

export const sincronizar = async () => {

  if (sincronizando) {
    return;
  }

  sincronizando = true;

  try {

    const pendentes = await buscarPendentes();

    for (const inspecao of pendentes) {

      console.log("ENVIANDO INSPEÇÃO:", inspecao.id);

      // marca como enviando
      await marcarComoEnviando(inspecao.id);

      const sucesso = await enviarInspecao(inspecao);

      if (sucesso) {

        console.log("INSPEÇÃO SINCRONIZADA:", inspecao.id);

        // marca como sincronizado PRIMEIRO
        await marcarComoSincronizado(inspecao.id);

        // tenta deletar o PDF separadamente
        try {

          await FileSystem.deleteAsync(inspecao.path_pdf, {
            idempotent: true,
          });

          console.log("PDF DELETADO:", inspecao.path_pdf);

        } catch (erroDelete) {

          console.log("Erro ao deletar PDF:", erroDelete);

        }

      } else {

        console.log("ERRO AO ENVIAR:", inspecao.id);

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


