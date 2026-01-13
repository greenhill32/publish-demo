import React, { useRef, useState, useCallback } from 'react';
import { View, Image, Animated, PanResponder, StyleSheet, Text, Dimensions } from 'react-native';

const window = Dimensions.get('window');

export default function App() {
  const pan = useRef(new Animated.ValueXY()).current;
  const [targetLayout, setTargetLayout] = useState(null);
  const [placed, setPlaced] = useState(false);
  const [error, setError] = useState(null);
  const hearts = useRef([...Array(8)].map(() => new Animated.Value(0))).current;

  const animateHearts = useCallback(() => {
    hearts.forEach((val) => {
      Animated.timing(val, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }).start(() => {
        val.setValue(0);
      });
    });
  }, [hearts]);

  const isWithinTarget = (gesture) => {
    if (!targetLayout) return false;
    const { x, y, width, height } = targetLayout;
    return (
      gesture.moveX >= x &&
      gesture.moveX <= x + width &&
      gesture.moveY >= y &&
      gesture.moveY <= y + height
    );
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => !placed,
      onPanResponderMove: Animated.event([
        null,
        { dx: pan.x, dy: pan.y },
      ], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gesture) => {
        try {
          if (isWithinTarget(gesture)) {
            setPlaced(true);
            animateHearts();
          }
        } catch (e) {
          console.warn('Error checking drop area', e);
          setError('Drop detection failed');
        }
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      <Image
        source={require('./assets/silhouette.png')}
        style={styles.target}
        onLayout={(e) => {
          const { x, y, width, height } = e.nativeEvent.layout;
          setTargetLayout({ x, y, width, height });
        }}
      />
      {!placed && (
        <Animated.View
          {...panResponder.panHandlers}
          style={[pan.getLayout(), styles.draggable]}
        >
          <Image
            source={require('./assets/bunny.png')}
            style={styles.bunny}
            onError={() => setError('Failed to load bunny image')}
          />
        </Animated.View>
      )}
      {placed &&
        hearts.map((val, i) => {
          const randomX = (i / hearts.length) * 200 - 100;
          return (
            <Animated.Text
              key={i}
              style={[
                styles.heart,
                {
                  opacity: val.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [1, 1, 0],
                  }),
                  transform: [
                    {
                      translateX: val.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, randomX],
                      }),
                    },
                    {
                      translateY: val.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -200],
                      }),
                    },
                    {
                      scale: val.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 2],
                      }),
                    },
                  ],
                },
              ]}
            >
              ❤️
            </Animated.Text>
          );
        })}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  target: {
    width: 150,
    height: 150,
    marginBottom: 20,
    resizeMode: 'contain',
    opacity: 0.5,
  },
  draggable: {
    position: 'absolute',
    left: (window.width - 150) / 2,
    bottom: 50,
  },
  bunny: {
    width: 150,
    height: 150,
  },
  heart: {
    position: 'absolute',
    fontSize: 32,
  },
  error: {
    position: 'absolute',
    bottom: 20,
    color: 'red',
  },
});
