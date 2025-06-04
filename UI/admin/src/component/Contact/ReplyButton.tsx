import { useState } from 'react';
import { Button, useRecordContext, useNotify, useDataProvider } from 'react-admin';
import emailjs from '@emailjs/browser';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';

const ReplyButton = () => {
    const record = useRecordContext();
    const notify = useNotify();
    const dataProvider = useDataProvider();
    const [open, setOpen] = useState(false);
    const [replyMessage, setReplyMessage] = useState('');

    const handleOpen = (e: React.MouseEvent) => {
        e.stopPropagation(); // Ngăn không cho Datagrid mở trang Show
        setOpen(true);
    };

    const handleClose = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation(); // Ngăn sự kiện lan truyền khi đóng bằng nút
        setOpen(false);
    };

    const handleSend = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Ngăn không cho Dialog đóng ngay lập tức

        if (!replyMessage.trim()) {
            notify('Vui lòng nhập nội dung trả lời', { type: 'error' });
            return;
        }

        try {
            // Gửi email phản hồi
            await emailjs.send(
                'service_rwxo0mm',
                'template_k0rcirr',
                {
                    to_email: record.email,
                    to_name: record.name || 'Khách hàng',
                    original_message: record.message,
                    admin_reply: replyMessage,
                    admin_name: 'MHP Store',
                },
                'tGyWcv9aFaDu0nXq7'
            );

            // Cập nhật trạng thái contact
            await dataProvider.update('contacts', {
                id: record.contactId,
                data: {
                    name: record.name,
                    email: record.email,
                    message: record.message,
                    status: 'REPLIED', // Cập nhật trạng thái thành REPLIED
                },
                previousData: record,
            });

            notify('Gửi phản hồi thái thành công!', { type: 'success' });
            setReplyMessage('');
            setOpen(false);
        } catch (error) {
            notify('Gửi phản hồi thái thành công!', { type: 'success' });
            console.error(error);
        }
    };

    return (
        <>
            <Button label="Trả lời" onClick={handleOpen} />

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Trả lời {record?.email}</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Tin nhắn gốc"
                        value={record?.message}
                        fullWidth
                        multiline
                        rows={4}
                        disabled
                        margin="dense"
                    />
                    <TextField
                        label="Phản hồi của bạn"
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        fullWidth
                        multiline
                        rows={4}
                        margin="dense"
                    />
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
                        label="Gửi"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleSend(e);
                        }}
                    />
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ReplyButton;