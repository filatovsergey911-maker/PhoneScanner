import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { styles } from '../styles';

export const HistoryModal = ({ 
  visible, 
  onClose, 
  scanHistory, 
  isDarkMode,
  onClearHistory,
  onViewScanResult
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
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
                    onPress={() => onViewScanResult(scan.apps)}
                  >
                    <Text style={styles.closeButtonText}>Посмотреть</Text>
                  </TouchableOpacity>
                </View>
              ))}
              
              <TouchableOpacity 
                style={[styles.clearHistoryButton, { backgroundColor: isDarkMode ? '#ff3b30' : '#d70015' }]}
                onPress={onClearHistory}
              >
                <Text style={styles.clearHistoryText}>Очистить историю</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
          
          <TouchableOpacity 
            style={[styles.modalButton, { backgroundColor: isDarkMode ? '#007AFF' : '#0056CC', marginTop: 20 }]}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>Закрыть</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};