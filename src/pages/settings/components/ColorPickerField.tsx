import { Stack, TextField, Typography } from "@mui/material";

type ColorPickerFieldProps = {
  fallbackColor: string;
  label: string;
  value: string;
  // eslint-disable-next-line no-unused-vars
  onChange: (...args: [string]) => void;
};

const isHexColor = (value: string) => /^#([A-Fa-f0-9]{6})$/.test(value.trim());

export const ColorPickerField = ({
  fallbackColor,
  label,
  value,
  onChange,
}: ColorPickerFieldProps) => (
  <Stack spacing={0.5} sx={{ width: "100%", maxWidth: 260 }}>
    <Typography variant="caption" sx={{ fontWeight: 700 }}>
      {label}
    </Typography>
    <TextField
      fullWidth
      type="color"
      value={isHexColor(value) ? value : fallbackColor}
      onChange={(event) => onChange(event.target.value)}
      sx={{ "& input": { height: 48, cursor: "pointer" } }}
      inputProps={{ "aria-label": `Pick ${label.toLowerCase()}` }}
    />
  </Stack>
);
