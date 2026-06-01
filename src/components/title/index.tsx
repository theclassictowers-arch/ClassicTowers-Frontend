import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import MemoryIcon from "@mui/icons-material/Memory";
import { useTheme } from "@mui/material/styles";
import { HamburgerMenu } from "@refinedev/mui";
import LogoTextBlack from "../../assets/images/logo_text_black.png";
import LogoTextWhite from "../../assets/images/logo_text_white.png";

type TitleProps = {
  collapsed: boolean;
};

export const Title: React.FC<TitleProps> = ({ collapsed }) => {
  const theme = useTheme();

  const logoText =
    theme.palette.mode === "light" ? LogoTextBlack : LogoTextWhite;

  return (
    <Link to="/">
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        gap={collapsed ? 0 : "8px"}
        sx={{
          padding: "8px",
          borderRadius: "4px",
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          position: "relative",
          overflow: "hidden",
          "&:hover": {
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          },
        }}
      >
        {collapsed ? (
          <Box
            sx={{
              width: "100%", // Take full width of parent
              display: "flex",
              justifyContent: "center", // Center horizontally
              alignItems: "center", // Center vertically
              p: 0.5,
            }}
          >
            <Box
              sx={{
                color: theme.palette.mode === "light" ? "#0b70c2" : "#fff",
                padding: 0,
                display: "flex",
                justifyContent: "center",
                paddingLeft: 3,
              }}
            >
              <HamburgerMenu />
            </Box>
          </Box>
        ) : (
          <Box display="flex" alignItems="center" gap={2}>
            <MemoryIcon
              sx={{
                fontSize: 32,
                color: theme.palette.mode === "light" ? "#0b70c2" : "#67B7F7",
                "&:active": {
                  color: theme.palette.mode === "light" ? "#0b70c2" : "#fff",
                  backgroundColor:
                    theme.palette.mode === "light" ? "#f5f5f5" : "#000",
                },
              }}
            />
            <Box display="flex" flexDirection="column" alignItems="center">
              <img
                src={logoText}
                width={120}
                alt="PLC Logo"
                style={{
                  filter: `drop-shadow(0 1px 2px ${theme.palette.divider})`,
                }}
              />
            </Box>
          </Box>
        )}
      </Box>
    </Link>
  );
};
