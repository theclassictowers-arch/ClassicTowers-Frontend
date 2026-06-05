import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import PaletteOutlinedIcon from "@mui/icons-material/PaletteOutlined";
import { alpha } from "@mui/material/styles";
import { useNotification } from "@refinedev/core";
import {
  useAuthContext,
  useBrandingContext,
  useColorModeContext,
} from "../../contexts";
import { axiosInstance } from "../../utils";
import { formStyles } from "../auth/styles";
import { MapBackgroundPage } from "../../components/map-background-page";
import {
  DASHBOARD_THEME_PRESETS,
  DEFAULT_DASHBOARD_THEME,
  normalizeDashboardTheme,
  type DashboardThemeColors,
} from "../../theme";

type OrganizationUser = {
  _id: string;
  name: string;
  dashboardTheme?: Partial<DashboardThemeColors>;
  dashboardBranding?: DashboardBranding;
};

type DashboardBranding = {
  logoText: string;
  logoIcon: string | null;
  logoIconEnabled: boolean;
  logoTextEnabled: boolean;
  logoTextSize: number;
  logoTextWidth: number;
  sidebarWidth: number;
  sidebarHeight: number;
};

const LOGO_TEXT_MAX_LENGTH = 15;
const LOGO_TEXT_MIN_SIZE = 8;
const LOGO_TEXT_MAX_SIZE = 12;

const clampNumber = (
  value: unknown,
  min: number,
  max: number,
  fallback: number
) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) &&
    numberValue >= min &&
    numberValue <= max
    ? numberValue
    : fallback;
};

const DEFAULT_DASHBOARD_BRANDING: DashboardBranding = {
  logoText: "Classic Towers",
  logoIcon: null,
  logoIconEnabled: true,
  logoTextEnabled: true,
  logoTextSize: 12,
  logoTextWidth: 165,
  sidebarWidth: 240,
  sidebarHeight: 100,
};

const normalizeLogoText = (value?: string) =>
  String(value || DEFAULT_DASHBOARD_BRANDING.logoText)
    .trim()
    .slice(0, LOGO_TEXT_MAX_LENGTH);

const isHexColor = (value: string) => /^#([A-Fa-f0-9]{6})$/.test(value.trim());

const areSameTheme = (
  first: DashboardThemeColors,
  second: DashboardThemeColors
) =>
  first.primaryColor.toLowerCase() === second.primaryColor.toLowerCase() &&
  first.backgroundColor.toLowerCase() ===
    second.backgroundColor.toLowerCase() &&
  first.textColor.toLowerCase() === second.textColor.toLowerCase();

export const SettingsPage: React.FC = () => {
  const { role } = useAuthContext();
  const { dashboardTheme, setDashboardTheme } = useColorModeContext();
  const { setBranding } = useBrandingContext();
  const { open } = useNotification();
  const currentUserId = localStorage.getItem("userId");
  const canManageSettings = role === "admin" || role === "organization";

  const [organizations, setOrganizations] = useState<OrganizationUser[]>([]);
  const [loadingOrganizations, setLoadingOrganizations] = useState(false);
  const [selectedTargetUserId, setSelectedTargetUserId] = useState(
    currentUserId || ""
  );
  const [themeInput, setThemeInput] =
    useState<DashboardThemeColors>(dashboardTheme);
  const [loadingTheme, setLoadingTheme] = useState(false);
  const [brandingInput, setBrandingInput] = useState<DashboardBranding>(
    DEFAULT_DASHBOARD_BRANDING
  );
  const [logoIconFile, setLogoIconFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<"colors" | "logo">(
    "colors"
  );

  useEffect(() => {
    setThemeInput(dashboardTheme);
  }, [dashboardTheme]);

  useEffect(() => {
    if (!canManageSettings || role !== "admin") return;

    const fetchOrganizations = async () => {
      setLoadingOrganizations(true);
      try {
        const response = await axiosInstance.get("/users?role=organization");
        const orgUsers = (response.data?.data || []).filter(
          (user: any) => user?.role === "organization"
        );
        setOrganizations(orgUsers);
      } catch {
        open?.({
          type: "error",
          message: "Failed to load organizations",
          description: "Please refresh and try again.",
        });
      } finally {
        setLoadingOrganizations(false);
      }
    };

    fetchOrganizations();
  }, [canManageSettings, open, role]);

  const targetUserId = useMemo(() => {
    if (!currentUserId) return "";
    return role === "organization" ? currentUserId : selectedTargetUserId;
  }, [currentUserId, role, selectedTargetUserId]);

  useEffect(() => {
    if (!canManageSettings || !targetUserId) return;

    const fetchTheme = async () => {
      setLoadingTheme(true);
      try {
        const response = await axiosInstance.get(`/users/${targetUserId}`);
        setThemeInput(normalizeDashboardTheme(response.data?.dashboardTheme));
        setBrandingInput({
          logoText: normalizeLogoText(response.data?.dashboardBranding?.logoText),
          logoIcon: response.data?.dashboardBranding?.logoIcon || null,
          logoIconEnabled:
            response.data?.dashboardBranding?.logoIconEnabled !== false,
          logoTextEnabled:
            response.data?.dashboardBranding?.logoTextEnabled !== false,
          logoTextSize: clampNumber(
            response.data?.dashboardBranding?.logoTextSize,
            LOGO_TEXT_MIN_SIZE,
            LOGO_TEXT_MAX_SIZE,
            DEFAULT_DASHBOARD_BRANDING.logoTextSize
          ),
          logoTextWidth: clampNumber(
            response.data?.dashboardBranding?.logoTextWidth,
            60,
            220,
            DEFAULT_DASHBOARD_BRANDING.logoTextWidth
          ),
          sidebarWidth: clampNumber(
            response.data?.dashboardBranding?.sidebarWidth,
            150,
            360,
            DEFAULT_DASHBOARD_BRANDING.sidebarWidth
          ),
          sidebarHeight: clampNumber(
            response.data?.dashboardBranding?.sidebarHeight,
            40,
            100,
            DEFAULT_DASHBOARD_BRANDING.sidebarHeight
          ),
        });
        setLogoIconFile(null);
      } catch {
        setThemeInput(DEFAULT_DASHBOARD_THEME);
        setBrandingInput(DEFAULT_DASHBOARD_BRANDING);
        setLogoIconFile(null);
      } finally {
        setLoadingTheme(false);
      }
    };

    fetchTheme();
  }, [canManageSettings, targetUserId]);

  if (!canManageSettings || !currentUserId) {
    return null;
  }

  const handleChangeThemeInput = (
    key: keyof DashboardThemeColors,
    value: string
  ) => {
    setThemeInput((prev) => ({ ...prev, [key]: value }));
  };

  const handleSelectPreset = (colors: DashboardThemeColors) => {
    setThemeInput(normalizeDashboardTheme(colors));
  };

  const validateTheme = () => {
    if (
      !isHexColor(themeInput.primaryColor) ||
      !isHexColor(themeInput.backgroundColor) ||
      !isHexColor(themeInput.textColor)
    ) {
      open?.({
        type: "error",
        message: "Invalid color",
        description: "Use hex colors like #0b70c2.",
      });
      return false;
    }

    return true;
  };

  const handleSaveColors = async () => {
    if (!validateTheme()) return;
    if (!targetUserId) return;

    const payload = normalizeDashboardTheme(themeInput);
    setIsSaving(true);
    try {
      try {
        await axiosInstance.patch(
          `/users/${targetUserId}/dashboard-theme`,
          payload
        );
      } catch (error: unknown) {
        const statusCode = (error as { response?: { status?: number } })
          ?.response?.status;
        if (statusCode !== 404) {
          throw error;
        }

        await axiosInstance.patch(`/users/${targetUserId}`, {
          dashboardTheme: payload,
        });
      }

      setThemeInput(payload);
      if (targetUserId === currentUserId) {
        setDashboardTheme(payload);
      }
      setOrganizations((prev) =>
        prev.map((org) =>
          org._id === targetUserId
            ? {
                ...org,
                dashboardTheme: payload,
              }
            : org
        )
      );

      open?.({
        type: "success",
        message: "Color settings saved",
        description: "Dashboard colors updated successfully.",
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      open?.({
        type: "error",
        message: "Failed to save settings",
        description: err.response?.data?.message || "Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveBranding = async () => {
    if (!targetUserId) return;
    const logoText = normalizeLogoText(brandingInput.logoText);
    const logoTextSize = clampNumber(
      brandingInput.logoTextSize,
      LOGO_TEXT_MIN_SIZE,
      LOGO_TEXT_MAX_SIZE,
      DEFAULT_DASHBOARD_BRANDING.logoTextSize
    );
    const logoTextWidth = clampNumber(
      brandingInput.logoTextWidth,
      60,
      220,
      DEFAULT_DASHBOARD_BRANDING.logoTextWidth
    );
    const sidebarWidth = clampNumber(
      brandingInput.sidebarWidth,
      150,
      360,
      DEFAULT_DASHBOARD_BRANDING.sidebarWidth
    );
    const sidebarHeight = clampNumber(
      brandingInput.sidebarHeight,
      40,
      100,
      DEFAULT_DASHBOARD_BRANDING.sidebarHeight
    );

    if (brandingInput.logoTextEnabled && !logoText) {
      open?.({
        type: "error",
        message: "Logo text is required",
        description: "Enter the sidebar name before saving.",
      });
      return;
    }

    setIsSaving(true);
    try {
      const createBrandingData = (useFallback = false) => {
        const brandingData = new FormData();
        brandingData.append("logoText", logoText);
        brandingData.append(
          "logoIconEnabled",
          String(brandingInput.logoIconEnabled)
        );
        brandingData.append(
          "logoTextEnabled",
          String(brandingInput.logoTextEnabled)
        );
        brandingData.append("logoTextSize", String(logoTextSize));
        brandingData.append(
          "logoTextWidth",
          String(logoTextWidth)
        );
        brandingData.append("sidebarWidth", String(sidebarWidth));
        brandingData.append("sidebarHeight", String(sidebarHeight));
        if (useFallback) {
          brandingData.append("dashboardBrandingUpdate", "true");
        }
        if (logoIconFile) {
          brandingData.append("logoIcon", logoIconFile);
        }
        return brandingData;
      };

      let response;
      try {
        response = await axiosInstance.patch(
          `/users/${targetUserId}/dashboard-branding`,
          createBrandingData()
        );
      } catch (error: unknown) {
        const statusCode = (error as { response?: { status?: number } })
          .response?.status;
        if (statusCode !== 404) {
          throw error;
        }

        response = await axiosInstance.patch(
          `/users/${targetUserId}`,
          createBrandingData(true)
        );
      }
      const savedBranding = response.data?.dashboardBranding || {
        ...brandingInput,
        logoText,
        logoTextSize,
        logoTextWidth,
        sidebarWidth,
        sidebarHeight,
      };

      const normalizedSavedBranding = {
        ...savedBranding,
        logoText: normalizeLogoText(savedBranding.logoText),
        logoTextSize: clampNumber(
          savedBranding.logoTextSize,
          LOGO_TEXT_MIN_SIZE,
          LOGO_TEXT_MAX_SIZE,
          DEFAULT_DASHBOARD_BRANDING.logoTextSize
        ),
        logoTextWidth,
        sidebarWidth,
        sidebarHeight,
      };

      setBrandingInput(normalizedSavedBranding);
      setLogoIconFile(null);
      if (targetUserId === currentUserId) {
        setBranding(normalizedSavedBranding);
      }
      setOrganizations((prev) =>
        prev.map((org) =>
          org._id === targetUserId
            ? { ...org, dashboardBranding: normalizedSavedBranding }
            : org
        )
      );

      open?.({
        type: "success",
        message: "Logo settings saved",
        description: "Sidebar logo and text updated successfully.",
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      open?.({
        type: "error",
        message: "Failed to save logo settings",
        description: err.response?.data?.message || "Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MapBackgroundPage>
      <Box
        className="map-table-page-shell"
        sx={{
          width: "100%",
          minHeight: "100dvh",
          boxSizing: "border-box",
          overflowY: "auto",
          px: { xs: 0.75, sm: 1.25, md: 1.5 },
          pl: { xs: 0.75, sm: 1.25, md: "76px" },
          py: { xs: 0.75, sm: 1.25 },
        }}
      >
        <Box
          component="form"
          sx={{
            ...formStyles.container,
            mx: "auto",
            my: 0,
            width: "100%",
            maxWidth: 1100,
            boxSizing: "border-box",
            px: { xs: 1.5, sm: 2, md: 2.5 },
            py: { xs: 1.5, sm: 2 },
            borderRadius: { xs: 1.5, sm: 2 },
            overflow: "visible",
          }}
          onSubmit={(event) => {
            event.preventDefault();
            if (activeSection === "colors") {
              handleSaveColors();
            } else {
              handleSaveBranding();
            }
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr minmax(220px, 360px) 1fr",
              },
              alignItems: "center",
              gap: 1,
            }}
          >
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, color: "text.primary", textAlign: "left" }}
            >
              Settings
            </Typography>

            {role === "admin" ? (
              <FormControl fullWidth size="small">
                <InputLabel id="settings-target-label">Target</InputLabel>
                <Select
                  labelId="settings-target-label"
                  label="Target"
                  value={selectedTargetUserId}
                  disabled={loadingOrganizations}
                  onChange={(event) =>
                    setSelectedTargetUserId(String(event.target.value))
                  }
                >
                  <MenuItem value={currentUserId}>My Account (Admin)</MenuItem>
                  {organizations.map((org) => (
                    <MenuItem key={org._id} value={org._id}>
                      {org.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <Typography sx={{ textAlign: "center", color: "text.secondary" }}>
                My Organization
              </Typography>
            )}

            <Button
              type="submit"
              variant="contained"
              disabled={isSaving}
              sx={{
                justifySelf: { xs: "stretch", sm: "end" },
                minWidth: 90,
                textTransform: "none",
                fontWeight: 700,
              }}
            >
              Save
            </Button>
          </Box>

          {loadingTheme ? (
            <Box sx={{ py: 3, display: "flex", justifyContent: "center" }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <Stack spacing={1.5} sx={{ mt: 1.5 }}>
              <Tabs
                value={activeSection}
                onChange={(_, value: "colors" | "logo") =>
                  setActiveSection(value)
                }
                variant="fullWidth"
                sx={{
                  minHeight: 44,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1.5,
                  bgcolor: "background.paper",
                  "& .MuiTab-root": {
                    minHeight: 44,
                    fontWeight: 700,
                    textTransform: "none",
                  },
                }}
              >
                <Tab
                  value="colors"
                  icon={<PaletteOutlinedIcon />}
                  iconPosition="start"
                  label="Color Settings"
                />
                <Tab
                  value="logo"
                  icon={<ImageOutlinedIcon />}
                  iconPosition="start"
                  label="Logo Settings"
                />
              </Tabs>

              {activeSection === "colors" && (
                <Box
                  key="colors"
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                    transformOrigin: "center top",
                    animation:
                      "settingsTabEnter 420ms cubic-bezier(0.16, 1, 0.3, 1) both",
                  }}
                >
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ mb: 1, fontWeight: 700, color: "text.primary" }}
                    >
                      Theme Presets
                    </Typography>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "1fr",
                          sm: "repeat(2, minmax(0, 1fr))",
                          md: "repeat(4, minmax(0, 1fr))",
                        },
                        gap: 0.75,
                      }}
                    >
                      {DASHBOARD_THEME_PRESETS.map((preset) => {
                        const isSelected = areSameTheme(
                          normalizeDashboardTheme(themeInput),
                          preset.colors
                        );

                        return (
                          <Button
                            key={preset.id}
                            type="button"
                            onClick={() => handleSelectPreset(preset.colors)}
                            sx={{
                              alignItems: "stretch",
                              border: "1px solid",
                              borderColor: isSelected
                                ? "primary.main"
                                : "divider",
                              borderRadius: 1,
                              color: "text.primary",
                              justifyContent: "flex-start",
                              minHeight: 68,
                              p: 0.75,
                              textAlign: "left",
                              textTransform: "none",
                              bgcolor: isSelected
                                ? (theme) =>
                                    alpha(theme.palette.primary.main, 0.08)
                                : "background.paper",
                              "&:hover": {
                                borderColor: "primary.main",
                                bgcolor: (theme) =>
                                  alpha(theme.palette.primary.main, 0.1),
                              },
                            }}
                          >
                            <Stack spacing={0.75} sx={{ width: "100%" }}>
                              <Stack direction="row" spacing={0.5}>
                                {Object.values(preset.colors).map((color) => (
                                  <Box
                                    key={`${preset.id}-${color}`}
                                    sx={{
                                      width: 24,
                                      height: 24,
                                      borderRadius: 0.75,
                                      bgcolor: color,
                                      border: "1px solid",
                                      borderColor: alpha("#000000", 0.16),
                                    }}
                                  />
                                ))}
                              </Stack>
                              <Box>
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 700, lineHeight: 1.2 }}
                                >
                                  {preset.name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: "text.secondary",
                                    display: "block",
                                    lineHeight: 1.25,
                                  }}
                                >
                                  {preset.description}
                                </Typography>
                              </Box>
                            </Stack>
                          </Button>
                        );
                      })}
                    </Box>
                  </Box>

                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, color: "text.primary" }}
                  >
                    Custom Theme
                  </Typography>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(3, minmax(0, 1fr))",
                      },
                      gap: 1,
                    }}
                  >
                    <Stack spacing={0.5}>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        Primary Color
                      </Typography>
                      <TextField
                        fullWidth
                        type="color"
                        value={
                          isHexColor(themeInput.primaryColor)
                            ? themeInput.primaryColor
                            : DEFAULT_DASHBOARD_THEME.primaryColor
                        }
                        onChange={(event) =>
                          handleChangeThemeInput(
                            "primaryColor",
                            event.target.value
                          )
                        }
                        sx={{ "& input": { height: 48, cursor: "pointer" } }}
                        inputProps={{ "aria-label": "Pick primary color" }}
                      />
                    </Stack>
                    <Stack spacing={0.5}>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        Background Color
                      </Typography>
                      <TextField
                        fullWidth
                        type="color"
                        value={
                          isHexColor(themeInput.backgroundColor)
                            ? themeInput.backgroundColor
                            : DEFAULT_DASHBOARD_THEME.backgroundColor
                        }
                        onChange={(event) =>
                          handleChangeThemeInput(
                            "backgroundColor",
                            event.target.value
                          )
                        }
                        sx={{ "& input": { height: 48, cursor: "pointer" } }}
                        inputProps={{ "aria-label": "Pick background color" }}
                      />
                    </Stack>
                    <Stack spacing={0.5}>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        Text Color
                      </Typography>
                      <TextField
                        fullWidth
                        type="color"
                        value={
                          isHexColor(themeInput.textColor)
                            ? themeInput.textColor
                            : DEFAULT_DASHBOARD_THEME.textColor
                        }
                        onChange={(event) =>
                          handleChangeThemeInput(
                            "textColor",
                            event.target.value
                          )
                        }
                        sx={{ "& input": { height: 48, cursor: "pointer" } }}
                        inputProps={{ "aria-label": "Pick text color" }}
                      />
                    </Stack>
                  </Box>
                </Box>
              )}

              {activeSection === "logo" && (
                <Box
                  key="logo"
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                    transformOrigin: "center top",
                    animation:
                      "settingsTabEnter 420ms cubic-bezier(0.16, 1, 0.3, 1) both",
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, color: "text.primary" }}
                  >
                    Sidebar Logo Settings
                  </Typography>
                  {role === "admin" && (
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "1fr",
                          sm: "repeat(2, max-content)",
                        },
                        gap: 2,
                        alignItems: "start",
                      }}
                    >
                      <Box sx={{ width: { xs: "100%", sm: 170 } }}>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          Sidebar Width: {brandingInput.sidebarWidth}px
                        </Typography>
                        <Slider
                          value={brandingInput.sidebarWidth}
                          min={150}
                          max={360}
                          step={10}
                          marks={[
                            { value: 150, label: "Small" },
                            { value: 280, label: "Medium" },
                            { value: 360, label: "Large" },
                          ]}
                          onChange={(_, value) =>
                            setBrandingInput((prev) => ({
                              ...prev,
                              sidebarWidth: value as number,
                            }))
                          }
                          sx={{
                            width: "100%",
                            "& .MuiSlider-markLabel": {
                              fontSize: "0.62rem",
                              whiteSpace: "nowrap",
                            },
                          }}
                        />
                      </Box>
                      <Box sx={{ width: { xs: "100%", sm: 170 } }}>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          Sidebar Height: {brandingInput.sidebarHeight}%
                        </Typography>
                        <Slider
                          value={brandingInput.sidebarHeight}
                          min={40}
                          max={100}
                          step={5}
                          marks={[
                            { value: 40, label: "Short" },
                            { value: 70, label: "Medium" },
                            { value: 100, label: "Full" },
                          ]}
                          onChange={(_, value) =>
                            setBrandingInput((prev) => ({
                              ...prev,
                              sidebarHeight: value as number,
                            }))
                          }
                          sx={{
                            width: "100%",
                            "& .MuiSlider-markLabel": {
                              fontSize: "0.62rem",
                              whiteSpace: "nowrap",
                            },
                          }}
                        />
                      </Box>
                    </Box>
                  )}
                  <TextField
                    label="Logo Text"
                    value={brandingInput.logoText}
                    disabled={!brandingInput.logoTextEnabled}
                    inputProps={{ maxLength: LOGO_TEXT_MAX_LENGTH }}
                    helperText={`${brandingInput.logoText.length}/${LOGO_TEXT_MAX_LENGTH} characters`}
                    onChange={(event) =>
                      setBrandingInput((prev) => ({
                        ...prev,
                        logoText: event.target.value.slice(
                          0,
                          LOGO_TEXT_MAX_LENGTH
                        ),
                      }))
                    }
                    InputProps={{ sx: { borderRadius: 2 } }}
                    sx={{ width: { xs: "100%", sm: 220 }, maxWidth: "100%" }}
                  />
                  {role === "admin" && (
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "1fr",
                          sm: "max-content repeat(2, 165px)",
                        },
                        columnGap: 5,
                        rowGap: 1.5,
                        alignItems: "start",
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Switch
                            checked={brandingInput.logoTextEnabled}
                            onChange={(event) =>
                              setBrandingInput((prev) => ({
                                ...prev,
                                logoTextEnabled: event.target.checked,
                              }))
                            }
                          />
                        }
                        label="Show Logo Text"
                      />
                      <Box sx={{ width: { xs: "100%", sm: 165 } }}>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          Text Size: {brandingInput.logoTextSize}px
                        </Typography>
                        <Slider
                          value={brandingInput.logoTextSize}
                          min={LOGO_TEXT_MIN_SIZE}
                          max={LOGO_TEXT_MAX_SIZE}
                          step={1}
                          marks={[
                            { value: LOGO_TEXT_MIN_SIZE, label: "8px" },
                            { value: LOGO_TEXT_MAX_SIZE, label: "12px" },
                          ]}
                          disabled={!brandingInput.logoTextEnabled}
                          onChange={(_, value) =>
                            setBrandingInput((prev) => ({
                              ...prev,
                              logoTextSize: value as number,
                            }))
                          }
                          sx={{
                            width: "100%",
                            "& .MuiSlider-markLabel": {
                              fontSize: "0.62rem",
                              whiteSpace: "nowrap",
                            },
                          }}
                        />
                      </Box>
                      <Box sx={{ width: { xs: "100%", sm: 165 } }}>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          Text Width: {brandingInput.logoTextWidth}px
                        </Typography>
                        <Slider
                          value={brandingInput.logoTextWidth}
                          min={60}
                          max={220}
                          step={5}
                          marks={[
                            { value: 60, label: "60px" },
                            { value: 220, label: "220px" },
                          ]}
                          disabled={!brandingInput.logoTextEnabled}
                          onChange={(_, value) =>
                            setBrandingInput((prev) => ({
                              ...prev,
                              logoTextWidth: value as number,
                            }))
                          }
                          sx={{
                            width: "100%",
                            "& .MuiSlider-markLabel": {
                              fontSize: "0.62rem",
                              whiteSpace: "nowrap",
                            },
                          }}
                        />
                      </Box>
                    </Box>
                  )}
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Button
                      component="label"
                      variant="outlined"
                      disabled={!brandingInput.logoIconEnabled}
                      sx={{ textTransform: "none" }}
                    >
                      {logoIconFile
                        ? logoIconFile.name
                        : "Choose Logo Icon Image"}
                      <input
                        hidden
                        type="file"
                        accept="image/png,image/jpeg"
                        onChange={(event) =>
                          setLogoIconFile(event.target.files?.[0] || null)
                        }
                      />
                    </Button>
                    {role === "admin" && (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={brandingInput.logoIconEnabled}
                            onChange={(event) =>
                              setBrandingInput((prev) => ({
                                ...prev,
                                logoIconEnabled: event.target.checked,
                              }))
                            }
                          />
                        }
                        label="Show Logo Image"
                        sx={{
                          m: 0,
                          "& .MuiFormControlLabel-label": {
                            whiteSpace: "nowrap",
                          },
                        }}
                      />
                    )}
                  </Box>
                  {role === "admin" && (
                    <>
                      <Typography variant="caption" color="text.secondary">
                        Recommended logo icon: 128 × 128px square PNG or JPG
                        (displayed at 34 × 34px). Maximum file size: 5MB.
                      </Typography>
                    </>
                  )}
                  {brandingInput.logoIconEnabled &&
                    (logoIconFile || brandingInput.logoIcon) && (
                      <Box
                        component="img"
                        src={
                          logoIconFile
                            ? URL.createObjectURL(logoIconFile)
                            : `${import.meta.env.VITE_API_BASE_URL}${
                                brandingInput.logoIcon
                              }`
                        }
                        alt="Logo icon preview"
                        sx={{
                          width: 64,
                          height: 64,
                          objectFit: "contain",
                          alignSelf: "center",
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: 1,
                          p: 0.5,
                        }}
                      />
                    )}
                </Box>
              )}
            </Stack>
          )}
        </Box>
      </Box>
    </MapBackgroundPage>
  );
};
