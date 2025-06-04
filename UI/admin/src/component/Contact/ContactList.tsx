import { useState } from 'react';
import { List, Datagrid, TextField, EmailField, FunctionField, Button, useDataProvider, useNotify, useRefresh } from 'react-admin';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

export const ContactList = () => {
    const dataProvider = useDataProvider();
    const notify = useNotify();
    const refresh = useRefresh();
    const [open, setOpen] = useState(false);
    const [selectedContactId, setSelectedContactId] = useState<number | null>(null);
    const [selectedContactEmail, setSelectedContactEmail] = useState<string | null>(null);

    const handleOpen = (id: number, email: string) => (e: React.MouseEvent) => {
        e.stopPropagation(); // Ngăn sự kiện lan truyền
        setSelectedContactId(id);
        setSelectedContactEmail(email);
        setOpen(true);
    };

    const handleClose = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setOpen(false);
        setSelectedContactId(null);
        setSelectedContactEmail(null);
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();

        if (!selectedContactId) {
            notify('Không tìm thấy ID contact', { type: 'error' });
            return;
        }

        try {
            await dataProvider.delete('contacts', { id: selectedContactId });
            notify('Xóa contact thành công!', { type: 'success' });
            setOpen(false);
            setSelectedContactId(null);
            setSelectedContactEmail(null);
            refresh(); // Làm mới danh sách
        } catch (error) {
            notify('Xóa contact thất bại', { type: 'error' });
            console.error('Lỗi khi xóa:', error);
        }
    };

    return (
        <>
            <List sort={{ field: 'contactId', order: 'ASC' }}>
                <Datagrid rowClick="show">
                    <TextField source="contactId" label="ID" />
                    <TextField source="name" label="Họ tên" />
                    <EmailField source="email" label="Email" />
                    <TextField source="message" label="Tin nhắn" />
                    <FunctionField
                        label="Trạng thái"
                        render={(record: any) => (record.status === 'NEW' ? 'Mới' : record.status)}
                    />
                    <FunctionField
                        label="Hành động"
                        render={(record: any) => (
                            <Button
                                onClick={handleOpen(record.contactId, record.email)}
                                color="error"
                                startIcon={<DeleteIcon />}
                            />
                        )}
                    />
                </Datagrid>
            </List>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Xác nhận xóa</DialogTitle>
                <DialogContent>
                    <Typography>
                        Bạn có chắc chắn muốn xóa contact với email "{selectedContactEmail}"?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        label="Hủy"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleClose();
                        }}
                    />
                    <Button
                        label="Xóa"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(e);
                        }}
                        color="error"
                    />
                </DialogActions>
            </Dialog>
        </>
    );
};