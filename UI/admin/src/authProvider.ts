import axios, { AxiosError } from "axios";
import { AuthProvider } from "react-admin";

interface LoginParams {
    username: string;
    password: string;
}

interface CheckParamsErr {
    status: number;
}

interface RoleDTO {
    roleId: number;
    roleName: string;
}

interface UserDTO {
    userId: number;
    firstName: string;
    lastName: string;
    mobileNumber: string;
    email: string;
    password: string;
    roles: RoleDTO[];
    address: {
        addressId: number;
        street: string;
        buildingName: string;
        city: string;
        state: string;
        country: string;
        pincode: string;
    };
    cart?: {
        cartId: number;
        totalPrice: number;
        quantity: number;
        products: unknown[];
        message: string | null;
    };
}

interface LoginResponse {
    "jwt-token": string;
}

export const authProvider: AuthProvider = {
    login: async ({ username, password }: LoginParams) => {
        try {
            // Gọi API đăng nhập
            const loginResponse = await axios.post<LoginResponse>(
                'http://localhost:8080/api/login',
                {
                    email: username,
                    password: password,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true,
                }
            );

            // Lưu JWT token
            const token = loginResponse.data["jwt-token"];
            if (!token) {
                throw new Error("Không nhận được token từ server");
            }
            localStorage.setItem("jwt-token", token);
            localStorage.setItem("username", username);

            // Kiểm tra vai trò ADMIN
            const userResponse = await axios.get<UserDTO>(
                `http://localhost:8080/api/public/users/email/${encodeURIComponent(username)}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': '*/*',
                    },
                }
            );

            const roles = userResponse.data.roles || [];
            const isAdmin = roles.some((role: RoleDTO) => role.roleName === 'ADMIN');

            if (!isAdmin) {
                // Xóa token nếu không phải ADMIN
                localStorage.removeItem("jwt-token");
                localStorage.removeItem("username");
                throw new Error("Chỉ người dùng có vai trò ADMIN mới được phép đăng nhập");
            }

            return Promise.resolve();
        } catch (error) {
            // Xử lý lỗi
            localStorage.removeItem("jwt-token");
            localStorage.removeItem("username");
            let errorMessage = "Chỉ người dùng có vai trò ADMIN mới được phép đăng nhập";
            if (error instanceof AxiosError) {
                errorMessage = error.response?.data?.message || error.message || errorMessage;
            }
            return Promise.reject(new Error(errorMessage));
        }
    },

    logout: () => {
        localStorage.removeItem("jwt-token");
        localStorage.removeItem("username");
        return Promise.resolve();
    },

    checkError: ({ status }: CheckParamsErr) => {
        if (status === 401 || status === 403) {
            localStorage.removeItem("jwt-token");
            localStorage.removeItem("username");
            return Promise.reject();
        }
        return Promise.resolve();
    },

    checkAuth: () => {
        return localStorage.getItem("jwt-token") ? Promise.resolve() : Promise.reject();
    },

    getPermissions: () => {
        return Promise.resolve(['ADMIN']);
    },
}; 