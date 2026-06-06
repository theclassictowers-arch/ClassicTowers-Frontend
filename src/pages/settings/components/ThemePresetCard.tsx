import { Box, Button } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { alpha } from "@mui/material/styles";
import type { DashboardThemeColors } from "../../../theme";

type ThemePresetCardProps = {
  colors: DashboardThemeColors;
  isSelected: boolean;
  name: string;
  onSelect: () => void;
};

const getPresetGradient = (colors: DashboardThemeColors) =>
  `conic-gradient(${colors.primaryColor} 0 25%, ${colors.textColor} 25% 50%, ${colors.backgroundColor} 50% 75%, ${alpha(
    colors.primaryColor,
    0.34
  )} 75% 100%)`;

export const ThemePresetCard = ({
  colors,
  isSelected,
  name,
  onSelect,
}: ThemePresetCardProps) => (
  <Button
    aria-label={name}
    type="button"
    onClick={onSelect}
    sx={{
      aspectRatio: "1 / 1",
      bgcolor: "action.hover",
      border: "1px solid",
      borderColor: isSelected ? "primary.main" : "divider",
      borderRadius: 2,
      minWidth: 0,
      p: 0,
      position: "relative",
      "&:hover": {
        bgcolor: "action.selected",
        borderColor: "primary.main",
      },
    }}
  >
    <Box
      sx={{
        background: getPresetGradient(colors),
        border: "1px solid",
        borderColor: alpha("#000000", 0.14),
        borderRadius: "50%",
        height: 64,
        width: 64,
      }}
    />
    {isSelected && (
      <Box
        sx={{
          alignItems: "center",
          bgcolor: "primary.main",
          border: "2px solid",
          borderColor: "background.paper",
          borderRadius: "50%",
          color: "primary.contrastText",
          display: "flex",
          height: 30,
          justifyContent: "center",
          position: "absolute",
          right: 12,
          top: 12,
          width: 30,
        }}
      >
        <CheckIcon fontSize="small" />
      </Box>
    )}
  </Button>
);
