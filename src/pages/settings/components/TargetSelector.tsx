import { FormControl, InputLabel, MenuItem, Select, Typography } from "@mui/material";
import type { OrganizationUser } from "../types";

type TargetSelectorProps = {
  currentUserId: string | null;
  loading: boolean;
  organizations: OrganizationUser[];
  role?: string;
  selectedTargetUserId: string;
  // eslint-disable-next-line no-unused-vars
  onTargetUserChange: (...args: [string]) => void;
};

export const TargetSelector = ({
  currentUserId,
  loading,
  organizations,
  role,
  selectedTargetUserId,
  onTargetUserChange,
}: TargetSelectorProps) => {
  if (role !== "admin") {
    return (
      <Typography sx={{ textAlign: "center", color: "text.secondary" }}>
        My Organization
      </Typography>
    );
  }

  return (
    <FormControl fullWidth size="small">
      <InputLabel id="settings-target-label">Target</InputLabel>
      <Select
        labelId="settings-target-label"
        label="Target"
        value={selectedTargetUserId}
        disabled={loading}
        onChange={(event) => onTargetUserChange(String(event.target.value))}
      >
        <MenuItem value={currentUserId || ""}>My Account (Admin)</MenuItem>
        {organizations.map((org) => (
          <MenuItem key={org._id} value={org._id}>
            {org.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
