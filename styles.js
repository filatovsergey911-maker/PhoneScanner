import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#0a0a0a',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  message: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
    color: 'white',
  },
  subMessage: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 15,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  cameraSection: {
    flex: 1,
    padding: 20,
  },
  cameraWrapper: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#000',
    position: 'relative',
    maxHeight: '70%',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 280,
    height: 380,
    position: 'relative',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    marginBottom: 20,
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#007AFF',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 6,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 6,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 6,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 6,
  },
  scanHint: {
    marginTop: 20,
    color: 'white',
    fontSize: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  scanStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },
  scanStatusText: {
    color: '#4CD964',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 10,
  },
  detectedCount: {
    color: '#aaa',
    fontSize: 14,
    marginLeft: 10,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 10,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanButtonContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  scanButton: {
    backgroundColor: '#007AFF',
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: 'center',
    width: '100%',
    maxWidth: 300,
  },
  scanButtonActive: {
    backgroundColor: '#ff3b30',
  },
  scanButtonContent: {
    alignItems: 'center',
  },
  scanButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },
  scanButtonHint: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
  },
  // УДАЛЕНО: detectedSection, openResultsButton, openResultsText
  // (больше не нужно, так как убираем кнопку "Открыть результаты")
  
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15, // Уменьшили отступ
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  modalScroll: {
    maxHeight: 400,
  },
  // Обновлённый resultsSummary - компактный, без иконки
  resultsSummary: {
    backgroundColor: '#2a2a2a',
    borderRadius: 15,
    padding: 15, // Уменьшили padding
    marginBottom: 15, // Уменьшили отступ
    alignItems: 'center', // Центрируем содержимое
  },
  summaryText: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#aaa',
  },
  summaryValue: {
    fontSize: 24,
    color: '#4CD964',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  // УДАЛЕНО: summaryItem (больше не нужен)
  
  appsList: {
    marginBottom: 20,
  },
  appListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  appIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  appType: {
    fontSize: 12,
    color: '#aaa',
  },
  downloadButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  downloadButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  modalButtons: {
    marginTop: 20,
  },
  modalButton: {
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: '#007AFF',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 15,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: '#aaa',
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#333',
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#007AFF',
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    transform: [{ translateX: 0 }],
  },
  toggleCircleActive: {
    transform: [{ translateX: 22 }],
  },
  // Обновлённые стили для истории - такая же ширина как у кнопки сканирования
  historyButtonContainer: {
    marginHorizontal: 10,
    marginTop: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  historyButton: {
    backgroundColor: '#333',
    borderRadius: 15,
    paddingVertical: 12,
    alignItems: 'center',
    width: '100%',
    maxWidth: 300, // Такая же ширина как у кнопки сканирования
  },
  historyButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  historyModalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 20,
    maxHeight: '80%',
    margin: 20,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  historyEmpty: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  historyEmptyText: {
    color: '#aaa',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  historyItem: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  historyDeviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    flex: 1,
  },
  historyDate: {
    fontSize: 12,
    color: '#aaa',
  },
  historyApps: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  historyAppBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  historyAppIcon: {
    marginRight: 5,
  },
  historyAppName: {
    color: 'white',
    fontSize: 12,
  },
  clearHistoryButton: {
    backgroundColor: '#ff3b30',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20,
  },
  clearHistoryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});