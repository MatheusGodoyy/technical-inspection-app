import * as FileSystem from "expo-file-system/legacy";
import * as ImageManipulator from "expo-image-manipulator";
import * as Print from "expo-print";
import { Alert, Image } from "react-native";
import { pdfStyles } from "../styles/pdfStyles";

export async function gerarPDF(relatorio: any) {
  try {
    const escoposHTML = relatorio.escopos
      ? (
          await Promise.all(
            relatorio.escopos.map(async (item: any, index: number) => {
              const fotosBase64 = await Promise.all(
                (item.fotos || []).map(async (foto: string) => {
                  try {
                    // redimensiona imagem
                    const manipulada = await ImageManipulator.manipulateAsync(
                      foto,
                      [{ resize: { width: 800 } }],
                      {
                        compress: 0.7,
                        format: ImageManipulator.SaveFormat.JPEG,
                      },
                    );

                    // converte para base64
                    const base64 = await FileSystem.readAsStringAsync(manipulada.uri, {
                      encoding: "base64",
                    });

                    return `data:image/jpeg;base64,${base64}`;
                  } catch (error) {
                    console.log("Erro ao processar foto:", foto);
                    return null;
                  }
                }),
              );

              const fotosHTML = fotosBase64
                .filter(Boolean)
                .map((foto) => `<img src="${foto}" style="width:150px;height:auto;margin:5px;" />`)
                .join("");

              return `

<div class="item">

<h3>Item ${index + 1} - ${item.tituloItem}</h3>

<p>
<b>Status:</b>
<span class="${item.status === "conforme" ? "ok" : "nok"}">
${item.status === "conforme" ? "Conforme" : "Não conforme"}
</span>
</p>

<p><b>Observação:</b> ${item.observacao || "-"}</p>

${item.status === "nao_conforme" ? `<p><b>Recomendação:</b> ${item.recomendacao || "-"}</p>` : ""}

<div class="fotos">
${fotosHTML}
</div>

</div>

`;
            }),
          )
        ).join("")
      : "";
    const html = `

<html>
  <head>
    ${pdfStyles}
  </head>

  <body>
    <div class="header">

      <div class="header-center">
        RELATÓRIO TÉCNICO DE INSPEÇÃO
      </div>

      <div class="header-right">
        <p><span class="label">Equipamento:</span> ${relatorio.fnEquipamento}</p>
        <p><span class="label">Data:</span> ${relatorio.data1}</p>
      </div>

    </div>

    <div class="content">
      <div class="title">
        ${relatorio.tituloInspecao}
      </div>

      <div class="section">
        <div class="section-title">
          Dados da Inspeção
        </div>

        <p><b>Título:</b> ${relatorio.tituloInspecao}</p>
        <p><b>Tipo:</b> ${relatorio.tipoInspecao}</p>
        <p><b>Data atual:</b> ${relatorio.data1}</p>
        <p><b>Próxima inspeção:</b> ${relatorio.data2}</p>
        <p><b>Responsável:</b> ${relatorio.responsavel}</p>
      </div>

      <div class="section">
        <div class="section-title">
          Equipamento
        </div>

        <p><b>FN:</b> ${relatorio.fnEquipamento}</p>
        <p><b>Nome:</b> ${relatorio.nomeEquipamento}</p>
        <p><b>Local:</b> ${relatorio.localInstalacao}</p>
        <p><b>Plano:</b> ${relatorio.plano}</p>
        <p><b>Lista de tarefas:</b> ${relatorio.listaTarefas}</p>
      </div>

      <div class="section">
        <div class="section-title">
          Objetivos da Inspeção
        </div>

          <p>
            Realizar a avaliação técnica das condições operacionais e estruturais do item
            inspecionado, visando à identificação sistemática de não conformidades,
            anomalias ou desvios em relação aos requisitos normativos e de segurança
            aplicáveis.
          </p>
      </div>

      <div class="section">
        <div class="section-title">
          Escopos da inspeção
        </div>
        ${escoposHTML}
      </div>

      <div class="signature">

        <div class="signature-box">

          ${
            relatorio.assinatura ? `<img src="${relatorio.assinatura}" />` : `<p>Sem assinatura</p>`
          }

          <div class="signature-label">
            Assinatura do responsável pela inspeção.
          </div>
      </div
  </div>

</div>
    </div>
    <div class="report-end">
      Relatório Técnico de Inspeção – Sylvamo
    </div>
  </body>
</html>
`;

    const idInspecao = Date.now();

    const nomeArquivo = `INSPECAO_${idInspecao}.pdf`;

    const pastaRelatorios = FileSystem.documentDirectory + "relatorios/";

    const info = await FileSystem.getInfoAsync(pastaRelatorios);

    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(pastaRelatorios, { intermediates: true });
    }

    const { uri } = await Print.printToFileAsync({
      html,
    });

    const caminhoFinal = pastaRelatorios + nomeArquivo;

    await FileSystem.moveAsync({
      from: uri,
      to: caminhoFinal,
    });
    return {
      idInspecao,
      path_pdf: caminhoFinal,
    };
  } catch (error) {
    console.log("ERRO PDF:", error);
    Alert.alert("Erro ao gerar PDF");
  }
}
