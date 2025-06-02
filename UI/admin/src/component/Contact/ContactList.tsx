// src/component/Contact/ContactList.tsx
import { List, Datagrid, TextField, EmailField, FunctionField, TextInput, SelectInput } from 'react-admin';

const contactFilters = [
  <TextInput label="Tìm kiếm theo tên" source="search" alwaysOn />,
  <SelectInput
    label="Trạng thái"
    source="status"
    choices={[
      { id: 'NEW', name: 'Mới' },
      { id: 'REPLIED', name: 'Đã trả lời' },
      { id: 'CLOSED', name: 'Đã đóng' },
    ]}
  />,
];

export const ContactList = () => (
  <List filters={contactFilters}>
    <Datagrid rowClick="show">
      <TextField source="contactId" label="ID" />
      <TextField source="name" label="Họ tên" />
      <EmailField source="email" label="Email" />
      <TextField source="message" label="Tin nhắn" />
      <FunctionField
        label="Trạng thái"
        render={(record: any) => (record.status === 'NEW' ? 'Mới' : record.status)}
      />
    </Datagrid>
  </List>
);