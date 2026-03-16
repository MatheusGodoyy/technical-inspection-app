import { View, Text, Pressable, Alert, Image, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { styles } from "../styles/styles";

export default function ListaRelatorios({ navigation }: any) {

    const [relatorios, setRelatorios] = useState<any[]>([]);

    useFocusEffect(
        useCallback(() => {

            const carregarRelatorios = async () => {

                const dados = await AsyncStorage.getItem("relatorios")

                if (!dados) {
                    setRelatorios([])
                    return
                }

                const lista = JSON.parse(dados)

                const abertos = lista.filter((r: any) => r.status === "aberto")

                setRelatorios(abertos)

            }

            carregarRelatorios()

        }, [])
    )
    const confirmarExclusao = (id: string) => {

        Alert.alert(
            "Excluir relatório",
            "Tem certeza que deseja excluir este relatório?",
            [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                {
                    text: "Excluir",
                    style: "destructive",
                    onPress: () => excluirRelatorio(id)
                }
            ]
        )

    }
    const excluirRelatorio = async (id: string) => {

        const dados = await AsyncStorage.getItem("relatorios")

        const lista = JSON.parse(dados || "[]")

        const novaLista = lista.filter((r: any) => r.id !== id)

        await AsyncStorage.setItem(
            "relatorios",
            JSON.stringify(novaLista)
        )

        setRelatorios(novaLista.filter((r: any) => r.status === "aberto"))

    }

    return (
        <ScrollView style={{ flex: 1, backgroundColor: "#f2f2f2" }}>

            <View style={{ padding: 20, alignItems: "center" }}>

                <Image
                    source={require("../assets/sylvamo-logo.png")}
                    style={styles.logo}
                />

                <Text style={{ fontSize: 18, color: "#555", marginBottom: 40 }}>
                    Relatórios técnicos de inspeção
                </Text>

                <Pressable
                    style={{
                        backgroundColor: "#7B3FE4",
                        paddingVertical: 15,
                        paddingHorizontal: 80,
                        borderRadius: 8,
                        marginBottom: 25
                    }}
                    onPress={() => navigation.navigate("Formulario")}
                >
                    <Text style={{ color: "white", fontSize: 18, fontWeight: "600" }}>
                        Novo relatório
                    </Text>
                </Pressable>
                <View
                    style={{
                        height: 1,
                        width: "100%",
                        backgroundColor: "#ddd",
                        marginVertical: 15
                    }}
                />
                <Text style={{ fontSize: 20, fontWeight:"600", color: "##333", marginBottom: 6 }}>
                    Relatórios em aberto
                </Text>

                <Text style={{ textAlign: "center", marginBottom: 20, color: "#777" }}>
                    •Toque em um relatório abaixo para continuar {"\n"}• Segure para excluir
                </Text>

            </View>

            <View style={{ paddingHorizontal: 20 }}>

                {relatorios.map((relatorio) => (
                    <Pressable
                        key={relatorio.id}
                        style={{
                            backgroundColor: "#eee",
                            padding: 7,
                            marginBottom: 7,
                            borderRadius: 5
                        }}
                        onPress={() => navigation.navigate("Formulario", { relatorio })}
                        onLongPress={() => confirmarExclusao(relatorio.id)}
                    >

                        <Text style={{ fontWeight: "bold" }}>
                            {relatorio.tituloInspecao || "Relatório sem título"}
                        </Text>

                        <Text>Status: {relatorio.status}</Text>

                    </Pressable>
                ))}

            </View>

        </ScrollView>

    )
}