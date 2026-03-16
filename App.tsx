import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ListaRelatorios from "./screens/ListaRelatorios";
import FormularioRelatorio from "./screens/FormularioRelatorio";

const Stack = createNativeStackNavigator();

export default function App(){

return(

<NavigationContainer>

<Stack.Navigator>

<Stack.Screen
name="Lista"
component={ListaRelatorios}
options={{ title:"Relatórios" }}
/>

<Stack.Screen
name="Formulario"
component={FormularioRelatorio}
options={{ title:"Inspeção" }}
/>

</Stack.Navigator>

</NavigationContainer>

)

}