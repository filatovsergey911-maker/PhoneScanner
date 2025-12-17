import { StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'System',
  },
  message: {
    fontSize: 24,
    fontFamily: 'System',
    fontWeight: '600',
    marginTop: 20,
    textAlign: 'center',
  },
  subMessage: {
    fontSize: 16,
    fontFamily: 'System',
    marginTop: 8,
    marginBottom: 32,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  primaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 17,
    fontFamily: 'System',
    fontWeight: '600',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'System',
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'System',
    marginTop: 4,
  },
  
  // Content
  content: {
    flex: 1,
  },
  cameraSection: {
    flex: 0.97,
    padding: 20,
    paddingBottom: 20,
  },
  
  // Camera
  cameraWrapper: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 15,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between', // ИЗМЕНЕНО: пространство между элементами
    alignItems: 'center',
    paddingVertical: 20, // отступ сверху и снизу
  },
  scanFrame: {
    width: screenWidth * 0.70,
    height: screenHeight * 0.45,
    position: 'relative',
    backgroundColor: 'transparent',
    borderWidth: 0,
    marginTop: 40, // отступ от верха
  },
  corner: {
    position: 'absolute',
    width: 25,
    height: 25,
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  scanHint: {
    marginTop: 0, // ИЗМЕНЕНО: убран верхний отступ
    marginBottom: 0, // ДОБАВЛЕНО: большой отступ снизу
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    fontSize: 14,
    fontFamily: 'System',
    fontWeight: '500',
  },
  
  // Scan Status
  scanStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 10,
    gap: 8,
  },
  scanStatusText: {
    fontSize: 14,
    fontFamily: 'System',
    fontWeight: '500',
  },
  detectedCount: {
    marginTop: 4,
    fontSize: 13,
    fontFamily: 'System',
    textAlign: 'center',
  },
  
  // Controls
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  scanButtonContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  scanButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  scanButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'System',
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 22,
  },
  scanButtonHint: {
    fontSize: 12,
    fontFamily: 'System',
    marginTop: 6,
    fontWeight: '400',
  },
  
  // History Button
  historyButtonContainer: {
    marginTop: 1,
    marginBottom: 10,
  },
  historyButton: {
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 14,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  historyButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  historyButtonText: {
    fontSize: 15,
    fontFamily: 'System',
    fontWeight: '600',
  },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  historyModalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: 'System',
    fontWeight: '700',
  },
  modalScroll: {
    paddingHorizontal: 20,
  },
  
  // Results
  resultsSummary: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  summaryText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 16,
    fontFamily: 'System',
  },
  summaryValue: {
    fontSize: 24,
    fontFamily: 'System',
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'System',
    fontWeight: '600',
    marginBottom: 16,
  },
  appsList: {
    marginBottom: 24,
  },
  appListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  appIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    fontSize: 16,
    fontFamily: 'System',
    fontWeight: '600',
  },
  appType: {
    fontSize: 13,
    fontFamily: 'System',
    marginTop: 2,
  },
  downloadButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  downloadButtonText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'System',
    fontWeight: '600',
  },
  
  // Modal Buttons
  modalButtons: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  modalButton: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 17,
    fontFamily: 'System',
    fontWeight: '600',
  },
  
  // Settings
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 17,
    fontFamily: 'System',
    fontWeight: '600',
  },
  settingDescription: {
    fontSize: 14,
    fontFamily: 'System',
    marginTop: 2,
  },
  toggle: {
    width: 52,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e5e5e7',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: '#34C759',
  },
  toggleCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'white',
    transform: [{ translateX: 0 }],
  },
  toggleCircleActive: {
    transform: [{ translateX: 20 }],
  },
  
  // History
  historyTitle: {
    fontSize: 24,
    fontFamily: 'System',
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
  },
  historyEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  historyEmptyText: {
    fontSize: 16,
    fontFamily: 'System',
    marginTop: 12,
  },
  historyItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  historyDeviceName: {
    fontSize: 16,
    fontFamily: 'System',
    fontWeight: '600',
    flex: 1,
  },
  historyDate: {
    fontSize: 13,
    fontFamily: 'System',
  },
  historyApps: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  historyAppBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    gap: 6,
  },
  historyAppIcon: {
    marginRight: 4,
  },
  historyAppName: {
    fontSize: 12,
    fontFamily: 'System',
    fontWeight: '500',
  },
  clearHistoryButton: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  clearHistoryText: {
    color: 'white',
    fontSize: 17,
    fontFamily: 'System',
    fontWeight: '600',
  },
});