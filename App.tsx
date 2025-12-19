import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';



export default function App() {
  const [tipoInspecao, setArea] = useState('');
  const [data1, setData1] = useState('');
  const [data2, setData2] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [fnEquipamento, setFnEquipamento] = useState('');
  const [tagEquipamento, setTagEquipamento] = useState('');
  const [localInstalacao, setLocalInstalacao] = useState('');
  const [plano, setPlano] = useState('');
  const [listaTarefas, setListaTarefas] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [erroData1, setErroData1] = useState(false);
  const [erroData2, setErroData2] = useState(false);

  const formatDate = (text: string) => {
    let cleaned = text.replace(/\D/g, '');
    cleaned = cleaned.slice(0, 8);

    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 4) {
      return cleaned.replace(/(\d{2})(\d+)/, '$1/$2');
    }

    return cleaned.replace(/(\d{2})(\d{2})(\d+)/, '$1/$2/$3');
  };

  const isValidDate = (date: string) => {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(date)) return false;

    const [day, month, year] = date.split('/').map(Number);
    if (month < 1 || month > 12) return false;

    const lastDayOfMonth = new Date(year, month, 0).getDate();
    if (day < 1 || day > lastDayOfMonth) return false;

    return true;
  };

  const isNextDateAfterCurrent = (current: string, next: string) => {
    const [d1, m1, y1] = current.split('/').map(Number);
    const [d2, m2, y2] = next.split('/').map(Number);

    const date1 = new Date(y1, m1 - 1, d1);
    const date2 = new Date(y2, m2 - 1, d2);

    return date2 > date1;
  };

  const [escopos, setEscopos] = useState<
    {
      id: string;
      foto: string | null;
      status: 'conforme' | 'nao_conforme' | null;
      observacao: string;
      recomendacao: string;
    }[]
  >([]);

  const removerEscopo = (index: number) => {
    Alert.alert(
      'Remover item',
      'Tem certeza que deseja remover este item da inspeção?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => {
            setEscopos((prev) => prev.filter((_, i) => i !== index));
          },
        },
      ]
    );
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

    if (
      isValidDate(data1) &&
      isValidDate(data2) &&
      !isNextDateAfterCurrent(data1, data2)
    ) {
      setErroData2(true);
      valido = false;
    }

    if (!valido) {
      Alert.alert('Erro', 'Verifique os campos destacados em vermelho');
      return;
    }

    Alert.alert('Sucesso', 'Datas válidas!');
  };

  const formatDateFromPicker = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  const adicionarEscopo = () => {
    setEscopos((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        foto: null,
        status: null,
        observacao: '',
        recomendacao: '',
      },
    ]);
  };
  const tirarFoto = async (index: number) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Permissão necessária',
        'Precisamos da câmera para tirar a foto'
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      allowsEditing: true,
    });

    if (!result.canceled) {
      const copia = [...escopos];
      copia[index].foto = result.assets[0].uri;
      setEscopos(copia);
    }

  };



  return (
    <ScrollView style={styles.container}>
      {/* CABEÇALHO */}
      <View style={styles.header}>
        <Text style={styles.title}>RELATÓRIO DE INSPEÇÃO</Text>
        <Text style={styles.subtitle}>Sylvamo</Text>
      </View>

      {/* IDENTIFICAÇÃO */}
      <View style={styles.sectionGray}>
        <Text style={styles.sectionText}>DADOS DA INSPEÇÃO</Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="TIPO DE INSPEÇÃO"
        placeholderTextColor="#444"
        value={tipoInspecao}
        onChangeText={setArea}
      />

      <TextInput
        style={[styles.input, erroData1 && styles.inputError]}
        placeholder="DATA INSPEÇÃO ATUAL (DD/MM/AAAA)"
        placeholderTextColor="#444"
        keyboardType="numeric"
        value={data1}
        onChangeText={(text) => {
          setData1(formatDate(text));
          setErroData1(false);
        }}
      />

      <TextInput
        style={[styles.input, erroData2 && styles.inputError]}
        placeholder="DATA PRÓXIMA INSPEÇÃO (DD/MM/AAAA)"
        placeholderTextColor="#444"
        keyboardType="numeric"
        value={data2}
        onChangeText={(text) => {
          setData2(formatDate(text));
          setErroData2(false);
        }}
      />

      <TextInput
        style={styles.input}
        placeholder="INSPETOR"
        placeholderTextColor="#444"
        value={responsavel}
        onChangeText={setResponsavel}
      />

      {/* EQUIPAMENTO */}
      <View style={styles.sectionGreen}>
        <Text style={styles.sectionText}>DADOS DO EQUIPAMENTO</Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="FN DO EQUIPAMENTO"
        placeholderTextColor="#444"
        value={fnEquipamento}
        onChangeText={setFnEquipamento}
      />

      <TextInput
        style={styles.input}
        placeholder="TAG"
        placeholderTextColor="#444"
        value={tagEquipamento}
        onChangeText={setTagEquipamento}
      />

      <TextInput
        style={styles.input}
        placeholder="LOCAL DA INSTALAÇÃO"
        placeholderTextColor="#444"
        value={localInstalacao}
        onChangeText={setLocalInstalacao}
      />

      <TextInput
        style={styles.input}
        placeholder="PLANO"
        placeholderTextColor="#444"
        value={plano}
        onChangeText={setPlano}
      />

      <TextInput
        style={styles.input}
        placeholder="LISTA DE TAREFAS"
        placeholderTextColor="#444"
        value={listaTarefas}
        onChangeText={setListaTarefas}
      />

      {/* OBJETIVOS */}
      <View style={styles.sectionPurple}>
        <Text style={styles.sectionText}>OBJETIVOS DA INSPEÇÃO</Text>
      </View>

      <View style={styles.fixedBox}>
        <Text style={styles.fixedText}>
          Realizar a avaliação técnica das condições operacionais e estruturais do item
          inspecionado, visando à identificação sistemática de não conformidades,
          anomalias ou desvios em relação aos requisitos normativos e de segurança
          aplicáveis.
        </Text>
      </View>
      {/* ESCOPOS DA INSPEÇÃO */}
      <View style={styles.sectionGray}>
        <Text style={styles.sectionText}>ESCOPOS DA INSPEÇÃO</Text>
      </View>

      <Pressable style={styles.button} onPress={adicionarEscopo}>
        <Text style={styles.buttonText}>+ Adicionar item de inspeção</Text>
      </Pressable>

      {escopos.map((item, index) => (
        <View key={item.id} style={styles.escopoBox}>
          <Text style={styles.escopoTitle}>Item {index + 1}</Text>

          <Pressable
            style={styles.removeEscopoButton}
            onPress={() => removerEscopo(index)}
          >
            <Text style={styles.removeEscopoText}>Remover item</Text>
          </Pressable>

          <Pressable
            style={styles.photoButton}
            onPress={() => tirarFoto(index)}
          >
            <Text style={styles.photoButtonText}>
              {item.foto ? 'Trocar foto' : 'Tirar foto'}
            </Text>
          </Pressable>

          {item.foto && (
            <Image
              source={{ uri: item.foto }}
              style={styles.photoPreview}
            />
          )}

          <View style={styles.statusRow}>
            <Pressable
              style={[
                styles.statusButton,
                item.status === 'conforme' && styles.statusActive,
              ]}
              onPress={() => {
                const copia = [...escopos];
                copia[index].status = 'conforme';
                setEscopos(copia);
              }}
            >
              <Text>Conforme</Text>
            </Pressable>

            <Pressable
              style={[
                styles.statusButton,
                item.status === 'nao_conforme' && styles.statusActive,
              ]}
              onPress={() => {
                const copia = [...escopos];
                copia[index].status = 'nao_conforme';
                setEscopos(copia);
              }}
            >
              <Text>Não conforme</Text>
            </Pressable>
          </View>

          {item.status === 'nao_conforme' && (
            <>
              <TextInput
                style={styles.textArea}
                placeholder="Descreva a não conformidade"
                value={item.observacao}
                onChangeText={(text) => {
                  const copia = [...escopos];
                  copia[index].observacao = text;
                  setEscopos(copia);
                }}
              />

              <TextInput
                style={styles.textArea}
                placeholder="Recomendações"
                value={item.recomendacao}
                onChangeText={(text) => {
                  const copia = [...escopos];
                  copia[index].recomendacao = text;
                  setEscopos(copia);
                }}
              />
            </>
          )}

        </View>
      ))}


      {/* ASSINATURAS */}
      <View style={styles.sectionGray}>
        <Text style={styles.sectionText}>ASSINATURAS</Text>
      </View>

      <View style={styles.signature} />
      <Text style={styles.signatureLabel}>Responsável</Text>

      <View style={styles.signature} />
      <Text style={styles.signatureLabel}>Gestor</Text>

      <Pressable style={styles.button} onPress={handleSalvar}>
        <Text style={styles.buttonText}>Salvar</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#666',
  },
  sectionGray: {
    backgroundColor: '#651e91ff',
    padding: 8,
    marginTop: 16,
  },
  sectionGreen: {
    backgroundColor: '#651e91ff',
    padding: 8,
    marginTop: 16,
  },
  sectionPurple: {
    backgroundColor: '#651e91ff',
    padding: 8,
    marginTop: 16,
  },
  sectionText: {
    color: '#ffffffff',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 10,
    marginTop: 10,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 10,
    marginTop: 10,
    height: 100,
    textAlignVertical: 'top',
  },
  signature: {
    borderWidth: 1,
    borderColor: '#000',
    height: 60,
    marginTop: 16,
  },
  signatureLabel: {
    textAlign: 'center',
    marginTop: 4,
  },
  fixedBox: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 10,
    marginTop: 10,
    backgroundColor: '#f9f9f9',
  },
  fixedText: {
    fontSize: 14,
    color: '#000',
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 14,
    borderRadius: 6,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  inputError: {
    borderColor: 'red',
    borderWidth: 2,
  },
  escopoBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginTop: 12,
  },

  escopoTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },

  statusRow: {
    flexDirection: 'row',
    gap: 10,
  },

  statusButton: {
    borderWidth: 1,
    borderColor: '#999',
    padding: 8,
    borderRadius: 4,
  },

  statusActive: {
    backgroundColor: '#d0f0d0',
    borderColor: '#4CAF50',
  },
  photoButton: {
    marginTop: 8,
    marginBottom: 8,
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 4,
    alignItems: 'center',
  },

  photoButtonText: {
    fontWeight: 'bold',
  },

  photoPreview: {
    width: '100%',
    height: 180,
    borderRadius: 6,
    marginBottom: 8,
  },
  removeEscopoButton: {
    marginTop: 12,
    padding: 10,
    borderRadius: 4,
    backgroundColor: '#f8d7da',
    alignItems: 'center',
  },

  removeEscopoText: {
    color: '#721c24',
    fontWeight: 'bold',
  },
});
