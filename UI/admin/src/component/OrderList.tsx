// src/component/OrderList.tsx
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
    FilterForm,
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
            title="Danh sách đơn hàng"
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


// // src/dataProvider.ts
// import axios, { AxiosError } from 'axios';
// import {
//     DataProvider,
//     CreateParams, CreateResult,
//     DeleteParams, DeleteResult,
//     DeleteManyParams, DeleteManyResult,
//     GetListParams, GetListResult,
//     GetOneParams, GetOneResult,
//     GetManyParams, GetManyResult,
//     UpdateParams, UpdateResult,
//     RaRecord
// } from 'react-admin';

// const apiUrl = 'http://localhost:8080/api';

// // Type definitions for API responses
// interface PaginatedResponse<T> {
//     content: T[];
//     totalElements: number;
//     pageNumber: number;
//     pageSize: number;
//     totalPages: number;
// }

// interface Product {
//     productId: number;
//     productName: string;
//     description: string;
//     price: number;
//     discount: number;
//     specialPrice: number;
//     quantity: number;
//     image?: string;
//     category?: Category;
// }

// interface Category {
//     categoryId: number;
//     categoryName: string;
// }

// interface Cart {
//     cartId: number;
//     products: CartProduct[];
//     totalPrice: number;
// }

// interface CartProduct extends Product {
//     quantity: number;
// }

// interface Order {
//     orderId: number;
//     email: string;
//     orderItems: OrderItem[];
//     orderDate: string;
//     payment: Payment;
//     totalAmount: number;
//     orderStatus: string;
// }

// interface OrderItem {
//     orderItemId: number;
//     product: Product;
//     quantity: number;
//     discount: number;
//     orderedProductPrice: number;
// }

// interface Payment {
//     paymentId: number;
//     paymentMethod: string;
// }

// // HTTP client with error handling
// const httpClient = {
//     request: async <T>(method: 'get' | 'post' | 'put' | 'delete', url: string, data?: any): Promise<{ json: T }> => {
//         const token = localStorage.getItem('jwt-token');
//         try {
//             const response = await axios({
//                 method,
//                 url,
//                 data,
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json',
//                     'Accept': 'application/json',
//                 },
//                 withCredentials: true,
//                 maxRedirects: 0, // Prevent following redirects
//                 validateStatus: function (status) {
//                     return status >= 200 && status < 303; // Accept 302 as valid
//                 }
//             });

//             // Handle 302 redirect manually if needed
//             if (response.status === 302) {
//                 const redirectUrl = response.headers.location;
//                 if (redirectUrl) {
//                     return await httpClient.request<T>(method, redirectUrl, data);
//                 }
//             }

//             return { json: response.data as T };
//         } catch (error) {
//             const axiosError = error as AxiosError;
//             console.error(`API request failed (${method.toUpperCase()} ${url}):`,
//                 axiosError.response?.data || axiosError.message);
//             throw error;
//         }
//     }
// };

// // Resource configuration
// const resourceConfig = {
//     products: {
//         endpoint: 'public/products',
//         idField: 'productId',
//         adminEndpoint: 'admin/categories'
//     },
//     categories: {
//         endpoint: 'public/categories',
//         idField: 'categoryId'
//     },
//     carts: {
//         endpoint: 'admin/users', // Special case
//         idField: 'cartId'
//     },
//     orders: {
//         endpoint: 'admin/orders',
//         idField: 'orderId'
//     }
// };

// export const dataProvider: DataProvider = {
//     getList: async <RecordType extends RaRecord = any>(resource: string, params: GetListParams): Promise<GetListResult<RecordType>> => {
//         const config = resourceConfig[resource as keyof typeof resourceConfig] || {
//             endpoint: `public/${resource}`,
//             idField: 'id'
//         };

//         // Special handling for orders to prevent redirect
//         if (resource === 'orders') {
//             try {
//                 // First try direct request
//                 const { page = 1, perPage = 10 } = params.pagination || {};
//                 const { field = 'id', order = 'ASC' } = params.sort || {};

//                 const queryParams = new URLSearchParams({
//                     pageNumber: String(page - 1),
//                     pageSize: String(perPage),
//                     sortBy: field,
//                     sortOrder: order.toLowerCase(),
//                     ...params.filter
//                 });

//                 const url = `${apiUrl}/${config.endpoint}?${queryParams}`;

//                 const { json } = await httpClient.request<PaginatedResponse<any>>('get', url);

//                 const data = json.content.map(item => ({
//                     id: item[config.idField],
//                     ...item
//                 }));

//                 return {
//                     data,
//                     total: json.totalElements
//                 };
//             } catch (error) {
//                 console.error('Direct order request failed, trying alternative...');
//                 // Fallback to alternative endpoint if needed
//                 const fallbackUrl = `${apiUrl}/api/admin/orders/list`;
//                 const { json } = await httpClient.request<PaginatedResponse<any>>('get', fallbackUrl);

//                 const data = json.content.map(item => ({
//                     id: item[config.idField],
//                     ...item
//                 }));

//                 return {
//                     data,
//                     total: json.totalElements
//                 };
//             }
//         }

//         // ... rest of your existing getList implementation
//     },

//     getOne: async <RecordType extends RaRecord = any>(resource: string, params: GetOneParams): Promise<GetOneResult<RecordType>> => {
//         const config = resourceConfig[resource as keyof typeof resourceConfig] || {
//             endpoint: `public/${resource}`,
//             idField: 'id'
//         };

//         let url: string;
//         if (resource === 'carts') {
//             const email = params.meta?.email || localStorage.getItem('username');
//             url = `${apiUrl}/public/users/${email}/carts/${params.id}`;
//         } else {
//             url = `${apiUrl}/${config.endpoint}/${params.id}`;
//         }

//         try {
//             const { json } = await httpClient.request<any>('get', url);
//             const baseUrl = `${apiUrl}/public/products/image/`;

//             let data: any;
//             if (resource === 'carts') {
//                 data = {
//                     id: json[config.idField],
//                     totalPrice: json.totalPrice,
//                     products: json.products?.map((product: any) => ({
//                         id: product.productId,
//                         ...product,
//                         image: product.image ? `${baseUrl}${product.image}` : null
//                     })) || []
//                 };
//             } else {
//                 data = {
//                     id: json[config.idField],
//                     ...json,
//                     image: json.image ? `${baseUrl}${json.image}` : null
//                 };
//             }

//             return { data };
//         } catch (error) {
//             console.error(`Error fetching ${resource} ${params.id}:`, error);
//             throw error;
//         }
//     },

//     create: async <RecordType extends RaRecord = any>(resource: string, params: CreateParams): Promise<CreateResult<RecordType>> => {
//         const config = resourceConfig[resource as keyof typeof resourceConfig] || {
//             endpoint: `admin/${resource}`,
//             idField: 'id'
//         };

//         let url: string;
//         if (resource === 'products') {
//             if ('adminEndpoint' in config) {
//                 url = `${apiUrl}/${config.adminEndpoint}/${params.data.categoryId}/products`;
//             } else {
//                 throw new Error(`adminEndpoint is not defined for resource: ${resource}`);
//             }
//             const { categoryId, ...data } = params.data;
//             params.data = { ...data, image: data.image || 'default.png' };
//         } else {
//             url = `${apiUrl}/${config.endpoint}`;
//         }

//         try {
//             const { json } = await httpClient.request<any>('post', url, params.data);
//             return { data: { ...params.data, id: json[config.idField] } };
//         } catch (error) {
//             console.error(`Error creating ${resource}:`, error);
//             throw error;
//         }
//     },

//     update: async <RecordType extends RaRecord = any>(resource: string, params: UpdateParams): Promise<UpdateResult<RecordType>> => {
//         const config = resourceConfig[resource as keyof typeof resourceConfig] || {
//             endpoint: `admin/${resource}`,
//             idField: 'id'
//         };

//         const url = `${apiUrl}/${config.endpoint}/${params.id}`;

//         try {
//             const { json } = await httpClient.request<any>('put', url, params.data);
//             return { data: { id: params.id, ...json } };
//         } catch (error) {
//             console.error(`Error updating ${resource} ${params.id}:`, error);
//             throw error;
//         }
//     },

//     delete: async <RecordType extends RaRecord = any>(resource: string, params: DeleteParams): Promise<DeleteResult<RecordType>> => {
//         const config = resourceConfig[resource as keyof typeof resourceConfig] || {
//             endpoint: `admin/${resource}`,
//             idField: 'id'
//         };

//         const url = `${apiUrl}/${config.endpoint}/${params.id}`;

//         try {
//             await httpClient.request('delete', url);
//             return { data: params.previousData };
//         } catch (error) {
//             console.error(`Error deleting ${resource} ${params.id}:`, error);
//             throw error;
//         }
//     },

//     deleteMany: async <RecordType extends RaRecord = any>(resource: string, params: DeleteManyParams): Promise<DeleteManyResult<RecordType>> => {
//         const config = resourceConfig[resource as keyof typeof resourceConfig] || {
//             endpoint: `admin/${resource}`,
//             idField: 'id'
//         };

//         try {
//             await Promise.all(params.ids.map(id =>
//                 httpClient.request('delete', `${apiUrl}/${config.endpoint}/${id}`)
//             ));
//             return { data: params.ids };
//         } catch (error) {
//             console.error(`Error deleting multiple ${resource}:`, error);
//             throw error;
//         }
//     },

//     // Unimplemented methods (required by interface)
//     getMany: async <RecordType extends RaRecord = any>(resource: string, params: GetManyParams): Promise<GetManyResult<RecordType>> => {
//         throw new Error('Function not implemented.');
//     },
//     getManyReference: async <RecordType extends RaRecord = any>(resource: string, params: any): Promise<any> => {
//         throw new Error('Function not implemented.');
//     },
//     updateMany: async <RecordType extends RaRecord = any>(resource: string, params: UpdateManyParams): Promise<UpdateManyResult<RecordType>> => {
//         throw new Error('Function not implemented.');
//     }
// };// src/component/OrderList.tsx
// import * as React from 'react';
// import { 
//     List,
//     Datagrid,
//     TextField,
//     DateField,
//     NumberField,
//     FunctionField,
//     EditButton,
//     ShowButton,
//     FilterLiveSearch,
//     FilterForm,
//     usePermissions,
//     useRecordContext
// } from 'react-admin';
// import { Stack, Chip, Typography, Box } from '@mui/material';
// import { LocalAtm, CreditCard } from '@mui/icons-material';

// // Define TypeScript interfaces
// interface OrderItem {
//     orderItemId: number;
//     product: {
//         productId: number;
//         productName: string;
//         price: number;
//     };
//     quantity: number;
//     discount: number;
//     orderedProductPrice: number;
// }

// interface Payment {
//     paymentId: number;
//     paymentMethod: string;
// }

// interface Order {
//     orderId: number;
//     email: string;
//     orderItems: OrderItem[];
//     orderDate: string;
//     payment: Payment;
//     totalAmount: number;
//     orderStatus: string;
// }

// // Custom field to display order status
// const OrderStatusField = () => {
//     const record = useRecordContext<Order>();
//     if (!record) return null;
    
//     const statusColors = {
//         'Order Accepted!': 'success',
//         'Processing': 'info',
//         'Cancelled': 'error',
//         'Shipped': 'warning',
//         'Delivered': 'secondary'
//     };
    
//     return (
//         <Chip 
//             label={record.orderStatus} 
//             color={statusColors[record.orderStatus] || 'default'} 
//             size="small"
//         />
//     );
// };

// // Custom field to display payment method
// const PaymentMethodField = () => {
//     const record = useRecordContext<Order>();
//     if (!record) return null;
    
//     return (
//         <Stack direction="row" alignItems="center" gap={1}>
//             {record.payment.paymentMethod === 'MOMO' ? (
//                 <LocalAtm color="primary" fontSize="small" />
//             ) : (
//                 <CreditCard color="info" fontSize="small" />
//             )}
//             <Typography variant="body2">
//                 {record.payment.paymentMethod}
//             </Typography>
//         </Stack>
//     );
// };

// // Custom field to display order items
// const OrderItemsField = () => {
//     const record = useRecordContext<Order>();
//     if (!record) return null;
    
//     return (
//         <Box>
//             {record.orderItems.map((item) => (
//                 <Box key={item.orderItemId} mb={1}>
//                     <Typography variant="body2">
//                         {item.product.productName} × {item.quantity}
//                     </Typography>
//                     <Typography variant="caption" color="text.secondary">
//                         {item.orderedProductPrice.toLocaleString('vi-VN')}₫ (-{item.discount}%)
//                     </Typography>
//                 </Box>
//             ))}
//         </Box>
//     );
// };

// // Filter component
// const OrderFilters = [
//     <FilterLiveSearch source="q" label="Tìm kiếm" key="search" />,
// ];

// const OrderList = () => {
//     const { permissions } = usePermissions();
    
//     return (
//         <List
//             title="Danh sách đơn hàng"
//             filters={OrderFilters}
//             perPage={25}
//             sort={{ field: 'orderDate', order: 'DESC' }}
//         >
//             <Datagrid rowClick="show">
//                 <TextField source="orderId" label="Mã đơn hàng" />
//                 <DateField 
//                     source="orderDate" 
//                     label="Ngày đặt" 
//                     locales="vi-VN" 
//                     options={{ 
//                         year: 'numeric', 
//                         month: '2-digit', 
//                         day: '2-digit' 
//                     }} 
//                 />
                
//                 <TextField source="email" label="Email khách hàng" />
                
//                 <FunctionField
//                     label="Sản phẩm"
//                     render={(record: Order) => <OrderItemsField record={record} />}
//                 />
                
//                 <NumberField 
//                     source="totalAmount" 
//                     label="Tổng tiền" 
//                     options={{ 
//                         style: 'currency', 
//                         currency: 'VND' 
//                     }}
//                     locales="vi-VN"
//                 />
                
//                 <FunctionField
//                     label="Trạng thái"
//                     render={(record: Order) => <OrderStatusField record={record} />}
//                 />
                
//                 <FunctionField
//                     label="Thanh toán"
//                     render={(record: Order) => (
//                         <Stack direction="row" spacing={1} alignItems="center">
//                             <PaymentMethodField record={record} />
//                             <Chip 
//                                 label={record.payment?.paymentId ? 'Đã thanh toán' : 'Chưa thanh toán'} 
//                                 color={record.payment?.paymentId ? 'success' : 'error'} 
//                                 size="small"
//                             />
//                         </Stack>
//                     )}
//                 />
                
//                 {permissions === 'ADMIN' && <EditButton />}
//                 <ShowButton />
//             </Datagrid>
//         </List>
//     );
// };

// export default OrderList; sửa lại cho đẹp hơn