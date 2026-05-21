import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Network from "expo-network";
import { useEffect, useState } from "react";
import { criarTabelas } from "./database/database";
import FormularioRelatorio from "./screens/FormularioRelatorio";
import ListaRelatorios from "./screens/ListaRelatorios";
import { sincronizar, temInternet } from "./services/syncService";
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
        <Stack.Screen name="Lista" component={ListaRelatorios} options={{ title: "Relatórios" }} />

        <Stack.Screen
          name="Formulario"
          component={FormularioRelatorio}
          options={{
            title: "Inspeção",
            headerBackVisible: false
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
