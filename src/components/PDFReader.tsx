// components/PDFReader.tsx
import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Modal,
  TextInput,
  ActivityIndicator,
  Platform,
} from "react-native";
import { WebView } from "react-native-webview";
import * as FileSystem from "expo-file-system";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";

interface PDFReaderProps {
  source: { uri: string } | { cache?: boolean };
  onAddWord: (word: string) => void;
  onZoomChange?: (zoom: number) => void;
  navigation: any;
}

export const PDFReader: React.FC<PDFReaderProps> = ({
  source,
  onAddWord,
  onZoomChange,
  navigation,
}) => {
  const { theme, isDark } = useTheme();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedText, setSelectedText] = useState("");
  const [wordModalVisible, setWordModalVisible] = useState(false);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [pdfReady, setPdfReady] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(1.0);

  // Load PDF and convert to base64
  useEffect(() => {
    const loadPDF = async () => {
      try {
        setIsLoading(true);
        setError(null);

        let pdfUri = "";
        if (typeof source === "object" && "uri" in source) {
          pdfUri = source.uri;
        }

        if (!pdfUri) {
          throw new Error("Invalid PDF source");
        }

        // Read the PDF file and convert to base64
        const base64 = await FileSystem.readAsStringAsync(pdfUri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        setPdfBase64(base64);
        setIsLoading(false);
      } catch (err) {
        console.error("Error loading PDF:", err);
        setError("Failed to load PDF. Please try again.");
        setIsLoading(false);
      }
    };

    loadPDF();
  }, [source]);

  // Hide controls after 3 seconds
  useEffect(() => {
    if (!showControls) return;

    const timer = setTimeout(() => {
      setShowControls(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [showControls]);

  const handlePressIn = useCallback(() => {
    setShowControls(true);
  }, []);

  const handleWebViewMessage = useCallback(
    (event: any) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        switch (data.type) {
          case "textSelected":
            if (data.text && data.text.trim()) {
              setSelectedText(data.text.trim());
              setWordModalVisible(true);
            }
            break;
          case "pdfLoaded":
            setTotalPages(data.totalPages);
            setPdfReady(true);
            break;
          case "zoomChanged":
            setCurrentZoom(data.zoom);
            onZoomChange?.(data.zoom);
            break;
          case "error":
            setError(data.message);
            break;
        }
      } catch (err) {
        console.error("Error parsing WebView message:", err);
      }
    },
    [onZoomChange],
  );

  const handleSearch = useCallback(() => {
    if (!searchTerm.trim()) {
      Alert.alert("Error", "Please enter a search term");
      return;
    }

    // Send search command to WebView
    if (webViewRef.current) {
      webViewRef.current.postMessage(
        JSON.stringify({
          type: "search",
          term: searchTerm,
        }),
      );
    }

    setSearchVisible(false);
  }, [searchTerm]);

  const handleAddWord = useCallback(() => {
    if (selectedText) {
      onAddWord(selectedText);
      setWordModalVisible(false);
      setSelectedText("");
    }
  }, [selectedText, onAddWord]);

  const webViewRef = React.useRef<WebView>(null);

  const sendZoomCommand = useCallback(
    (command: string) => {
      if (webViewRef.current && pdfReady) {
        webViewRef.current.postMessage(
          JSON.stringify({
            type: "zoomCommand",
            command,
          }),
        );
      }
    },
    [pdfReady],
  );

  // HTML template for PDF viewer
  const safeBase64 = (pdfBase64 || "").replace(/\n/g, "");

  const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #f5f5f5;
      overflow-x: auto;
      overflow-y: auto;
      height: 100vh;
      touch-action: manipulation;
    }
    
    #loading {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 18px;
      color: #666;
      z-index: 1000;
    }
    
    #error {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 18px;
      color: #d32f2f;
      text-align: center;
      display: none;
      z-index: 1000;
    }
    
    #pdfContainer {
      display: none;
      padding: 20px;
      min-height: 100vh;
      overflow: auto;
    }
    
    .page-container {
      margin: 0 auto 20px auto;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      background: white;
      border-radius: 4px;
      overflow: hidden;
      position: relative;
    }
    
    .page-canvas {
      display: block;
      width: 100%;
      height: auto;
    }
    
    .text-layer {
      position: absolute;
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;
      overflow: hidden;
      opacity: 0.2;
      line-height: 1;
    }
    
    .text-layer > span {
      color: transparent;
      position: absolute;
      white-space: pre;
      cursor: text;
      transform-origin: 0% 0%;
    }
    
    .text-layer .highlight {
      background-color: rgba(180, 0, 170, 0.3);
    }
    
    .selected-text {
      background-color: rgba(0, 100, 255, 0.7) !important;
      color: #fff !important;
    }
  </style>
</head>
<body>
  <div id="loading">Loading PDF...</div>
  <div id="error">Failed to load PDF</div>
  <div id="pdfContainer"></div>
  
  <script>
    let pdfDoc = null;
    let scale = 1.0;
    let container = document.getElementById('pdfContainer');
    let isRendering = false;
    let pageElements = [];

    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    async function loadPDF() {
      try {
        const loadingTask = pdfjsLib.getDocument({
          data: atob('${safeBase64}')
        });

        pdfDoc = await loadingTask.promise;

        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'pdfLoaded',
          totalPages: pdfDoc.numPages
        }));

        document.getElementById('loading').style.display = 'none';
        document.getElementById('pdfContainer').style.display = 'block';
        
        await renderAllPages();
      } catch (error) {
        console.error('Error loading PDF:', error);
        document.getElementById('loading').style.display = 'none';
        document.getElementById('error').style.display = 'block';
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'error',
          message: 'Failed to load PDF'
        }));
      }
    }

    async function renderAllPages() {
      if (isRendering) return;
      isRendering = true;
      
      // Clear existing pages
      container.innerHTML = '';
      pageElements = [];
      
      for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
        await renderPage(pageNum);
      }
      
      isRendering = false;
    }

    async function renderPage(pageNum) {
      try {
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale });
        
        // Create page container
        const pageContainer = document.createElement('div');
        pageContainer.className = 'page-container';
        pageContainer.style.width = viewport.width + 'px';
        
        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.className = 'page-canvas';
        const context = canvas.getContext('2d');
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        // Render page
        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        
        await page.render(renderContext).promise;
        
        // Create text layer for text selection
        const textLayerDiv = document.createElement('div');
        textLayerDiv.className = 'text-layer';
        textLayerDiv.style.height = viewport.height + 'px';
        textLayerDiv.style.width = viewport.width + 'px';
        
        // Render text layer
        const textContent = await page.getTextContent();
        pdfjsLib.renderTextLayer({
          textContent: textContent,
          container: textLayerDiv,
          viewport: viewport,
          textDivs: []
        });
        
        pageContainer.appendChild(canvas);
        pageContainer.appendChild(textLayerDiv);
        container.appendChild(pageContainer);
        
        pageElements.push(pageContainer);
        
      } catch (error) {
        console.error('Error rendering page ' + pageNum + ':', error);
      }
    }

    function updateZoom(newScale) {
      scale = Math.max(0.5, Math.min(3.0, newScale));
      
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'zoomChanged',
        zoom: scale
      }));
      
      renderAllPages();
    }

    // Handle messages from React Native
    function handleNativeMessage(event) {
      let data;
      try {
        data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      } catch (e) {
        return;
      }
      switch (data.type) {
        case 'zoomCommand':
          if (data.command === 'in') {
            updateZoom(scale + 0.2);
          } else if (data.command === 'out') {
            updateZoom(scale - 0.2);
          } else if (data.command === 'reset') {
            updateZoom(1.0);
          }
          break;
        case 'search':
          performSearch(data.term);
          break;
      }
    }
    window.addEventListener('message', handleNativeMessage);
    window.addEventListener('message', function(event) {
      // For iOS compatibility
      if (window.ReactNativeWebView && event.data) {
        handleNativeMessage(event);
      }
    });

    function performSearch(searchTerm) {
      // Clear previous highlights
      document.querySelectorAll('.highlight').forEach(el => {
        el.classList.remove('highlight');
      });
      
      if (!searchTerm) return;
      
      // Simple text search in text layers
      document.querySelectorAll('.text-layer span').forEach(span => {
        if (span.textContent.toLowerCase().includes(searchTerm.toLowerCase())) {
          span.classList.add('highlight');
        }
      });
    }

    // Text selection handling
    document.addEventListener('mouseup', handleTextSelection);
    document.addEventListener('touchend', handleTextSelection);

    function handleTextSelection() {
      const selection = window.getSelection();
      if (selection.toString().trim()) {
        const selectedText = selection.toString().trim();
        
        // Clear previous selections
        document.querySelectorAll('.selected-text').forEach(el => {
          el.classList.remove('selected-text');
        });
        
        // Highlight selected text
        const range = selection.getRangeAt(0);
        const span = document.createElement('span');
        span.className = 'selected-text';
        try {
          range.surroundContents(span);
        } catch (e) {
          // Handle complex selections
        }
        
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'textSelected',
          text: selectedText
        }));
        
        selection.removeAllRanges();
      }
    }

    // Load PDF when page is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', loadPDF);
    } else {
      loadPDF();
    }
  </script>
</body>
</html>
`;

  const renderControls = () => {
    if (!showControls) return null;

    return (
      <>
        {/* Top Controls */}
        <View
          style={[
            styles.topControls,
            { backgroundColor: theme.colors.surface + "E6" },
          ]}
        >
          <View style={styles.controlRow}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={[
                styles.controlButton,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
            </TouchableOpacity>

            <View style={styles.pageInfo}>
              <Text style={[styles.pageText, { color: theme.colors.text }]}>
                {Math.round(currentZoom * 100)}% • {totalPages} pages
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => setSearchVisible(true)}
              style={[
                styles.controlButton,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <Ionicons name="search" size={20} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Controls */}
        <View
          style={[
            styles.bottomControls,
            { backgroundColor: theme.colors.surface + "E6" },
          ]}
        >
          <View style={styles.controlRow}>
            <TouchableOpacity
              onPress={() => sendZoomCommand("out")}
              style={[
                styles.controlButton,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <Ionicons name="remove" size={20} color={theme.colors.text} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => sendZoomCommand("reset")}
              style={[
                styles.controlButton,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <Ionicons name="resize" size={20} color={theme.colors.text} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => sendZoomCommand("in")}
              style={[
                styles.controlButton,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <Ionicons name="add" size={20} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      </>
    );
  };

  const renderSearchModal = () => (
    <Modal
      visible={searchVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setSearchVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.searchModal,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
            Search in PDF
          </Text>

          <TextInput
            style={[
              styles.searchInput,
              {
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              },
            ]}
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder="Enter search term..."
            placeholderTextColor={theme.colors.textSecondary}
            autoFocus
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity
              onPress={() => setSearchVisible(false)}
              style={[
                styles.modalButton,
                { backgroundColor: theme.colors.background },
              ]}
            >
              <Text
                style={[styles.modalButtonText, { color: theme.colors.text }]}
              >
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSearch}
              style={[
                styles.modalButton,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              <Text style={[styles.modalButtonText, { color: "#fff" }]}>
                Search
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderWordModal = () => (
    <Modal
      visible={wordModalVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setWordModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[styles.wordModal, { backgroundColor: theme.colors.surface }]}
        >
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
            Add Word
          </Text>

          <Text style={[styles.selectedWord, { color: theme.colors.primary }]}>
            "{selectedText}"
          </Text>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              onPress={() => setWordModalVisible(false)}
              style={[
                styles.modalButton,
                { backgroundColor: theme.colors.background },
              ]}
            >
              <Text
                style={[styles.modalButtonText, { color: theme.colors.text }]}
              >
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleAddWord}
              style={[
                styles.modalButton,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              <Text style={[styles.modalButtonText, { color: "#fff" }]}>
                Add Word
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (error) {
    return (
      <View
        style={[
          styles.errorContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Ionicons name="alert-circle" size={64} color={theme.colors.error} />
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {error}
        </Text>
        <TouchableOpacity
          onPress={() => {
            setError(null);
            setIsLoading(true);
            setPdfBase64(null);
          }}
          style={[
            styles.retryButton,
            { backgroundColor: theme.colors.primary },
          ]}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading || !pdfBase64) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Loading PDF...
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <TouchableOpacity
        style={styles.touchableArea}
        onPress={handlePressIn}
        activeOpacity={1}
      >
        <WebView
          originWhitelist={["*"]}
          ref={webViewRef}
          source={{ html: htmlTemplate }}
          style={styles.webView}
          onMessage={handleWebViewMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={false}
          scrollEnabled={true}
          bounces={true}
          showsHorizontalScrollIndicator={true}
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}
        />
      </TouchableOpacity>

      {renderControls()}
      {renderSearchModal()}
      {renderWordModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  touchableArea: {
    flex: 1,
  },
  webView: {
    flex: 1,
  },
  webViewLoading: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  topControls: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bottomControls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  controlRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  disabledButton: {
    opacity: 0.5,
  },
  pageInfo: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  pageText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  searchModal: {
    width: "80%",
    padding: 20,
    borderRadius: 12,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  wordModal: {
    width: "80%",
    padding: 20,
    borderRadius: 12,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  selectedWord: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
