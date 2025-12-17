import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles';

export const SettingsModal = ({ 
  visible, 
  onClose, 
  isDarkMode,
  useDarkTheme,
  autoSave,
  onToggleTheme,
  onToggleAutoSave
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
              Настройки
            </Text>
            <TouchableOpacity onPress={onClose}>
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
                onPress={onToggleTheme}
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
                onPress={onToggleAutoSave}
              >
                <View style={[styles.toggleCircle, autoSave && styles.toggleCircleActive]} />
              </TouchableOpacity>
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