import * as React from 'react';
import { 
    List,
    Datagrid,
    TextField,
    DateField,
    NumberField,
    FunctionField,
    EditButton,
    ShowButton,
    FilterLiveSearch,
    usePermissions,
    useRecordContext
} from 'react-admin';
import { Stack, Chip, Typography, Box } from '@mui/material';
import { LocalAtm, CreditCard } from '@mui/icons-material';

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

// Custom field to display order status
const OrderStatusField = () => {
    const record = useRecordContext<Order>();
    if (!record) return null;
    
    const statusColors = {
        'Order Accepted!': 'success',
        'Processing': 'info',
        'Cancelled': 'error',
        'Shipped': 'warning',
        'Delivered': 'secondary'
    };
    
    return (
        <Chip 
            label={record.orderStatus} 
            color={statusColors[record.orderStatus] || 'default'} 
            size="small"
        />
    );
};

// Custom field to display payment method
const PaymentMethodField = () => {
    const record = useRecordContext<Order>();
    if (!record) return null;
    
    return (
        <Stack direction="row" alignItems="center" gap={1}>
            {record.payment.paymentMethod === 'MOMO' ? (
                <LocalAtm color="primary" fontSize="small" />
            ) : (
                <CreditCard color="info" fontSize="small" />
            )}
            <Typography variant="body2">
                {record.payment.paymentMethod}
            </Typography>
        </Stack>
    );
};

// Custom field to display order items
const OrderItemsField = () => {
    const record = useRecordContext<Order>();
    if (!record) return null;
    
    return (
        <Box>
            {record.orderItems.map((item) => (
                <Box key={item.orderItemId} mb={1}>
                    <Typography variant="body2">
                        {item.product.productName} × {item.quantity}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {item.orderedProductPrice.toLocaleString('vi-VN')}₫ (-{item.discount}%)
                    </Typography>
                </Box>
            ))}
        </Box>
    );
};

// Filter component
const OrderFilters = [
    <FilterLiveSearch source="q" label="Tìm kiếm" key="search" />,
];

const OrderList = () => {
    const { permissions } = usePermissions();
    
    return (
        <List
            title="Order List"
            filters={OrderFilters}
            perPage={25}
            sort={{ field: 'orderDate', order: 'DESC' }}
        >
            <Datagrid rowClick="show">
                <TextField source="orderId" label="Mã đơn hàng" />
                <DateField 
                    source="orderDate" 
                    label="Ngày đặt" 
                    locales="vi-VN" 
                    options={{ 
                        year: 'numeric', 
                        month: '2-digit', 
                        day: '2-digit' 
                    }} 
                />
                
                <TextField source="email" label="Email khách hàng" />
                
                <FunctionField
                    label="Sản phẩm"
                    render={(record: Order) => <OrderItemsField record={record} />}
                />
                
                <NumberField 
                    source="totalAmount" 
                    label="Tổng tiền" 
                    options={{ 
                        style: 'currency', 
                        currency: 'VND' 
                    }}
                    locales="vi-VN"
                />
                
                <FunctionField
                    label="Trạng thái"
                    render={(record: Order) => <OrderStatusField record={record} />}
                />
                
                <FunctionField
                    label="Thanh toán"
                    render={(record: Order) => (
                        <Stack direction="row" spacing={1} alignItems="center">
                            <PaymentMethodField record={record} />
                            <Chip 
                                label={record.payment?.paymentId ? 'Đã thanh toán' : 'Chưa thanh toán'} 
                                color={record.payment?.paymentId ? 'success' : 'error'} 
                                size="small"
                            />
                        </Stack>
                    )}
                />
                
                {permissions === 'ADMIN' && <EditButton />}
                <ShowButton />
            </Datagrid>
        </List>
    );
};

export default OrderList;