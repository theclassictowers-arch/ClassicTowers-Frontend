import React, { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import LockResetOutlinedIcon from "@mui/icons-material/LockResetOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import { useNotification } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { alpha } from "@mui/material/styles";
import { MapBackgroundPage } from "../../components/map-background-page";
import { ShowPageLogo } from "../../components/map-table-page";
import { useAuthContext } from "../../contexts";
import { axiosInstance, ROLE_LABELS } from "../../utils";
import { formStyles } from "../auth/styles";

const { VITE_API_BASE_URL } = import.meta.env;

type ProfileFormValues = {
  name: string;
  email: string;
  profilePicture: File | string | null;
};

const formatRole = (role?: string | null) => {
  if (!role) return "User";
  return ROLE_LABELS[role as keyof typeof ROLE_LABELS] || role;
};

export const ProfilePage: React.FC = () => {
  const { role } = useAuthContext();
  const { open } = useNotification();
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const [activeTab, setActiveTab] = useState<"profile" | "password" | "settings">(
    "profile"
  );
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [storedProfilePath, setStoredProfilePath] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<ProfileFormValues>({
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      profilePicture: null,
    },
  });

  const watchedName = watch("name");
  const watchedEmail = watch("email");

  const avatarSrc = useMemo(
    () =>
      previewUrl ||
      (storedProfilePath ? `${VITE_API_BASE_URL}${storedProfilePath}` : ""),
    [previewUrl, storedProfilePath]
  );

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      setIsInitialLoading(true);
      try {
        const response = await axiosInstance.get(`/users/${userId}`);
        const record = response.data?.data || response.data || {};
        const profilePicturePath =
          typeof record.profilePicture === "string" ? record.profilePicture : "";

        setStoredProfilePath(profilePicturePath);
        setValue("name", record.name || "");
        setValue("email", record.email || "");
        setValue("profilePicture", profilePicturePath || null);
      } catch (error: any) {
        open?.({
          type: "error",
          message: "Failed to load profile",
          description: error.response?.data?.message || "Please refresh and try again.",
        });
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, open, setValue, userId]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setValue("profilePicture", file, { shouldDirty: true, shouldValidate: true });
  };

  const onSubmit = async (data: ProfileFormValues) => {
    if (!userId) return;

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("role", role || "");

      if (data.profilePicture instanceof File) {
        formData.append("profilePicture", data.profilePicture);
      }

      await axiosInstance.patch(`/users/${userId}`, formData);

      open?.({
        type: "success",
        message: "Profile updated",
        description: "Your profile details have been saved.",
      });
    } catch (error: any) {
      open?.({
        type: "error",
        message: "Failed to update profile",
        description: error.response?.data?.message || "Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendPasswordOtp = async () => {
    if (!watchedEmail) return;

    setIsSendingOtp(true);
    try {
      await axiosInstance.post("/forgot-password", { email: watchedEmail });
      open?.({
        type: "success",
        message: "Password OTP sent",
        description: "Check your email for the password reset OTP.",
      });
    } catch (error: any) {
      open?.({
        type: "error",
        message: "Failed to send OTP",
        description: error.response?.data?.message || "Please try again.",
      });
    } finally {
      setIsSendingOtp(false);
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
          onSubmit={handleSubmit(onSubmit)}
          sx={{
            ...formStyles.container,
            mx: "auto",
            my: 0,
            width: "100%",
            maxWidth: 560,
            maxHeight: "calc(100dvh - 20px)",
            boxSizing: "border-box",
            px: { xs: 1.5, sm: 2, md: 2.5 },
            py: { xs: 1.25, sm: 1.5 },
            borderRadius: { xs: 1.5, sm: 2 },
            overflowY: "auto",
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "34px minmax(0, 1fr) 34px",
              alignItems: "center",
              gap: 1,
              mb: 1,
            }}
          >
            <Tooltip title="Back to Dashboard">
              <IconButton
                size="small"
                aria-label="Back to Dashboard"
                onClick={() => navigate("/")}
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: "7px",
                  color: "primary.main",
                  border: (theme) =>
                    `1px solid ${alpha(theme.palette.primary.main, 0.42)}`,
                  backgroundColor: (theme) =>
                    alpha(theme.palette.background.paper, 0.72),
                  "&:hover": {
                    backgroundColor: (theme) =>
                      alpha(theme.palette.primary.main, 0.1),
                  },
                }}
              >
                <ArrowBackIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Typography variant="h5" sx={{ ...formStyles.title, mb: 0 }}>
              Profile Settings
            </Typography>
            <Box />
          </Box>

          {isInitialLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={28} />
            </Box>
          ) : (
            <Stack spacing={1.5}>
              <Tabs
                value={activeTab}
                onChange={(_, value: "profile" | "password" | "settings") =>
                  setActiveTab(value)
                }
                variant="fullWidth"
                sx={{
                  minHeight: 42,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1.5,
                  bgcolor: "background.paper",
                  "& .MuiTab-root": {
                    minHeight: 42,
                    fontWeight: 700,
                    textTransform: "none",
                  },
                }}
              >
                <Tab value="profile" icon={<ManageAccountsOutlinedIcon />} iconPosition="start" label="Profile" />
                <Tab value="password" icon={<LockResetOutlinedIcon />} iconPosition="start" label="Password" />
                <Tab value="settings" icon={<TuneOutlinedIcon />} iconPosition="start" label="Settings" />
              </Tabs>

              {activeTab === "profile" && (
                <Stack spacing={1.25}>
                  <Box sx={{ display: "flex", justifyContent: "center", mt: 0.5 }}>
                    <Box sx={{ position: "relative", display: "inline-block" }}>
                      <Avatar
                        src={avatarSrc || undefined}
                        alt={watchedName || "User"}
                        sx={{ width: 96, height: 96, fontSize: "2rem" }}
                      >
                        {(watchedName || "U").charAt(0).toUpperCase()}
                      </Avatar>
                      <Box sx={{ position: "absolute", right: -4, bottom: -4 }}>
                        <input
                          accept="image/*"
                          id="profile-picture-input"
                          type="file"
                          style={{ display: "none" }}
                          onChange={handleFileChange}
                        />
                        <label htmlFor="profile-picture-input">
                          <IconButton color="primary" component="span" size="small">
                            <PhotoCamera />
                          </IconButton>
                        </label>
                      </Box>
                    </Box>
                  </Box>

                  <TextField
                    fullWidth
                    label="Full Name"
                    {...register("name", { required: "Full name is required" })}
                    error={!!errors.name}
                    helperText={errors.name?.message?.toString()}
                    InputProps={{ sx: { borderRadius: 2 } }}
                  />
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Invalid email format",
                      },
                    })}
                    error={!!errors.email}
                    helperText={errors.email?.message?.toString()}
                    InputProps={{ sx: { borderRadius: 2 } }}
                  />
                  <TextField
                    fullWidth
                    label="Role"
                    value={formatRole(role)}
                    disabled
                    InputProps={{ sx: { borderRadius: 2 } }}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={!isValid || isSaving}
                    sx={formStyles.submitButton}
                  >
                    {isSaving ? <CircularProgress size={22} color="inherit" /> : "Save Profile"}
                  </Button>
                </Stack>
              )}

              {activeTab === "password" && (
                <Stack spacing={1.25}>
                  <Typography sx={{ color: "text.secondary", textAlign: "center" }}>
                    Password change ke liye OTP aapke email par send hoga.
                  </Typography>
                  <TextField
                    fullWidth
                    label="Email"
                    value={watchedEmail}
                    disabled
                    InputProps={{ sx: { borderRadius: 2 } }}
                  />
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleSendPasswordOtp}
                    disabled={isSendingOtp || !watchedEmail}
                    sx={formStyles.submitButton}
                  >
                    {isSendingOtp ? (
                      <CircularProgress size={22} color="inherit" />
                    ) : (
                      "Send Password Reset OTP"
                    )}
                  </Button>
                </Stack>
              )}

              {activeTab === "settings" && (
                <Stack spacing={1.25}>
                  <Typography sx={{ color: "text.secondary", textAlign: "center" }}>
                    Theme, font, logo aur baqi dashboard settings yahan se open karen.
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => navigate("/settings")}
                    sx={formStyles.submitButton}
                  >
                    Open Full Settings
                  </Button>
                </Stack>
              )}

              <ShowPageLogo />
            </Stack>
          )}
        </Box>
      </Box>
    </MapBackgroundPage>
  );
};

export default ProfilePage;
