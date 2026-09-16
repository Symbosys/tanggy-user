import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Image, StatusBar, StyleSheet, View } from 'react-native';
import { getMessaging, requestPermission, getToken, onTokenRefresh } from '@react-native-firebase/messaging';
import { useAuth } from '../../context/AuthContext';
import { useUpdateProfile } from '../../api/hooks/useProfile';
import { AppNavigation } from '../../types/type';
import { PROFILE_INCOMPLETE_KEY } from '../auth/CompleteProfile';

const USER_FCM_TOKEN_KEY = 'userFcmToken';

const Splash = ({ navigation }: AppNavigation) => {
  const [ready, setReady] = useState(false);

  const { isAuthenticated, hasSkippedLogin } = useAuth();
  const { mutate: updateProfile } = useUpdateProfile({ silent: true });

  useEffect(() => {
    let unsubscribeTokenRefresh: (() => void) | undefined;

    const setupNotificationAndFcm = async () => {
      try {
        const messagingInstance = getMessaging();
        const authStatus = await requestPermission(messagingInstance);
        console.log('Permission status:', authStatus);

        const freshFcmToken = await getToken(messagingInstance);
        console.log('FCM Token:', freshFcmToken);

        const storedFcmToken = await AsyncStorage.getItem(USER_FCM_TOKEN_KEY);

        if (freshFcmToken && (!storedFcmToken || storedFcmToken !== freshFcmToken)) {
          if (isAuthenticated) {
            updateProfile({ fcmToken: freshFcmToken });
          }
          await AsyncStorage.setItem(USER_FCM_TOKEN_KEY, freshFcmToken);
          console.log('✅ FCM token updated in DB and AsyncStorage');
        }

        unsubscribeTokenRefresh = onTokenRefresh(messagingInstance, async (refreshedToken: string) => {
          console.log('🔄 FCM Token Refreshed:', refreshedToken);
          const currentStoredToken = await AsyncStorage.getItem(USER_FCM_TOKEN_KEY);
          if (refreshedToken && (!currentStoredToken || currentStoredToken !== refreshedToken)) {
            if (isAuthenticated) {
              updateProfile({ fcmToken: refreshedToken });
            }
            await AsyncStorage.setItem(USER_FCM_TOKEN_KEY, refreshedToken);
            console.log('✅ Refreshed FCM token updated in DB and AsyncStorage');
          }
        });
      } catch (error) {
        console.error('Error requesting notification permission or getting FCM token:', error);
      }
    };

    setupNotificationAndFcm();

    return () => {
      if (unsubscribeTokenRefresh) {
        unsubscribeTokenRefresh();
      }
    };
  }, [isAuthenticated, updateProfile]);

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
    }, 3000);

    return () => clearTimeout(timeout);
  }, [ready, isAuthenticated, hasSkippedLogin, navigation]);

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <Image
        source={require('../../assets/splash/splash.png')}
        style={styles.image}
        resizeMode="cover"
        onLoad={() => setReady(true)}
      />
    </View>
  );
};

export default Splash;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF5EE',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
