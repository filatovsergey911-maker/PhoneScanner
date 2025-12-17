import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  useColorScheme,
  Linking,
  Animated,
  StyleSheet,
  Dimensions,
  Vibration,
  Platform
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { APP_DATABASE } from './appData';
import { styles } from './styles';
import { getHistory, saveToHistory, clearHistory } from './historyService';
import { ResultsModal } from './components/ResultsModal';
import { HistoryModal } from './components/HistoryModal';
import { SettingsModal } from './components/SettingsModal';
import ScanAnimation from './ScanAnimation'; // Импорт отдельного компонента

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Основной компонент приложения
export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const [detectedApps, setDetectedApps] = useState([]);
  const [resultsVisible, setResultsVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [autoSave, setAutoSave] = useState(false);
  const [useDarkTheme, setUseDarkTheme] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);
  const [isCameraReady, setIsCameraReady] = useState(false);
  
  const cameraRef = useRef(null);
  const scanInterval = useRef(null);

  const systemColorScheme = useColorScheme();
  const isDarkMode = useDarkTheme || systemColorScheme === 'dark';

  useEffect(() => {
    loadHistory();
    loadThemePreference();
    
    return () => {
      if (scanInterval.current) {
        clearInterval(scanInterval.current);
      }
    };
  }, []);

  // Функция вибрации при обнаружении приложения
  const vibrateOnDetection = () => {
    if (Platform.OS === 'ios') {
      // Для iOS
      Vibration.vibrate(100);
    } else {
      // Для Android - короткая вибрация
      Vibration.vibrate(50);
    }
  };

  // Функция вибрации при старте/стопе сканирования
  const vibrateOnScanToggle = () => {
    if (Platform.OS === 'ios') {
      Vibration.vibrate(200);
    } else {
      Vibration.vibrate(100);
    }
  };

  const loadHistory = async () => {
    const history = await getHistory();
    setScanHistory(history);
  };

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('@theme_preference');
      if (savedTheme !== null) {
        setUseDarkTheme(savedTheme === 'dark');
      }
    } catch (error) {
      console.log('Ошибка загрузки темы:', error);
    }
  };

  const saveThemePreference = async (isDark) => {
    try {
      await AsyncStorage.setItem('@theme_preference', isDark ? 'dark' : 'light');
    } catch (error) {
      console.log('Ошибка сохранения темы:', error);
    }
  };

  const simulateAppRecognition = () => {
    const count = Math.floor(Math.random() * 5) + 4;
    const shuffled = [...APP_DATABASE].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const startScanning = () => {
    if (!isScanning && isCameraReady) {
      setIsScanning(true);
      setDetectedApps([]);
      
      // Вибрация при старте сканирования
      vibrateOnScanToggle();
      
      let appsFound = [];
      let counter = 0;
      
      scanInterval.current = setInterval(() => {
        if (counter < 6) {
          const newApp = APP_DATABASE[Math.floor(Math.random() * APP_DATABASE.length)];
          if (!appsFound.find(app => app.id === newApp.id)) {
            appsFound.push(newApp);
            setDetectedApps([...appsFound]);
            
            // Вибрация при обнаружении каждого приложения
            vibrateOnDetection();
            
            counter++;
          }
        } else {
          stopScanning();
        }
      }, 1000);
    }
  };

  const stopScanning = () => {
    if (isScanning) {
      setIsScanning(false);
      if (scanInterval.current) {
        clearInterval(scanInterval.current);
        scanInterval.current = null;
      }
      
      // Вибрация при остановке сканирования
      vibrateOnScanToggle();
      
      if (detectedApps.length > 0) {
        saveScanResult();
      }
    }
  };

  const handlePress = () => {
    if (isScanning) {
      stopScanning();
    } else if (isCameraReady) {
      startScanning();
    }
  };

  const pickImageFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.7,
      });

      if (!result.canceled) {
        setIsScanning(true);
        
        // Вибрация при выборе изображения
        vibrateOnScanToggle();
        
        setTimeout(() => {
          const apps = simulateAppRecognition();
          setDetectedApps(apps);
          setIsScanning(false);
          saveScanResult();
          
          // Вибрация при завершении анализа
          vibrateOnScanToggle();
        }, 1500);
      }
    } catch (error) {
      console.log('Ошибка выбора фото:', error);
      setIsScanning(false);
    }
  };

  const saveScanResult = async () => {
    if (detectedApps.length === 0) return;

    const scanResult = {
      id: Date.now().toString(),
      deviceName: `Скан от ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`,
      date: new Date().toLocaleString(),
      appsCount: detectedApps.length,
      apps: [...detectedApps],
    };

    if (autoSave) {
      const updatedHistory = await saveToHistory(scanResult);
      setScanHistory(updatedHistory);
    }
    
    setResultsVisible(true);
  };

  const openInStore = (app) => {
    Linking.openURL(app.storeUrl).catch(err => {
      Alert.alert('Ошибка', 'Не удалось открыть магазин приложений');
    });
  };

  const handleClearHistory = async () => {
    Alert.alert(
      'Очистить историю?',
      'Все сохранённые результаты будут удалены',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Очистить',
          style: 'destructive',
          onPress: async () => {
            const cleared = await clearHistory();
            setScanHistory(cleared);
            
            // ЗАКРЫТЬ ОКНО ИСТОРИИ ПОСЛЕ ОЧИСТКИ
            if (historyVisible) {
              setHistoryVisible(false);
            }
          }
        }
      ]
    );
  };

  const toggleTheme = () => {
    const newTheme = !useDarkTheme;
    setUseDarkTheme(newTheme);
    saveThemePreference(newTheme);
  };

  const handleCameraReady = () => {
    setIsCameraReady(true);
  };

  if (!permission) {
    return (
      <View style={[styles.centered, { backgroundColor: isDarkMode ? '#0a0a0a' : '#f5f5f7' }]}>
        <ActivityIndicator size="large" color={isDarkMode ? "#007AFF" : "#0056CC"} />
        <Text style={[styles.loadingText, { color: isDarkMode ? '#666' : '#888' }]}>Загрузка...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.centered, { backgroundColor: isDarkMode ? '#0a0a0a' : '#f5f5f7' }]}>
        <MaterialIcons name="camera-alt" size={80} color={isDarkMode ? "#007AFF" : "#0056CC"} />
        <Text style={[styles.message, { color: isDarkMode ? 'white' : '#1d1d1f' }]}>Доступ к камере</Text>
        <Text style={[styles.subMessage, { color: isDarkMode ? '#aaa' : '#666' }]}>
          Для сканирования экрана другого телефона нужен доступ к камере
        </Text>
        <TouchableOpacity 
          style={[styles.primaryButton, { backgroundColor: isDarkMode ? "#007AFF" : "#0056CC" }]} 
          onPress={requestPermission}
        >
          <Text style={styles.buttonText}>Разрешить доступ к камере</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#0a0a0a' : '#f5f5f7' }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      
      <View style={[styles.header, { backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff' }]}>
        <View>
          <Text style={[styles.headerTitle, { color: isDarkMode ? 'white' : '#1d1d1f' }]}>
            Phone Scanner
          </Text>
          <Text style={[styles.headerSubtitle, { color: isDarkMode ? '#aaa' : '#666' }]}>
            Сканирование приложений на другом устройстве
          </Text>
        </View>
        
        <TouchableOpacity onPress={() => setSettingsVisible(true)}>
          <Ionicons name="settings-outline" size={24} color={isDarkMode ? "#007AFF" : "#0056CC"} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.cameraSection}>
          <View style={[styles.cameraWrapper, { backgroundColor: isDarkMode ? '#000' : '#1a1a1a' }]}>
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing="back"
              onCameraReady={handleCameraReady}
            />
            
            <View style={styles.cameraOverlay}>
              {/* Статус сканирования ВНУТРИ камеры */}
              {isScanning && (
                <View style={localStyles.scanStatusOverlay}>
                  <ActivityIndicator size="small" color="white" />
                  <Text style={localStyles.scanStatusOverlayText}>
                    Сканирование...
                  </Text>
                  {detectedApps.length > 0 && (
                    <Text style={localStyles.detectedCountOverlay}>
                      Найдено: {detectedApps.length} приложений
                    </Text>
                  )}
                </View>
              )}
              
              <View style={styles.scanFrame}>
                <View style={[
                  styles.corner, 
                  styles.topLeft, 
                  { borderColor: isDarkMode ? '#007AFF' : '#0056CC' }
                ]} />
                <View style={[
                  styles.corner, 
                  styles.topRight, 
                  { borderColor: isDarkMode ? '#007AFF' : '#0056CC' }
                ]} />
                <View style={[
                  styles.corner, 
                  styles.bottomLeft, 
                  { borderColor: isDarkMode ? '#007AFF' : '#0056CC' }
                ]} />
                <View style={[
                  styles.corner, 
                  styles.bottomRight, 
                  { borderColor: isDarkMode ? '#007AFF' : '#0056CC' }
                ]} />
                
                {/* Анимация сканирования с передачей высоты */}
                <ScanAnimation 
                  isActive={isScanning} 
                  isDarkMode={isDarkMode}
                  frameHeight={screenHeight * 0.44} // ВАЖНО: передаем высоту
                />
              </View>
              
              <Text style={[styles.scanHint, { 
                color: 'white',
                backgroundColor: isDarkMode ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.6)'
              }]}>
                Наведите на экран другого телефона
              </Text>
            </View>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity 
              style={[styles.controlButton, { backgroundColor: isDarkMode ? '#333' : '#e5e5e7' }]}
              onPress={pickImageFromGallery}
            >
              <Ionicons name="images" size={24} color={isDarkMode ? "white" : "#1d1d1f"} />
            </TouchableOpacity>
            
            <View style={styles.scanButtonContainer}>
              <TouchableOpacity
                style={[
                  styles.scanButton, 
                  { backgroundColor: isDarkMode ? '#007AFF' : '#0056CC' },
                  isScanning && { backgroundColor: isDarkMode ? '#ff3b30' : '#d70015' },
                  !isCameraReady && styles.disabledButton
                ]}
                onPress={handlePress}
                activeOpacity={0.7}
                disabled={!isCameraReady}
              >
                <View style={styles.scanButtonContent}>
                  <Text style={styles.scanButtonText}>
                    {isScanning ? 'ОСТАНОВИТЬ' : 'НАЧАТЬ'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            
            <View style={[styles.controlButton, { opacity: 0 }]} />
          </View>

          {/* Кнопка истории показывается ТОЛЬКО если есть записи */}
          {scanHistory.length > 0 && (
            <View style={styles.historyButtonContainer}>
              <TouchableOpacity 
                style={[styles.historyButton, { backgroundColor: isDarkMode ? '#333' : '#e5e5e7' }]}
                onPress={() => setHistoryVisible(true)}
              >
                <View style={styles.historyButtonContent}>
                  <Ionicons name="time-outline" size={20} color={isDarkMode ? "#007AFF" : "#0056CC"} />
                  <Text style={[styles.historyButtonText, { 
                    color: isDarkMode ? "#007AFF" : "#0056CC" 
                  }]}>
                    История ({scanHistory.length})
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Модальные окна через компоненты с настоящими Modal */}
      <ResultsModal
        visible={resultsVisible}
        onClose={() => {
          setResultsVisible(false);
        }}
        detectedApps={detectedApps}
        isDarkMode={isDarkMode}
        openInStore={openInStore}
      />

      <HistoryModal
        visible={historyVisible}
        onClose={() => setHistoryVisible(false)}
        scanHistory={scanHistory}
        isDarkMode={isDarkMode}
        onClearHistory={handleClearHistory}
        onViewScanResult={(apps) => {
          setDetectedApps([...apps]);
          setHistoryVisible(false);
          setResultsVisible(true);
        }}
      />

      <SettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        isDarkMode={isDarkMode}
        useDarkTheme={useDarkTheme}
        autoSave={autoSave}
        onToggleTheme={toggleTheme}
        onToggleAutoSave={() => setAutoSave(!autoSave)}
      />
    </View>
  );
}

// Локальные стили для статуса сканирования
const localStyles = StyleSheet.create({
  scanStatusOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    zIndex: 20,
  },
  scanStatusOverlayText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'System',
    fontWeight: '500',
    marginTop: 5,
  },
  detectedCountOverlay: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontFamily: 'System',
    marginTop: 2,
  },
});