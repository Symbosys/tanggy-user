import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import Video from 'react-native-video';
import { AppNavigation } from '../../types/type';
import { PROFILE_INCOMPLETE_KEY } from '../auth/CompleteProfile';

const Splash = ({ navigation }: AppNavigation) => {
  const [ready, setReady] = useState(false);

  const { isAuthenticated, hasSkippedLogin } = useAuth();

  useEffect(() => {
    if (!ready) return;

    const checkNavigationTarget = async () => {
      const profileIncomplete = await AsyncStorage.getItem(PROFILE_INCOMPLETE_KEY);

      if (isAuthenticated) {
        if (profileIncomplete === 'true') {
          navigation.reset({
            index: 0,
            routes: [{ name: "CompleteProfile" }],
          });
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: "BottomTab" }],
          });
        }
      } else if (hasSkippedLogin) {
        navigation.reset({
          index: 0,
          routes: [{ name: "BottomTab" }],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: "Login" }],
        });
      }
    };

    const timeout = setTimeout(() => {
      checkNavigationTarget();
    }, 2000);

    return () => clearTimeout(timeout);
  }, [ready, isAuthenticated, hasSkippedLogin, navigation]);

  return (
    <View style={styles.container}>
      <Video
        source={require('../../assets/video/splash.mp4')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"

        // KEY FIXES
        onLoad={() => setReady(true)}      // ensures first frame is ready
        poster={require('../../assets/video/splash.mp4')}  // first frame
        posterResizeMode="cover"
        // posterStyle={StyleSheet.absoluteFill}
        muted
        repeat
      />
    </View>
  );
};

export default Splash;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',  // prevents white flash
  },
});
