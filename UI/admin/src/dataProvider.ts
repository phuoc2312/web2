import axios from 'axios';
import {
  CreateParams,
  CreateResult,
  DataProvider,
  DeleteManyParams,
  DeleteManyResult,
  DeleteParams,
  DeleteResult,
  GetManyParams,
  GetManyReferenceParams,
  GetManyReferenceResult,
  GetManyResult,
  GetOneParams,
  GetOneResult,
  Identifier,
  QueryFunctionContext,
  RaRecord,
  UpdateManyParams,
  UpdateManyResult,
  UpdateParams,
  UpdateResult,
} from 'react-admin';

const apiUrl = 'http://localhost:8080/api';

const httpClient = {
  get: (url: string) => {
    const token = localStorage.getItem('jwt-token');
    return axios
      .get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      })
      .then((response) => ({ json: response.data }))
      .catch((error) => {
        console.error('API GET request failed:', error.response?.data, error.response?.status);
        throw error;
      });
  },

  post: (url: string, data: any) => {
    const token = localStorage.getItem('jwt-token');
    return axios
      .post(url, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      })
      .then((response) => ({ json: response.data }))
      .catch((error) => {
        console.error('API POST request failed:', error.response?.data, error.response?.status);
        throw error;
      });
  },

  put: (url: string, data: any, headers: any = {}) => {
    const token = localStorage.getItem('jwt-token');
    return axios
      .put(url, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...headers,
        },
        withCredentials: true,
      })
      .then((response) => ({ json: response.data }))
      .catch((error) => {
        console.error('API PUT request failed:', error.response?.data, error.response?.status);
        throw error;
      });
  },

  delete: (url: string) => {
    const token = localStorage.getItem('jwt-token');
    return axios
      .delete(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      })
      .then((response) => ({ json: response.data }))
      .catch((error) => {
        console.error('API DELETE request failed:', error.response?.data, error.response?.status);
        throw error;
      });
  },
};

export const dataProvider: DataProvider = {
  getList: async (resource: string, { pagination = {}, sort = {}, filter = {} }) => {
    const { page = 1, perPage = 25 } = pagination;
    const defaultSortField = resource === 'orders' ? 'orderDate' : resource === 'contacts' ? 'contactId' : resource === 'users' ? 'userId' : 'id';
    const { field = defaultSortField, order = 'ASC' } = sort;

    console.log('Resource:', resource);
    console.log('Sort params:', sort);
    console.log('Selected field:', field);

    const idFieldMapping: { [key: string]: string } = {
      products: 'productId',
      categories: 'categoryId',
      carts: 'cartId',
      orders: 'orderId',
      BlogPosts: 'id',
      contacts: 'contactId',
      configs: 'id',
    };

    const idField = idFieldMapping[resource] || 'id';
    const query = {
      pageNumber: (page - 1).toString(),
      pageSize: perPage.toString(),
      sortBy: resource === 'users' ? 'userId' : resource === 'orders' ? 'orderId' : field,
      sortOrder: order,
      ...filter,
    };
    let url: string;
    const resourceEndpoint = resource === 'BlogPosts' ? 'blogs' : resource;
    if (filter && filter.status && resource === 'contacts') {
      const status = filter.status;
      delete query.status;
      url = `${apiUrl}/public/${resourceEndpoint}?status=${encodeURIComponent(status)}&${new URLSearchParams(query).toString()}`;
    } else if (filter && filter.categoryId) {
      const categoryId = filter.categoryId;
      delete query.categoryId;
      url = `${apiUrl}/public/categories/${categoryId}/${resourceEndpoint}?${new URLSearchParams(query).toString()}`;
    } else {
      if (resource === 'carts') {
        url = `${apiUrl}/admin/carts?${new URLSearchParams(query).toString()}`;
      } else if (resource === 'orders') {
        url = `${apiUrl}/admin/orders?${new URLSearchParams(query).toString()}`;
      } else if (resource === 'users') {
        url = `${apiUrl}/admin/users?${new URLSearchParams(query).toString()}`;
      } else {
        url = `${apiUrl}/public/${resourceEndpoint}?${new URLSearchParams(query).toString()}`;
      }
    }

    console.log('Request URL:', url);
    const response = await httpClient.get(url);
    console.log('API response:', response.json);
    const baseUrl = resource === 'BlogPosts' ? `${apiUrl}/public/images/` : `${apiUrl}/public/products/image/`;
    let data;
    if (resource === 'carts') {
      data = response.json.content
        .filter((item: any) => item !== null && item !== undefined)
        .map((item: any) => ({
          id: item.cartId || item.id, // Sửa lại để phù hợp với cả 2 trường hợp
          ...item,
          image: item.image ? `${baseUrl}${item.image}` : null,
        }));
    } else {
      data = response.json.content
        .filter((item: any) => item !== null && item !== undefined)
        .map((item: any) => ({
          id: resource === 'users' ? item.userId : item[idField],
          ...item,
          image: item.image ? `${baseUrl}${item.image}` : null,
        }));
    }

    return {
      data,
      total: response.json.totalElements,
    };
  },

  getOne: async (resource: string, params: GetOneParams): Promise<GetOneResult> => {
    const resourceEndpoint = resource === 'BlogPosts' ? 'blogs' : resource === 'configs' ? 'config' : resource;
    let url: string;

    if (resource === 'carts') {
      url = `${apiUrl}/public/users/${params.meta?.email}/${resource}/${params.id}`;
    } else if (resource === 'orders') {
      url = `${apiUrl}/admin/orders/${params.id}`;
    } else {
      url = `${apiUrl}/public/${resourceEndpoint}/${params.id}`;
    }

    const result = await httpClient.get(url);
    const idFieldMapping: { [key: string]: string } = {
      products: 'productId',
      categories: 'categoryId',
      carts: 'cartId',
      orders: 'orderId',
      BlogPosts: 'id',
      configs: 'id',
    };

    const idField = idFieldMapping[resource] || 'id';
    const baseUrl = resource === 'BlogPosts' ? `${apiUrl}/public/images/` : `${apiUrl}/public/products/image/`;
    let data;
    if (resource === 'carts') {
      data = {
        id: result.json.cartId || result.json.id, // Sửa lại để phù hợp với cả 2 trường hợp
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
          category: product.category
            ? {
              id: product.category.categoryId,
              name: product.category.categoryName,
            }
            : null,
        })),
      };
    } else {
      data = {
        id: result.json[idField],
        ...result.json,
        image: result.json.image ? `${baseUrl}${result.json.image}` : null,
      };
    }

    return { data };
  },

  getMany: async (resource: string, params: GetManyParams): Promise<GetManyResult> => {
    const idFieldMapping: { [key: string]: string } = {
      products: 'productId',
      categories: 'categoryId',
      BlogPosts: 'id',
      configs: 'id',
    };
    const idField = idFieldMapping[resource] || 'id';
    const baseUrl =
      resource === 'BlogPosts' ? `${apiUrl}/public/images/` : `${apiUrl}/public/products/image/`;
    const resourceEndpoint = resource === 'BlogPosts' ? 'blogs' : resource === 'configs' ? 'config' : resource;

    const ids = params.ids.join(',');
    let url: string;
    if (resource === 'products') {
      url = `${apiUrl}/public/categories/${ids}/${resource}`;
    } else {
      url = `${apiUrl}/public/${resourceEndpoint}`;
    }

    const result = await httpClient.get(url);
    const data = result.json.content.map((item: any) => ({
      id: item[idField],
      ...item,
      image: item.image ? `${baseUrl}${item.image}` : null,
    }));

    return { data };
  },

  create: async (resource: string, params: CreateParams): Promise<CreateResult> => {
    try {
      const resourceEndpoint = resource === 'BlogPosts' ? 'blogs' : resource === 'configs' ? 'config' : resource;
      let url: string;
      if (resource === 'products') {
        url = `${apiUrl}/admin/categories/${params.data.categoryId}/${resource}`;
        delete params.data.categoryId;
        params.data.image = 'default.png';
      } else {
        url = `${apiUrl}/admin/${resourceEndpoint}`;
      }
      const { data } = params;
      const result = await httpClient.post(url, data);
      return { data: { ...data, id: result.json.id } };
    } catch (error) {
      console.error('Error creating resource:', error);
      throw error;
    }
  },

  update: async (resource: string, params: UpdateParams): Promise<UpdateResult> => {
    const resourceEndpoint = resource === 'BlogPosts' ? 'blogs' : resource === 'configs' ? 'config' : resource;
    const { data, id } = params;

    console.log('Update data:', data);

    if (resource === 'BlogPosts' && data.image instanceof File) {
      const url = `${apiUrl}/admin/${resourceEndpoint}/${id}/image`;
      const formData = new FormData();
      formData.append('image', data.image);
      try {
        const result = await httpClient.put(url, formData, {
          'Content-Type': 'multipart/form-data',
        });
        return { data: { id, ...result.json } };
      } catch (error: any) {
        console.error('Image update failed:', error.response?.data, error.response?.status);
        throw new Error(`Cập nhật hình ảnh thất bại: ${error.response?.data?.message || error.message}`);
      }
    } else if (resource === 'orders') {
      if (!data.email || !data.orderStatus) {
        throw new Error('Thiếu email hoặc orderStatus trong dữ liệu cập nhật');
      }
      const url = `${apiUrl}/admin/users/${encodeURIComponent(data.email)}/orders/${id}/orderStatus/${encodeURIComponent(data.orderStatus)}`;
      try {
        const result = await httpClient.put(url, {});
        return {
          data: {
            id,
            orderId: result.json.orderId,
            email: result.json.email,
            orderItems: result.json.orderItems,
            orderDate: result.json.orderDate,
            payment: result.json.payment,
            totalAmount: result.json.totalAmount,
            orderStatus: result.json.orderStatus,
          },
        };
      } catch (error: any) {
        console.error('Order status update failed:', error.response?.data, error.response?.status);
        throw new Error(`Cập nhật trạng thái đơn hàng thất bại: ${error.response?.data?.message || error.message}`);
      }
    } else {
      const url = `${apiUrl}/admin/${resourceEndpoint}/${id}`;
      try {
        const result = await httpClient.put(url, data);
        const idField = resource === 'contacts' ? 'contactId' : 'id';
        return { data: { [idField]: id, ...result.json } };
      } catch (error: any) {
        console.error('Content update failed:', error.response?.data, error.response?.status);
        throw new Error(`Cập nhật nội dung thất bại: ${error.response?.data?.message || error.message}`);
      }
    }
  },

  delete: async <RecordType extends RaRecord = any>(
    resource: string,
    params: DeleteParams<RecordType>
  ): Promise<DeleteResult<RecordType>> => {
    try {
      const resourceEndpoint = resource === 'BlogPosts' ? 'blogs' : resource === 'configs' ? 'config' : resource;
      const url = `${apiUrl}/admin/${resourceEndpoint}/${params.id}`;
      await httpClient.delete(url);
      return {
        data: params.previousData as RecordType,
      };
    } catch (error) {
      console.error('API DELETE request failed:', error);
      throw new Error('Error deleting record');
    }
  },

  deleteMany: async <RecordType extends RaRecord = any>(
    resource: string,
    params: DeleteManyParams
  ): Promise<DeleteManyResult<RecordType>> => {
    const { ids } = params;
    const resourceEndpoint = resource === 'BlogPosts' ? 'blogs' : resource === 'configs' ? 'config' : resource;

    try {
      const deletePromises = ids.map((id) => {
        const url = `${apiUrl}/admin/${resourceEndpoint}/${id}`;
        return httpClient.delete(url);
      });

      await Promise.all(deletePromises);

      return {
        data: ids,
      };
    } catch (error) {
      console.error('API DELETE MANY request failed:', error);
      throw new Error('Error deleting records');
    }
  },

  getManyReference: function <RecordType extends RaRecord = any>(
    resource: string,
    params: GetManyReferenceParams & QueryFunctionContext
  ): Promise<GetManyReferenceResult<RecordType>> {
    throw new Error('Function not implemented.');
  },

  updateMany: function <RecordType extends RaRecord = any>(
    resource: string,
    params: UpdateManyParams
  ): Promise<UpdateManyResult<RecordType>> {
    throw new Error('Function not implemented.');
  },
};