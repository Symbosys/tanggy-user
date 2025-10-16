import { NavigationProp } from "@react-navigation/native";

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Otp: { mobile: string };
  BottomTab: undefined;
};


export type AppNavigation = {
    navigation: NavigationProp<RootStackParamList>;
}