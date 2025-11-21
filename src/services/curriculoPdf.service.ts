import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import { Alert } from "react-native";
import { CurriculoData } from "../types/curriculo.types";
import { buildCurriculoHTML } from "../templates/curriculoPdf.template";

function normalizeName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export async function gerarCurriculoPDF(data: CurriculoData) {
  try {
    const html = buildCurriculoHTML(data);
    const { uri } = await Print.printToFileAsync({ html });

    const rawName = data.name || "Usuario_RISE";
    const safeName = normalizeName(rawName);
    const fileName = `Curriculo_${safeName || "RISE"}.pdf`;

    const baseDir =
      FileSystem.cacheDirectory || FileSystem.documentDirectory || "";

    const finalUri = baseDir + fileName;

    if (baseDir) {
      await FileSystem.moveAsync({
        from: uri,
        to: finalUri,
      });
    }

    const shareUri = baseDir ? finalUri : uri;

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(shareUri, {
        UTI: "com.adobe.pdf",
        mimeType: "application/pdf",
      });
    } else {
      Alert.alert("PDF gerado", shareUri);
    }
  } catch {
    Alert.alert("Erro", "Não foi possível gerar o PDF.");
  }
}
