import { StyleSheet } from "react-native";
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    padding: 5,
  },

  label: {
  fontSize: 14,
  color: "#888",        
  marginBottom: -6,
},
  header: {
    alignItems: "center",
    marginBottom: -8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold"
  },
  subtitle: {
    fontSize: 45,
    color: "#651e91ff",
    fontWeight: "bold"
  },
  sectionHeader: {
    backgroundColor: "#651e91ff",
    padding: 8,
    marginTop: 16,
  },
  sectionText: {
    color: "#ffffffff",
    fontWeight: "bold",
    textAlign: "center"
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 10,
    marginTop: 10,
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 10,
    marginTop: 10,
    height: 100,
    textAlignVertical: "top",
  },
  signature: {
    height: 180,
    borderWidth: 1,
    borderColor: "#333",
    marginTop: 20,
    backgroundColor: "#fff",
  },
  signatureLabel: {
    textAlign: "center",
    marginTop: 4,
  },
  fixedBox: {
    borderWidth: 1,
    borderColor: "#000",
    padding: 10,
    marginTop: 10,
    backgroundColor: "#f9f9f9",
  },
  fixedText: {
    fontSize: 17,
    color: "#000",
    lineHeight: 23,
  },
  button: {
    backgroundColor: "#97f99b",
    padding: 14,
    borderRadius: 6,
    marginTop: 20,
    alignItems: "center",
  },
  buttonText: {
    color: "#000000",
    fontWeight: "bold",
  },
  inputError: {
    borderColor: "red",
    borderWidth: 2,
  },
  escopoBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginTop: 12,
  },

  escopoTitle: {
    fontWeight: "bold",
    marginBottom: 8,
  },

  statusRow: {
    flexDirection: "row",
    gap: 10,
  },

  statusButton: {
    borderWidth: 1,
    borderColor: "#999",
    padding: 8,
    borderRadius: 4,
  },

  statusActive: {
    backgroundColor: "#d0f0d0",
    borderColor: "#4CAF50",
  },
  photoButton: {
    marginTop: 8,
    marginBottom: 8,
    padding: 10,
    backgroundColor: "#b9b9b9",
    borderRadius: 4,
    alignItems: "center",
  },

  photoButtonText: {
    fontWeight: "bold",
  },

  photoPreview: {
    width: "100%",
    height: 180,
    borderRadius: 6,
    marginBottom: 8,
  },
  removeEscopoButton: {
    marginTop: 12,
    padding: 10,
    borderRadius: 4,
    backgroundColor: "#f24949",
    alignItems: "center",
  },

  removeEscopoText: {
    color: "#721c24",
    fontWeight: "bold",
  },

  logo: {
    width: 300,
    height: 350,
    resizeMode: "contain",
    marginBottom: 20,
  },

  statusConforme: {
    backgroundColor: "#97f99b", // verde
  },

  statusNaoConforme: {
    backgroundColor: "#f24949", // vermelho
  },
});
