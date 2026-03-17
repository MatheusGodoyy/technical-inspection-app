import { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ListaRelatorios from "./screens/ListaRelatorios";
import FormularioRelatorio from "./screens/FormularioRelatorio";
import { sincronizar, temInternet } from "./services/syncService";
import * as Network from "expo-network";
import { criarTabelas } from "./database/database.js";
import LoadingScreen from "./screens/LoadingScreen";

const Stack = createNativeStackNavigator();

export default function App() {

    const [loading, setLoading] = useState(true);
    
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
                console.log("Internet voltou, sincronizando...");
                await sincronizar();
            }

        });

        return () => {
            subscription.remove();
        };

    }, []);

    return (

        <NavigationContainer>

            <Stack.Navigator>

                <Stack.Screen
                    name="Lista"
                    component={ListaRelatorios}
                    options={{ title: "Relatórios" }}
                />

                <Stack.Screen
                    name="Formulario"
                    component={FormularioRelatorio}
                    options={{ title: "Inspeção" }}
                />

            </Stack.Navigator>

        </NavigationContainer>

    )
}