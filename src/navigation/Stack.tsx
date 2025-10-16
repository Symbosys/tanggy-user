import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from '../screens/auth/Login';
import Otp from '../screens/auth/Otp';
import BottomTab from './Bottom';
import Splash from '../screens/others/Splash';

const Stack = createNativeStackNavigator();

export default function StackNavigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator
      initialRouteName='BottomTab'
      screenOptions={{headerShown: false}}>

        <Stack.Screen 
          name="Splash"
          component={Splash}
        />

        <Stack.Screen 
          name="Login" 
          component={Login} 
        />
        <Stack.Screen 
          name="Otp" 
          component={Otp} 
        />

        <Stack.Screen 
          name="BottomTab" 
          component={BottomTab}
          options={{ headerShown: false }}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
