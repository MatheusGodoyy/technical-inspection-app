import { View, Text, TextInput } from "react-native";
import { styles } from "../styles";

interface Props {
    item: any;
    index: number;
    escopos: any[];
    setEscopos: (escopos: any[]) => void;
}

export function MedicoesEletricas({
    item,
    index,
    escopos,
    setEscopos,
}: Props) {

    const atualizarCampo = (
        secao: "qmt" | "qgbt",
        grupo: "tensao" | "corrente",
        fase: "r" | "s" | "t",
        valor: string
    ) => {
        const copia = [...escopos];

        copia[index].medicoes = copia[index].medicoes || {};

        copia[index].medicoes[secao] =
            copia[index].medicoes[secao] || {};

        copia[index].medicoes[secao][grupo] =
            copia[index].medicoes[secao][grupo] || {};

        copia[index].medicoes[secao][grupo][fase] = valor;

        setEscopos(copia);
    };

    const atualizarPotencia = (
        secao: "qmt" | "qgbt",
        valor: string
    ) => {
        const copia = [...escopos];

        copia[index].medicoes = copia[index].medicoes || {};

        copia[index].medicoes[secao] =
            copia[index].medicoes[secao] || {};

        copia[index].medicoes[secao].potencia = valor;

        setEscopos(copia);
    };

    return (
        <View
            style={{
                marginTop: 15,
                padding: 10,
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 8,
            }}
        >
            <Text
                style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    marginBottom: 15,
                    textAlign: "center",
                }}
            >
                Valores Elétricos
            </Text>

            {/* QMT */}

            <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                QMT
            </Text>

            <Text style={{ marginTop: 10 }}>Tensão</Text>

            <TextInput
                style={styles.input}
                placeholder="Tensão R (kV)"
                value={item.medicoes?.qmt?.tensao?.r || ""}
                onChangeText={(text) =>
                    atualizarCampo("qmt", "tensao", "r", text)
                }
            />

            <TextInput
                style={styles.input}
                placeholder="Tensão S (kV)"
                value={item.medicoes?.qmt?.tensao?.s || ""}
                onChangeText={(text) =>
                    atualizarCampo("qmt", "tensao", "s", text)
                }
            />

            <TextInput
                style={styles.input}
                placeholder="Tensão T (kV)"
                value={item.medicoes?.qmt?.tensao?.t || ""}
                onChangeText={(text) =>
                    atualizarCampo("qmt", "tensao", "t", text)
                }
            />

            <Text style={{ marginTop: 10 }}>Corrente</Text>

            <TextInput
                style={styles.input}
                placeholder="Corrente R (A)"
                value={item.medicoes?.qmt?.corrente?.r || ""}
                onChangeText={(text) =>
                    atualizarCampo("qmt", "corrente", "r", text)
                }
            />

            <TextInput
                style={styles.input}
                placeholder="Corrente S (A)"
                value={item.medicoes?.qmt?.corrente?.s || ""}
                onChangeText={(text) =>
                    atualizarCampo("qmt", "corrente", "s", text)
                }
            />

            <TextInput
                style={styles.input}
                placeholder="Corrente T (A)"
                value={item.medicoes?.qmt?.corrente?.t || ""}
                onChangeText={(text) =>
                    atualizarCampo("qmt", "corrente", "t", text)
                }
            />

            <TextInput
                style={styles.input}
                placeholder="Potência Trifásica (MW)"
                value={item.medicoes?.qmt?.potencia || ""}
                onChangeText={(text) =>
                    atualizarPotencia("qmt", text)
                }
            />

            {/* QGBT */}

            <Text
                style={{
                    fontWeight: "bold",
                    fontSize: 16,
                    marginTop: 20,
                }}
            >
                QGBT
            </Text>

            <Text style={{ marginTop: 10 }}>Tensão</Text>

            <TextInput
                style={styles.input}
                placeholder="Tensão R (V)"
                value={item.medicoes?.qgbt?.tensao?.r || ""}
                onChangeText={(text) =>
                    atualizarCampo("qgbt", "tensao", "r", text)
                }
            />

            <TextInput
                style={styles.input}
                placeholder="Tensão S (V)"
                value={item.medicoes?.qgbt?.tensao?.s || ""}
                onChangeText={(text) =>
                    atualizarCampo("qgbt", "tensao", "s", text)
                }
            />

            <TextInput
                style={styles.input}
                placeholder="Tensão T (V)"
                value={item.medicoes?.qgbt?.tensao?.t || ""}
                onChangeText={(text) =>
                    atualizarCampo("qgbt", "tensao", "t", text)
                }
            />

            <Text style={{ marginTop: 10 }}>Corrente</Text>

            <TextInput
                style={styles.input}
                placeholder="Corrente R (kA)"
                value={item.medicoes?.qgbt?.corrente?.r || ""}
                onChangeText={(text) =>
                    atualizarCampo("qgbt", "corrente", "r", text)
                }
            />

            <TextInput
                style={styles.input}
                placeholder="Corrente S (kA)"
                value={item.medicoes?.qgbt?.corrente?.s || ""}
                onChangeText={(text) =>
                    atualizarCampo("qgbt", "corrente", "s", text)
                }
            />

            <TextInput
                style={styles.input}
                placeholder="Corrente T (kA)"
                value={item.medicoes?.qgbt?.corrente?.t || ""}
                onChangeText={(text) =>
                    atualizarCampo("qgbt", "corrente", "t", text)
                }
            />

            <TextInput
                style={styles.input}
                placeholder="Potência Trifásica (MW)"
                value={item.medicoes?.qgbt?.potencia || ""}
                onChangeText={(text) =>
                    atualizarPotencia("qgbt", text)
                }
            />
        </View>
    );
}