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
  Modal,
  Dimensions
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { APP_DATABASE } from './appData';
import { styles } from './styles';
import { getHistory, saveToHistory, clearHistory } from './historyService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Компонент анимации сканирования
const ScanAnimation = ({ isActive, isDarkMode }) => {
  const scanAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    let animation;
    
    if (isActive) {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scanAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
      
      animation.start();
    } else {
      scanAnim.setValue(0);
    }
    
    return () => {
      if (animation) {
        animation.stop();
      }
    };
  }, [isActive]);

  if (!isActive) return null;

  const translateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, screenHeight * 0.32 * 0.9],
  });

  return (
    <View style={localStyles.animationContainer}>
      <Animated.View
        style={[
          localStyles.scanLine,
          {
            transform: [{ translateY }],
            backgroundColor: isDarkMode ? '#007AFF' : '#0056CC',
          },
        ]}
      />
      
      <Animated.View
        style={[
          localStyles.glowEffect,
          {
            transform: [{ translateY }],
            backgroundColor: isDarkMode ? '#4CD964' : '#34C759',
            opacity: scanAnim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.1, 0.8, 0.1],
            }),
          },
        ]}
      />
      
      <Animated.View
        style={[
          localStyles.secondaryLine,
          {
            transform: [{ translateY: Animated.add(translateY, 15) }],
            backgroundColor: isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.4)',
            opacity: scanAnim.interpolate({
              inputRange: [0, 0.3, 0.7, 1],
              outputRange: [0, 0.5, 0.5, 0],
            }),
          },
        ]}
      />
    </View>
  );
};

const localStyles = StyleSheet.create({
  animationContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: screenHeight * 0.32 * 0.9,
  },
  scanLine: {
    position: 'absolute',
    left: 10,
    right: 10,
    height: 4,
    borderRadius: 2,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 15,
    zIndex: 10,
  },
  glowEffect: {
    position: 'absolute',
    left: 5,
    right: 5,
    height: 10,
    borderRadius: 5,
    zIndex: 9,
  },
  secondaryLine: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: 2,
    borderRadius: 1,
    zIndex: 8,
  },
  // Новые стили для статуса внутри камеры
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
  scanHintAbsolute: {
  position: 'absolute',
  bottom: -55, // Отступ от низа камеры
  left: 0,
  right: 0,
  alignItems: 'center',
  zIndex: 15,
},
});

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
  const isLongPress = useRef(false);
  const longPressTimeout = useRef(null);

  const systemColorScheme = useColorScheme();
  const isDarkMode = useDarkTheme || systemColorScheme === 'dark';

  useEffect(() => {
    loadHistory();
    loadThemePreference();
    return () => {
      if (longPressTimeout.current) {
        clearTimeout(longPressTimeout.current);
      }
      if (scanInterval.current) {
        clearInterval(scanInterval.current);
      }
    };
  }, []);

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
      isLongPress.current = false;
      
      let appsFound = [];
      let counter = 0;
      
      scanInterval.current = setInterval(() => {
        if (counter < 6) {
          const newApp = APP_DATABASE[Math.floor(Math.random() * APP_DATABASE.length)];
          if (!appsFound.find(app => app.id === newApp.id)) {
            appsFound.push(newApp);
            setDetectedApps([...appsFound]);
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
      
      if (detectedApps.length > 0) {
        saveScanResult();
      }
    }
  };

  const takePhotoAndAnalyze = async () => {
    if (!cameraRef.current || !isCameraReady) {
      console.log('Камера не готова');
      return;
    }

    try {
      setIsScanning(true);
      isLongPress.current = true;
      
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: false,
        skipProcessing: true,
      });
      
      setTimeout(() => {
        const apps = simulateAppRecognition();
        setDetectedApps(apps);
        setIsScanning(false);
        isLongPress.current = false;
        setResultsVisible(true);
        saveScanResult();
      }, 1500);
      
    } catch (error) {
      console.log('Ошибка при съёмке:', error);
      setIsScanning(false);
      isLongPress.current = false;
    }
  };

  const handlePressIn = () => {
    if (!isScanning && isCameraReady) {
      longPressTimeout.current = setTimeout(() => {
        takePhotoAndAnalyze();
      }, 800);
    }
  };

  const handlePressOut = () => {
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
      longPressTimeout.current = null;
      
      if (!isScanning && !isLongPress.current && isCameraReady) {
        startScanning();
      }
    }
  };

  const handlePress = () => {
    if (isScanning) {
      stopScanning();
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
        
        setTimeout(() => {
          const apps = simulateAppRecognition();
          setDetectedApps(apps);
          setIsScanning(false);
          saveScanResult();
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
                    {isLongPress.current ? 'Анализ фото...' : 'Сканирование...'}
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
                
                <ScanAnimation isActive={isScanning} isDarkMode={isDarkMode} />
              </View>
              
              <View style={localStyles.scanHintAbsolute}>
                <Text style={[styles.scanHint, { 
                  color: 'white',
                  backgroundColor: isDarkMode ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.6)'
                }]}>
                  Наведите на экран другого телефона
                </Text>
              </View>
            </View>
          </View>

          {/* УДАЛЕН блок scanStatus здесь - теперь он внутри cameraOverlay */}

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
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={handlePress}
                activeOpacity={0.7}
                disabled={!isCameraReady}
              >
                <View style={styles.scanButtonContent}>
                  <Text style={styles.scanButtonText}>
                    {isScanning ? 'ОСТАНОВИТЬ СКАНИРОВАНИЕ' : 'НАЧАТЬ СКАНИРОВАНИЕ'}
                  </Text>
                  <Text style={[styles.scanButtonHint, { 
                    color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.8)' 
                  }]}>
                    (удерживайте для фото)
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
                    История сканирований ({scanHistory.length})
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Модальное окно результатов */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={resultsVisible}
        onRequestClose={() => {
          setResultsVisible(false);
          isLongPress.current = false;
        }}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDarkMode ? 'white' : '#1d1d1f' }]}>
                Результаты сканирования
              </Text>
              <TouchableOpacity onPress={() => {
                setResultsVisible(false);
                isLongPress.current = false;
              }}>
                <Ionicons name="close" size={24} color={isDarkMode ? "#666" : "#8e8e93"} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <View style={[styles.resultsSummary, { backgroundColor: isDarkMode ? '#2a2a2a' : '#f2f2f7' }]}>
                <View style={styles.summaryText}>
                  <Text style={[styles.summaryLabel, { color: isDarkMode ? '#aaa' : '#666' }]}>
                    Найдено приложений:
                  </Text>
                  <Text style={[styles.summaryValue, { color: isDarkMode ? '#4CD964' : '#34C759' }]}>
                    {detectedApps.length}
                  </Text>
                </View>
              </View>
              
              <Text style={[styles.sectionTitle, { color: isDarkMode ? 'white' : '#1d1d1f' }]}>
                Обнаруженные приложения:
              </Text>
              <View style={styles.appsList}>
                {detectedApps.map((app, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={[styles.appListItem, { backgroundColor: isDarkMode ? '#2a2a2a' : '#f2f2f7' }]}
                    onPress={() => openInStore(app)}
                  >
                    <View style={[
                      styles.appIconContainer, 
                      { backgroundColor: isDarkMode ? '#333' : '#e5e5e7' }
                    ]}>
                      <FontAwesome5 name={app.icon} size={24} color={isDarkMode ? "#007AFF" : "#0056CC"} />
                    </View>
                    <View style={styles.appInfo}>
                      <Text style={[styles.appName, { color: isDarkMode ? 'white' : '#1d1d1f' }]}>
                        {app.name}
                      </Text>
                      <Text style={[styles.appType, { color: isDarkMode ? '#aaa' : '#666' }]}>
                        {app.type}
                      </Text>
                    </View>
                    <TouchableOpacity 
                      style={[styles.downloadButton, { backgroundColor: isDarkMode ? '#007AFF' : '#0056CC' }]}
                      onPress={() => openInStore(app)}
                    >
                      <Text style={styles.downloadButtonText}>Скачать</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: isDarkMode ? '#007AFF' : '#0056CC' }]}
                onPress={() => {
                  setResultsVisible(false);
                  isLongPress.current = false;
                }}
              >
                <Text style={styles.closeButtonText}>Закрыть</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Модальное окно истории */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={historyVisible}
        onRequestClose={() => setHistoryVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.historyModalContent, { backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff' }]}>
            <Text style={[styles.historyTitle, { color: isDarkMode ? 'white' : '#1d1d1f' }]}>
              История сканирований
            </Text>
            
            {scanHistory.length === 0 ? (
              <View style={styles.historyEmpty}>
                <Ionicons name="time-outline" size={60} color={isDarkMode ? "#666" : "#8e8e93"} />
                <Text style={[styles.historyEmptyText, { color: isDarkMode ? '#aaa' : '#666' }]}>
                  История пуста
                </Text>
              </View>
            ) : (
              <ScrollView style={styles.modalScroll}>
                {scanHistory.map((scan) => (
                  <View key={scan.id} style={[styles.historyItem, { backgroundColor: isDarkMode ? '#2a2a2a' : '#f2f2f7' }]}>
                    <View style={styles.historyItemHeader}>
                      <Text style={[styles.historyDeviceName, { color: isDarkMode ? 'white' : '#1d1d1f' }]}>
                        {scan.deviceName}
                      </Text>
                      <Text style={[styles.historyDate, { color: isDarkMode ? '#aaa' : '#666' }]}>
                        {scan.date}
                      </Text>
                    </View>
                    
                    <Text style={[styles.detectedCount, { color: isDarkMode ? '#aaa' : '#666' }]}>
                      Найдено приложений: {scan.appsCount}
                    </Text>
                    
                    <View style={styles.historyApps}>
                      {scan.apps.slice(0, 5).map((app, index) => (
                        <View key={index} style={[styles.historyAppBadge, { backgroundColor: isDarkMode ? '#333' : '#e5e5e7' }]}>
                          <FontAwesome5 
                            name={app.icon} 
                            size={12} 
                            color={isDarkMode ? "#007AFF" : "#0056CC"} 
                            style={styles.historyAppIcon}
                          />
                          <Text style={[styles.historyAppName, { color: isDarkMode ? 'white' : '#1d1d1f' }]}>
                            {app.name}
                          </Text>
                        </View>
                      ))}
                      {scan.apps.length > 5 && (
                        <View style={[styles.historyAppBadge, { backgroundColor: isDarkMode ? '#333' : '#e5e5e7' }]}>
                          <Text style={[styles.historyAppName, { color: isDarkMode ? 'white' : '#1d1d1f' }]}>
                            +{scan.apps.length - 5}
                          </Text>
                        </View>
                      )}
                    </View>
                    
                    <TouchableOpacity 
                      style={[styles.modalButton, { backgroundColor: isDarkMode ? '#007AFF' : '#0056CC', marginTop: 10 }]}
                      onPress={() => {
                        setDetectedApps([...scan.apps]);
                        setHistoryVisible(false);
                        setResultsVisible(true);
                      }}
                    >
                      <Text style={styles.closeButtonText}>Посмотреть</Text>
                    </TouchableOpacity>
                  </View>
                ))}
                
                <TouchableOpacity 
                  style={[styles.clearHistoryButton, { backgroundColor: isDarkMode ? '#ff3b30' : '#d70015' }]}
                  onPress={handleClearHistory}
                >
                  <Text style={styles.clearHistoryText}>Очистить историю</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
            
            <TouchableOpacity 
              style={[styles.modalButton, { backgroundColor: isDarkMode ? '#007AFF' : '#0056CC', marginTop: 20 }]}
              onPress={() => setHistoryVisible(false)}
            >
              <Text style={styles.closeButtonText}>Закрыть</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Модальное окно настроек */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={settingsVisible}
        onRequestClose={() => setSettingsVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDarkMode ? 'white' : '#1d1d1f' }]}>
                Настройки
              </Text>
              <TouchableOpacity onPress={() => setSettingsVisible(false)}>
                <Ionicons name="close" size={24} color={isDarkMode ? "#666" : "#8e8e93"} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScroll}>
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Ionicons name="moon" size={24} color={isDarkMode ? "#007AFF" : "#0056CC"} style={styles.settingIcon} />
                  <View>
                    <Text style={[styles.settingTitle, { color: isDarkMode ? 'white' : '#1d1d1f' }]}>
                      Тёмная тема
                    </Text>
                    <Text style={[styles.settingDescription, { color: isDarkMode ? '#aaa' : '#666' }]}>
                      Включить тёмный режим интерфейса
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.toggle, useDarkTheme && styles.toggleActive]}
                  onPress={toggleTheme}
                >
                  <View style={[styles.toggleCircle, useDarkTheme && styles.toggleCircleActive]} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Ionicons name="save" size={24} color={isDarkMode ? "#007AFF" : "#0056CC"} style={styles.settingIcon} />
                  <View>
                    <Text style={[styles.settingTitle, { color: isDarkMode ? 'white' : '#1d1d1f' }]}>
                      Автосохранение
                    </Text>
                    <Text style={[styles.settingDescription, { color: isDarkMode ? '#aaa' : '#666' }]}>
                      Автоматически сохранять в историю
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.toggle, autoSave && styles.toggleActive]}
                  onPress={() => setAutoSave(!autoSave)}
                >
                  <View style={[styles.toggleCircle, autoSave && styles.toggleCircleActive]} />
                </TouchableOpacity>
              </View>
            </ScrollView>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: isDarkMode ? '#007AFF' : '#0056CC' }]}
                onPress={() => setSettingsVisible(false)}
              >
                <Text style={styles.closeButtonText}>Закрыть</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}