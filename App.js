import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Modal,
  TextInput,
  Linking,
  ActivityIndicator,
  Switch,
} from "react-native";
import Camera from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { Ionicons, FontAwesome5, MaterialIcons } from "@expo/vector-icons";

const APP_DATABASE = [
  { id: 1, name: "WhatsApp", icon: "whatsapp", type: "мессенджер", storeUrl: "https://play.google.com/store/apps/details?id=com.whatsapp", color: "#25D366" },
  { id: 2, name: "Telegram", icon: "telegram", type: "мессенджер", storeUrl: "https://play.google.com/store/apps/details?id=org.telegram.messenger", color: "#0088cc" },
  { id: 3, name: "Instagram", icon: "instagram", type: "соцсеть", storeUrl: "https://play.google.com/store/apps/details?id=com.instagram.android", color: "#E4405F" },
  { id: 4, name: "YouTube", icon: "youtube", type: "видео", storeUrl: "https://play.google.com/store/apps/details?id=com.google.android.youtube", color: "#FF0000" },
  { id: 5, name: "Chrome", icon: "chrome", type: "браузер", storeUrl: "https://play.google.com/store/apps/details?id=com.android.chrome", color: "#4285F4" },
  { id: 6, name: "Facebook", icon: "facebook", type: "соцсеть", storeUrl: "https://play.google.com/store/apps/details?id=com.facebook.katana", color: "#1877F2" },
  { id: 7, name: "TikTok", icon: "tiktok", type: "видео", storeUrl: "https://play.google.com/store/apps/details?id=com.zhiliaoapp.musically", color: "#000000" },
  { id: 8, name: "Spotify", icon: "spotify", type: "музыка", storeUrl: "https://play.google.com/store/apps/details?id=com.spotify.music", color: "#1DB954" },
  { id: 9, name: "Gmail", icon: "envelope", type: "почта", storeUrl: "https://play.google.com/store/apps/details?id=com.google.android.gm", color: "#EA4335" },
  { id: 10, name: "VK", icon: "vk", type: "соцсеть", storeUrl: "https://play.google.com/store/apps/details?id=com.vkontakte.android", color: "#0077FF" },
  { id: 11, name: "Discord", icon: "discord", type: "мессенджер", storeUrl: "https://play.google.com/store/apps/details?id=com.discord", color: "#5865F2" },
  { id: 12, name: "Netflix", icon: "netflix", type: "видео", storeUrl: "https://play.google.com/store/apps/details?id=com.netflix.mediaclient", color: "#E50914" },
  { id: 13, name: "Zoom", icon: "video", type: "видеозвонки", storeUrl: "https://play.google.com/store/apps/details?id=us.zoom.videomeetings", color: "#2D8CFF" },
  { id: 14, name: "Twitter", icon: "twitter", type: "соцсеть", storeUrl: "https://play.google.com/store/apps/details?id=com.twitter.android", color: "#1DA1F2" },
  { id: 15, name: "Snapchat", icon: "snapchat", type: "соцсеть", storeUrl: "https://play.google.com/store/apps/details?id=com.snapchat.android", color: "#FFFC00" },
];

// Компонент реальной камеры
const RealCamera = ({ isScanning, onCapture, isDarkMode }) => {
  const [type, setType] = useState('back');
  const [hasPermission, setHasPermission] = useState(true); // Временно true для теста
  const cameraRef = useRef(null);

  // Упрощенный запрос разрешений (закомментирован для теста)
  useEffect(() => {
    /*
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
    */
  }, []);

  const takePicture = async () => {
    if (cameraRef.current && !isScanning) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
        });
        onCapture(photo.uri);
      } catch (error) {
        Alert.alert("Ошибка", "Не удалось сделать снимок");
      }
    }
  };

  // Если разрешения нет
  if (hasPermission === false) {
    return (
      <View style={styles.cameraContainer}>
        <View style={styles.cameraPlaceholder}>
          <Ionicons name="camera-off" size={60} color="#ff3b30" />
          <Text style={styles.cameraText}>Нет доступа к камере</Text>
          <TouchableOpacity 
            style={styles.permissionButton}
            onPress={() => onCapture("demo-image-" + Date.now())}
          >
            <Text style={styles.permissionButtonText}>Тестовый снимок</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Если есть разрешение
  return (
    <View style={styles.cameraContainer}>
      <Camera
        style={styles.camera}
        type={type}
        ref={cameraRef}
      >
        <View style={styles.cameraOverlay}>
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          
          <Text style={styles.scanHint}>
            {isScanning ? "📱 Анализ..." : "Наведите на экран"}
          </Text>
          
          <View style={styles.cameraControls}>
            <TouchableOpacity 
              style={styles.captureButton}
              onPress={takePicture}
            >
              <View style={styles.captureButtonInner}>
                <MaterialIcons name="photo-camera" size={30} color="white" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Camera>
    </View>
  );
};

// Вкладки приложения
const TABS = {
  SCANNER: 'scanner',
  HISTORY: 'history',
  SETTINGS: 'settings'
};

export default function App() {
  const [isScanning, setIsScanning] = useState(false);
  const [detectedApps, setDetectedApps] = useState([]);
  const [scanHistory, setScanHistory] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [deviceName, setDeviceName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedScan, setSelectedScan] = useState(null);
  const [currentTab, setCurrentTab] = useState(TABS.SCANNER);
  const [historyExpanded, setHistoryExpanded] = useState(true);
  const [settings, setSettings] = useState({
    autoSave: true,
    soundEffects: true,
    vibrate: true,
    showNotifications: true,
    darkMode: false,
    useRealCamera: true,
    saveToGallery: true,
  });

  const [hasPermission, setHasPermission] = useState(null);
  const [permissionError, setPermissionError] = useState(null);

  useEffect(() => {
  const requestPermissions = async () => {
    console.log("=== ЗАПРОС РАЗРЕШЕНИЙ КАМЕРЫ ===");
    
    try {
      // Сначала проверяем, есть ли уже разрешение
      console.log("1. Проверяем существующие разрешения...");
      const { status: existingStatus } = await Camera.getCameraPermissionsAsync();
      console.log("   Существующий статус:", existingStatus);
      
      if (existingStatus === 'granted') {
        console.log("   ✓ Разрешение уже предоставлено!");
        setHasPermission(true);
        return;
      }
      
      // Если разрешения нет, запрашиваем
      console.log("2. Запрашиваем новые разрешения...");
      const { status: newStatus, canAskAgain } = await Camera.requestCameraPermissionsAsync();
      console.log("   Новый статус:", newStatus);
      console.log("   Можно запросить снова?:", canAskAgain);
      
      setHasPermission(newStatus === 'granted');
      
      if (newStatus !== 'granted') {
        console.log("   ✗ Пользователь отказал или диалог не показался");
        
        // Если нельзя запрашивать снова, значит пользователь нажал "Не спрашивать again"
        if (!canAskAgain) {
          console.log("   ⚠ Пользователь выбрал 'Не спрашивать снова'");
          setPermissionError("user_denied_forever");
        } else {
          setPermissionError("user_denied");
        }
      }
      
    } catch (error) {
      console.error("!!! ОШИБКА ПРИ ЗАПРОСЕ РАЗРЕШЕНИЙ:", error);
      setHasPermission(false);
      setPermissionError("request_failed");
    }
  };

  requestPermissions();
}, []);

  const loadScanHistory = async () => {
    try {
      const saved = await AsyncStorage.getItem("scanHistory");
      if (saved) setScanHistory(JSON.parse(saved));
    } catch (error) {
      console.log("Ошибка загрузки:", error);
    }
  };

  const saveScanHistory = async (history) => {
    try {
      await AsyncStorage.setItem("scanHistory", JSON.stringify(history));
    } catch (error) {
      console.log("Ошибка сохранения:", error);
    }
  };

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem("appSettings");
      if (saved) setSettings(JSON.parse(saved));
    } catch (error) {
      console.log("Ошибка загрузки настроек:", error);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem("appSettings", JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.log("Ошибка сохранения настроек:", error);
    }
  };

  const simulateAppRecognition = () => {
    const count = Math.floor(Math.random() * 6) + 3;
    const shuffled = [...APP_DATABASE].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const handleImageCapture = async (imageUri) => {
    if (isScanning) return;
    
    setIsScanning(true);
    
    // Симуляция обработки изображения
    setTimeout(() => {
      const apps = simulateAppRecognition();
      setDetectedApps(apps);
      setIsScanning(false);
      setModalVisible(true);
    }, 2000);
  };

  const pickImageFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [9, 16],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await handleImageCapture(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Ошибка', 'Не удалось выбрать изображение');
    }
  };

  const saveScanResult = () => {
    if (detectedApps.length === 0) {
      Alert.alert("Ошибка", "Нет обнаруженных приложений");
      return;
    }

    const scanResult = {
      id: Date.now().toString(),
      deviceName: deviceName || `Устройство ${scanHistory.length + 1}`,
      date: new Date().toLocaleString(),
      appsCount: detectedApps.length,
      apps: detectedApps,
      timestamp: Date.now()
    };

    const updatedHistory = [scanResult, ...scanHistory];
    setScanHistory(updatedHistory);
    saveScanHistory(updatedHistory);
    
    setModalVisible(false);
    setDeviceName("");
    setDetectedApps([]);
    Alert.alert("Успешно", "Результат сканирования сохранен!");
  };

  const openInStore = (app) => {
    Linking.openURL(app.storeUrl).catch(err => {
      Alert.alert("Ошибка", "Не удалось открыть магазин приложений");
    });
  };

  const deleteScan = (id) => {
    Alert.alert(
      "Удалить запись?",
      "Результат сканирования будет удален",
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Удалить",
          style: "destructive",
          onPress: () => {
            const updated = scanHistory.filter(item => item.id !== id);
            setScanHistory(updated);
            saveScanHistory(updated);
          }
        }
      ]
    );
  };

  const clearHistory = () => {
    if (scanHistory.length === 0) return;
    
    Alert.alert(
      "Очистить всю историю?",
      "Все результаты сканирования будут удалены",
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Очистить",
          style: "destructive",
          onPress: async () => {
            setScanHistory([]);
            await AsyncStorage.removeItem("scanHistory");
          }
        }
      ]
    );
  };

  const viewScanDetails = (scan) => {
    setSelectedScan(scan);
    setModalVisible(true);
  };

  const getStats = () => {
    const totalScans = scanHistory.length;
    const totalApps = scanHistory.reduce((sum, scan) => sum + scan.appsCount, 0);
    const avgApps = totalScans > 0 ? (totalApps / totalScans).toFixed(1) : 0;
    
    const appCounts = {};
    scanHistory.forEach(scan => {
      scan.apps.forEach(app => {
        appCounts[app.name] = (appCounts[app.name] || 0) + 1;
      });
    });
    
    const mostCommon = Object.entries(appCounts).sort((a, b) => b[1] - a[1])[0];
    const mostCommonApp = mostCommon ? { name: mostCommon[0], count: mostCommon[1] } : null;
    
    return { totalScans, totalApps, avgApps, mostCommonApp };
  };

  const filteredHistory = searchQuery.trim() === "" 
    ? scanHistory 
    : scanHistory.filter(scan =>
        scan.deviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scan.apps.some(app => 
          app.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );

  const stats = getStats();

  const toggleSetting = (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    saveSettings(newSettings);
  };

  const exportHistory = async () => {
    try {
      const historyText = scanHistory.map(scan => 
        `Устройство: ${scan.deviceName}\nДата: ${scan.date}\nПриложений: ${scan.appsCount}\n` +
        `Приложения: ${scan.apps.map(app => app.name).join(', ')}\n${'-'.repeat(40)}`
      ).join('\n');

      Alert.alert(
        "Экспорт истории",
        `Готово! История содержит ${scanHistory.length} записей.`,
        [{ text: "OK" }]
      );
      
      console.log("История для экспорта:", historyText);
    } catch (error) {
      Alert.alert("Ошибка", "Не удалось экспортировать историю");
    }
  };

  // Группировка истории по месяцам для сворачивания
  const groupHistoryByMonth = () => {
    const groups = {};
    filteredHistory.forEach(scan => {
      const date = new Date(scan.timestamp);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      
      if (!groups[monthKey]) {
        groups[monthKey] = {
          title: monthName,
          data: []
        };
      }
      groups[monthKey].data.push(scan);
    });
    
    return Object.values(groups);
  };

  const renderTabContent = () => {
    switch (currentTab) {
case TABS.SCANNER:
  return (
    <>
      {/* ВРЕМЕННО: простой блок вместо RealCamera */}
      <View style={styles.cameraContainer}>
        <View style={styles.cameraPlaceholder}>
          <Ionicons name="camera" size={60} color="#007AFF" />
          <Text style={styles.cameraText}>📱 Режим сканирования</Text>
          
          <TouchableOpacity 
            style={styles.permissionButton}
            onPress={() => handleImageCapture("demo-screenshot")}
          >
            <Text style={styles.permissionButtonText}>Сделать тестовый снимок</Text>
          </TouchableOpacity>
          
          <Text style={{marginTop: 20, color: '#666', fontSize: 12}}>
            Камера временно в разработке
          </Text>
        </View>
      </View>

      {/* Остальной код оставьте БЕЗ изменений */}
      {isScanning && (
        <View style={styles.scanStatus}>
          <ActivityIndicator size="small" color="#4CD964" />
          <Text style={styles.scanStatusText}>Анализ скриншота...</Text>
        </View>
      )}

      <View style={styles.controls}>
        <TouchableOpacity 
          style={styles.galleryButton}
          onPress={pickImageFromGallery}
          disabled={isScanning}
        >
          <View style={styles.galleryButtonInner}>
            <Ionicons name="images" size={24} color="white" />
          </View>
          <Text style={styles.galleryButtonText}>Из галереи</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.scanButton, isScanning && styles.scanButtonActive]}
          onPress={() => handleImageCapture("demo")}
          disabled={isScanning}
        >
          <View style={[styles.scanButtonInner, isScanning && styles.scanButtonInnerActive]}>
            {isScanning ? (
              <ActivityIndicator color="white" />
            ) : (
              <Ionicons name="scan" size={30} color="white" />
            )}
          </View>
          <Text style={styles.scanButtonText}>
            СКАНИРОВАТЬ
          </Text>
        </TouchableOpacity>
      </View>

      {scanHistory.length > 0 && (
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>📊 Статистика</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.totalScans}</Text>
              <Text style={styles.statLabel}>Всего сканирований</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.totalApps}</Text>
              <Text style={styles.statLabel}>Всего приложений</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.avgApps}</Text>
              <Text style={styles.statLabel}>В среднем</Text>
            </View>
          </View>
        </View>
      )}
    </>
  );

      case TABS.HISTORY:
        return (
          <View style={styles.historyTab}>
            {scanHistory.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="time-outline" size={80} color={isDarkMode ? "#ccc" : "#999"} />
                <Text style={[styles.emptyText, isDarkMode && styles.emptyTextDark]}>История сканирований пуста</Text>
                <Text style={[styles.emptySubtext, isDarkMode && styles.emptySubtextDark]}>
                  Перейдите во вкладку "Сканер" чтобы начать сканирование
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.historyHeader}>
                  <Text style={[styles.historyTitle, isDarkMode && styles.historyTitleDark]}>
                    📜 История сканирований ({scanHistory.length})
                  </Text>
                  <TouchableOpacity 
                    style={[styles.clearHistoryButton, isDarkMode && styles.clearHistoryButtonDark]}
                    onPress={clearHistory}
                  >
                    <Text style={styles.clearHistoryText}>Очистить</Text>
                  </TouchableOpacity>
                </View>

                <View style={[styles.searchContainer, isDarkMode && styles.searchContainerDark]}>
                  <Ionicons name="search" size={20} color={isDarkMode ? "#666" : "#888"} style={styles.searchIcon} />
                  <TextInput
                    style={[styles.searchInput, isDarkMode && styles.searchInputDark]}
                    placeholder="Поиск по устройству или приложению..."
                    placeholderTextColor={isDarkMode ? "#666" : "#888"}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery("")}>
                      <Ionicons name="close-circle" size={20} color={isDarkMode ? "#666" : "#888"} />
                    </TouchableOpacity>
                  )}
                </View>

                <TouchableOpacity 
                  style={[styles.expandButton, isDarkMode && styles.expandButtonDark]}
                  onPress={() => setHistoryExpanded(!historyExpanded)}
                >
                  <Text style={styles.expandButtonText}>
                    {historyExpanded ? "Свернуть историю" : "Развернуть историю"}
                  </Text>
                  <Ionicons 
                    name={historyExpanded ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color="#007AFF" 
                  />
                </TouchableOpacity>

                {historyExpanded && (
                  <ScrollView style={styles.historyList}>
                    {groupHistoryByMonth().map((group, groupIndex) => (
                      <View key={groupIndex} style={styles.monthGroup}>
                        <Text style={[styles.monthTitle, isDarkMode && styles.monthTitleDark]}>{group.title}</Text>
                        {group.data.map((scan) => (
                          <TouchableOpacity 
                            key={scan.id} 
                            style={[styles.historyCard, isDarkMode && styles.historyCardDark]}
                            onPress={() => viewScanDetails(scan)}
                          >
                            <View style={styles.cardHeader}>
                              <View>
                                <Text style={[styles.deviceName, isDarkMode && styles.deviceNameDark]}>{scan.deviceName}</Text>
                                <Text style={[styles.scanDate, isDarkMode && styles.scanDateDark]}>{scan.date}</Text>
                              </View>
                              <View style={styles.cardActions}>
                                <Text style={styles.appsCount}>{scan.appsCount} apps</Text>
                                <TouchableOpacity 
                                  style={styles.deleteButton}
                                  onPress={(e) => {
                                    e.stopPropagation();
                                    deleteScan(scan.id);
                                  }}
                                >
                                  <Ionicons name="trash-outline" size={18} color="#ff3b30" />
                                </TouchableOpacity>
                              </View>
                            </View>
                            
                            <ScrollView 
                              horizontal 
                              showsHorizontalScrollIndicator={false}
                              style={styles.scanApps}
                            >
                              {scan.apps.slice(0, 4).map((app, index) => (
                                <View key={index} style={[styles.scanAppItem, isDarkMode && styles.scanAppItemDark]}>
                                  <FontAwesome5 name={app.icon} size={14} color={app.color || "#666"} />
                                  <Text style={[styles.scanAppName, isDarkMode && styles.scanAppNameDark]}>{app.name}</Text>
                                </View>
                              ))}
                              {scan.apps.length > 4 && (
                                <View style={[styles.moreApps, isDarkMode && styles.moreAppsDark]}>
                                  <Text style={[styles.moreText, isDarkMode && styles.moreTextDark]}>+{scan.apps.length - 4}</Text>
                                </View>
                              )}
                            </ScrollView>
                          </TouchableOpacity>
                        ))}
                      </View>
                    ))}
                  </ScrollView>
                )}
              </>
            )}
          </View>
        );

      case TABS.SETTINGS:
        return (
          <ScrollView style={styles.settingsTab}>
            <Text style={[styles.settingsTitle, isDarkMode && styles.settingsTitleDark]}>⚙️ Настройки</Text>
            
            <View style={[styles.settingsSection, isDarkMode && styles.settingsSectionDark]}>
              <Text style={[styles.settingsSectionTitle, isDarkMode && styles.settingsSectionTitleDark]}>Камера</Text>
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Ionicons name="camera" size={24} color="#007AFF" />
                  <View style={styles.settingText}>
                    <Text style={[styles.settingName, isDarkMode && styles.settingNameDark]}>Использовать камеру</Text>
                    <Text style={[styles.settingDescription, isDarkMode && styles.settingDescriptionDark]}>
                      Включить реальную камеру для сканирования
                    </Text>
                  </View>
                </View>
                <Switch
                  value={settings.useRealCamera}
                  onValueChange={() => toggleSetting('useRealCamera')}
                  trackColor={{ false: "#767577", true: "#007AFF" }}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Ionicons name="save" size={24} color="#007AFF" />
                  <View style={styles.settingText}>
                    <Text style={[styles.settingName, isDarkMode && styles.settingNameDark]}>Сохранять в галерею</Text>
                    <Text style={[styles.settingDescription, isDarkMode && styles.settingDescriptionDark]}>
                      Автоматически сохранять снимки в галерею
                    </Text>
                  </View>
                </View>
                <Switch
                  value={settings.saveToGallery}
                  onValueChange={() => toggleSetting('saveToGallery')}
                  trackColor={{ false: "#767577", true: "#007AFF" }}
                />
              </View>
            </View>

            <View style={[styles.settingsSection, isDarkMode && styles.settingsSectionDark]}>
              <Text style={[styles.settingsSectionTitle, isDarkMode && styles.settingsSectionTitleDark]}>Основные</Text>
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Ionicons name="save" size={24} color="#007AFF" />
                  <View style={styles.settingText}>
                    <Text style={[styles.settingName, isDarkMode && styles.settingNameDark]}>Автосохранение</Text>
                    <Text style={[styles.settingDescription, isDarkMode && styles.settingDescriptionDark]}>
                      Автоматически сохранять результаты сканирования
                    </Text>
                  </View>
                </View>
                <Switch
                  value={settings.autoSave}
                  onValueChange={() => toggleSetting('autoSave')}
                  trackColor={{ false: "#767577", true: "#007AFF" }}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Ionicons name="notifications" size={24} color="#007AFF" />
                  <View style={styles.settingText}>
                    <Text style={[styles.settingName, isDarkMode && styles.settingNameDark]}>Уведомления</Text>
                    <Text style={[styles.settingDescription, isDarkMode && styles.settingDescriptionDark]}>
                      Показывать уведомления о завершении сканирования
                    </Text>
                  </View>
                </View>
                <Switch
                  value={settings.showNotifications}
                  onValueChange={() => toggleSetting('showNotifications')}
                  trackColor={{ false: "#767577", true: "#007AFF" }}
                />
              </View>
            </View>

            <View style={[styles.settingsSection, isDarkMode && styles.settingsSectionDark]}>
              <Text style={[styles.settingsSectionTitle, isDarkMode && styles.settingsSectionTitleDark]}>Звуки и вибрация</Text>
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Ionicons name="volume-high" size={24} color="#007AFF" />
                  <View style={styles.settingText}>
                    <Text style={[styles.settingName, isDarkMode && styles.settingNameDark]}>Звуковые эффекты</Text>
                    <Text style={[styles.settingDescription, isDarkMode && styles.settingDescriptionDark]}>
                      Воспроизводить звуки при сканировании
                    </Text>
                  </View>
                </View>
                <Switch
                  value={settings.soundEffects}
                  onValueChange={() => toggleSetting('soundEffects')}
                  trackColor={{ false: "#767577", true: "#007AFF" }}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Ionicons name="phone-portrait" size={24} color="#007AFF" />
                  <View style={styles.settingText}>
                    <Text style={[styles.settingName, isDarkMode && styles.settingNameDark]}>Вибрация</Text>
                    <Text style={[styles.settingDescription, isDarkMode && styles.settingDescriptionDark]}>
                      Вибрация при завершении сканирования
                    </Text>
                  </View>
                </View>
                <Switch
                  value={settings.vibrate}
                  onValueChange={() => toggleSetting('vibrate')}
                  trackColor={{ false: "#767577", true: "#007AFF" }}
                />
              </View>
            </View>

            <View style={[styles.settingsSection, isDarkMode && styles.settingsSectionDark]}>
              <Text style={[styles.settingsSectionTitle, isDarkMode && styles.settingsSectionTitleDark]}>Внешний вид</Text>
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Ionicons name={isDarkMode ? "moon" : "sunny"} size={24} color="#007AFF" />
                  <View style={styles.settingText}>
                    <Text style={[styles.settingName, isDarkMode && styles.settingNameDark]}>Темная тема</Text>
                    <Text style={[styles.settingDescription, isDarkMode && styles.settingDescriptionDark]}>
                      {isDarkMode ? "Использовать темную тему приложения" : "Использовать светлую тему приложения"}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={settings.darkMode}
                  onValueChange={() => toggleSetting('darkMode')}
                  trackColor={{ false: "#767577", true: "#007AFF" }}
                />
              </View>
            </View>

            <View style={[styles.settingsSection, isDarkMode && styles.settingsSectionDark]}>
              <Text style={[styles.settingsSectionTitle, isDarkMode && styles.settingsSectionTitleDark]}>Управление данными</Text>
              
              <TouchableOpacity style={styles.settingAction} onPress={exportHistory}>
                <Ionicons name="download" size={24} color="#007AFF" />
                <View style={styles.settingActionText}>
                  <Text style={[styles.settingActionName, isDarkMode && styles.settingActionNameDark]}>Экспорт истории</Text>
                  <Text style={[styles.settingActionDescription, isDarkMode && styles.settingActionDescriptionDark]}>
                    Сохранить историю сканирований в файл
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={isDarkMode ? "#666" : "#888"} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingAction} onPress={clearHistory}>
                <Ionicons name="trash" size={24} color="#ff3b30" />
                <View style={styles.settingActionText}>
                  <Text style={[styles.settingActionName, { color: "#ff3b30" }]}>Очистить историю</Text>
                  <Text style={[styles.settingActionDescription, isDarkMode && styles.settingActionDescriptionDark]}>
                    Удалить все записи сканирований
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={isDarkMode ? "#666" : "#888"} />
              </TouchableOpacity>
            </View>

            <View style={styles.appInfo}>
              <Text style={[styles.appInfoTitle, isDarkMode && styles.appInfoTitleDark]}>Phone Scanner</Text>
              <Text style={[styles.appInfoVersion, isDarkMode && styles.appInfoVersionDark]}>Версия 1.0.0</Text>
              <Text style={[styles.appInfoDescription, isDarkMode && styles.appInfoDescriptionDark]}>
                Приложение для сканирования и анализа установленных приложений на других устройствах
              </Text>
            </View>
          </ScrollView>
        );

      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      
      {/* Шапка */}
      <View style={[styles.header, isDarkMode && styles.headerDark]}>
        <View>
          <Text style={[styles.headerTitle, isDarkMode && styles.headerTitleDark]}>📱 Phone Scanner</Text>
          <Text style={[styles.headerSubtitle, isDarkMode && styles.headerSubtitleDark]}>
            {currentTab === TABS.SCANNER && "Сканирование приложений с экрана"}
            {currentTab === TABS.HISTORY && "История сканирований"}
            {currentTab === TABS.SETTINGS && "Настройки"}
          </Text>
        </View>
      </View>

      {/* Контент вкладок */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderTabContent()}
      </ScrollView>

      {/* Нижняя панель навигации */}
      <View style={[styles.tabBar, isDarkMode && styles.tabBarDark]}>
        <TouchableOpacity 
          style={[styles.tab, currentTab === TABS.SCANNER && styles.activeTab]}
          onPress={() => setCurrentTab(TABS.SCANNER)}
        >
          <Ionicons 
            name={currentTab === TABS.SCANNER ? "scan" : "scan-outline"} 
            size={24} 
            color={currentTab === TABS.SCANNER ? "#007AFF" : (isDarkMode ? "#666" : "#888")} 
          />
          <Text style={[
            styles.tabText, 
            currentTab === TABS.SCANNER && styles.activeTabText,
            isDarkMode && styles.tabTextDark
          ]}>
            Сканер
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, currentTab === TABS.HISTORY && styles.activeTab]}
          onPress={() => setCurrentTab(TABS.HISTORY)}
        >
          <Ionicons 
            name={currentTab === TABS.HISTORY ? "time" : "time-outline"} 
            size={24} 
            color={currentTab === TABS.HISTORY ? "#007AFF" : (isDarkMode ? "#666" : "#888")} 
          />
          <Text style={[
            styles.tabText, 
            currentTab === TABS.HISTORY && styles.activeTabText,
            isDarkMode && styles.tabTextDark
          ]}>
            История
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, currentTab === TABS.SETTINGS && styles.activeTab]}
          onPress={() => setCurrentTab(TABS.SETTINGS)}
        >
          <Ionicons 
            name={currentTab === TABS.SETTINGS ? "settings" : "settings-outline"} 
            size={24} 
            color={currentTab === TABS.SETTINGS ? "#007AFF" : (isDarkMode ? "#666" : "#888")} 
          />
          <Text style={[
            styles.tabText, 
            currentTab === TABS.SETTINGS && styles.activeTabText,
            isDarkMode && styles.tabTextDark
          ]}>
            Настройки
          </Text>
        </TouchableOpacity>
      </View>

      {/* Модальное окно */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setSelectedScan(null);
          if (!selectedScan) {
            setDeviceName("");
            setDetectedApps([]);
          }
        }}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, isDarkMode && styles.modalContentDark]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isDarkMode && styles.modalTitleDark]}>
                {selectedScan ? selectedScan.deviceName : "Результаты сканирования"}
              </Text>
              <TouchableOpacity onPress={() => {
                setModalVisible(false);
                setSelectedScan(null);
                if (!selectedScan) {
                  setDeviceName("");
                  setDetectedApps([]);
                }
              }}>
                <Ionicons name="close" size={24} color={isDarkMode ? "#666" : "#888"} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScroll}>
              {selectedScan ? (
                <>
                  <View style={[styles.modalStats, isDarkMode && styles.modalStatsDark]}>
                    <View style={styles.modalStat}>
                      <Text style={styles.modalStatNumber}>{selectedScan.appsCount}</Text>
                      <Text style={[styles.modalStatLabel, isDarkMode && styles.modalStatLabelDark]}>приложений</Text>
                    </View>
                    <View style={styles.modalStat}>
                      <Ionicons name="time-outline" size={20} color={isDarkMode ? "#666" : "#888"} />
                      <Text style={[styles.modalStatDate, isDarkMode && styles.modalStatDateDark]}>{selectedScan.date}</Text>
                    </View>
                  </View>
                  
                  <Text style={[styles.appsListTitle, isDarkMode && styles.appsListTitleDark]}>Обнаруженные приложения:</Text>
                  {selectedScan.apps.map((app, index) => (
                    <TouchableOpacity 
                      key={index}
                      style={[styles.appListItem, isDarkMode && styles.appListItemDark]}
                      onPress={() => openInStore(app)}
                    >
                      <View style={[styles.appListIcon, { backgroundColor: `${app.color}20` }]}>
                        <FontAwesome5 name={app.icon} size={24} color={app.color} />
                      </View>
                      <View style={styles.appListInfo}>
                        <Text style={[styles.appListName, isDarkMode && styles.appListNameDark]}>{app.name}</Text>
                        <Text style={[styles.appListType, isDarkMode && styles.appListTypeDark]}>{app.type}</Text>
                      </View>
                      <TouchableOpacity 
                        style={[styles.downloadButton, { backgroundColor: app.color }]}
                        onPress={() => openInStore(app)}
                      >
                        <Text style={styles.downloadButtonText}>Скачать</Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </>
              ) : (
                <>
                  <Text style={[styles.modalText, isDarkMode && styles.modalTextDark]}>
                    🎉 Найдено {detectedApps.length} приложений
                  </Text>
                  
                  <View style={styles.form}>
                    <Text style={[styles.label, isDarkMode && styles.labelDark]}>Название устройства</Text>
                    <TextInput
                      style={[styles.input, isDarkMode && styles.inputDark]}
                      value={deviceName}
                      onChangeText={setDeviceName}
                      placeholder="Например: Телефон друга или Мой смартфон"
                      placeholderTextColor={isDarkMode ? "#999" : "#aaa"}
                    />
                  </View>
                  
                  <Text style={[styles.label, isDarkMode && styles.labelDark]}>Обнаруженные приложения:</Text>
                  <View style={styles.detectedAppsGrid}>
                    {detectedApps.map((app, index) => (
                      <TouchableOpacity 
                        key={index}
                        style={[styles.detectedAppItem, { borderLeftColor: app.color }, isDarkMode && styles.detectedAppItemDark]}
                        onPress={() => openInStore(app)}
                      >
                        <FontAwesome5 name={app.icon} size={16} color={app.color} />
                        <Text style={[styles.detectedAppName, isDarkMode && styles.detectedAppNameDark]}>{app.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}
            </ScrollView>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton, isDarkMode && styles.cancelButtonDark]}
                onPress={() => {
                  setModalVisible(false);
                  setSelectedScan(null);
                  if (!selectedScan) {
                    setDeviceName("");
                    setDetectedApps([]);
                  }
                }}
              >
                <Text style={[styles.cancelButtonText, isDarkMode && styles.cancelButtonTextDark]}>
                  {selectedScan ? "Закрыть" : "Отмена"}
                </Text>
              </TouchableOpacity>
              
              {!selectedScan && (
                <TouchableOpacity 
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={saveScanResult}
                >
                  <Text style={styles.saveButtonText}>💾 Сохранить</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  // Светлая тема
  container: {
    flex: 1,
    backgroundColor: "#f5f5f7",
  },
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingBottom: 20,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e7",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1c1c1e",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666668",
    marginTop: 2,
  },
  cameraContainer: {
    height: 400,
    width: 320,
    alignSelf: "center",
    marginTop: 20,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
  cameraPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
  },
  cameraText: {
    color: "white",
    fontSize: 16,
    marginTop: 10,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  permissionButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 15,
  },
  permissionButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  scanFrame: {
    width: 220,
    height: 320,
    position: "relative",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
    borderRadius: 10,
    marginTop: 30,
  },
  corner: {
    position: "absolute",
    width: 25,
    height: 25,
    borderColor: "#007AFF",
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  scanAnimation: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
  },
  scanLine: {
    position: "absolute",
    top: 0,
    left: 10,
    right: 10,
    height: 3,
    backgroundColor: "#007AFF",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  scanHint: {
    marginTop: 20,
    color: "white",
    fontSize: 16,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    textAlign: "center",
  },
  cameraControls: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  captureButton: {
    alignItems: "center",
  },
  captureButtonInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "white",
  },
  captureButtonActive: {
    backgroundColor: "#ff3b30",
  },
  flipButton: {
    position: "absolute",
    right: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  scanStatus: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
    marginBottom: 10,
  },
  scanStatusText: {
    color: "#4CD964",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 10,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  scanButton: {
    alignItems: "center",
    marginLeft: 30,
  },
  scanButtonActive: {
    opacity: 0.8,
  },
  scanButtonInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  scanButtonInnerActive: {
    backgroundColor: "#ff3b30",
  },
  scanButtonText: {
    color: "#1c1c1e",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  galleryButton: {
    alignItems: "center",
    marginRight: 30,
  },
  galleryButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#e5e5e7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  galleryButtonText: {
    color: "#1c1c1e",
    fontSize: 12,
    textAlign: "center",
  },
  statsCard: {
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e5e5e7",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1c1c1e",
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: "#666668",
    textAlign: "center",
  },
  historyTab: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  historyTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1c1c1e",
  },
  clearHistoryButton: {
    backgroundColor: "#e5e5e7",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
  },
  clearHistoryText: {
    color: "#ff3b30",
    fontSize: 14,
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f7",
    marginBottom: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: "#1c1c1e",
    fontSize: 16,
  },
  expandButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f2f2f7",
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  expandButtonText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "600",
    marginRight: 8,
  },
  historyList: {
    flex: 1,
  },
  monthGroup: {
    marginBottom: 20,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666668",
    marginBottom: 10,
    paddingLeft: 10,
  },
  historyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e5e5e7",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1c1c1e",
    marginBottom: 5,
  },
  scanDate: {
    fontSize: 12,
    color: "#666668",
  },
  cardActions: {
    alignItems: "flex-end",
  },
  appsCount: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
    marginBottom: 8,
  },
  deleteButton: {
    padding: 4,
  },
  scanApps: {
    flexDirection: "row",
  },
  scanAppItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  scanAppName: {
    color: "#1c1c1e",
    fontSize: 12,
    marginLeft: 6,
  },
  moreApps: {
    backgroundColor: "#f2f2f7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    justifyContent: "center",
  },
  moreText: {
    color: "#666668",
    fontSize: 12,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 100,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    color: "#666668",
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#8e8e93",
    textAlign: "center",
    lineHeight: 20,
  },
  settingsTab: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  settingsTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1c1c1e",
    marginBottom: 25,
    marginTop: 10,
  },
  settingsSection: {
    backgroundColor: "#ffffff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e5e5e7",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingsSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1c1c1e",
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingText: {
    flex: 1,
    marginLeft: 15,
  },
  settingName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1c1c1e",
    marginBottom: 3,
  },
  settingDescription: {
    fontSize: 12,
    color: "#666668",
    lineHeight: 16,
  },
  settingAction: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingVertical: 10,
  },
  settingActionText: {
    flex: 1,
    marginLeft: 15,
  },
  settingActionName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1c1c1e",
    marginBottom: 3,
  },
  settingActionDescription: {
    fontSize: 12,
    color: "#666668",
    lineHeight: 16,
  },
  appInfo: {
    alignItems: "center",
    paddingVertical: 30,
    borderTopWidth: 1,
    borderTopColor: "#e5e5e7",
    marginTop: 20,
  },
  appInfoTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1c1c1e",
    marginBottom: 5,
  },
  appInfoVersion: {
    fontSize: 14,
    color: "#8e8e93",
    marginBottom: 15,
  },
  appInfoDescription: {
    fontSize: 14,
    color: "#666668",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e5e5e7",
    paddingBottom: Platform.OS === "ios" ? 30 : 20,
    paddingTop: 10,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  activeTab: {},
  tabText: {
    fontSize: 12,
    color: "#8e8e93",
    marginTop: 4,
  },
  activeTabText: {
    color: "#007AFF",
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1c1c1e",
  },
  modalScroll: {
    maxHeight: 500,
  },
  modalStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    paddingVertical: 15,
    backgroundColor: "#f2f2f7",
    borderRadius: 15,
  },
  modalStat: {
    alignItems: "center",
  },
  modalStatNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 5,
  },
  modalStatLabel: {
    fontSize: 12,
    color: "#666668",
  },
  modalStatDate: {
    fontSize: 14,
    color: "#666668",
    marginLeft: 5,
  },
  modalText: {
    fontSize: 18,
    color: "#1c1c1e",
    marginBottom: 20,
    textAlign: "center",
  },
  appsListTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1c1c1e",
    marginBottom: 15,
  },
  appListItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f7",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  appListIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  appListInfo: {
    flex: 1,
  },
  appListName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1c1c1e",
    marginBottom: 4,
  },
  appListType: {
    fontSize: 12,
    color: "#666668",
  },
  downloadButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  downloadButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  form: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1c1c1e",
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e5e5e7",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: "#f2f2f7",
    color: "#1c1c1e",
  },
  detectedAppsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  detectedAppItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f7",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    borderLeftWidth: 3,
  },
  detectedAppName: {
    color: "#1c1c1e",
    fontSize: 12,
    marginLeft: 6,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f2f2f7",
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: "#007AFF",
    marginLeft: 10,
  },
  cancelButtonText: {
    color: "#1c1c1e",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  // Темная тема
  containerDark: {
    backgroundColor: "#0a0a0a",
  },
  headerDark: {
    backgroundColor: "#1a1a1a",
    borderBottomColor: "#333",
  },
  headerTitleDark: {
    color: "white",
  },
  headerSubtitleDark: {
    color: "#aaa",
  },
  cameraContainerDark: {
    backgroundColor: "#000",
  },
  cameraTextDark: {
    color: "white",
  },
  scanFrameDark: {
    borderColor: "rgba(255,255,255,0.3)",
  },
  cornerDark: {
    borderColor: "#007AFF",
  },
  scanHintDark: {
    color: "white",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  scanStatusTextDark: {
    color: "#4CD964",
  },
  scanButtonTextDark: {
    color: "white",
  },
  galleryButtonInnerDark: {
    backgroundColor: "#333",
  },
  galleryButtonTextDark: {
    color: "white",
  },
  statsCardDark: {
    backgroundColor: "#1a1a1a",
    borderColor: "#333",
    shadowColor: "#000",
  },
  statsTitleDark: {
    color: "white",
  },
  statLabelDark: {
    color: "#aaa",
  },
  historyTitleDark: {
    color: "white",
  },
  clearHistoryButtonDark: {
    backgroundColor: "#333",
  },
  searchContainerDark: {
    backgroundColor: "#2a2a2a",
  },
  searchInputDark: {
    color: "white",
  },
  expandButtonDark: {
    backgroundColor: "#2a2a2a",
  },
  monthTitleDark: {
    color: "#aaa",
  },
  historyCardDark: {
    backgroundColor: "#2a2a2a",
    borderColor: "#333",
    shadowColor: "#000",
  },
  deviceNameDark: {
    color: "white",
  },
  scanDateDark: {
    color: "#aaa",
  },
  scanAppItemDark: {
    backgroundColor: "#333",
  },
  scanAppNameDark: {
    color: "white",
  },
  moreAppsDark: {
    backgroundColor: "#333",
  },
  moreTextDark: {
    color: "#aaa",
  },
  emptyTextDark: {
    color: "#aaa",
  },
  emptySubtextDark: {
    color: "#666",
  },
  settingsTitleDark: {
    color: "white",
  },
  settingsSectionDark: {
    backgroundColor: "#1a1a1a",
    borderColor: "#333",
    shadowColor: "#000",
  },
  settingsSectionTitleDark: {
    color: "white",
  },
  settingNameDark: {
    color: "white",
  },
  settingDescriptionDark: {
    color: "#aaa",
  },
  settingActionNameDark: {
    color: "white",
  },
  settingActionDescriptionDark: {
    color: "#aaa",
  },
  appInfoTitleDark: {
    color: "white",
  },
  appInfoVersionDark: {
    color: "#666",
  },
  appInfoDescriptionDark: {
    color: "#aaa",
  },
  tabBarDark: {
    backgroundColor: "#1a1a1a",
    borderTopColor: "#333",
  },
  tabTextDark: {
    color: "#666",
  },
  modalContentDark: {
    backgroundColor: "#1a1a1a",
  },
  modalTitleDark: {
    color: "white",
  },
  modalStatsDark: {
    backgroundColor: "#2a2a2a",
  },
  modalStatLabelDark: {
    color: "#aaa",
  },
  modalStatDateDark: {
    color: "#aaa",
  },
  modalTextDark: {
    color: "white",
  },
  appsListTitleDark: {
    color: "white",
  },
  appListItemDark: {
    backgroundColor: "#2a2a2a",
  },
  appListNameDark: {
    color: "white",
  },
  appListTypeDark: {
    color: "#aaa",
  },
  labelDark: {
    color: "white",
  },
  inputDark: {
    borderColor: "#444",
    backgroundColor: "#2a2a2a",
    color: "white",
  },
  detectedAppItemDark: {
    backgroundColor: "#2a2a2a",
  },
  detectedAppNameDark: {
    color: "white",
  },
  cancelButtonDark: {
    backgroundColor: "#333",
  },
  cancelButtonTextDark: {
    color: "white",
  },
  cameraSubtext: {
    color: "#666668",
    fontSize: 12,
    marginTop: 5,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  
  cameraSubtextDark: {
    color: "#aaa",
  },
  cameraContainerDark: {
    backgroundColor: "#000",
  },
  
  cameraTextDark: {
    color: "white",
  },
  
  scanFrameDark: {
    borderColor: "rgba(255,255,255,0.3)",
  },
  
  cornerDark: {
    borderColor: "#007AFF",
  },
  
  scanHintDark: {
    color: "white",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  cameraContainerDark: {
    backgroundColor: "#000",
  },
  cameraTextDark: {
    color: "white",
  },
  scanFrameDark: {
    borderColor: "rgba(255,255,255,0.3)",
  },
  cornerDark: {
    borderColor: "#007AFF",
  },
  scanHintDark: {
    color: "white",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  
  // Ещё могут понадобиться эти стили:
  cameraPlaceholderDark: {
    backgroundColor: "#1a1a1a",
  },
  permissionButtonDark: {
    backgroundColor: "#333",
  },
  permissionButtonTextDark: {
    color: "white",
  },
});