import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

const ScanAnimation = ({ isActive }) => {
  const scanAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  
  // Анимация движения сканирующей линии
  useEffect(() => {
    if (isActive) {
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
      
      // Анимация свечения
      const glowAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      
      lineAnimation.start();
      glowAnimation.start();
      
      return () => {
        lineAnimation.stop();
        glowAnimation.stop();
      };
    } else {
      scanAnim.setValue(0);
      glowAnim.setValue(0);
    }
  }, [isActive]);

  if (!isActive) return null;

  // Позиционирование линии (движется сверху вниз и обратно)
  const translateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  // Эффект свечения
  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  return (
    <>
      {/* Основная сканирующая линия */}
      <Animated.View
        style={[
          styles.scanLine,
          {
            transform: [{ translateY }],
            opacity: glowOpacity,
          },
        ]}
      >
        {/* Центральная яркая часть */}
        <View style={styles.lineCenter} />
        {/* Верхний градиентный хвост */}
        <View style={styles.lineTopTail} />
        <View style={styles.lineTopTail2} />
        {/* Нижний градиентный хвост */}
        <View style={styles.lineBottomTail} />
        <View style={styles.lineBottomTail2} />
      </Animated.View>
      
      {/* Случайные мерцающие пиксели */}
      <View style={styles.pixelsContainer}>
        {[...Array(8)].map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.pixel,
              {
                left: `${10 + index * 10}%`,
                top: `${20 + Math.random() * 60}%`,
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

const styles = StyleSheet.create({
  scanLine: {
    position: 'absolute',
    left: 10,
    right: 10,
    height: 4,
    zIndex: 10,
  },
  lineCenter: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
  },
  lineTopTail: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: -2,
    height: 2,
    backgroundColor: '#4CD964',
    opacity: 0.7,
  },
  lineTopTail2: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: -4,
    height: 2,
    backgroundColor: '#4CD964',
    opacity: 0.4,
  },
  lineBottomTail: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -2,
    height: 2,
    backgroundColor: '#4CD964',
    opacity: 0.7,
  },
  lineBottomTail2: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -4,
    height: 2,
    backgroundColor: '#4CD964',
    opacity: 0.4,
  },
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

export default ScanAnimation;