import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import StorageService from '../services/storageService';
import { Alert } from "react-native";



export const handleExportData = async () => {
  try {
    const jsonData = await StorageService.exportData();
    const fileUri = FileSystem.cacheDirectory + "OusaroTeacher-backup.json";
    await FileSystem.writeAsStringAsync(fileUri, jsonData, { encoding: FileSystem.EncodingType.UTF8 });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri);
    } else {
      Alert.alert("Export Success", "The backup file is saved: " + fileUri);
    }
  } catch (error) {
    Alert.alert("Export Failed", "There was an error exporting your data.");
  }
};

export const handleImportData = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({ type: "application/json" });
    if (!result.assets || result.assets.length === 0) return;

    const fileUri = result.assets[0].uri;
    const importString = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.UTF8 });
    await StorageService.importData(importString);
    Alert.alert("Import Success", "Your data has been restored!");
  } catch (error) {
    Alert.alert("Import Failed", "Could not import data. Please check file format.");
  }
};


export const handleResetProgress = async () => {
  try {
    await StorageService.clearAllData();
    Alert.alert("Progress Reset", "All learning data has been cleared.");
  } catch (error) {
    Alert.alert("Reset Failed", "There was an error resetting your progress.");
  }
};  