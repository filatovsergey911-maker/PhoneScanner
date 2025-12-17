// historyService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = '@scan_history';

// Получить историю
export const getHistory = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(HISTORY_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error('Ошибка загрузки истории:', error);
    return [];
  }
};

// Сохранить результат сканирования
export const saveToHistory = async (scanResult) => {
  try {
    const history = await getHistory();
    const newHistory = [scanResult, ...history.slice(0, 4)]; // Храним только последние 5
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    return newHistory;
  } catch (error) {
    console.error('Ошибка сохранения в историю:', error);
    return [];
  }
};

// Очистить историю
export const clearHistory = async () => {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
    return [];
  } catch (error) {
    console.error('Ошибка очистки истории:', error);
    return [];
  }
};