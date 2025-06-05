import { List, Datagrid, TextField, DateField, TextInput } from "react-admin";

export const ConfigList = () => (
  <List filters={configFilters}>
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <TextField source="siteName" label="Site Name" />
      <TextField source="email" />
      <TextField source="phone" />
      <TextField source="address" />
      <TextField source="hotline" />
      <TextField source="status" />
      <DateField source="createdAt" label="Created At" />
      <DateField source="updatedAt" label="Updated At" />
    </Datagrid>
  </List>
);

const configFilters = [
  <TextInput label="Search Site Name" source="siteName" alwaysOn />,
  <TextInput label="Search Email" source="email" />,
];