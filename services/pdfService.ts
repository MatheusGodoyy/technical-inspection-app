import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";
import * as ImageManipulator from "expo-image-manipulator";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Alert } from "react-native";
import logo from "../assets/sylvamo-logo.png";

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

    const asset = Asset.fromModule(logo);

    await asset.downloadAsync();

    const base64Logo = await FileSystem.readAsStringAsync(asset.localUri!, {
      encoding: "base64",
    });

    const logoBase64 = `data:image/png;base64,${base64Logo}`;
    const html = `

<html>
  <head>
    <style>
  body {
  font-family: Arial;
  padding: 25px;
}

/* CABEÇALHO */

.header {
  display: table;
  width: 100%;
  border-bottom: 2px solid #ccc;
  margin-bottom: 20px;
  padding-bottom: 10px;
}

.header-left {
  display: table-cell;
  vertical-align: middle;
  width: 120px;
}

.header-center {
  display: table-cell;
  text-align: center;
  vertical-align: middle;
  font-size: 20px;
  font-weight: bold;
}

.header-right {
  font-size: 10px;
  text-align: right;
}

.header-right p {
  margin: 2px 0;
}

.label {
  font-weight: bold;
  display: inline-block;
  width: 90px;
}

.logo {
  height: 50px;
}

/* TÍTULO */

.title {
  font-size: 22px;
  font-weight: bold;
  text-align: center;
  margin-top: 10px;
  margin-bottom: 20px;
}

/* SEÇÕES */

.section {
  margin-top: 25px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
  padding-bottom: 6px;
  border-bottom: 1px solid #ccc;
  text-align: center;
}

/* ITENS DA INSPEÇÃO */

.item {
  padding: 10px 0;
  margin-top: 10px;
  page-break-before: always;
}

/* STATUS */

.ok {
  color: green;
  font-weight: bold;
}

.nok {
  color: red;
  font-weight: bold;
}

/* FOTOS */

.fotos {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.fotos img {
  width: 200px;
  height: 150px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #ddd;
}

/* ASSINATURA */

.signature {
  margin-top: 60px;
  text-align: center;
}

.signature img {
  width: 400px;
  max-height: 140px;
  object-fit: contain;
  display: block;
  margin: 0 auto;
}

.signature-label {
  border-top: 2px solid #000;
  width: 280px;
  margin: 2px auto 0 auto;
  padding-top: 4px;
  font-weight: bold;
  font-size: 14px;
}

/* FINAL DO RELATÓRIO */

.report-end {
  margin-top: 40px;
  text-align: center;
  font-size: 11px;
  color: #666;
  border-top: 1px solid #ccc;
  padding-top: 10px;
}
</style>
  </head>

  <body>
    <div class="header">

      <div class="header-left">
        <img class="logo" src="${logoBase64}" />
      </div>

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
          Escopos da inspeção
        </div>

        ${escoposHTML}
      </div>

      <div class="signature">

        <div class="signature-box">

          ${relatorio.assinatura
        ? `<img src="${relatorio.assinatura}" />`
        : `<p>Sem assinatura</p>`
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
    };

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
