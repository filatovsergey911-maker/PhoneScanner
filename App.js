import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Modal,
  ActivityIndicator,
  useColorScheme,
  Linking,
  Animated,
  StyleSheet
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { APP_DATABASE } from './appData';
import { styles as appStyles } from './styles';
import { getHistory, saveToHistory, clearHistory } from './historyService';

// Компонент анимации сканирования - УПРОЩЁННАЯ РАБОЧАЯ ВЕРСИЯ
const ScanAnimation = ({ isActive }) => {
  const scanAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (isActive) {
      // Анимация движения сверху вниз (от 0% до 100% высоты рамки)
      const lineAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scanAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );
      
      // Анимация пульсации свечения
      const glowAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.3,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      
      lineAnimation.start();
      glowAnimation.start();
      
      return () => {
        lineAnimation.stop();
        glowAnimation.stop();
        scanAnim.setValue(0);
        glowAnim.setValue(0);
      };
    }
  }, [isActive]);

  if (!isActive) return null;

  // Позиция линии от верха рамки (0% - вверху, 100% - внизу)
  const translateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'], // Двигаемся по всей высоте рамки
  });

  // Яркость свечения
  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  // Прозрачность хвостов (зависит от позиции)
  const tailOpacity = scanAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.2, 0.8, 0.2],
  });

  return (
    <>
      {/* Контейнер который движется ВМЕСТЕ со всей линией и хвостами */}
      <Animated.View
        style={[
          scanAnimationStyles.scanLineContainer,
          {
            transform: [{ translateY }],
          },
        ]}
      >
        {/* Верхний хвост 1 (самый дальний) */}
        <View style={[
          scanAnimationStyles.tail,
          scanAnimationStyles.tailTop1,
          { opacity: 0.3 }
        ]} />
        
        {/* Верхний хвост 2 */}
        <View style={[
          scanAnimationStyles.tail,
          scanAnimationStyles.tailTop2,
          { opacity: 0.5 }
        ]} />
        
        {/* Верхний хвост 3 (ближайший к линии) */}
        <View style={[
          scanAnimationStyles.tail,
          scanAnimationStyles.tailTop3,
          { opacity: 0.7 }
        ]} />
        
        {/* Основная линия - самая яркая */}
        <Animated.View
          style={[
            scanAnimationStyles.mainLine,
            { opacity: glowOpacity }
          ]}
        />
        
        {/* Нижний хвост 1 (ближайший к линии) */}
        <View style={[
          scanAnimationStyles.tail,
          scanAnimationStyles.tailBottom1,
          { opacity: 0.7 }
        ]} />
        
        {/* Нижний хвост 2 */}
        <View style={[
          scanAnimationStyles.tail,
          scanAnimationStyles.tailBottom2,
          { opacity: 0.5 }
        ]} />
        
        {/* Нижний хвост 3 (самый дальний) */}
        <View style={[
          scanAnimationStyles.tail,
          scanAnimationStyles.tailBottom3,
          { opacity: 0.3 }
        ]} />
      </Animated.View>
      
      {/* Статичные мерцающие точки (не привязаны к линии) */}
      <View style={scanAnimationStyles.pixelsContainer}>
        {[...Array(8)].map((_, index) => (
          <Animated.View
            key={index}
            style={[
              scanAnimationStyles.pixel,
              {
                left: `${15 + index * 10}%`,
                top: `${25 + Math.random() * 50}%`,
                opacity: glowAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.1, 0.7, 0.1],
                }),
              },
            ]}
          />
        ))}
      </View>
    </>
  );
};

const scanAnimationStyles = StyleSheet.create({
  // Контейнер для ВСЕХ элементов линии (движется как единое целое)
  scanLineContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 24, // Общая высота линии со всеми хвостами
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Основная яркая линия
  mainLine: {
    width: '100%',
    height: 3,
    backgroundColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 12,
  },
  
  // Общие стили для хвостов
  tail: {
    position: 'absolute',
    width: '100%',
    backgroundColor: '#4CD964',
  },
  
  // Верхние хвосты (над основной линией)
  tailTop1: {
    height: 2,
    top: -12, // Самый дальний от линии
  },
  tailTop2: {
    height: 3,
    top: -8,
  },
  tailTop3: {
    height: 4,
    top: -4, // Ближайший к линии
  },
  
  // Нижние хвосты (под основной линией)
  tailBottom1: {
    height: 4,
    bottom: -4, // Ближайший к линии
  },
  tailBottom2: {
    height: 3,
    bottom: -8,
  },
  tailBottom3: {
    height: 2,
    bottom: -12, // Самый дальний от линии
  },
  
  // Мерцающие пиксели
  pixelsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  pixel: {
    position: 'absolute',
    width: 3,
    height: 3,
    backgroundColor: '#00D4FF',
    borderRadius: 1.5,
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
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
  const [flash, setFlash] = useState('off');
  const [autoSave, setAutoSave] = useState(true);
  const [scanHistory, setScanHistory] = useState([]);
  const cameraRef = useRef(null);
  const scanInterval = useRef(null);
  const isLongPress = useRef(false);
  
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const history = await getHistory();
    setScanHistory(history);
  };

  const simulateAppRecognition = () => {
    const count = Math.floor(Math.random() * 5) + 4;
    const shuffled = [...APP_DATABASE].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const startScanning = () => {
    if (!isScanning) {
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
    if (cameraRef.current) {
      try {
        setIsScanning(true);
        isLongPress.current = true;
        
        setTimeout(() => {
          const apps = simulateAppRecognition();
          setDetectedApps(apps);
          setIsScanning(false);
          saveScanResult();
        }, 1500);
        
      } catch (error) {
        Alert.alert('Ошибка', 'Не удалось сделать фото');
        setIsScanning(false);
        isLongPress.current = false;
      }
    }
  };

  const handlePress = () => {
    if (isScanning) {
      stopScanning();
    } else {
      startScanning();
    }
  };

  const handleLongPress = () => {
    if (!isScanning) {
      takePhotoAndAnalyze();
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
      Alert.alert('Ошибка', 'Не удалось выбрать изображение');
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
      apps: detectedApps,
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
          }
        }
      ]
    );
  };

  if (!permission) {
    return (
      <View style={appStyles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={appStyles.loadingText}>Загрузка...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={appStyles.centered}>
        <MaterialIcons name="camera-alt" size={80} color="#007AFF" />
        <Text style={appStyles.message}>Доступ к камере</Text>
        <Text style={appStyles.subMessage}>
          Для сканирования экрана другого телефона нужен доступ к камере
        </Text>
        <TouchableOpacity style={appStyles.primaryButton} onPress={requestPermission}>
          <Text style={appStyles.buttonText}>Разрешить доступ к камере</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={appStyles.container}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      
      <View style={appStyles.header}>
        <View>
          <Text style={appStyles.headerTitle}>Phone Scanner</Text>
          <Text style={appStyles.headerSubtitle}>Сканирование приложений на другом устройстве</Text>
        </View>
        
        <TouchableOpacity onPress={() => setSettingsVisible(true)}>
          <Ionicons name="settings-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <View style={appStyles.content}>
        <View style={appStyles.cameraSection}>
          <View style={appStyles.cameraWrapper}>
            <CameraView
              ref={cameraRef}
              style={appStyles.camera}
              facing="back"
              flash={flash}
            />
            
            <View style={appStyles.cameraOverlay}>
              <View style={appStyles.scanFrame}>
                <View style={[appStyles.corner, appStyles.topLeft]} />
                <View style={[appStyles.corner, appStyles.topRight]} />
                <View style={[appStyles.corner, appStyles.bottomLeft]} />
                <View style={[appStyles.corner, appStyles.bottomRight]} />
                
                <ScanAnimation isActive={isScanning} />
              </View>
              <Text style={appStyles.scanHint}>
                Наведите на экран другого телефона
              </Text>
            </View>
          </View>

          {isScanning && (
            <View style={appStyles.scanStatus}>
              <ActivityIndicator size="small" color="#4CD964" />
              <Text style={appStyles.scanStatusText}>
                {isLongPress.current ? 'Обработка фото...' : 'Сканирование...'}
              </Text>
              {detectedApps.length > 0 && (
                <Text style={appStyles.detectedCount}>
                  Найдено: {detectedApps.length} приложений
                </Text>
              )}
            </View>
          )}

          <View style={appStyles.controls}>
            <TouchableOpacity 
              style={appStyles.controlButton}
              onPress={async () => {
                try {
                  const newFlash = flash === 'off' ? 'on' : 'off';
                  setFlash(newFlash);
                } catch (error) {
                  console.log('Ошибка вспышки:', error);
                }
              }}
            >
              <Ionicons 
                name={flash === 'off' ? "flash-off" : "flash"} 
                size={24} 
                color={flash === 'off' ? "white" : "#FFD700"} 
              />
            </TouchableOpacity>
            
            <View style={appStyles.scanButtonContainer}>
              <TouchableOpacity
                style={[appStyles.scanButton, isScanning && appStyles.scanButtonActive]}
                onPress={handlePress}
                onLongPress={handleLongPress}
                delayLongPress={800}
                activeOpacity={0.7}
              >
                <View style={appStyles.scanButtonContent}>
                  {isScanning ? (
                    <Ionicons name="stop" size={30} color="white" />
                  ) : (
                    <Ionicons name="scan" size={30} color="white" />
                  )}
                  <Text style={appStyles.scanButtonText}>
                    {isScanning ? 'ОСТАНОВИТЬ СКАНИРОВАНИЕ' : 'НАЧАТЬ СКАНИРОВАНИЕ'}
                  </Text>
                  <Text style={appStyles.scanButtonHint}>
                    (удерживайте для фото)
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={appStyles.controlButton}
              onPress={pickImageFromGallery}
            >
              <Ionicons name="images" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {scanHistory.length > 0 && (
            <View style={appStyles.historyButtonContainer}>
              <TouchableOpacity 
                style={appStyles.historyButton}
                onPress={() => setHistoryVisible(true)}
              >
                <View style={appStyles.historyButtonContent}>
                  <Ionicons name="time-outline" size={20} color="#007AFF" />
                  <Text style={appStyles.historyButtonText}>
                    История сканирований ({scanHistory.length})
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={resultsVisible}
        onRequestClose={() => {
          setResultsVisible(false);
          setDetectedApps([]);
          isLongPress.current = false;
        }}
      >
        <View style={appStyles.modalContainer}>
          <View style={appStyles.modalContent}>
            <View style={appStyles.modalHeader}>
              <Text style={appStyles.modalTitle}>Результаты сканирования</Text>
              <TouchableOpacity onPress={() => {
                setResultsVisible(false);
                setDetectedApps([]);
                isLongPress.current = false;
              }}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={appStyles.modalScroll} showsVerticalScrollIndicator={false}>
              <View style={appStyles.resultsSummary}>
                <View style={appStyles.summaryText}>
                  <Text style={appStyles.summaryLabel}>Найдено приложений:</Text>
                  <Text style={appStyles.summaryValue}>
                    {detectedApps.length}
                  </Text>
                </View>
              </View>
              
              <Text style={appStyles.sectionTitle}>Обнаруженные приложения:</Text>
              <View style={appStyles.appsList}>
                {detectedApps.map((app, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={appStyles.appListItem}
                    onPress={() => openInStore(app)}
                  >
                    <View style={appStyles.appIconContainer}>
                      <FontAwesome5 name={app.icon} size={24} color="#007AFF" />
                    </View>
                    <View style={appStyles.appInfo}>
                      <Text style={appStyles.appName}>{app.name}</Text>
                      <Text style={appStyles.appType}>{app.type}</Text>
                    </View>
                    <TouchableOpacity 
                      style={appStyles.downloadButton}
                      onPress={() => openInStore(app)}
                    >
                      <Text style={appStyles.downloadButtonText}>Скачать</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            
            <View style={appStyles.modalButtons}>
              <TouchableOpacity 
                style={[appStyles.modalButton, appStyles.closeButton]}
                onPress={() => {
                  setResultsVisible(false);
                  setDetectedApps([]);
                  isLongPress.current = false;
                }}
              >
                <Text style={appStyles.closeButtonText}>Закрыть</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={historyVisible}
        onRequestClose={() => setHistoryVisible(false)}
      >
        <View style={appStyles.modalContainer}>
          <View style={appStyles.historyModalContent}>
            <Text style={appStyles.historyTitle}>История сканирований</Text>
            
            {scanHistory.length === 0 ? (
              <View style={appStyles.historyEmpty}>
                <Ionicons name="time-outline" size={60} color="#666" />
                <Text style={appStyles.historyEmptyText}>История пуста</Text>
              </View>
            ) : (
              <ScrollView style={appStyles.modalScroll}>
                {scanHistory.map((scan) => (
                  <View key={scan.id} style={appStyles.historyItem}>
                    <View style={appStyles.historyItemHeader}>
                      <Text style={appStyles.historyDeviceName}>{scan.deviceName}</Text>
                      <Text style={appStyles.historyDate}>{scan.date}</Text>
                    </View>
                    
                    <Text style={appStyles.detectedCount}>
                      Найдено приложений: {scan.appsCount}
                    </Text>
                    
                    <View style={appStyles.historyApps}>
                      {scan.apps.slice(0, 5).map((app, index) => (
                        <View key={index} style={appStyles.historyAppBadge}>
                          <FontAwesome5 
                            name={app.icon} 
                            size={12} 
                            color="#007AFF" 
                            style={appStyles.historyAppIcon}
                          />
                          <Text style={appStyles.historyAppName}>{app.name}</Text>
                        </View>
                      ))}
                      {scan.apps.length > 5 && (
                        <View style={appStyles.historyAppBadge}>
                          <Text style={appStyles.historyAppName}>+{scan.apps.length - 5}</Text>
                        </View>
                      )}
                    </View>
                    
                    <TouchableOpacity 
                      style={[appStyles.modalButton, appStyles.closeButton, { marginTop: 10 }]}
                      onPress={() => {
                        setDetectedApps(scan.apps);
                        setHistoryVisible(false);
                        setResultsVisible(true);
                      }}
                    >
                      <Text style={appStyles.closeButtonText}>Посмотреть</Text>
                    </TouchableOpacity>
                  </View>
                ))}
                
                <TouchableOpacity 
                  style={appStyles.clearHistoryButton}
                  onPress={handleClearHistory}
                >
                  <Text style={appStyles.clearHistoryText}>Очистить историю</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
            
            <TouchableOpacity 
              style={[appStyles.modalButton, appStyles.closeButton, { marginTop: 20 }]}
              onPress={() => setHistoryVisible(false)}
            >
              <Text style={appStyles.closeButtonText}>Закрыть</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={settingsVisible}
        onRequestClose={() => setSettingsVisible(false)}
      >
        <View style={appStyles.modalContainer}>
          <View style={appStyles.modalContent}>
            <View style={appStyles.modalHeader}>
              <Text style={appStyles.modalTitle}>Настройки</Text>
              <TouchableOpacity onPress={() => setSettingsVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={appStyles.modalScroll}>
              <View style={appStyles.settingItem}>
                <View style={appStyles.settingInfo}>
                  <Ionicons name="flash" size={24} color="#007AFF" style={appStyles.settingIcon} />
                  <View>
                    <Text style={appStyles.settingTitle}>Вспышка</Text>
                    <Text style={appStyles.settingDescription}>Включить фонарик камеры</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[appStyles.toggle, flash === 'on' && appStyles.toggleActive]}
                  onPress={() => setFlash(flash === 'off' ? 'on' : 'off')}
                >
                  <View style={[appStyles.toggleCircle, flash === 'on' && appStyles.toggleCircleActive]} />
                </TouchableOpacity>
              </View>
              
              <View style={appStyles.settingItem}>
                <View style={appStyles.settingInfo}>
                  <Ionicons name="save" size={24} color="#007AFF" style={appStyles.settingIcon} />
                  <View>
                    <Text style={appStyles.settingTitle}>Автосохранение</Text>
                    <Text style={appStyles.settingDescription}>Автоматически сохранять в историю</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[appStyles.toggle, autoSave && appStyles.toggleActive]}
                  onPress={() => setAutoSave(!autoSave)}
                >
                  <View style={[appStyles.toggleCircle, autoSave && appStyles.toggleCircleActive]} />
                </TouchableOpacity>
              </View>
            </ScrollView>
            
            <View style={appStyles.modalButtons}>
              <TouchableOpacity 
                style={[appStyles.modalButton, appStyles.closeButton]}
                onPress={() => setSettingsVisible(false)}
              >
                <Text style={appStyles.closeButtonText}>Закрыть</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}