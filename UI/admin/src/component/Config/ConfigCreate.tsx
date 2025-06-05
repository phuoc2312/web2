import { Create, SimpleForm, TextInput, SelectInput } from "react-admin";

export const ConfigCreate = () => (
  <Create>
    <SimpleForm>
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
    </SimpleForm>
  </Create>
);