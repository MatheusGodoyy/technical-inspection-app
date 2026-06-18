import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Network from "expo-network";
import { useEffect, useState } from "react";
import { criarTabelas } from "./database";
import { FormularioRelatorioMecanicoCivil } from "./screens";
import { FormularioRelatorioEletrico } from "./screens";
import { ListaRelatorios } from "./screens";
import { SelecionarTipoInspecao } from "./screens";
import { sincronizar, temInternet } from "./services/sync";
import { navigationConfig } from "./config";
import { ROUTES } from "./constants";

const Stack = createNativeStackNavigator();

export default function App() {
    useEffect(() => {
        const iniciarApp = async () => {
            // cria a tabela SQLite
            await criarTabelas();

            // verifica internet
            const online = await temInternet();

            if (online) {
                await sincronizar();
            }
        };

        iniciarApp();

        const subscription = Network.addNetworkStateListener(async (state) => {
            if (state.isConnected) {
                await sincronizar();
            }
        });

        // Sincroniza a cada 5 segundos quando houver conexão
        const interval = setInterval(async () => {
            const state = await Network.getNetworkStateAsync();
            if (state.isConnected) {
                await sincronizar();
            }
        }, 5000);

        return () => {
            subscription.remove();
            clearInterval(interval);
        };
    }, []);

    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen
                    name={ROUTES.LISTA}
                    component={ListaRelatorios}
                    options={{ title: "Relatórios" }}
                />

                <Stack.Screen
                    name={ROUTES.SELECIONAR_TIPO}
                    component={SelecionarTipoInspecao}
                    options={{ title: "Tipo de Inspeção" }}
                />

                <Stack.Screen
                    name={ROUTES.FORMULARIO_MECANICO}
                    component={FormularioRelatorioMecanicoCivil}
                    options={{
                        title: "Inspeção Mecânica/Civil",
                        headerBackVisible: false
                    }}
                />

                <Stack.Screen
                    name={ROUTES.FORMULARIO_ELETRICO}
                    component={FormularioRelatorioEletrico}
                    options={{
                        title: "Inspeção Elétrica",
                        headerBackVisible: false
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
