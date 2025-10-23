import {create} from 'zustand';
import api from '../api/api';

type Address = {
  id: number;
  type: string;
  mainAddress: string;
  completeAddress: string;
  receiverName: string;
  receiverContact: string;
  city?: string;
  landMark?: string;
  floor?: string;
  instructions?: string;
  isDefault: boolean;
};

type AddressStore = {
  addresses: Address[];
  loading: boolean;
  totalAddress: number;
  error: string | null;

  fetchAddresses: () => Promise<void>;
  deleteAddress: (id: number) => Promise<void>;
  createAddress: (data: Partial<Address>) => Promise<void>;
  setDefaultAddress: (id: number) => Promise<void>;
};

export const useAddressStore = create<AddressStore>((set, get) => ({
  addresses: [],
  totalAddress: 0,
  loading: false,
  error: null,

  fetchAddresses: async () => {
    try {
      set({loading: true, error: null});
      const res = await api.get('/user/address/all');
      set({
        addresses: res.data.data,
        loading: false,
        totalAddress: res.data.data.length,
      });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Failed to load addresses',
        loading: false,
      });
    }
  },

  createAddress: async data => {
    try {
      set({loading: true});
      const res = await api.post('/user/address/create', data);
      set(state => ({
        addresses: [res.data.data, ...state.addresses],
        loading: false,
      }));
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Failed to add address',
        loading: false,
      });
    }
  },

  deleteAddress: async id => {
    try {
      set({loading: true});
      await api.delete(`/user/address/${id}`);
      await get().fetchAddresses();
      set(state => ({
        addresses: state.addresses.filter(a => a.id !== id),
        loading: false,
      }));
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Failed to delete address',
        loading: false,
      });
    }
  },

  setDefaultAddress: async id => {
    try {
      set({loading: true});
      await api.put(`/user/address/${id}`, {isDefault: true});
      // refetch updated list
      await get().fetchAddresses();
      set({loading: false});
    } catch (err: any) {
      set({
        error:
          err.response?.data?.message || 'Failed to update default address',
        loading: false,
      });
    }
  },
}));
