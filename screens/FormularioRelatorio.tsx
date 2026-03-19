import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import * as Network from "expo-network";
import { useEffect, useRef, useState } from "react";
import { Alert, Image, Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import Signature from "react-native-signature-canvas";
import db from "../database/database";
import { gerarPDF } from "../services/pdfService";
import { sincronizar } from "../services/syncService.js";
import { styles } from "../styles/styles";
import * as MediaLibrary from 'expo-media-library';

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
  const [observacoes, setObservacoes] = useState("");
  const [erroData1, setErroData1] = useState(false);
  const [erroData2, setErroData2] = useState(false);
  const [fotoSelecionada, setFotoSelecionada] = useState<string | null>(null);

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
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          tituloInspecao,
          tipoInspecao,
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

    Alert.alert("Relatório salvo");
  };

  useEffect(() => {
    if (!relatorio) return;

    setRelatorioAtualId(relatorio.id);
    setTituloInspecao(relatorio.tituloInspecao);
    setArea(relatorio.tipoInspecao);
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

    if (isValidDate(data1) && isValidDate(data2) && !isNextDateAfterCurrent(data1, data2)) {
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

    navigation.navigate("Lista");

    Alert.alert("Relatório finalizado");
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
        console.log("Internet detectada - sincronizando...");
        await sincronizar();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const podeFinalizar = () => {
    return (
      tituloInspecao.trim() &&
      tipoInspecao.trim() &&
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
          style={{
            backgroundColor: "#2e7d32",
            padding: 15,
            alignItems: "center",
          }}
          onPress={() => signatureRef.current.readSignature()}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>Salvar assinatura</Text>
        </Pressable>

        <Pressable
          style={{
            backgroundColor: "#c62828",
            padding: 15,
            alignItems: "center",
          }}
          onPress={() => setAssinando(false)}
        >
          <Text style={{ color: "white" }}>Cancelar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* CABEÇALHO */}
      <View style={styles.header}>
        <Text style={[styles.subtitle, { marginBottom: 15 }]}>Sylvamo</Text>

        <Text style={styles.title}>RELATÓRIO DIGITAL DE INSPEÇÃO TÉCNICA</Text>
      </View>

      {/* IDENTIFICAÇÃO */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionText}>TÍTULO DA INSPEÇÃO</Text>
      </View>
      <TextInput
        style={styles.input}
        placeholder="TÍTULO DA INSPEÇÃO"
        placeholderTextColor="#ababab"
        value={tituloInspecao}
        onChangeText={setTituloInspecao}
      />

      {/* IDENTIFICAÇÃO */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionText}>DADOS DA INSPEÇÃO</Text>
      </View>

      <View style={{ marginBottom: 15, marginTop: 10 }}>
        <Text style={styles.label}>Tipo de inspeção:</Text>
        <TextInput
          style={styles.input}
          placeholderTextColor="#ababab"
          value={tipoInspecao}
          onChangeText={setArea}
        />
      </View>

      <View style={{ marginBottom: 15, marginTop: 10 }}>
        <Text style={styles.label}>Data da inspeção:</Text>
        <TextInput
          style={[styles.input, erroData1 && styles.inputError]}
          placeholder="(DD/MM/AAAA)"
          placeholderTextColor="#ababab"
          keyboardType="numeric"
          value={data1}
          onChangeText={(text) => {
            setData1(formatDate(text));
            setErroData1(false);
          }}
        />
      </View>

      <View style={{ marginBottom: 15, marginTop: 10 }}>
        <Text style={styles.label}>Data da próxima inspeção:</Text>
        <TextInput
          style={[styles.input, erroData2 && styles.inputError]}
          placeholder="(DD/MM/AAAA)"
          placeholderTextColor="#ababab"
          keyboardType="numeric"
          value={data2}
          onChangeText={(text) => {
            setData2(formatDate(text));
            setErroData2(false);
          }}
        />
      </View>

      <View style={{ marginBottom: 15, marginTop: 10 }}>
        <Text style={styles.label}>Nome do inspetor:</Text>
        <TextInput
          style={styles.input}
          placeholderTextColor="#ababab"
          value={responsavel}
          onChangeText={setResponsavel}
        />
      </View>

      {/* EQUIPAMENTO */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionText}>DADOS DO EQUIPAMENTO</Text>
      </View>

      <View style={{ marginBottom: 15, marginTop: 10 }}>
        <Text style={styles.label}>FN do equipamento:</Text>
        <TextInput
          style={styles.input}
          placeholderTextColor="#ababab"
          value={fnEquipamento}
          onChangeText={setFnEquipamento}
        />
      </View>

      <View style={{ marginBottom: 15, marginTop: 10 }}>
        <Text style={styles.label}>Nome do equipamento ou rota:</Text>
        <TextInput
          style={styles.input}
          placeholderTextColor="#ababab"
          value={nomeEquipamento}
          onChangeText={setnomeEquipamento}
        />
      </View>

      <View style={{ marginBottom: 15, marginTop: 10 }}>
        <Text style={styles.label}> Local da instalação: </Text>
        <TextInput
          style={styles.input}
          placeholderTextColor="#ababab"
          value={localInstalacao}
          onChangeText={setLocalInstalacao}
        />
      </View>

      <View style={{ marginBottom: 15, marginTop: 10 }}>
        <Text style={styles.label}> Plano </Text>
        <TextInput
          style={styles.input}
          placeholderTextColor="#ababab"
          value={plano}
          onChangeText={setPlano}
        />
      </View>

      <View style={{ marginBottom: 15, marginTop: 10 }}>
        <Text style={styles.label}> Lista de tarefas: </Text>
        <TextInput
          style={styles.input}
          placeholderTextColor="#ababab"
          value={listaTarefas}
          onChangeText={setListaTarefas}
        />
      </View>
      {/* OBJETIVOS */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionText}>OBJETIVOS DA INSPEÇÃO</Text>
      </View>

      <View style={styles.fixedBox}>
        <Text style={styles.fixedText}>
          Realizar a avaliação técnica das condições operacionais e estruturais do item
          inspecionado, visando à identificação sistemática de não conformidades, anomalias ou
          desvios em relação aos requisitos normativos e de segurança aplicáveis.
        </Text>
      </View>
      {/* ESCOPOS DA INSPEÇÃO */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionText}>ESCOPOS DA INSPEÇÃO</Text>
      </View>

      {escopos.map((item, index) => (
        <View key={item.id} style={styles.escopoBox}>
          <View>
            <Text style={styles.escopoTitle}>Item {index + 1}</Text>

            <TextInput
              style={styles.input}
              placeholder="Nome do item inspecionado"
              value={item.tituloItem}
              onChangeText={(text) => {
                const copia = [...escopos];

                copia[index].tituloItem = text;

                setEscopos(copia);
              }}
            />
          </View>

          <Pressable style={styles.removeEscopoButton} onPress={() => removerEscopo(index)}>
            <Text style={styles.removeEscopoText}>Remover item</Text>
          </Pressable>

          <Pressable style={styles.photoButton} onPress={() => escolherImagem(index)}>
            <Text style={styles.photoButtonText}>Adicionar foto</Text>
          </Pressable>

          <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 10 }}>
            {item.fotos.map((foto, fotoIndex) => (
              <View key={fotoIndex} style={{ marginRight: 10, marginBottom: 10 }}>
                <Pressable onPress={() => setFotoSelecionada(foto)}>
                  <Image source={{ uri: foto }} style={styles.photoPreview} />
                </Pressable>

                <Pressable
                  style={{
                    backgroundColor: "red",
                    padding: 4,
                    marginTop: 4,
                    alignItems: "center",
                  }}
                  onPress={() => {
                    const copia = [...escopos];
                    copia[index].fotos.splice(fotoIndex, 1);
                    setEscopos(copia);
                  }}
                >
                  <Text style={{ color: "white", fontSize: 12 }}>Excluir</Text>
                </Pressable>
              </View>
            ))}
          </View>

          <View style={styles.statusRow}>
            <Pressable
              style={[styles.statusButton, item.status === "conforme" && styles.statusConforme]}
              onPress={() => {
                const copia = [...escopos];
                copia[index].status = "conforme";
                setEscopos(copia);
              }}
            >
              <Text
                style={{
                  color: item.status === "conforme" ? "white" : "#334155",
                  fontWeight: "600",
                }}
              >
                Conforme
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.statusButton,
                item.status === "nao_conforme" && styles.statusNaoConforme,
              ]}
              onPress={() => {
                const copia = [...escopos];
                copia[index].status = "nao_conforme";
                setEscopos(copia);
              }}
            >
              <Text
                style={{
                  color: item.status === "nao_conforme" ? "white" : "#334155",
                  fontWeight: "600",
                }}
              >
                Não conforme
              </Text>
            </Pressable>
          </View>

          {item.status && (
            <>
              <TextInput
                style={styles.textArea}
                placeholder={
                  item.status === "conforme" ? "Observações" : "Descreva a não conformidade"
                }
                placeholderTextColor="#9CA3AF"
                value={item.observacao}
                onChangeText={(text) => {
                  const copia = [...escopos];
                  copia[index].observacao = text;
                  setEscopos(copia);
                }}
              />

              {item.status === "nao_conforme" && (
                <TextInput
                  style={styles.textArea}
                  placeholder="Recomendações"
                  placeholderTextColor="#9CA3AF"
                  value={item.recomendacao}
                  onChangeText={(text) => {
                    const copia = [...escopos];
                    copia[index].recomendacao = text;
                    setEscopos(copia);
                  }}
                />
              )}
            </>
          )}
        </View>
      ))}
      <Pressable style={styles.button} onPress={adicionarEscopo}>
        <Text style={styles.buttonText}>+ Adicionar item de inspeção</Text>
      </Pressable>

      {/* ASSINATURAS */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionText}>ASSINATURAS</Text>
      </View>

      <Pressable style={styles.signature} onPress={() => setAssinando(true)}>
        {assinatura ? (
          <Image
            source={{ uri: assinatura }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="stretch"
          />
        ) : (
          <Text>Toque para assinar</Text>
        )}
      </Pressable>

      <Text style={styles.signatureLabel}>Responsável</Text>

      <Modal visible={fotoSelecionada !== null} transparent={true}>
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.9)",
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => setFotoSelecionada(null)}
        >
          {fotoSelecionada && (
            <Image
              source={{ uri: fotoSelecionada }}
              style={{
                width: "95%",
                height: "80%",
                resizeMode: "contain",
              }}
            />
          )}
        </Pressable>
      </Modal>

      <View style={{ marginTop: 30 }}>
        <Pressable style={styles.button} onPress={salvarRelatorio}>
          <Text style={styles.buttonText}>Salvar relatório</Text>
        </Pressable>

        <Pressable
          style={[styles.button, { backgroundColor: podeFinalizar() ? "#e80303" : "#999" }]}
          disabled={!podeFinalizar()}
          onPress={confirmarFinalizacao}
        >
          <Text style={styles.buttonText}>Finalizar relatório</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
