import { List, Datagrid, TextField, EmailField, DeleteButton, FunctionField } from 'react-admin';

export const UserList = () => (
    <List>
        <Datagrid>
            <TextField source="userId" label="User ID" />
            <FunctionField
                label="Name"
                render={record => `${record.firstName || ''} ${record.lastName || ''}`}
            />
            <EmailField source="email" label="Email" />
            <FunctionField
                label="Role"
                render={record =>
                    Array.isArray(record.roles)
                        ? record.roles.map(role => role.roleName).join(', ')
                        : ''
                }
            />
            <TextField source="mobileNumber" label="Phone" />
            <FunctionField
                label="Address"
                render={record =>
                    record.address
                        ? `${record.address.street || ''}, ${record.address.buildingName || ''}`
                        : ''
                }
            />
            <DeleteButton />
        </Datagrid>
    </List>
);