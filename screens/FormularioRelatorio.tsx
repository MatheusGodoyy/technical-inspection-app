import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import * as Network from "expo-network";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Pressable,
  Text,
  View,
} from "react-native";
import Signature from "react-native-signature-canvas";
import db from "../database/database";
import { gerarPDF } from "../services/pdfService";
import { sincronizar } from "../services/syncService.js";
import FormularioInspecao from "../screens/FormularioRelatorioUI";

export default function App({ navigation, route }: any) {
  const relatorio = route.params?.relatorio;
  const signatureRef = useRef<any>(null);
  const SignaturePad = Signature as any;
  const [relatorioAtualId, setRelatorioAtualId] = useState<string | null>(null);
  const [assinatura, setAssinatura] = useState<string | null>(null);
  const [assinando, setAssinando] = useState(false);
  const [tituloInspecao, setTituloInspecao] = useState("");
  const [tipoInspecao, setArea] = useState("");
  const [data1, setData1] = useState("");
  const [data2, setData2] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [fnEquipamento, setFnEquipamento] = useState("");
  const [nomeEquipamento, setnomeEquipamento] = useState("");
  const [localInstalacao, setLocalInstalacao] = useState("");
  const [plano, setPlano] = useState("");
  const [listaTarefas, setListaTarefas] = useState("");
  const [erroData1, setErroData1] = useState(false);
  const [erroData2, setErroData2] = useState(false);
  const [fotoSelecionada, setFotoSelecionada] = useState<string | null>(null);
  const [unidade, setUnidade] = useState("");

  const formatDate = (text: string) => {
    let cleaned = text.replace(/\D/g, "");
    cleaned = cleaned.slice(0, 8);

    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 4) {
      return cleaned.replace(/(\d{2})(\d+)/, "$1/$2");
    }

    return cleaned.replace(/(\d{2})(\d{2})(\d+)/, "$1/$2/$3");
  };

  const isValidDate = (date: string) => {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(date)) return false;

    const [day, month, year] = date.split("/").map(Number);
    if (month < 1 || month > 12) return false;

    const lastDayOfMonth = new Date(year, month, 0).getDate();
    if (day < 1 || day > lastDayOfMonth) return false;

    return true;
  };

  const isNextDateAfterCurrent = (current: string, next: string) => {
    const [d1, m1, y1] = current.split("/").map(Number);
    const [d2, m2, y2] = next.split("/").map(Number);

    const date1 = new Date(y1, m1 - 1, d1);
    const date2 = new Date(y2, m2 - 1, d2);

    return date2 > date1;
  };

  const handleOK = (signature: string) => {
    setAssinatura(signature);
    setAssinando(false);
  };

  const [escopos, setEscopos] = useState<
    {
      id: string;
      tituloItem: string;
      fotos: string[];
      status: "conforme" | "nao_conforme" | null;
      observacao: string;
      recomendacao: string;
    }[]
  >([]);

  const removerEscopo = (index: number) => {
    Alert.alert("Remover item", "Tem certeza que deseja remover este item da inspeção?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: () => {
          setEscopos((prev) => prev.filter((_, i) => i !== index));
        },
      },
    ]);
  };

  const gerarPDFESalvar = async () => {
    console.log("BOTAO GERAR PDF CLICADO");

    try {
      const resultado = await gerarPDF({
        tituloInspecao,
        tipoInspecao,
        unidade,
        data1,
        data2,
        responsavel,
        fnEquipamento,
        nomeEquipamento,
        localInstalacao,
        plano,
        listaTarefas,
        escopos,
        assinatura,
      });

      console.log("RESULTADO PDF:", resultado);

      if (!resultado) {
        console.log("PDF NAO GERADO");
        return;
      }

      // 🔹 calcular estatísticas da inspeção
      const itensConforme = escopos.filter((item) => item.status === "conforme").length;

      const itensNaoConforme = escopos.filter((item) => item.status === "nao_conforme").length;

      const totalItens = escopos.length;

      await db.runAsync(
        `INSERT INTO inspecoes (
                titulo_inspecao,
                tipo_inspecao,
                unidade,
                data_inspecao,
                proxima_inspecao,
                responsavel,

                equipamento_fn,
                equipamento_nome,
                equipamento_local,
                equipamento_plano,
                equipamento_lista_tarefas,

                itens_conforme,
                itens_nao_conforme,
                total_itens,

                escopos,

                path_pdf,
                status_sync
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          tituloInspecao,
          tipoInspecao,
          unidade,
          data1,
          data2,
          responsavel,

          fnEquipamento,
          nomeEquipamento,
          localInstalacao,
          plano,
          listaTarefas,

          itensConforme,
          itensNaoConforme,
          totalItens,

          JSON.stringify(escopos),

          resultado.path_pdf,
          "pending",
        ],
      );

      console.log("SALVO NO SQLITE");
    } catch (erro) {
      console.log("ERRO AO GERAR PDF:", erro);
    }
  };

  const handleSalvar = () => {
    let valido = true;

    setErroData1(false);
    setErroData2(false);

    if (!isValidDate(data1)) {
      setErroData1(true);
      valido = false;
    }

    if (!isValidDate(data2)) {
      setErroData2(true);
      valido = false;
    }

    if (isValidDate(data1) && isValidDate(data2) && !isNextDateAfterCurrent(data1, data2)) {
      setErroData2(true);
      valido = false;
    }

    if (!valido) {
      Alert.alert("Erro", "Verifique os campos destacados em vermelho");
      return;
    }

    Alert.alert("Sucesso", "Datas válidas!");
  };

  const formatDateFromPicker = (date: Date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  const adicionarEscopo = () => {
    setEscopos((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        tituloItem: "",
        fotos: [],
        status: null,
        observacao: "",
        recomendacao: "",
      },
    ]);
  };
  const tirarFoto = async (index: number) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    // Permissão da câmera
    if (status !== "granted") {
      Alert.alert("Permissão necessária", "Precisamos da câmera");
      return;
    }

    // Permissão da galeria
    const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();

    if (mediaStatus !== "granted") {
      Alert.alert("Permissão necessária", "Precisamos acessar a galeria");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      allowsEditing: true,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;

      // SALVA NA GALERIA
      await MediaLibrary.saveToLibraryAsync(uri);

      const copia = [...escopos];
      copia[index].fotos.push(uri);

      setEscopos(copia);
    }
  };

  const escolherDaGaleria = async (index: number) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("Permissão necessária", "Precisamos acessar a galeria");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      const copia = [...escopos];

      copia[index].fotos.push(result.assets[0].uri);

      setEscopos(copia);
    }
  };

  const escolherImagem = (index: number) => {
    Alert.alert("Adicionar foto", "Escolha uma opção", [
      { text: "Câmera", onPress: () => tirarFoto(index) },
      { text: "Galeria", onPress: () => escolherDaGaleria(index) },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  const salvarRelatorio = async () => {
    const dados = await AsyncStorage.getItem("relatorios");

    const lista = JSON.parse(dados || "[]");

    let id = relatorioAtualId;

    if (!id) {
      id = Date.now().toString();
      setRelatorioAtualId(id);
    }

    const novoRelatorio = {
      id,
      status: "aberto",
      tituloInspecao,
      tipoInspecao,
      unidade,
      data1,
      data2,
      responsavel,
      fnEquipamento,
      nomeEquipamento,
      localInstalacao,
      plano,
      listaTarefas,
      escopos,
      assinatura,
    };

    const novaLista = lista.filter((r: any) => r.id !== id);

    novaLista.push(novoRelatorio);

    await AsyncStorage.setItem("relatorios", JSON.stringify(novaLista));

    Alert.alert(
      "Relatório salvo 📝",
      "Este relatório foi salvo como rascunho.\n\nO envio será realizado somente após a finalização."
    );
  };

  useEffect(() => {
    if (!relatorio) return;

    setRelatorioAtualId(relatorio.id);
    setTituloInspecao(relatorio.tituloInspecao);
    setArea(relatorio.tipoInspecao);
    setUnidade(relatorio.unidade);
    setData1(relatorio.data1);
    setData2(relatorio.data2);
    setResponsavel(relatorio.responsavel);
    setFnEquipamento(relatorio.fnEquipamento);
    setnomeEquipamento(relatorio.nomeEquipamento);
    setLocalInstalacao(relatorio.localInstalacao);
    setPlano(relatorio.plano);
    setListaTarefas(relatorio.listaTarefas);
    setEscopos(relatorio.escopos);
    setAssinatura(relatorio.assinatura);
  }, []);

  const finalizarRelatorio = async () => {
    let valido = true;

    setErroData1(false);
    setErroData2(false);

    if (!isValidDate(data1)) {
      setErroData1(true);
      valido = false;
    }

    if (!isValidDate(data2)) {
      setErroData2(true);
      valido = false;
    }

    if (
      isValidDate(data1) &&
      isValidDate(data2) &&
      !isNextDateAfterCurrent(data1, data2)
    ) {
      setErroData2(true);
      valido = false;
    }

    if (!valido) {
      Alert.alert("Erro", "Corrija as datas antes de finalizar");
      return;
    }

    await gerarPDFESalvar();

    const dados = await AsyncStorage.getItem("relatorios");
    const lista = JSON.parse(dados || "[]");

    const novaLista = lista.map((r: any) => {
      if (r.id === relatorioAtualId) {
        return { ...r, status: "finalizado" };
      }
      return r;
    });

    await AsyncStorage.setItem("relatorios", JSON.stringify(novaLista));

    Alert.alert(
      "Relatório finalizado ✅",
      "O envio será feito automaticamente quando houver conexão com a internet.\n\n📌IMPORTANTE: Caso o relatório ainda não tenha sido enviado, ele será enviado automaticamente na próxima vez que você abrir o aplicativo com conexão à internet.",
      [
        {
          text: "OK",
          onPress: () => navigation.navigate("Lista"),
        },
      ]
    );
  };

  const buscarRelatoriosAbertos = async () => {
    const dados = await AsyncStorage.getItem("relatorios");

    if (!dados) return [];

    const lista = JSON.parse(dados);

    return lista.filter((r: any) => r.status === "aberto");
  };

  const confirmarFinalizacao = () => {
    Alert.alert(
      "Finalizar relatório",
      "Tem certeza que deseja finalizar este relatório?\n\nApós finalizado não será possível continuar editando. Será necessário criar um novo relatório.",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Finalizar",
          style: "destructive",
          onPress: () => finalizarRelatorio(),
        },
      ],
    );
  };

  useEffect(() => {
    let ultimaTentativa = 0;

    const interval = setInterval(async () => {
      const agora = Date.now();

      if (agora - ultimaTentativa < 15000) return;

      const state = await Network.getNetworkStateAsync();

      if (state.isConnected) {
        ultimaTentativa = agora;
        await sincronizar();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const podeFinalizar = () => {
    return (
      tituloInspecao.trim() &&
      tipoInspecao.trim() &&
      unidade.trim() &&
      data1.trim() &&
      data2.trim() &&
      responsavel.trim() &&
      fnEquipamento.trim() &&
      nomeEquipamento.trim() &&
      localInstalacao.trim() &&
      listaTarefas.trim() &&
      assinatura &&
      escopos.length > 0 &&
      escopos.every(
        (e) =>
          e.tituloItem?.trim() &&
          e.status !== null &&
          (e.status === "conforme" || (e.status === "nao_conforme" && e.recomendacao?.trim())),
      )
    );
  };

  if (assinando) {
    return (
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        <SignaturePad
          ref={signatureRef}
          onOK={handleOK}
          descriptionText="Assine abaixo"
          clearText="Limpar"
          confirmText="Salvar"
        />

        <Pressable
          style={({ pressed }) => ({
            backgroundColor: pressed ? "#1b5e20" : "#2e7d32",
            padding: 15,
            alignItems: "center",
            transform: [{ scale: pressed ? 0.97 : 1 }],
            opacity: pressed ? 0.85 : 1,
          })}
          onPress={() => signatureRef.current.readSignature()}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>
            Salvar assinatura
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => ({
            backgroundColor: pressed ? "#8e0000" : "#c62828",
            padding: 15,
            alignItems: "center",
            transform: [{ scale: pressed ? 0.97 : 1 }],
            opacity: pressed ? 0.85 : 1,
          })}
          onPress={() => setAssinando(false)}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>
            Cancelar
          </Text>
        </Pressable>
      </View>
    );
  }
  return (
    <FormularioInspecao
      tituloInspecao={tituloInspecao}
      setTituloInspecao={setTituloInspecao}
      tipoInspecao={tipoInspecao}
      setArea={setArea}
      unidade={unidade}
      setUnidade={setUnidade}
      data1={data1}
      setData1={setData1}
      data2={data2}
      setData2={setData2}
      responsavel={responsavel}
      setResponsavel={setResponsavel}
      fnEquipamento={fnEquipamento}
      setFnEquipamento={setFnEquipamento}
      nomeEquipamento={nomeEquipamento}
      setnomeEquipamento={setnomeEquipamento}
      localInstalacao={localInstalacao}
      setLocalInstalacao={setLocalInstalacao}
      plano={plano}
      setPlano={setPlano}
      listaTarefas={listaTarefas}
      setListaTarefas={setListaTarefas}
      escopos={escopos}
      setEscopos={setEscopos}
      adicionarEscopo={adicionarEscopo}
      removerEscopo={removerEscopo}
      escolherImagem={escolherImagem}
      assinatura={assinatura}
      setAssinando={setAssinando}
      fotoSelecionada={fotoSelecionada}
      setFotoSelecionada={setFotoSelecionada}
      salvarRelatorio={salvarRelatorio}
      confirmarFinalizacao={confirmarFinalizacao}
      podeFinalizar={podeFinalizar}
      formatDate={formatDate}
      erroData1={erroData1}
      erroData2={erroData2}
      setErroData1={setErroData1}
      setErroData2={setErroData2}
    />
  );
}
