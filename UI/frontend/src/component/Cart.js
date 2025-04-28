import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

function Cart() {
    const [cartItems, setCartItems] = useState([]);

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

    const updateCartFromStorage = () => {
        const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
        console.log("Stored cart (raw):", storedCart);
        const flattenedCart = flattenCartItems(storedCart);
        console.log("Flattened cart:", flattenedCart);
        setCartItems(flattenedCart);
    };

    useEffect(() => {
        updateCartFromStorage();
        window.addEventListener("storage", updateCartFromStorage);
        return () => {
            window.removeEventListener("storage", updateCartFromStorage);
        };
    }, []);

    useEffect(() => {
        if (cartItems.length > 0) {
            localStorage.setItem("cart", JSON.stringify(cartItems));
            console.log("Saved cart to localStorage:", cartItems);
        }
    }, [cartItems]);

    const removeFromCart = (id, productName) => {
        if (window.confirm(`Bạn có chắc muốn xóa "${productName}" khỏi giỏ hàng?`)) {
            const updatedCart = cartItems.filter((item) => item.id !== id);
            console.log("Updated cart after removal:", updatedCart);
            localStorage.setItem("cart", JSON.stringify(updatedCart));
            setCartItems(updatedCart);
            toast.success(`Đã xóa "${productName}" khỏi giỏ hàng!`, {
                position: "top-right",
                autoClose: 2000,
            });
            window.dispatchEvent(new Event("cartUpdated"));
        }
    };

    const incrementQuantity = (id, productName) => {
        const updatedCart = cartItems.map((item) =>
            item.id === id ? { ...item, quantity: item.quantity + 1 } : item
        );
        localStorage.setItem("cart", JSON.stringify(updatedCart));
        setCartItems(updatedCart);
        toast.info(`Đã tăng số lượng "${productName}"`, {
            position: "top-right",
            autoClose: 1000,
        });
        window.dispatchEvent(new Event("cartUpdated"));
    };

    const decrementQuantity = (id, productName) => {
        const item = cartItems.find((item) => item.id === id);
        if (item.quantity === 1) {
            // SỬA: Xóa sản phẩm nếu quantity === 1
            removeFromCart(id, productName);
        } else {
            const updatedCart = cartItems.map((item) =>
                item.id === id ? { ...item, quantity: item.quantity - 1 } : item
            );
            localStorage.setItem("cart", JSON.stringify(updatedCart));
            setCartItems(updatedCart);
            toast.info(`Đã giảm số lượng "${productName}"`, {
                position: "top-right",
                autoClose: 1000,
            });
            window.dispatchEvent(new Event("cartUpdated"));
        }
    };

    const calculateTotalQuantity = () => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    };

    const calculateTotal = () => {
        return cartItems
            .reduce((total, item) => total + item.price * item.quantity, 0)
            .toLocaleString("vi-VN", { style: "currency", currency: "VND" });
    };

    if (cartItems.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Giỏ hàng của bạn</h2>
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                    <svg
                        className="mx-auto h-16 w-16 text-gray-400 mb-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                    </svg>
                    <p className="text-gray-600 mb-4">
                        Giỏ hàng trống.{" "}
                        <Link to="/home" className="text-green-600 hover:text-green-700 font-medium">
                            Quay lại mua sắm
                        </Link>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Giỏ hàng của bạn ({calculateTotalQuantity()} sản phẩm)
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-md p-6 max-h-[600px] overflow-y-auto">
                        {cartItems.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center border-b border-gray-200 py-4 last:border-b-0"
                            >
                                <Link to={`/product/${item.id}`} className="flex-shrink-0">
                                    <img
                                        src={`http://localhost:8080/api/public/products/image/${item.image}`}
                                        alt={item.productName}
                                        className="w-24 h-24 object-contain rounded-md border border-gray-200"
                                        onError={(e) => {
                                            e.target.src = "https://via.placeholder.com/150?text=No+Image";
                                        }}
                                    />
                                </Link>
                                <div className="ml-4 flex-grow">
                                    <Link to={`/product/${item.id}`}>
                                        <h3 className="text-lg font-semibold text-gray-800 hover:text-green-600 transition-colors">
                                            {item.productName}
                                        </h3>
                                    </Link>
                                    <p className="text-gray-600">
                                        Đơn giá: {item.price.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                                    </p>
                                    <div className="flex items-center mt-2">
                                        <button
                                            className="w-8 h-8 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 transition-colors"
                                            onClick={() => decrementQuantity(item.id, item.productName)}
                                        >
                                            −
                                        </button>
                                        <input
                                            type="text"
                                            className="w-12 mx-2 text-center border border-gray-300 rounded-md"
                                            value={item.quantity}
                                            readOnly
                                        />
                                        <button
                                            className="w-8 h-8 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 transition-colors"
                                            onClick={() => incrementQuantity(item.id, item.productName)}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-semibold text-green-600">
                                        {(item.price * item.quantity).toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                                    </p>
                                    <button
                                        className="mt-2 text-red-600 hover:text-red-700 font-medium transition-colors"
                                        onClick={() => removeFromCart(item.id, item.productName)}
                                    >
                                        <svg
                                            className="inline-block w-5 h-5 mr-1"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                        Xóa
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Tổng cộng</h3>
                        <div className="flex justify-between mb-4">
                            <span className="text-gray-600">Tổng giá:</span>
                            <span className="text-xl font-semibold text-green-600">{calculateTotal()}</span>
                        </div>
                        <Link
                            to="/checkout"
                            className="w-full block text-center bg-green-600 text-white font-semibold py-2 rounded-md hover:bg-green-700 transition-colors mb-3"
                        >
                            Thanh toán
                        </Link>
                        <Link
                            to="/home"
                            className="w-full block text-center bg-gray-100 text-gray-700 font-semibold py-2 rounded-md hover:bg-gray-200 transition-colors"
                        >
                            Tiếp tục mua sắm
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Cart;