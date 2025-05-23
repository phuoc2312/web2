import axios from 'axios';
import { CreateParams, CreateResult, DataProvider, DeleteManyParams, DeleteManyResult, DeleteParams, DeleteResult, GetManyParams, GetManyReferenceParams, GetManyReferenceResult, GetManyResult, GetOneParams, GetOneResult, Identifier, QueryFunctionContext, RaRecord, UpdateManyParams, UpdateManyResult, UpdateParams, UpdateResult } from 'react-admin';

const apiUrl = 'http://localhost:8080/api';

const httpClient = {
    get: (url: string) => {
        const token = localStorage.getItem('jwt-token');

        return axios.get(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            withCredentials: true,
        }).then(response => ({ json: response.data }))
            .catch(error => {
                console.error('API request failed:', error);
                throw error;
            });
    },

    post: (url: string, data: any) => {
        const token = localStorage.getItem('jwt-token');
        return axios.post(url, data, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            withCredentials: true,
        }).then(response => ({ json: response.data }))
            .catch(error => {
                console.error('API request failed:', error);
                throw error;
            });
    },

    put: (url: string, data: any) => {
        const token = localStorage.getItem('jwt-token');

        return axios.put(url, data, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            withCredentials: true,
        }).then(response => ({ json: response.data }))
            .catch(error => {
                console.error('API request failed:', error);
                throw error;
            });
    },

    delete: (url: string, p0: { data: { ids: any[]; }; }) => {
        const token = localStorage.getItem('jwt-token');

        return axios.delete(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            withCredentials: true,
        }).then(response => ({ json: response.data }))
            .catch(error => {
                console.error('API request failed:', error);
                throw error;
            });
    },
};

export const dataProvider: DataProvider = {
    getList: (resource: string, { pagination = {}, sort = {}, filter = {} }) => {
        // 1. Giữ nguyên logic phân trang và sắp xếp mặc định
        const { page = 1, perPage = 25 } = pagination; // Thay đổi giá trị mặc định để phù hợp với orders
        const { field = 'orderDate', order = 'DESC' } = sort; // Thay đổi mặc định cho orders
    
        // 2. Giữ nguyên ánh xạ trường ID
        const idFieldMapping: { [key: string]: string; } = {
            products: 'productId',
            categories: 'categoryId',
            carts: 'cartId',
            orders: 'orderId', // Thêm mapping cho orders
        };
    
        // 3. Xác định trường ID
        const idField = idFieldMapping[resource] || 'id';
    
        // 4. Xây dựng query parameters (giữ logic cũ nhưng điều chỉnh pageNumber)
        const query = {
            pageNumber: (page - 1).toString(), // Chuyển từ 1-based sang 0-based
            pageSize: perPage.toString(),
            sortBy: field,
            sortOrder: order,
            ...filter
        };
        
        console.log('Request filter:', filter);
        console.log('user email: ', localStorage.getItem('username'));
    
        // 5. Xây dựng URL (giữ logic cũ nhưng thêm xử lý cho orders)
        let url: string;
        if (filter && filter.search) {
            const keyword = filter.search;
            delete query.search;
            url = `${apiUrl}/public/${resource}/keyword/${encodeURIComponent(keyword)}?${new URLSearchParams(query).toString()}`;
        } else if (filter && filter.categoryId) {
            const categoryId = filter.categoryId;
            delete query.categoryId;
            url = `${apiUrl}/public/categories/${categoryId}/${resource}?${new URLSearchParams(query).toString()}`;
        } else {
            if (resource === "carts") {
                url = `${apiUrl}/admin/users`;
            } else if (resource === "orders") {
                url = `${apiUrl}/admin/orders?${new URLSearchParams(query).toString()}`; // Sử dụng endpoint admin cho orders
            } else {
                url = `${apiUrl}/public/${resource}?${new URLSearchParams(query).toString()}`;
            }
        }
    
        console.log('Request URL:', url);
    
        // 6. Giữ nguyên logic xử lý response
        let data;
        return httpClient.get(url).then(({ json }) => {
            const baseUrl = 'http://localhost:8080/api/public/products/image/';
            if (resource === "carts") {
                data = json.content
                    .filter((item: any) => item && item.cart)
                    .map((item: any) => ({
                        id: item.cart.cartId,
                        ...item,
                        image: item.image ? `${baseUrl}${item.image}` : null
                    }));
            } else {
                data = json.content
                    .filter((item: any) => item !== null && item !== undefined)
                    .map((item: any) => ({
                        id: item[idField],
                        ...item,
                        image: item.image ? `${baseUrl}${item.image}` : null
                    }));
            }
    
            console.log('data list:', data);
            return {
                data,
                total: json.totalElements
            };
        });
    },
    delete: async <RecordType extends RaRecord = any>(resource: string, params: DeleteParams<RecordType>): Promise<DeleteResult<RecordType>> => {
        try {
            // Construct the URL for the DELETE request
            const url = `${apiUrl}/admin/${resource}/${params.id}`;

            // Perform the DELETE request
            await httpClient.delete(url, {
                data: {
                    ids: [params.id], // Assuming you want to pass the ID of the item to delete
                },
            });

            // Return an empty result
            return {
                data: params.previousData as RecordType,
            };
        } catch (error) {
            console.error('API request failed:', error);
            throw new Error('Error deleting record');
        }
    },
    deleteMany: async <RecordType extends RaRecord = any>(
        resource: string,
        params: DeleteManyParams
    ): Promise<DeleteManyResult<RecordType>> => {
        const { ids } = params;

        try {
            // Create an array of promises for each delete request
            const deletePromises = ids.map(id => {
                const url = `${apiUrl}/admin/${resource}/${id}`;
                return httpClient.delete(url, {
                    data: {
                        ids: [id], // Sending the ID as part of the request body, if needed
                    },
                });
            });

            // Execute all delete requests in parallel
            await Promise.all(deletePromises);

            // Return the IDs of the deleted records
            return {
                data: ids,
            };
        } catch (error) {
            console.error('API request failed:', error);
            throw new Error('Error deleting records');
        }
    },

    getManyReference: function <RecordType extends RaRecord = any>(resource: string, params: GetManyReferenceParams & QueryFunctionContext): Promise<GetManyReferenceResult<RecordType>> {
        throw new Error('Function not implemented.');
    },
    updateMany: function <RecordType extends RaRecord = any>(resource: string, params: UpdateManyParams): Promise<UpdateManyResult<RecordType>> {
        throw new Error('Function not implemented.');
    },
    create: async (resource: string, params: CreateParams): Promise<CreateResult> => {
        try {
            console.log("data", params);
            let url: string;
            if (resource === "products") {
                url = `${apiUrl}/admin/categories/${params.data.categoryId}/${resource}`;
                delete params.data.categoryId;
                params.data.image = 'default.png';
            } else {
                url = `${apiUrl}/admin/${resource}`;
            }
            const { data } = params;
            const result = await httpClient.post(url, data);
            return { data: { ...data, id: result.json.id } };
        } catch (error) {
            console.error("Error creating resource:", error);
            throw error; // Hoặc xử lý lỗi tùy theo nhu cầu của bạn
        }
    },
    update: async (resource: string, params: UpdateParams): Promise<UpdateResult> => {
        let url: string;
        const { data, id } = params;

        if (resource === "orders" && data.orderStatus) {
            // Cập nhật trạng thái đơn hàng
            const emailId = data.email || localStorage.getItem('username');
            if (!emailId) {
                throw new Error('No emailId found for order status update.');
            }
            url = `${apiUrl}/admin/users/${encodeURIComponent(emailId)}/orders/${id}/orderStatus/${encodeURIComponent(data.orderStatus)}`;
            // Gửi yêu cầu PUT mà không cần body
            const result = await httpClient.put(url);
            return {
                data: {
                    id,
                    ...result.json,
                    orderStatus: data.orderStatus // Đảm bảo orderStatus được trả về
                }
            };
        } else {
            // Logic cập nhật mặc định cho các tài nguyên khác
            url = `${apiUrl}/admin/${resource}/${id}`;
            const result = await httpClient.put(url, data);
            return {
                data: {
                    id,
                    ...result.json
                }
            };
        }
    },

    getOne: async (resource: string, params: GetOneParams): Promise<GetOneResult> => {
        console.log('getOne called for resource:', resource, 'with params:', params);
        let url: string;

        if (resource === "carts") {
            url = `${apiUrl}/public/users/${params.meta?.email}/${resource}/${params.id}`;
        } else if (resource === "orders") {
            url = `${apiUrl}/admin/orders/${params.id}`;
        } else {
            url = `${apiUrl}/public/${resource}/${params.id}`;
        }

        try {
            const result = await httpClient.get(url);
            console.log('API Response:', result.json);

            const idFieldMapping: { [key: string]: string } = {
                products: 'productId',
                categories: 'categoryId',
                carts: 'cartId',
                orders: 'orderId',
            };

            const idField = idFieldMapping[resource] || 'id';
            const baseUrl = 'http://localhost:8080/api/public/products/image/';
            let data;
            if (resource === "carts") {
                data = {
                    id: result.json[idField],
                    totalPrice: result.json.totalPrice,
                    products: result.json.products.map((product: any) => ({
                        id: product.productId,
                        productName: product.productName,
                        image: product.image ? `${baseUrl}${product.image}` : null,
                        description: product.description,
                        quantity: product.quantity,
                        price: product.price,
                        discount: product.discount,
                        specialPrice: product.specialPrice,
                        category: product.category ? {
                            id: product.category.categoryId,
                            name: product.category.categoryName
                        } : null,
                    }))
                };
            } else {
                data = {
                    id: result.json[idField],
                    ...result.json
                };
            }

            return { data };
        } catch (error) {
            console.error('API request failed for URL:', url);
            console.error('Error details:', error.response?.data || error.message);
            throw error;
        }
    },
    getMany: async (resource: string, params: GetManyParams): Promise<GetManyResult> => {
        const idFieldMapping: { [key: string]: string } = {
            products: 'productId',
            categories: 'categoryId',
            // Add more mappings as needed
        };
        console.log('Request resource:', resource);
        console.log('Request params:', params);

        const idField = idFieldMapping[resource] || 'id';

        // Construct the URL with the selected IDs
        const ids = params.ids.join(',');
        // const url = `${apiUrl}/public/${resource}?${idField}=${ids}`;
        let url: string;
        if (resource === "products") {
            url = `${apiUrl}/public/categories/${ids}/${resource}`;
        } else {
            url = `${apiUrl}/public/${resource}`;
        }
        console.log('Request URL getMany:', url);

        // Perform the GET requests
        const result = await httpClient.get(url);
        console.log('Request result:', result);
        console.log('Request result JSON:', result.json);

        // Map the results to include the correct 'id' field
        const data = result.json.content.map((item: any) => ({
            id: item[idField],
            ...item,
        }));

        return { data };
    },

};


