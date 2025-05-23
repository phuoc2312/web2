import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

function Cart({ addToCart }) {
    const [cartItems, setCartItems] = useState([]);
    const [totalQuantity, setTotalQuantity] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [cartId, setCartId] = useState(localStorage.getItem("cartId") || null);

    const emailId = localStorage.getItem("authEmail"); // Lấy email từ localStorage
    const API_URL = "http://localhost:8080/api/public";

    const flattenCartItems = (data) => {
        if (!data || !Array.isArray(data)) return [];
        return data.map((item) => ({
            id: item.productId || item.id,
            productName: item.productName,
            price: item.price || 0,
            specialPrice: item.specialPrice || 0,
            image: item.image,
            quantity: item.cartItemQuantity != null ? item.cartItemQuantity : 1,
            stock: item.stock != null ? item.stock : 0,
        }));
    };

    const createCart = async () => {
        if (!emailId) {
            setError("Vui lòng đăng nhập để tạo giỏ hàng.");
            toast.error("Vui lòng đăng nhập.", { position: "top-right", autoClose: 2000 });
            return null;
        }

        try {
            const response = await axios.post(`${API_URL}/users/${encodeURIComponent(emailId)}/carts`);
            const newCartId = response.data.cartId;
            setCartId(newCartId);
            localStorage.setItem("cartId", newCartId);
            setCartItems([]);
            setTotalQuantity(0);
            localStorage.setItem("cart", JSON.stringify([]));
            console.log("Created new cart:", newCartId);
            return newCartId;
        } catch (err) {
            setError("Không thể tạo giỏ hàng mới.");
            toast.error("Lỗi khi tạo giỏ hàng.", { position: "top-right", autoClose: 2000 });
            return null;
        }
    };

    const fetchCartFromServer = async () => {
        if (!emailId) {
            setError("Vui lòng đăng nhập để xem giỏ hàng.");
            toast.error("Vui lòng đăng nhập.", { position: "top-right", autoClose: 2000 });
            setCartItems([]);
            setTotalQuantity(0);
            setLoading(false);
            return;
        }

        setLoading(true);
        let currentCartId = cartId;

        if (!currentCartId) {
            currentCartId = await createCart();
            if (!currentCartId) {
                setLoading(false);
                return;
            }
        }

        try {
            const response = await axios.get(
                `${API_URL}/users/${encodeURIComponent(emailId)}/carts/${currentCartId}`,
                { headers: { Accept: "*/*" } }
            );
            const serverCart = response.data.products || [];
            const flattenedCart = flattenCartItems(serverCart);
            setCartItems(flattenedCart);
            setTotalQuantity(response.data.quantity != null ? response.data.quantity : 0);
            localStorage.setItem("cart", JSON.stringify(flattenedCart));
            localStorage.setItem("cartId", response.data.cartId);
            console.log("Fetched cart from server:", flattenedCart, "Total Quantity:", response.data.quantity);
        } catch (err) {
            setError("Không thể tải giỏ hàng từ server.");
            toast.error("Lỗi khi tải giỏ hàng. Sử dụng dữ liệu local.", {
                position: "top-right",
                autoClose: 2000,
            });
            const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
            setCartItems(flattenCartItems(storedCart));
            setTotalQuantity(storedCart.reduce((sum, item) => sum + (item.quantity || 0), 0));
        } finally {
            setLoading(false);
        }
    };

    const addProductToCart = async (productId, quantity, productName) => {
        if (!emailId) {
            toast.error("Vui lòng đăng nhập để thêm sản phẩm.", { position: "top-right", autoClose: 2000 });
            return null;
        }

        if (!cartId) {
            await createCart();
        }

        try {
            const response = await axios.post(
                `${API_URL}/carts/${cartId}/products/${productId}?quantity=${quantity}`
            );
            await fetchCartFromServer();
            toast.success(`Đã thêm "${productName}" vào giỏ hàng!`, {
                position: "top-right",
                autoClose: 2000,
            });
            window.dispatchEvent(new Event("cartUpdated"));
            return response.data;
        } catch (err) {
            const message = err.response?.data?.message || "Lỗi khi thêm sản phẩm vào giỏ hàng.";
            toast.error(message, { position: "top-right", autoClose: 2000 });
            return null;
        }
    };

    const removeFromCart = async (id, productName) => {
        if (!emailId) {
            toast.error("Vui lòng đăng nhập để xóa sản phẩm.", { position: "top-right", autoClose: 2000 });
            return;
        }

        if (window.confirm(`Bạn có chắc muốn xóa "${productName}" khỏi giỏ hàng?`)) {
            const itemToRemove = cartItems.find((item) => item.id === id);
            try {
                await axios.delete(`${API_URL}/carts/${cartId}/product/${id}`);
                await fetchCartFromServer();
                toast.success(`Đã xóa "${productName}" khỏi giỏ hàng!`, {
                    position: "top-right",
                    autoClose: 2000,
                });
                window.dispatchEvent(new Event("cartUpdated"));
            } catch (err) {
                toast.error("Lỗi khi xóa sản phẩm trên server.", {
                    position: "top-right",
                    autoClose: 2000,
                });
                const updatedCart = cartItems.filter((item) => item.id !== id);
                setCartItems(updatedCart);
                setTotalQuantity(totalQuantity - (itemToRemove.quantity || 0));
                localStorage.setItem("cart", JSON.stringify(updatedCart));
            }
        }
    };

    const incrementQuantity = async (id, productName) => {
        if (!emailId) {
            toast.error("Vui lòng đăng nhập để cập nhật số lượng.", { position: "top-right", autoClose: 2000 });
            return;
        }

        const item = cartItems.find((item) => item.id === id);
        if (item.quantity >= item.stock) {
            toast.error(`Số lượng tối đa là ${item.stock}.`, {
                position: "top-right",
                autoClose: 2000,
            });
            return;
        }
        const newQuantity = item.quantity + 1;
        try {
            await axios.put(`${API_URL}/carts/${cartId}/products/${id}/quantity/${newQuantity}`);
            await fetchCartFromServer();
            toast.info(`Đã tăng số lượng "${productName}"`, {
                position: "top-right",
                autoClose: 1000,
            });
            window.dispatchEvent(new Event("cartUpdated"));
        } catch (err) {
            const message = err.response?.data?.message || "Lỗi khi cập nhật số lượng.";
            toast.error(message, { position: "top-right", autoClose: 2000 });
        }
    };

    const decrementQuantity = async (id, productName) => {
        if (!emailId) {
            toast.error("Vui lòng đăng nhập để cập nhật số lượng.", { position: "top-right", autoClose: 2000 });
            return;
        }

        const item = cartItems.find((item) => item.id === id);
        if (item.quantity <= 1) {
            removeFromCart(id, productName);
        } else {
            const newQuantity = item.quantity - 1;
            try {
                await axios.put(`${API_URL}/carts/${cartId}/products/${id}/quantity/${newQuantity}`);
                await fetchCartFromServer();
                toast.info(`Đã giảm số lượng "${productName}"`, {
                    position: "top-right",
                    autoClose: 1000,
                });
                window.dispatchEvent(new Event("cartUpdated"));
            } catch (err) {
                const message = err.response?.data?.message || "Lỗi khi cập nhật số lượng.";
                toast.error(message, { position: "top-right", autoClose: 2000 });
            }
        }
    };

    useEffect(() => {
        if (cartItems.length > 0) {
            localStorage.setItem("cart", JSON.stringify(cartItems));
            console.log("Saved cart to localStorage:", cartItems);
        } else if (cartItems.length === 0 && cartId) {
            localStorage.setItem("cart", JSON.stringify([]));
            setTotalQuantity(0);
        }
    }, [cartItems]);

    useEffect(() => {
        fetchCartFromServer();
        const handleCartUpdated = () => fetchCartFromServer();
        window.addEventListener("cartUpdated", handleCartUpdated);
        window.addEventListener("storage", fetchCartFromServer);
        return () => {
            window.removeEventListener("cartUpdated", handleCartUpdated);
            window.removeEventListener("storage", fetchCartFromServer);
        };
    }, []);

    const getProductPrice = (item) => {
        return item.specialPrice > 0 ? item.specialPrice : item.price;
    };

    const calculateTotal = () => {
        return cartItems
            .reduce((total, item) => total + getProductPrice(item) * item.quantity, 0)
            .toLocaleString("vi-VN", { style: "currency", currency: "VND" });
    };

    if (!emailId) {
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
                        Vui lòng đăng nhập để xem giỏ hàng.{" "}
                        <Link to="/login" className="text-green-600 hover:text-green-700 font-medium">
                            Đăng nhập
                        </Link>
                    </p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Đang tải giỏ hàng...</h2>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Lỗi</h2>
                <p className="text-red-600">{error}</p>
                <Link to="/home" className="text-green-600 hover:text-green-700 font-medium">
                    Quay lại mua sắm
                </Link>
            </div>
        );
    }

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
                Giỏ hàng của bạn ({totalQuantity} sản phẩm)
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
                                        src={`${API_URL}/products/image/${item.image}`}
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
                                        Đơn giá: {getProductPrice(item).toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                                    </p>
                                    <p className="text-gray-600">Tồn kho: {item.stock}</p>
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
                                        {(getProductPrice(item) * item.quantity).toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
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