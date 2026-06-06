import {
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
  Paper,
  TextField,
  Divider,
} from "@mui/material";
import { Edit } from "@refinedev/mui";
import { useForm } from "@refinedev/react-hook-form";
import { useNavigate } from "react-router-dom";
import { formStyles } from "../auth/styles";
import { MovableForm } from "../../components/movable-form";
import { AxisLimitInputGroup, LimitInputGroup, SectionHeading, SubSectionHeading } from "./components/LimitInputGroup";

export const LimitsEdit = () => {
  const navigate = useNavigate();
  const {
    saveButtonProps,
    register,
    formState: { errors },
  } = useForm();

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <MovableForm
        panelId="limits-edit-form"
        initialWidth={760}
        minWidth={460}
        maxWidth={1250}
        onClose={() => navigate("/limits")}
      >
        <Card
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
              Edit Sensor Limits Configuration
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box component="form" autoComplete="off">
              <Grid container spacing={1.5} sx={{ mb: 2 }}>
                <Grid item xs={12} md={6}>
                  <TextField
                    {...register("vibrationSensor.sensorId")}
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
                    {...register("windSensor.sensorId")}
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
                  {/* Vibration Parameters */}
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

                  {/* Environmental Parameters */}
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
                        sx={{
                          p: 2,
                          borderRadius: 1,
                          backgroundColor: "#333",
                        }}
                      >
                        <LimitInputGroup register={register} errors={errors} prefix="windTemperature" />
                      </Paper>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <SectionHeading title="Humidity" />
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: 1,
                          backgroundColor: "#333",
                        }}
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
                        sx={{
                          p: 2,
                          borderRadius: 1,
                          backgroundColor: "#333",
                        }}
                      >
                        <SubSectionHeading title="Roll Angle" />
                        <LimitInputGroup register={register} errors={errors} prefix="vibrationRollAngle" title="Roll Angle" />
                      </Paper>
                    </Box>
                  </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </MovableForm>
    </Edit>
  );
};

export default LimitsEdit;

