import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import emailjs from '@emailjs/browser';

function Checkout() {
    const [cartItems, setCartItems] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState("COD");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [cartId, setCartId] = useState(localStorage.getItem("cartId") || null);
    const navigate = useNavigate();

    const emailId = localStorage.getItem("authEmail");
    const API_URL = "http://localhost:8080/api/public";

    // Hàm làm phẳng dữ liệu giỏ hàng
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

    // Lấy giỏ hàng từ server
    const fetchCartFromServer = async () => {
        if (!emailId) {
            setError("Vui lòng đăng nhập để thanh toán");
            toast.error("Vui lòng đăng nhập.", { position: "top-right", autoClose: 2000 });
            setCartItems([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        let currentCartId = cartId;

        if (!currentCartId) {
            setError("Không tìm thấy giỏ hàng");
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(
                `${API_URL}/users/${encodeURIComponent(emailId)}/carts/${currentCartId}`,
                {
                    headers: {
                        Accept: "*/*",
                        Authorization: `Bearer ${localStorage.getItem("authToken")}`
                    }
                }
            );
            const serverCart = response.data.products || [];
            const flattenedCart = flattenCartItems(serverCart);
            setCartItems(flattenedCart);
            localStorage.setItem("cart", JSON.stringify(flattenedCart));
        } catch (err) {
            setError("Không thể tải giỏ hàng từ server");
            toast.error("Lỗi khi tải giỏ hàng. Sử dụng dữ liệu local.", {
                position: "top-right",
                autoClose: 2000,
            });
            const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
            setCartItems(flattenCartItems(storedCart));
        } finally {
            setLoading(false);
        }
    };

    // Xóa tất cả sản phẩm trong giỏ hàng
    const clearCart = async () => {
        if (!emailId || !cartId) {
            setCartItems([]);
            localStorage.setItem("cart", JSON.stringify([]));
            window.dispatchEvent(new Event("cartUpdated"));
            toast.success("Đã xóa giỏ hàng!", {
                position: "top-right",
                autoClose: 2000,
            });
            return;
        }

        try {
            await axios.delete(`${API_URL}/carts/${cartId}/clear`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("authToken")}`
                }
            });
            console.log("Giỏ hàng đã được xóa trên server.");
            toast.success("Đã xóa giỏ hàng!", {
                position: "top-right",
                autoClose: 2000,
            });
        } catch (error) {
            console.warn("Không thể xóa giỏ hàng trên server:", error.message);
            if (error.response?.status === 404) {
                console.warn("Giỏ hàng không tồn tại hoặc endpoint không được triển khai.");
            }
        } finally {
            setCartItems([]);
            localStorage.setItem("cart", JSON.stringify([]));
            window.dispatchEvent(new Event("cartUpdated"));
            toast.success("Đã xóa giỏ hàng!", {
                position: "top-right",
                autoClose: 2000,
            });
        }
    };

    useEffect(() => {
        fetchCartFromServer();
        const handleCartUpdated = () => fetchCartFromServer();
        window.addEventListener("cartUpdated", handleCartUpdated);
        return () => {
            window.removeEventListener("cartUpdated", handleCartUpdated);
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

    const calculateTotalQuantity = () => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    };

    const placeOrder = async () => {
        try {
            const authToken = localStorage.getItem("authToken");
            if (!authToken) {
                throw new Error("Bạn cần đăng nhập để đặt hàng!");
            }

            const response = await axios.post(
                `${API_URL}/users/${encodeURIComponent(emailId)}/carts/${cartId}/payments/${paymentMethod}/order`,
                {},
                {
                    headers: {
                        "Authorization": `Bearer ${authToken}`,
                        "Accept": "*/*",
                        "Content-Type": "application/json"
                    }
                }
            );

            if (response.status === 201) {
                console.log("Place order response:", response.data);
                return response.data;
            } else {
                throw new Error("Đặt hàng không thành công");
            }
        } catch (error) {
            console.error("Lỗi khi tạo đơn hàng:", error);
            if (error.response) {
                console.error("Chi tiết lỗi:", error.response.data);
                throw new Error(error.response.data.message || "Lỗi khi tạo đơn hàng");
            } else {
                throw new Error("Không thể kết nối đến server");
            }
        }
    };

    const sendOrderConfirmationEmail = async (orderData) => {
        try {
            if (!emailId || !orderData.orderId || !orderData.totalAmount || !orderData.payment?.paymentMethod || !orderData.orderStatus) {
                throw new Error("Thiếu thông tin cần thiết để gửi email xác nhận.");
            }

            const cartItemsString = cartItems
                .map(
                    (item) => `${item.productName} - Số lượng: ${item.quantity} - Giá: ${getProductPrice(item).toLocaleString("vi-VN", { style: "currency", currency: "VND" })}`
                )
                .join("\n") || "Không có sản phẩm";

            console.log("EmailJS params:", {
                to_email: emailId,
                to_name: emailId || "Khách hàng",
                order_id: orderData.orderId,
                total_amount: orderData.totalAmount.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
                payment_method: orderData.payment.paymentMethod.toLowerCase(),
                order_status: orderData.orderStatus,
                cart_items: cartItemsString,
            });

            await emailjs.send(
                'service_rwxo0mm',
                'template_lkw3kwb', // Đã sửa Template ID thành template_k0rcirr
                {
                    to_email: emailId,
                    to_name: emailId || "Khách hàng",
                    order_id: orderData.orderId,
                    total_amount: orderData.totalAmount.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
                    payment_method: orderData.payment.paymentMethod.toLowerCase(),
                    order_status: orderData.orderStatus,
                    cart_items: cartItemsString,
                },
                'tGyWcv9aFaDu0nXq7'
            );
            toast.success("Email xác nhận đơn hàng đã được gửi!", {
                position: "top-right",
                autoClose: 2000,
            });
        } catch (error) {
            console.error("Lỗi khi gửi email xác nhận:", error);
            toast.error("Không thể gửi email xác nhận đơn hàng.", {
                position: "top-right",
                autoClose: 2000,
            });
        }
    };

    const handlePlaceOrder = async () => {
        try {
            setLoading(true);
            const orderData = await placeOrder();

            await sendOrderConfirmationEmail(orderData);

            await clearCart();

            toast.success(
                <div>
                    <div className="font-bold text-lg mb-2">Đặt hàng thành công!</div>
                    <div className="grid grid-cols-2 gap-2">
                        <span className="font-medium">Mã đơn hàng:</span>
                        <span className="text-green-600">#{orderData.orderId}</span>
                        <span className="font-medium">Tổng tiền:</span>
                        <span className="text-green-600">
                            {orderData.totalAmount.toLocaleString('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                            })}
                        </span>
                        <span className="font-medium">Phương thức:</span>
                        <span className="capitalize">{orderData.payment.paymentMethod.toLowerCase()}</span>
                        <span className="font-medium">Trạng thái:</span>
                        <span className="text-blue-600">{orderData.orderStatus}</span>
                    </div>
                    <div className="mt-2 text-sm">
                        Cảm ơn bạn đã đặt hàng! Chúng tôi sẽ liên hệ với bạn sớm.
                    </div>
                </div>,
                {
                    position: "top-right",
                    autoClose: 5000,
                    closeButton: true,
                    draggable: true,
                    className: '!bg-white !text-gray-800 !shadow-lg !rounded-lg !border !border-gray-200',
                    progressClassName: '!bg-green-500',
                }
            );

            setTimeout(() => {
                navigate("/order-success", {
                    state: {
                        orderId: orderData.orderId,
                        orderDetails: orderData
                    }
                });
            }, 3000);
        } catch (error) {
            console.error("Lỗi đặt hàng:", error);
            toast.error(
                <div>
                    <div className="font-bold">Đặt hàng không thành công</div>
                    <div className="text-sm mt-1">{error.message || "Vui lòng thử lại sau"}</div>
                </div>,
                {
                    position: "top-right",
                    autoClose: 1000,
                    className: '!bg-red-100 !text-red-800',
                }
            );
        } finally {
            setLoading(false);
        }
    };

    if (!emailId) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Thanh toán</h2>
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
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                    </svg>
                    <p className="text-gray-600 mb-4">
                        Vui lòng đăng nhập để thanh toán.{" "}
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
                <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Lỗi</h2>
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
                    <p>{error}</p>
                </div>
                <Link
                    to="/home"
                    className="inline-block bg-green-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                >
                    Quay lại mua sắm
                </Link>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Thanh toán</h2>
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
                Thanh toán ({calculateTotalQuantity()} sản phẩm)
            </h2>
            <div className="grid grid-cols-1 gap-6">
                <div className="bg-white rounded-lg shadow-md p-6">

                    <h3 className="text-xl font-bold text-gray-800 mb-4">Sản phẩm trong giỏ hàng</h3>
                    <div className="ml-3">
                        <p className="text-xl text-yellow-700">
                            Vui lòng kiểm tra và{" "}
                            <Link to="/profile" className="font-medium text-yellow-700 underline hover:text-yellow-600">
                                cập nhật thông tin địa chỉ
                            </Link>{" "}
                            của bạn trước khi đặt hàng để đảm bảo giao hàng chính xác.
                        </p>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {cartItems.map((item) => (
                            <div key={item.id} className="flex py-4">
                                <div className="flex-shrink-0">
                                    <img
                                        src={`${API_URL}/products/image/${item.image}`}
                                        alt={item.productName}
                                        className="w-20 h-20 object-contain rounded-md border border-gray-200"
                                        onError={(e) => {
                                            e.target.src = "https://via.placeholder.com/150?text=No+Image";
                                        }}
                                    />
                                </div>
                                <div className="ml-4 flex-grow">
                                    <h4 className="text-lg font-semibold text-gray-800">
                                        {item.productName}
                                    </h4>
                                    <div className="mt-1 flex flex-wrap items-center gap-4">
                                        <p className="text-gray-600">
                                            <span className="font-medium">Đơn giá:</span>{" "}
                                            {getProductPrice(item).toLocaleString("vi-VN", {
                                                style: "currency",
                                                currency: "VND",
                                            })}
                                            {item.specialPrice > 0 && (
                                                <span className="ml-2 text-sm text-gray-400 line-through">
                                                    {item.price.toLocaleString("vi-VN", {
                                                        style: "currency",
                                                        currency: "VND",
                                                    })}
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-gray-600">
                                            <span className="font-medium">Số lượng:</span> {item.quantity}
                                        </p>
                                    </div>
                                </div>
                                <div className="ml-4 text-right">
                                    <p className="text-lg font-semibold text-green-600">
                                        {(getProductPrice(item) * item.quantity).toLocaleString("vi-VN", {
                                            style: "currency",
                                            currency: "VND",
                                        })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 border-t border-gray-200 pt-4">
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-medium text-gray-700">Tổng cộng:</span>
                            <span className="text-xl font-bold text-green-600">
                                {calculateTotal()}
                            </span>
                        </div>
                    </div>

                    <div className="mt-6">
                        <div className="mb-4">
                            <label className="block text-gray-700 font-medium mb-2">
                                Phương thức thanh toán
                            </label>
                            <select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                <option value="COD">Thanh toán khi nhận hàng (COD)</option>
                                <option value="MOMO">Thanh toán qua MOMO</option>
                                <option value="BankTransfer">Chuyển khoản ngân hàng</option>
                            </select>
                        </div>

                        <button
                            onClick={handlePlaceOrder}
                            disabled={loading}
                            className="w-full bg-green-600 text-white font-semibold py-3 px-4 rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Đang xử lý..." : "Đặt hàng ngay"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Checkout;