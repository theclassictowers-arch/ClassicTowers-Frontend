import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { axiosInstance } from "../utils";

const DEFAULT_LOGO_TEXT = "The Classic Towers";

export type DashboardBranding = {
  logoText: string;
  logoIcon: string | null;
  logoIconEnabled: boolean;
  logoTextEnabled: boolean;
  logoTextSize: number;
  logoTextWidth: number;
};

type BrandingContextType = {
  branding: DashboardBranding;
  setBranding: React.Dispatch<Partial<DashboardBranding> | null>;
};

const BrandingContext = createContext<BrandingContextType | undefined>(
  undefined
);

const normalizeBranding = (
  branding?: Partial<DashboardBranding> | null
): DashboardBranding => ({
  logoText: String(branding?.logoText || DEFAULT_LOGO_TEXT).trim(),
  logoIcon: branding?.logoIcon || null,
  logoIconEnabled: branding?.logoIconEnabled !== false,
  logoTextEnabled: branding?.logoTextEnabled !== false,
  logoTextSize:
    Number.isFinite(Number(branding?.logoTextSize)) &&
    Number(branding?.logoTextSize) >= 10 &&
    Number(branding?.logoTextSize) <= 32
      ? Number(branding?.logoTextSize)
      : 16,
  logoTextWidth:
    Number.isFinite(Number(branding?.logoTextWidth)) &&
    Number(branding?.logoTextWidth) >= 60 &&
    Number(branding?.logoTextWidth) <= 180
      ? Number(branding?.logoTextWidth)
      : 145,
});

declare global {
  interface Window {
    setDashboardBranding?: React.Dispatch<Partial<DashboardBranding> | null>;
  }
}

export const useBrandingContext = () => {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error("useBrandingContext must be used within BrandingProvider");
  }
  return context;
};

export const BrandingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [branding, setBrandingState] = useState<DashboardBranding>(() =>
    normalizeBranding()
  );

  const setBranding = useCallback(
    (value: Partial<DashboardBranding> | null) => {
      setBrandingState(normalizeBranding(value));
    },
    []
  );

  useEffect(() => {
    window.setDashboardBranding = setBranding;
    return () => {
      delete window.setDashboardBranding;
    };
  }, [setBranding]);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setBranding(null);
      return;
    }

    axiosInstance
      .get(`/users/${userId}`)
      .then(({ data }) => setBranding(data?.dashboardBranding))
      .catch(() => setBranding(null));
  }, [setBranding]);

  const value = useMemo(
    () => ({ branding, setBranding }),
    [branding, setBranding]
  );

  return (
    <BrandingContext.Provider value={value}>
      {children}
    </BrandingContext.Provider>
  );
};
