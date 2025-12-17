import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

const ScanAnimation = ({ isActive, isDarkMode, frameHeight = 300 }) => {
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

  // Используем переданную высоту рамки
  const translateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, frameHeight],
  });

  return (
    <View style={[styles.animationContainer, { height: frameHeight }]}>
      <Animated.View
        style={[
          styles.scanLine,
          {
            transform: [{ translateY }],
            backgroundColor: isDarkMode ? '#007AFF' : '#0056CC',
          },
        ]}
      />
      
      <Animated.View
        style={[
          styles.glowEffect,
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
          styles.secondaryLine,
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

const styles = StyleSheet.create({
  animationContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
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
});

export default ScanAnimation;