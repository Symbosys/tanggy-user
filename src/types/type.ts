import { NavigationProp } from "@react-navigation/native";

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Otp: { mobile: string };
  select_your_location: undefined;
  BottomTab: undefined;
};


export type AppNavigation = {
    navigation: NavigationProp<RootStackParamList>;
}