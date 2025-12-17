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

export const ResultsModal = ({ 
  visible, 
  onClose, 
  detectedApps, 
  isDarkMode,
  openInStore 
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff' }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: isDarkMode ? 'white' : '#1d1d1f' }]}>
              Результаты сканирования
            </Text>
            <TouchableOpacity onPress={onClose}>
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
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>Закрыть</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};