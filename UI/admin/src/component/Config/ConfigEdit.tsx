import { Edit, SimpleForm, TextInput, SelectInput, DateField } from "react-admin";

export const ConfigEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="id" disabled />
      <TextInput source="siteName" label="Site Name" required />
      <TextInput source="email" required />
      <TextInput source="phone" />
      <TextInput source="address" />
      <TextInput source="hotline" />
      <SelectInput
        source="status"
        choices={[
          { id: "ACTIVE", name: "Active" },
          { id: "INACTIVE", name: "Inactive" },
        ]}
      />
      <DateField source="createdAt" label="Created At" />
      <DateField source="updatedAt" label="Updated At" />
    </SimpleForm>
  </Edit>
);