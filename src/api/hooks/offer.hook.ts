import { useQuery } from "@tanstack/react-query";
import apiClient from "../api";

// ── Types ───────────────────────────────────────────────────

export interface Offer {
  id: string; // BigInt IDs are normalized to string
  uuid?: string;
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  badgeText?: string | null;
  bannerImage?: {
    public_id: string;
    url: string;
  } | null;
  image?: {
    public_id: string;
    url: string;
  } | null;
  searchQuery?: string | null;
  displayOrder?: number;
  isActive?: boolean;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

export interface UserPeriodProgress {
  id?: string;
  currentCycleNumber: number;
  status: "IN_PROGRESS" | "UNLOCKED" | "REDEEMED" | "EXPIRED";
  cycleStartDate: string;
  cycleEndDate: string;
  completedOrderCount: number;
  targetOrderCount: number;
  unlockedAt?: string | null;
  redeemedAt?: string | null;
  remainingDays?: number;
  progressPercentage?: number;
}

export interface AvailableOffer {
  id: string;
  uuid?: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  badgeText?: string | null;
  discountType: string;
  discountValue: number;
  type: string;
  startDate: string;
  endDate: string;
  isPeriodOffer?: boolean;
  periodRule?: {
    periodDurationType: string;
    periodDurationValue: number;
    targetOrderCount: number;
  } | null;
  userPeriodProgress?: UserPeriodProgress | null;
  codes?: Array<{ code: string; isActive: boolean }>;
  metadata?: {
    minCartValue?: number;
    minCartItems?: number;
    applicableDays?: string[];
    isStackable?: boolean;
    termsAndConditions?: string | null;
  } | null;
  productTargets?: Array<{ productId: string; product?: { name: string } }>;
}

// ── Hooks ───────────────────────────────────────────────────

export const useGetAllOffers = (isActive?: boolean) => {
  return useQuery<Offer[]>({
    queryKey: ["all-offers", isActive],
    queryFn: async () => {
      try {
        const res = await apiClient.get<any>("/offers/sliders");
        const raw = res.data?.data ?? res.data;
        if (Array.isArray(raw)) {
          return raw;
        }
        if (raw && Array.isArray(raw.offers)) {
          return raw.offers;
        }
        return [];
      } catch (e) {
        return [];
      }
    },
    staleTime: 0,
    refetchOnMount: true,
  });
};

export const useGetAvailableOffers = () => {
  return useQuery<AvailableOffer[]>({
    queryKey: ["available-customer-offers"],
    queryFn: async () => {
      try {
        const res = await apiClient.get<any>("/offers/available");
        const raw = res.data?.data ?? res.data;
        if (Array.isArray(raw)) {
          return raw;
        }
        if (raw && Array.isArray(raw.offers)) {
          return raw.offers;
        }
        return [];
      } catch (e) {
        return [];
      }
    },
    initialData: [],
  });
};
