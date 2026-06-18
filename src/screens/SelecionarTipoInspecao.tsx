import { View, Text, Pressable, Image, SafeAreaView } from "react-native";
import { styles } from "../styles";
import { ROUTES, TIPO_INSPECAO } from "../constants";

export default function SelecionarTipoInspecao({ navigation }: any) {
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#f2f2f2" }}>
            <View style={{ flex: 1, padding: 20, justifyContent: "center", alignItems: "center" }}>
                <Image source={require("../../assets/sylvamo-logo.png")} style={styles.logo} />

                <Text style={{ fontSize: 20, fontWeight: "600", color: "#333", marginBottom: 40, textAlign: "center" }}>
                    Selecione o tipo de inspeção
                </Text>

                {/* Botão Inspeção Mecânica/Civil */}
                <Pressable
                    onPress={() => navigation.navigate(ROUTES.FORMULARIO_MECANICO, { tipoInspecao: TIPO_INSPECAO.MECANICA })}
                    style={({ pressed }) => [
                        {
                            backgroundColor: "#7B3FE4",
                            paddingVertical: 20,
                            paddingHorizontal: 30,
                            borderRadius: 8,
                            marginBottom: 20,
                            width: "100%",
                            alignItems: "center",
                        },
                        pressed && { opacity: 0.8, transform: [{ scale: 0.96 }] },
                    ]}
                >
                    <Text style={{ color: "white", fontSize: 18, fontWeight: "600", marginBottom: 8 }}>
                        Inspeção Técnica Geral
                    </Text>
                    <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 14 }}>
                        Relatório técnico de inspeção de equipamentos, estruturas e instalações
                    </Text>
                </Pressable>

                {/* Botão Inspeção Elétrica */}
                <Pressable
                    onPress={() => navigation.navigate(ROUTES.FORMULARIO_ELETRICO, { tipoInspecao: TIPO_INSPECAO.ELETRICA })}
                    style={({ pressed }) => [
                        {
                            backgroundColor: "#E74C3C",
                            paddingVertical: 20,
                            paddingHorizontal: 30,
                            borderRadius: 8,
                            width: "100%",
                            alignItems: "center",
                        },
                        pressed && { opacity: 0.8, transform: [{ scale: 0.96 }] },
                    ]}
                >
                    <Text style={{ color: "white", fontSize: 18, fontWeight: "600", marginBottom: 8 }}>
                        Inspeção Elétrica (Guide  Line)
                    </Text>
                    <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 14 }}>
                        Relatório técnico de inspeção elétrica
                    </Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}
