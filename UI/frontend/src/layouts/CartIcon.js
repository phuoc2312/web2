import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function CartIcon() {
    const [cartQuantity, setCartQuantity] = useState(0);

    // Hàm làm phẳng dữ liệu từ localStorage
    const flattenCartItems = (data) => {
        if (!data || !Array.isArray(data)) return [];
        return data.map((item) => ({
            id: item.productId || item.id,
            productName: item.productName,
            price: item.price,
            image: item.image,
            quantity: item.quantity,
        }));
    };

    // Tính tổng số lượng sản phẩm
    const calculateTotalQuantity = () => {
        const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
        const flattenedCart = flattenCartItems(storedCart);
        return flattenedCart.reduce((total, item) => total + item.quantity, 0);
    };

    // Cập nhật số lượng từ localStorage
    const updateCartQuantity = () => {
        const totalQuantity = calculateTotalQuantity();
        setCartQuantity(totalQuantity);
    };

    useEffect(() => {
        // Cập nhật số lượng khi component mount
        updateCartQuantity();

        // Lắng nghe sự kiện storage và cartUpdated
        window.addEventListener("storage", updateCartQuantity);
        window.addEventListener("cartUpdated", updateCartQuantity);

        return () => {
            window.removeEventListener("storage", updateCartQuantity);
            window.removeEventListener("cartUpdated", updateCartQuantity);
        };
    }, []);

    return (
        <Link
            to="/cart"
            className="p-2 text-gray-600 hover:text-green-600 relative"
            aria-label="Giỏ hàng"
        >
            <i className="fa fa-shopping-cart"></i>
            {cartQuantity > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {cartQuantity}
                </span>
            )}
        </Link>
    );
}

export default CartIcon;