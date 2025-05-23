import * as React from 'react';
import {
    Show,
    SimpleShowLayout,
    TextField,
    DateField,
    NumberField,
    FunctionField,
    Labeled,
    useRecordContext,
    useUpdate,
    useNotify,
} from 'react-admin';
import { 
    Stack,
    Chip,
    Typography,
    Box,
    Divider,
    Grid,
    Select,
    MenuItem,
} from '@mui/material';
import { 
    LocalAtm, 
    CreditCard,
    CheckCircle,
    Cancel,
    LocalShipping,
    AssignmentTurnedIn
} from '@mui/icons-material';

// Define TypeScript interfaces
interface OrderItem {
    orderItemId: number;
    product: {
        productId: number;
        productName: string;
        price: number;
    };
    quantity: number;
    discount: number;
    orderedProductPrice: number;
}

interface Payment {
    paymentId: number;
    paymentMethod: string;
}

interface Order {
    orderId: number;
    email: string;
    orderItems: OrderItem[];
    orderDate: string;
    payment: Payment;
    totalAmount: number;
    orderStatus: string;
}

// Danh sách trạng thái đơn hàng
const orderStatuses = [
    'Order Accepted!',
    'Processing',
    'Cancelled',
    'Shipped',
    'Delivered',
];

const OrderStatusChip = () => {
    const record = useRecordContext<Order>();
    const [update, { isLoading }] = useUpdate();
    const notify = useNotify();

    console.log('OrderStatusChip - record:', record);

    if (!record) {
        console.warn('OrderStatusChip: No record found');
        return <Typography>No record available</Typography>;
    }

    if (!record.orderStatus) {
        console.warn('OrderStatusChip: No orderStatus in record');
        return <Typography>No status available</Typography>;
    }

    const statusIcons = {
        'Order Accepted!': <CheckCircle color="success" fontSize="small" />,
        'Processing': <CheckCircle color="info" fontSize="small" />,
        'Cancelled': <Cancel color="error" fontSize="small" />,
        'Shipped': <LocalShipping color="warning" fontSize="small" />,
        'Delivered': <AssignmentTurnedIn color="secondary" fontSize="small" />,
    };

    const handleStatusChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        const newStatus = event.target.value as string;
        console.log('OrderStatusChip - Updating status to:', newStatus);
        update(
            'orders',
            { id: record.orderId, data: { orderStatus: newStatus, email: record.email } },
            { mutationMode: 'pessimistic' }
        )
            .then(() => {
                notify(`Cập nhật trạng thái đơn hàng ${record.orderId} thành công`, { type: 'success' });
            })
            .catch((error: any) => {
                notify(`Lỗi khi cập nhật trạng thái: ${error.message}`, { type: 'error' });
            });
    };

    return (
        <Select
            value={record.orderStatus}
            onChange={handleStatusChange}
            size="small"
            disabled={isLoading}
            sx={{ minWidth: 150 }}
            renderValue={(value) => (
                <Stack direction="row" alignItems="center" gap={1}>
                    {statusIcons[value as string]}
                    <Typography variant="body1">{value}</Typography>
                </Stack>
            )}
        >
            {orderStatuses.map(status => (
                <MenuItem key={status} value={status}>
                    <Stack direction="row" alignItems="center" gap={1}>
                        {statusIcons[status]}
                        <Typography variant="body1">{status}</Typography>
                    </Stack>
                </MenuItem>
            ))}
        </Select>
    );
};

const PaymentMethodChip = () => {
    const record = useRecordContext<Order>();
    if (!record) return null;
    
    return (
        <Stack direction="row" alignItems="center" gap={1}>
            {record.payment.paymentMethod === 'MOMO' ? (
                <LocalAtm color="primary" fontSize="small" />
            ) : (
                <CreditCard color="info" fontSize="small" />
            )}
            <Typography variant="body1">
                {record.payment.paymentMethod} • 
                <Chip 
                    label={record.payment?.paymentId ? 'Đã thanh toán' : 'Chưa thanh toán'} 
                    color={record.payment?.paymentId ? 'success' : 'error'} 
                    size="small"
                    sx={{ ml: 1 }}
                />
            </Typography>
        </Stack>
    );
};

const OrderItemsDetail = () => {
    const record = useRecordContext<Order>();
    if (!record) return null;

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
                Chi tiết sản phẩm
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {record.orderItems.map((item) => (
                <Box key={item.orderItemId} mb={3}>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <Typography variant="body1" fontWeight="medium">
                                {item.product.productName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Giá: {item.product.price.toLocaleString('vi-VN')}₫
                            </Typography>
                        </Grid>
                        <Grid item xs={2}>
                            <Typography variant="body1">
                                Số lượng: {item.quantity}
                            </Typography>
                        </Grid>
                        <Grid item xs={2}>
                            <Typography variant="body1" color="error">
                                Giảm: {item.discount}%
                            </Typography>
                        </Grid>
                        <Grid item xs={2} textAlign="right">
                            <Typography variant="body1" fontWeight="bold">
                                {item.orderedProductPrice.toLocaleString('vi-VN')}₫
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>
            ))}
        </Box>
    );
};

const OrderShow = () => {
    return (
        <Show title="Chi tiết đơn hàng">
            <SimpleShowLayout>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <Labeled label="Mã đơn hàng">
                            <TextField source="orderId" />
                        </Labeled>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Labeled label="Ngày đặt">
                            <DateField 
                                source="orderDate" 
                                locales="vi-VN" 
                                options={{ 
                                    year: 'numeric', 
                                    month: '2-digit', 
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                }} 
                            />
                        </Labeled>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Labeled label="Khách hàng">
                            <TextField source="email" />
                        </Labeled>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Labeled label="Trạng thái">
                            <FunctionField render={() => <OrderStatusChip />} />
                        </Labeled>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Labeled label="Phương thức thanh toán">
                            <FunctionField render={() => <PaymentMethodChip />} />
                        </Labeled>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Labeled label="Tổng tiền">
                            <NumberField 
                                source="totalAmount" 
                                options={{ 
                                    style: 'currency', 
                                    currency: 'VND' 
                                }}
                                locales="vi-VN"
                                sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}
                            />
                        </Labeled>
                    </Grid>
                    <Grid item xs={12}>
                        <FunctionField render={() => <OrderItemsDetail />} />
                    </Grid>
                </Grid>
            </SimpleShowLayout>
        </Show>
    );
};

export default OrderShow;