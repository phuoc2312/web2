import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Checkout() {
    const [cartItems, setCartItems] = useState([]);
    const [formData, setFormData] = useState({
        fullName: "",
        address: "",
        phone: "",
        note: "",
        paymentMethod: "COD",
    });
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

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
        window.addEventListener("cartUpdated", updateCartFromStorage);
        return () => {
            window.removeEventListener("cartUpdated", updateCartFromStorage);
        };
    }, []);

    const calculateTotal = () => {
        return cartItems
            .reduce((total, item) => total + item.price * item.quantity, 0)
            .toLocaleString("vi-VN", { style: "currency", currency: "VND" });
    };

    const calculateTotalQuantity = () => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setErrors({ ...errors, [name]: "" });
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.fullName.trim()) newErrors.fullName = "Họ tên là bắt buộc";
        if (!formData.address.trim()) newErrors.address = "Địa chỉ là bắt buộc";
        if (!formData.phone.trim()) newErrors.phone = "Số điện thoại là bắt buộc";
        else if (!/^\d{10,11}$/.test(formData.phone)) newErrors.phone = "Số điện thoại không hợp lệ";
        return newErrors;
    };

    const placeOrder = async (paymentMethod) => {
        try {
            const authEmail = localStorage.getItem("authEmail");
            const authToken = localStorage.getItem("authToken");
            const cartId = localStorage.getItem("cartId");

            if (!cartId) {
                throw new Error("Giỏ hàng không tồn tại. Vui lòng thêm sản phẩm trước!");
            }

            if (!authToken) {
                throw new Error("Bạn cần đăng nhập để đặt hàng!");
            }

            const orderResponse = await fetch(
                `http://localhost:8080/api/public/users/${encodeURIComponent(authEmail)}/carts/${cartId}/payments/${paymentMethod}/order`,
                {
                    method: "POST",
                    headers: {
                        "Accept": "*/*",
                        "Authorization": `Bearer ${authToken}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({}),
                }
            );

            if (!orderResponse.ok) {
                throw new Error(`Không thể tạo đơn hàng: ${orderResponse.status}`);
            }

            const orderData = await orderResponse.json();
            localStorage.removeItem("cart");

            window.dispatchEvent(new Event("cartUpdated"));
            return orderData;
        } catch (error) {
            console.error("Lỗi khi tạo đơn hàng:", error);
            throw error;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        try {
            const orderData = await placeOrder(formData.paymentMethod);

            toast.success(`Đơn hàng #${orderData.orderId} đã được tạo thành công!`, {
                position: "top-right",
                autoClose: 3000,
            });

            navigate("/home");
        } catch (error) {
            // Lưu đơn hàng tạm thời vào localStorage nếu API thất bại
            const order = {
                customerInfo: {
                    fullName: formData.fullName,
                    address: formData.address,
                    phone: formData.phone,
                    note: formData.note,
                },
                cartItems,
                total: cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
                paymentMethod: formData.paymentMethod,
                orderDate: new Date().toISOString(),
            };

            const orders = JSON.parse(localStorage.getItem("orders")) || [];
            orders.push(order);
            localStorage.setItem("orders", JSON.stringify(orders));

            localStorage.removeItem("cart");

            window.dispatchEvent(new Event("cartUpdated"));

            toast.warn("Đơn hàng đã được lưu tạm thời do lỗi kết nối!", {
                position: "top-right",
                autoClose: 3000,
            });

            navigate("/home");
        }
    };

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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Danh sách sản phẩm */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Sản phẩm trong giỏ hàng</h3>
                        {cartItems.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center border-b border-gray-200 py-4 last:border-b-0"
                            >
                                <div className="flex-grow">
                                    <h4 className="text-lg font-semibold text-gray-800">{item.productName}</h4>
                                    <p className="text-gray-600">
                                        Đơn giá: {item.price.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                                    </p>
                                    <p className="text-gray-600">Số lượng: {item.quantity}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-semibold text-green-600">
                                        {(item.price * item.quantity).toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                                    </p>
                                </div>
                            </div>
                        ))}
                        <div className="mt-4 text-right">
                            <p className="text-xl font-bold text-gray-800">
                                Tổng cộng: {calculateTotal()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form thanh toán */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Thông tin thanh toán</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-medium mb-1">Họ tên *</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    className={`w-full border rounded-md px-3 py-2 ${errors.fullName ? "border-red-500" : "border-gray-300"}`}
                                />
                                {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-medium mb-1">Địa chỉ *</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    className={`w-full border rounded-md px-3 py-2 ${errors.address ? "border-red-500" : "border-gray-300"}`}
                                />
                                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-medium mb-1">Số điện thoại *</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className={`w-full border rounded-md px-3 py-2 ${errors.phone ? "border-red-500" : "border-gray-300"}`}
                                />
                                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-medium mb-1">Ghi chú</label>
                                <textarea
                                    name="note"
                                    value={formData.note}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                    rows="4"
                                ></textarea>
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-medium mb-1">Phương thức thanh toán</label>
                                <div className="flex items-center mb-2">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="COD"
                                        checked={formData.paymentMethod === "COD"}
                                        onChange={handleInputChange}
                                        className="mr-2"
                                    />
                                    <span>Thanh toán khi nhận hàng (COD)</span>
                                </div>
                                <div className="flex items-center mb-2">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="MOMO"
                                        checked={formData.paymentMethod === "MOMO"}
                                        onChange={handleInputChange}
                                        className="mr-2"
                                    />
                                    <span>Thanh toán qua MOMO</span>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="BankTransfer"
                                        checked={formData.paymentMethod === "BankTransfer"}
                                        onChange={handleInputChange}
                                        className="mr-2"
                                    />
                                    <span>Chuyển khoản ngân hàng</span>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-green-600 text-white font-semibold py-2 rounded-md hover:bg-green-700 transition-colors"
                            >
                                Đặt hàng
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Checkout;