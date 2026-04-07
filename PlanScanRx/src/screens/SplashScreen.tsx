import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import Video from 'react-native-video';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../navigation/types';
import { useTheme } from '../theme/ThemeProvider';

type Props = NativeStackScreenProps<AuthStackParamList, 'Splash'>;

export default function SplashScreen({ navigation }: Props) {
  const { theme } = useTheme();

  const handleVideoEnd = useCallback(() => {
    navigation.replace('AuthLanding');
  }, [navigation]);

  // Fallback timeout if video fails
  useEffect(() => {
    const timeout = setTimeout(() => navigation.replace('AuthLanding'), 5000);
    return () => clearTimeout(timeout);
  }, [navigation]);

  return (
    <View style={[styles.container, { backgroundColor: theme.splashBg }]}>
      <StatusBar hidden />
      <Video
        source={require('../assets/splash-video.mp4')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
        repeat={false}
        playInBackground={false}
        onEnd={handleVideoEnd}
        onError={handleVideoEnd}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
