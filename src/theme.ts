import { RefineThemes } from "@refinedev/mui";
import {
  alpha,
  createTheme,
  darken,
  lighten,
  responsiveFontSizes,
} from "@mui/material/styles";
import gray from "@mui/material/colors/grey";

export type DashboardThemeColors = {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
};

export const APP_FONT_OPTIONS = [
  {
    label: "Arial",
    value: "\"Arial\", \"Helvetica\", sans-serif",
  },
  {
    label: "Courier New",
    value: "\"Courier New\", Courier, monospace",
  },
  {
    label: "Times New Roman",
    value: "\"Times New Roman\", Times, serif",
  },
  {
    label: "Calibri",
    value: "\"Calibri\", \"Arial\", sans-serif",
  },
  {
    label: "Verdana",
    value: "\"Verdana\", \"Arial\", sans-serif",
  },
] as const;

export const DEFAULT_APP_FONT = APP_FONT_OPTIONS[0].value;

export const normalizeAppFont = (value?: string | null): string =>
  APP_FONT_OPTIONS.some((font) => font.value === value)
    ? String(value)
    : DEFAULT_APP_FONT;

export const DEFAULT_DASHBOARD_THEME: DashboardThemeColors = {
  primaryColor: "#0b70c2",
  backgroundColor: "#f5f7fb",
  textColor: "#0f172a",
};

export type DashboardThemePreset = {
  id: string;
  name: string;
  description: string;
  colors: DashboardThemeColors;
};

export const LIGHT_DASHBOARD_THEME_PRESETS: DashboardThemePreset[] = [
  {
    id: "tower-blue",
    name: "Tower Blue",
    description: "Clean control-room blue",
    colors: DEFAULT_DASHBOARD_THEME,
  },
  {
    id: "emerald-grid",
    name: "Emerald Grid",
    description: "Fresh, technical, and calm",
    colors: {
      primaryColor: "#059669",
      backgroundColor: "#f0fdf4",
      textColor: "#064e3b",
    },
  },
  {
    id: "sky-command",
    name: "Sky Command",
    description: "Bright blue operational palette",
    colors: {
      primaryColor: "#2563eb",
      backgroundColor: "#eff6ff",
      textColor: "#172554",
    },
  },
  {
    id: "solar-amber",
    name: "Solar Amber",
    description: "Warm highlights with crisp text",
    colors: {
      primaryColor: "#d97706",
      backgroundColor: "#fffbeb",
      textColor: "#451a03",
    },
  },
  {
    id: "royal-indigo",
    name: "Royal Indigo",
    description: "Premium and focused",
    colors: {
      primaryColor: "#4f46e5",
      backgroundColor: "#eef2ff",
      textColor: "#1f2937",
    },
  },
  {
    id: "rose-day",
    name: "Rose Day",
    description: "Soft alerts with clean contrast",
    colors: {
      primaryColor: "#e11d48",
      backgroundColor: "#fff1f2",
      textColor: "#4c0519",
    },
  },
  {
    id: "violet-cloud",
    name: "Violet Cloud",
    description: "Soft violet with clear contrast",
    colors: {
      primaryColor: "#7c3aed",
      backgroundColor: "#f5f3ff",
      textColor: "#2e1065",
    },
  },
];

export const DARK_DASHBOARD_THEME_PRESETS: DashboardThemePreset[] = [
  {
    id: "graphite-cyan",
    name: "Graphite Cyan",
    description: "Sharp dark dashboard feel",
    colors: {
      primaryColor: "#06b6d4",
      backgroundColor: "#111827",
      textColor: "#e2e8f0",
    },
  },
  {
    id: "ruby-night",
    name: "Ruby Night",
    description: "Bold monitoring contrast",
    colors: {
      primaryColor: "#fb7185",
      backgroundColor: "#18181b",
      textColor: "#ffe4e6",
    },
  },
  {
    id: "midnight-blue",
    name: "Midnight Blue",
    description: "Deep blue command room",
    colors: {
      primaryColor: "#38bdf8",
      backgroundColor: "#020617",
      textColor: "#dbeafe",
    },
  },
  {
    id: "dark-emerald",
    name: "Dark Emerald",
    description: "Low-light green monitoring",
    colors: {
      primaryColor: "#34d399",
      backgroundColor: "#052e16",
      textColor: "#bbf7d0",
    },
  },
  {
    id: "amber-night",
    name: "Amber Night",
    description: "Warm dark visibility",
    colors: {
      primaryColor: "#f59e0b",
      backgroundColor: "#1c1917",
      textColor: "#fed7aa",
    },
  },
  {
    id: "violet-night",
    name: "Violet Night",
    description: "Dark premium contrast",
    colors: {
      primaryColor: "#a78bfa",
      backgroundColor: "#1e1b4b",
      textColor: "#ede9fe",
    },
  },
];

export const DEVICE_DASHBOARD_THEME_PRESETS: DashboardThemePreset[] = [
  {
    id: "adaptive-blue",
    name: "Adaptive Blue",
    description: "Balanced system blue",
    colors: {
      primaryColor: "#3b82f6",
      backgroundColor: "#eaf2ff",
      textColor: "#1e3a8a",
    },
  },
  {
    id: "adaptive-teal",
    name: "Adaptive Teal",
    description: "System-friendly teal",
    colors: {
      primaryColor: "#14b8a6",
      backgroundColor: "#e6fffb",
      textColor: "#115e59",
    },
  },
  {
    id: "adaptive-slate",
    name: "Adaptive Slate",
    description: "Neutral across modes",
    colors: {
      primaryColor: "#64748b",
      backgroundColor: "#f1f5f9",
      textColor: "#334155",
    },
  },
  {
    id: "adaptive-indigo",
    name: "Adaptive Indigo",
    description: "Soft system indigo",
    colors: {
      primaryColor: "#6366f1",
      backgroundColor: "#e0e7ff",
      textColor: "#3730a3",
    },
  },
];

export const DASHBOARD_THEME_PRESETS = LIGHT_DASHBOARD_THEME_PRESETS;

const HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{6})$/;

const normalizeHexColor = (
  value: string | null | undefined,
  fallback: string
): string => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();

  if (!HEX_COLOR_REGEX.test(normalized)) {
    return fallback;
  }

  return normalized;
};

export const normalizePrimaryColor = (value?: string | null): string =>
  normalizeHexColor(value, DEFAULT_DASHBOARD_THEME.primaryColor);

export const normalizeDashboardTheme = (
  input?: Partial<DashboardThemeColors> | null
): DashboardThemeColors => ({
  primaryColor: normalizeHexColor(
    input?.primaryColor,
    DEFAULT_DASHBOARD_THEME.primaryColor
  ),
  backgroundColor: normalizeHexColor(
    input?.backgroundColor,
    DEFAULT_DASHBOARD_THEME.backgroundColor
  ),
  textColor: normalizeHexColor(
    input?.textColor,
    DEFAULT_DASHBOARD_THEME.textColor
  ),
});

export const isDefaultDashboardTheme = (
  input?: Partial<DashboardThemeColors> | null
): boolean => {
  const normalized = normalizeDashboardTheme(input);
  return (
    normalized.primaryColor === DEFAULT_DASHBOARD_THEME.primaryColor &&
    normalized.backgroundColor === DEFAULT_DASHBOARD_THEME.backgroundColor &&
    normalized.textColor === DEFAULT_DASHBOARD_THEME.textColor
  );
};

const LightTheme = createTheme({
  ...RefineThemes.Blue,
  components: {
    ...RefineThemes.Blue.components,
    MuiChip: {
      styleOverrides: {
        labelSmall: {
          lineHeight: "18px",
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        "main.MuiBox-root": {
          backgroundColor: gray[100],
        },
        body: {
          backgroundColor: "#000",
        },
      },
    },
    MuiTypography: {
      defaultProps: {
        variant: "body2",
      },
    },
  },
});

const DarkTheme = createTheme({
  ...RefineThemes.Blue,
  components: {
    ...RefineThemes.Blue.components,
    MuiChip: {
      styleOverrides: {
        labelSmall: {
          lineHeight: "18px",
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        "main.MuiBox-root": {
          backgroundColor: gray[100],
        },
        body: {
          backgroundColor: gray[100],
        },
      },
    },
    MuiTypography: {
      defaultProps: {
        variant: "body2",
      },
    },
  },
});

const DarkThemeWithResponsiveFontSizes = responsiveFontSizes(DarkTheme);
const LightThemeWithResponsiveFontSizes = responsiveFontSizes(LightTheme);

export const createAppTheme = (
  mode: "light" | "dark",
  dashboardThemeInput?: Partial<DashboardThemeColors> | null,
  fontFamilyInput?: string | null
) => {
  const dashboardTheme = normalizeDashboardTheme(
    dashboardThemeInput || DEFAULT_DASHBOARD_THEME
  );
  const primaryColor = dashboardTheme.primaryColor;
  const backgroundColor = dashboardTheme.backgroundColor;
  const textColor = dashboardTheme.textColor;
  const fontFamily = normalizeAppFont(fontFamilyInput);
  const paperBackground =
    mode === "dark"
      ? darken(backgroundColor, 0.12)
      : lighten(backgroundColor, 0.03);

  const baseTheme = createTheme({
    ...RefineThemes.Blue,
    palette: {
      ...RefineThemes.Blue.palette,
      mode,
      primary: {
        ...RefineThemes.Blue.palette.primary,
        main: primaryColor,
        light: lighten(primaryColor, 0.18),
        dark: darken(primaryColor, 0.22),
        contrastText: "#ffffff",
      },
      background: {
        default: backgroundColor,
        paper: paperBackground,
      },
      text: {
        primary: textColor,
        secondary: alpha(textColor, 0.74),
      },
    },
    typography: {
      ...RefineThemes.Blue.typography,
      fontFamily,
    },
    components: {
      ...RefineThemes.Blue.components,
      MuiChip: {
        styleOverrides: {
          labelSmall: {
            lineHeight: "18px",
          },
        },
      },
      MuiCssBaseline: {
        styleOverrides: {
          "main.MuiBox-root": {
            backgroundColor,
          },
          body: {
            backgroundColor,
            color: textColor,
            fontFamily: `${fontFamily} !important`,
          },
          "*, *::before, *::after": {
            fontFamily: `${fontFamily} !important`,
          },
          "button, input, textarea, select, table": {
            fontFamily: `${fontFamily} !important`,
          },
        },
      },
      MuiTypography: {
        defaultProps: {
          variant: "body2",
        },
      },
    },
  });

  return responsiveFontSizes(baseTheme);
};

export { LightThemeWithResponsiveFontSizes, DarkThemeWithResponsiveFontSizes };
