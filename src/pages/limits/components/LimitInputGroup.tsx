import { Paper, TextField, Typography } from "@mui/material";
import type { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";

const LIMIT_DOMAINS = ["green", "yellow", "red"];

export const SectionHeading = ({ title }: { title: string }) => (
  <Typography
    variant="h6"
    sx={{
      mt: 1.5,
      mb: 1,
      fontSize: "1rem",
      fontWeight: 600,
      color: (theme) => theme.palette.text.primary,
    }}
  >
    {title}
  </Typography>
);

export const SubSectionHeading = ({ title }: { title: string }) => (
  <Typography
    variant="caption"
    sx={{
      display: "block",
      mb: 0.5,
      color: (theme) => theme.palette.text.secondary,
      fontWeight: 500,
    }}
  >
    {title}
  </Typography>
);

type LimitInputGroupProps = {
  axis?: string;
  errors: FieldErrors<FieldValues>;
  prefix: string;
  register: UseFormRegister<FieldValues>;
  title?: string;
};

const getLimitError = (
  errors: FieldErrors<FieldValues>,
  prefix: string,
  axis: string,
  domain: string,
  bound: "min" | "max"
) =>
  (errors as any)?.[prefix]?.[axis]?.[domain]?.[bound]?.message?.toString();

export const LimitInputGroup = ({
  axis = "",
  errors,
  prefix,
  register,
  title,
}: LimitInputGroupProps) => (
  <Paper
    elevation={0}
    sx={{
      p: 2,
      mb: 1,
      backgroundColor: "#333",
      borderRadius: 2,
    }}
  >
    {title && <SubSectionHeading title={title} />}
    {LIMIT_DOMAINS.flatMap((domain) =>
      (["max", "min"] as const).map((bound) => {
        const errorMessage = getLimitError(errors, prefix, axis, domain, bound);
        const domainLabel = domain.charAt(0).toUpperCase() + domain.slice(1);
        const axisLabel = axis ? ` (${axis.toUpperCase()})` : "";

        return (
          <TextField
            key={`${prefix}-${axis}-${domain}-${bound}`}
            {...register(`${prefix}.${axis}.${domain}.${bound}`, {
              valueAsNumber: true,
            })}
            error={!!errorMessage}
            helperText={errorMessage}
            margin="dense"
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
            type="number"
            label={`${domainLabel} ${
              bound.charAt(0).toUpperCase() + bound.slice(1)
            }${axisLabel}`}
          />
        );
      })
    )}
  </Paper>
);

type AxisLimitInputGroupProps = Omit<LimitInputGroupProps, "title"> & {
  axis: string;
};

export const AxisLimitInputGroup = (props: AxisLimitInputGroupProps) => (
  <LimitInputGroup {...props} title={`${props.axis.toUpperCase()} Axis`} />
);
