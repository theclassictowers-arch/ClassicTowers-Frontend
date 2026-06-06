import {
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
  Paper,
  TextField,
  Divider,
  Button,
  CircularProgress,
} from "@mui/material";
import { useState } from "react";
import { useForm, type FieldValues, type SubmitHandler } from "react-hook-form";
import { useNotification } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import { formStyles } from "../auth/styles";
import { MovableForm } from "../../components/movable-form";
import { AxisLimitInputGroup, LimitInputGroup, SectionHeading, SubSectionHeading } from "./components/LimitInputGroup";
import { MapBackgroundPage } from "../../components/map-background-page";
import { axiosInstance } from "../../utils";

export const LimitsCreate = () => {
  const navigate = useNavigate();
  const { open } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FieldValues>({ mode: "onChange" });

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setIsLoading(true);
    try {
      await axiosInstance.post("/limits", data);

      open?.({
        type: "success",
        message: "Sensor limits created successfully!",
        description: "The sensor configuration has been added.",
      });

      reset();
      navigate("/limits");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      open?.({
        type: "error",
        message: "Failed to create sensor limits",
        description: err.response?.data?.message || "An error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MapBackgroundPage>
      <MovableForm
        panelId="limits-create-form"
        initialWidth={760}
        minWidth={460}
        maxWidth={1250}
        onClose={() => navigate("/limits")}
      >
        <Card
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{
            ...formStyles.container,
            m: 0,
            width: "100%",
            maxWidth: "100%",
            maxHeight: "90vh",
            overflowY: "auto",
            borderRadius: 2,
            boxShadow: (theme) => theme.shadows[5],
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="h5"
              gutterBottom
              sx={{
                fontWeight: 700,
                color: (theme) => theme.palette.text.primary,
                mb: 2,
              }}
            >
              Create Sensor Limits Configuration
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box component="form" autoComplete="off">
              <Grid container spacing={1.5} sx={{ mb: 2 }}>
                <Grid item xs={12} md={6}>
                  <TextField
                    {...register("vibrationSensor.sensorId", {
                      required: "Vibration Sensor ID is required",
                    })}
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    label="Vibration Sensor ID"
                    error={!!(errors as any)?.vibrationSensor?.sensorId}
                    helperText={
                      (errors as any)?.vibrationSensor?.sensorId?.message?.toString()
                    }
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    {...register("windSensor.sensorId", {
                      required: "Wind Sensor ID is required",
                    })}
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    label="Wind Sensor ID"
                    error={!!(errors as any)?.windSensor?.sensorId}
                    helperText={(errors as any)?.windSensor?.sensorId?.message?.toString()}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2.5}>
                <Grid item xs={12} md={6}>
                  <SectionHeading title="Vibration Parameters" />

                  <Box sx={{ mb: 2 }}>
                    <SectionHeading title="Angle" />
                    {["x", "y", "z"].map((axis) => (
                      <AxisLimitInputGroup
                        key={`angle-${axis}`}
                        prefix="vibrationAngle"
                        axis={axis}
                        register={register}
                        errors={errors}
                      />
                    ))}
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <SectionHeading title="Displacement" />
                    {["x", "y", "z"].map((axis) => (
                      <AxisLimitInputGroup
                        key={`displacement-${axis}`}
                        prefix="vibrationDisplacement"
                        axis={axis}
                        register={register}
                        errors={errors}
                      />
                    ))}
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <SectionHeading title="Speed" />
                    {["x", "y", "z"].map((axis) => (
                      <AxisLimitInputGroup
                        key={`speed-${axis}`}
                        prefix="vibrationSpeed"
                        axis={axis}
                        register={register}
                        errors={errors}
                      />
                    ))}
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <SectionHeading title="Frequency" />
                    {["x", "y", "z"].map((axis) => (
                      <AxisLimitInputGroup
                        key={`frequency-${axis}`}
                        prefix="vibrationFrequency"
                        axis={axis}
                        register={register}
                        errors={errors}
                      />
                    ))}
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <SectionHeading title="Environmental Parameters" />

                  <Box sx={{ mb: 2 }}>
                    <SectionHeading title="Wind" />
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        mb: 2,
                        borderRadius: 1,
                        backgroundColor: "#333",
                      }}
                    >
                      <SubSectionHeading title="Direction" />
                      <LimitInputGroup register={register} errors={errors} prefix="windDirection" title="Direction" />
                    </Paper>

                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 1,
                        backgroundColor: "#333",
                      }}
                    >
                      <SubSectionHeading title="Speed" />
                      <LimitInputGroup register={register} errors={errors} prefix="windSpeed" title="Speed" />
                    </Paper>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <SectionHeading title="Temperature" />
                    <Paper
                      elevation={0}
                      sx={{ p: 2, borderRadius: 1, backgroundColor: "#333" }}
                    >
                      <LimitInputGroup register={register} errors={errors} prefix="windTemperature" />
                    </Paper>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <SectionHeading title="Humidity" />
                    <Paper
                      elevation={0}
                      sx={{ p: 2, borderRadius: 1, backgroundColor: "#333" }}
                    >
                      <LimitInputGroup register={register} errors={errors} prefix="windHumidity" />
                    </Paper>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <SectionHeading title="Orientation" />
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        mb: 2,
                        borderRadius: 1,
                        backgroundColor: "#333",
                      }}
                    >
                      <SubSectionHeading title="Pitch Angle" />
                      <LimitInputGroup
                        register={register}
                        errors={errors}
                        prefix="vibrationPitchAngle"
                        title="Pitch Angle"
                      />
                    </Paper>

                    <Paper
                      elevation={0}
                      sx={{ p: 2, borderRadius: 1, backgroundColor: "#333" }}
                    >
                      <SubSectionHeading title="Roll Angle" />
                      <LimitInputGroup register={register} errors={errors} prefix="vibrationRollAngle" title="Roll Angle" />
                    </Paper>
                  </Box>
                </Grid>
              </Grid>

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{
                  ...formStyles.submitButton,
                  mt: 1,
                  opacity: isLoading ? 0.6 : 1,
                }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Create Sensor"
                )}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </MovableForm>
    </MapBackgroundPage>
  );
};

export default LimitsCreate;

