import { View, Text, ActivityIndicator } from "react-native";

export default function LoadingScreen() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#ffffff",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text
        style={{
          fontSize: 22,
          fontWeight: "bold",
          marginBottom: 20,
          color: "#1b5e20" // verde estilo Sylvamo
        }}
      >
        Inspeção Técnica
      </Text>

      <ActivityIndicator size="large" color="#1b5e20" />
    </View>
  );
}