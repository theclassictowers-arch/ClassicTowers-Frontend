// @ts-nocheck
import React, { useEffect } from "react";
import {
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import {
  CreateButton,
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useDataGrid,
} from "@refinedev/mui";
import { useNotification, useShow } from "@refinedev/core";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { axiosInstance } from "../../utils";
import {
  MapTablePage,
  ShowPageLogo,
  TableBottomActions,
  TableCenterLogo,
} from "../../components/map-table-page";
import { MovableForm } from "../../components/movable-form";
import { formStyles } from "../auth/styles";

const configs = {
  menus: {
    title: "Menu",
    fields: [
      { name: "title", label: "Title", required: true },
      { name: "path", label: "Path / URL", required: true, placeholder: "/dashboard or https://example.com" },
      { name: "icon", label: "Icon" },
      { name: "parent", label: "Parent menu", placeholder: "Leave blank for main menu" },
      { name: "order", label: "Display order", type: "number" },
      {
        name: "menuType",
        label: "Link type",
        type: "select",
        options: [
          { value: "internal", label: "Internal page" },
          { value: "external", label: "External URL" },
        ],
      },
      {
        name: "roles",
        label: "Visible to roles",
        placeholder: "admin, organization, team_lead, operator",
        array: true,
      },
      { name: "description", label: "Description", multiline: true },
      { name: "openInNewTab", label: "Open in new tab", type: "boolean" },
      { name: "isActive", label: "Active", type: "boolean" },
    ],
  },
  inventory: {
    title: "Inventory Item",
    fields: [
      { name: "name", label: "Item name", required: true },
      { name: "sku", label: "SKU", required: true },
      { name: "category", label: "Category", required: true },
      { name: "quantity", label: "Quantity", required: true, type: "number" },
      { name: "unit", label: "Unit", placeholder: "pcs" },
      { name: "minimumStock", label: "Minimum stock", type: "number" },
      { name: "location", label: "Location" },
      { name: "description", label: "Description", multiline: true },
      { name: "isActive", label: "Active", type: "boolean" },
    ],
  },
};

const getConfig = (resource) => configs[resource];
const idOf = (row) => row?._id ?? row?.id;

export const AdminCrudList = ({ resource }) => {
  const config = getConfig(resource);
  const { dataGridProps } = useDataGrid({
    resource,
    dataProviderName: "admin",
    pagination: { mode: "client", pageSize: 10 },
  });
  const columns = React.useMemo(() => {
    const fields = config.fields
      .filter((field) => !field.multiline)
      .slice(0, resource === "menus" ? 6 : 7)
      .map((field) => ({
        field: field.name,
        headerName: field.label,
        flex: 1,
        minWidth: 110,
        valueFormatter: field.type === "boolean"
          ? ({ value }) => (value === false ? "No" : "Yes")
          : field.array
            ? ({ value }) => (Array.isArray(value) ? value.join(", ") : value || "")
            : undefined,
      }));
    return [
      ...fields,
      {
        field: "actions",
        headerName: "Actions",
        width: 140,
        sortable: false,
        filterable: false,
        renderCell: ({ row }) => (
          <>
            <ShowButton hideText resource={resource} recordItemId={idOf(row)} />
            <EditButton hideText resource={resource} recordItemId={idOf(row)} />
            <DeleteButton hideText resource={resource} recordItemId={idOf(row)} dataProviderName="admin" />
          </>
        ),
      },
    ];
  }, [config, resource]);
  const rows = Array.isArray(dataGridProps.rows) ? dataGridProps.rows : [];

  return (
    <MapTablePage>
      <List title={`${config.title} Management`} headerButtons={() => null}>
        <div style={{ position: "relative" }}>
          <DataGrid
            {...dataGridProps}
            rows={rows}
            columns={columns}
            getRowId={idOf}
            autoHeight
            rowHeight={40}
            columnHeaderHeight={40}
            paginationMode="client"
            sortingMode="client"
            filterMode="client"
            slots={{ toolbar: GridToolbar }}
            slotProps={{ toolbar: { showQuickFilter: true } }}
          />
          <TableBottomActions createButton={<CreateButton resource={resource} />} />
          <TableCenterLogo />
        </div>
      </List>
    </MapTablePage>
  );
};

export const AdminCrudForm = ({ resource, mode }) => {
  const config = getConfig(resource);
  const { id } = useParams();
  const navigate = useNavigate();
  const { open } = useNotification();
  const [loading, setLoading] = React.useState(mode === "edit");
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    defaultValues: { isActive: true, openInNewTab: false, menuType: "internal" },
  });

  useEffect(() => {
    if (mode !== "edit" || !id) return;
    axiosInstance.get(`/${resource}/${id}`)
      .then(({ data }) => {
        const record = data?.data ?? data;
        config.fields.filter((field) => field.array).forEach((field) => {
          if (Array.isArray(record?.[field.name])) record[field.name] = record[field.name].join(", ");
        });
        reset(record);
      })
      .catch((error) => {
        open?.({ type: "error", message: `Could not load ${config.title}`, description: error?.response?.data?.message });
        navigate(`/${resource}`);
      })
      .finally(() => setLoading(false));
  }, [config.title, id, mode, navigate, open, reset, resource]);

  const submit = async (values) => {
    setLoading(true);
    const payload = { ...values };
    config.fields.filter((field) => field.type === "number").forEach((field) => {
      payload[field.name] = Number(payload[field.name] || 0);
    });
    config.fields.filter((field) => field.array).forEach((field) => {
      payload[field.name] = Array.isArray(payload[field.name])
        ? payload[field.name]
        : String(payload[field.name] || "")
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
    });
    try {
      if (mode === "edit") await axiosInstance.patch(`/${resource}/${id}`, payload);
      else await axiosInstance.post(`/${resource}`, payload);
      open?.({ type: "success", message: `${config.title} ${mode === "edit" ? "updated" : "created"} successfully` });
      navigate(`/${resource}`);
    } catch (error) {
      open?.({ type: "error", message: `Could not save ${config.title}`, description: error?.response?.data?.message || error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MovableForm panelId={`${resource}-${mode}`} initialWidth={600} minWidth={360} maxWidth={850} onClose={() => navigate(`/${resource}`)}>
      <Card component="form" onSubmit={handleSubmit(submit)} sx={{ ...formStyles.container, m: 0, width: "100%", maxWidth: "100%" }}>
        <CardContent>
          <Typography variant="h5" sx={formStyles.title}>{mode === "edit" ? "Edit" : "Add"} {config.title}</Typography>
          {loading && mode === "edit" ? <CircularProgress /> : (
            <Grid container spacing={2}>
              {config.fields.map((field) => field.type === "boolean" ? (
                <Grid item xs={12} sm={6} key={field.name}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={Boolean(watch(field.name))}
                        onChange={(event) => setValue(field.name, event.target.checked, { shouldDirty: true })}
                      />
                    }
                    label={field.label}
                  />
                </Grid>
              ) : (
                <Grid item xs={12} sm={field.multiline ? 12 : 6} key={field.name}>
                  <TextField
                    {...register(field.name, { required: field.required ? `${field.label} is required` : false })}
                    label={field.label}
                    type={field.type || "text"}
                    placeholder={field.placeholder}
                    multiline={field.multiline}
                    rows={field.multiline ? 3 : undefined}
                    select={field.type === "select"}
                    error={Boolean(errors[field.name])}
                    helperText={errors[field.name]?.message}
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  >
                    {field.options?.map((option) => (
                      <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
              ))}
              <Grid item xs={12} display="flex" justifyContent="flex-end" gap={1}>
                <Button onClick={() => navigate(`/${resource}`)}>Cancel</Button>
                <Button variant="contained" type="submit" disabled={loading}>{loading ? <CircularProgress size={22} /> : "Save"}</Button>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>
    </MovableForm>
  );
};

export const AdminCrudShow = ({ resource }) => {
  const config = getConfig(resource);
  const navigate = useNavigate();
  const { query } = useShow({ resource, dataProviderName: "admin" });
  const record = query.data?.data || {};
  return (
    <MovableForm panelId={`${resource}-show`} initialWidth={520} minWidth={340} maxWidth={780} onClose={() => navigate(`/${resource}`)}>
      <Card sx={{ ...formStyles.container, m: 0, width: "100%", maxWidth: "100%" }}>
        <CardContent>
          <Typography variant="h5" sx={formStyles.title}>{config.title} Details</Typography>
          {query.isLoading ? <CircularProgress /> : (
            <Stack spacing={1.5}>
              {config.fields.map((field) => (
                <Grid container key={field.name}>
                  <Grid item xs={5}><Typography fontWeight={600}>{field.label}</Typography></Grid>
                  <Grid item xs={7}><Typography>{field.type === "boolean" ? (record[field.name] === false ? "No" : "Yes") : String(record[field.name] ?? "N/A")}</Typography></Grid>
                </Grid>
              ))}
              <Button onClick={() => navigate(`/${resource}`)}>Back</Button>
            </Stack>
          )}
          <ShowPageLogo />
        </CardContent>
      </Card>
    </MovableForm>
  );
};
