import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import StorageService from '../services/storageService';
import { Alert } from "react-native";

// Enhanced data chunking for large datasets
const CHUNK_SIZE = 50; // Process data in chunks to prevent UI blocking

export const handleExportData = async () => {
  try {
    // Show loading indicator for large exports
    const jsonData = await StorageService.exportData();
    const fileUri = FileSystem.cacheDirectory + `OusaroTeacher-backup-${Date.now()}.json`;
    
    // Use async write for better performance
    await FileSystem.writeAsStringAsync(fileUri, jsonData, { 
      encoding: FileSystem.EncodingType.UTF8 
    });
    
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'Export OusaroTeacher Data'
      });
    } else {
      Alert.alert("Export Success", "The backup file is saved: " + fileUri);
    }
  } catch (error) {
    console.error("Export error:", error);
    Alert.alert("Export Failed", "There was an error exporting your data. Please try again.");
  }
};

export const handleImportData = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({ 
      type: "application/json",
      copyToCacheDirectory: true // Better performance for large files
    });
    
    if (!result.assets || result.assets.length === 0) return;

    const fileUri = result.assets[0].uri;
    
    // Check file size before import to prevent memory issues
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (fileInfo.exists && fileInfo.size && fileInfo.size > 10 * 1024 * 1024) { // 10MB limit
      Alert.alert("File Too Large", "The selected file is too large. Please choose a smaller backup file.");
      return;
    }
    
    const importString = await FileSystem.readAsStringAsync(fileUri, { 
      encoding: FileSystem.EncodingType.UTF8 
    });
    
    // Validate JSON before import
    try {
      JSON.parse(importString);
    } catch (parseError) {
      Alert.alert("Invalid File", "The selected file is not a valid JSON backup file.");
      return;
    }
    
    await StorageService.importData(importString);
    Alert.alert("Import Success", "Your data has been restored!");
  } catch (error) {
    console.error("Import error:", error);
    Alert.alert("Import Failed", "Could not import data. Please check file format and try again.");
  }
};

// New utility for memory-efficient data processing
export const processLargeDataset = async <T>(
  data: T[], 
  processFn: (chunk: T[]) => Promise<void>,
  chunkSize: number = CHUNK_SIZE
): Promise<void> => {
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    await processFn(chunk);
    
    // Allow UI to breathe between chunks
    await new Promise(resolve => setTimeout(resolve, 0));
  }
};

// Utility to clean up storage and optimize performance
export const optimizeStorage = async (): Promise<void> => {
  try {
    // Clear expired caches
    StorageService.clearExpiredCache();
    
    // Force write any pending data
    await StorageService.forceWrite();
    
    // Clean up temporary files
    const cacheDir = FileSystem.cacheDirectory;
    if (cacheDir) {
      const files = await FileSystem.readDirectoryAsync(cacheDir);
      const oldFiles = files.filter(file => file.includes('OusaroTeacher-backup-'));
      
      // Keep only the 3 most recent backup files
      if (oldFiles.length > 3) {
        const filesToDelete = oldFiles.slice(0, oldFiles.length - 3);
        for (const file of filesToDelete) {
          try {
            await FileSystem.deleteAsync(cacheDir + file);
          } catch (deleteError) {
            console.warn("Could not delete old backup file:", file);
          }
        }
      }
    }
  } catch (error) {
    console.error("Storage optimization error:", error);
  }
};  