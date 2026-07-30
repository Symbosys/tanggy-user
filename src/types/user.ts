export interface User {
  name: string;
  email: string;
  mobile: string;
  longitude: string;
  latitude: string;
  fcmToken?: string[];
  UserWallet: {
    balance: number;
  };
}
