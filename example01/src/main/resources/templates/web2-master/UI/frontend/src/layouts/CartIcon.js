import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { GET_ALL } from "./../api/apiService";

function CartIcon() {
    const [cartQuantity, setCartQuantity] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // Hàm lấy authEmail và cartId từ localStorage
    const getUserCredentials = () => {
        const emailId = localStorage.getItem("authEmail");
        const cartId = localStorage.getItem("cartId");
        if (!emailId || !cartId) {
            return null;
        }
        return { emailId, cartId };
    };

    // Hàm gọi API để lấy dữ liệu giỏ hàng
    const fetchCartQuantity = async () => {
        const credentials = getUserCredentials();
        if (!credentials) {
            setCartQuantity(0);
            return;
        }

        const { emailId, cartId } = credentials;
        setIsLoading(true);

        try {
            const response = await GET_ALL(
                `http://localhost:8080/api/public/users/${encodeURIComponent(emailId)}/carts/${cartId}`,
                {}
            );
            const totalQuantity = response.quantity || 
                (response.products ? 
                    response.products.reduce((total, item) => total + (item.cartItemQuantity || 0), 0) : 
                    0);
            setCartQuantity(totalQuantity);
        } catch (error) {
            console.error(`Failed to fetch cart for email ${emailId}, cartId ${cartId}:`, error);
            setCartQuantity(0);
        } finally {
            setIsLoading(false);
        }
    };

    // Xử lý khi đăng xuất
    const handleLogout = () => {
        setCartQuantity(0);
    };

    useEffect(() => {
        // Lấy số lượng khi component mount
        fetchCartQuantity();

        // Lắng nghe sự kiện cartUpdated
        window.addEventListener("cartUpdated", fetchCartQuantity);
        // Lắng nghe sự kiện logout
        window.addEventListener("logout", handleLogout);
        // Lắng nghe sự kiện storage
        window.addEventListener("storage", fetchCartQuantity);

        return () => {
            window.removeEventListener("cartUpdated", fetchCartQuantity);
            window.removeEventListener("logout", handleLogout);
            window.removeEventListener("storage", fetchCartQuantity);
        };
    }, []);

    return (
        <Link
            to="/cart"
            className="p-2 text-gray-600 hover:text-green-600 relative"
            aria-label="Giỏ hàng"
        >
            <i className="fa fa-shopping-cart"></i>
            {!isLoading && cartQuantity > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {cartQuantity}
                </span>
            )}
        </Link>
    );
}

export default CartIcon;