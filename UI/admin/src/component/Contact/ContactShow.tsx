// src/component/Contact/ContactShow.tsx
import React from 'react';
import { Show, SimpleShowLayout, TextField, EmailField, FunctionField } from 'react-admin';

export const ContactShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="contactId" label="ID" />
      <TextField source="name" label="Họ tên" />
      <EmailField source="email" label="Email" />
      <TextField source="message" label="Tin nhắn" />
      <FunctionField
        label="Trạng thái"
        render={(record: any) => (record.status === 'NEW' ? 'Mới' : record.status)}
      />
    </SimpleShowLayout>
  </Show>
);