// OrderSuccess.jsx
import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "react-toastify";

function OrderSuccess() {
    const { state } = useLocation();
    const orderDetails = state?.orderDetails;

    useEffect(() => {
        if (!orderDetails) {
            toast.error("Không tìm thấy thông tin đơn hàng", {
                position: "top-center",
                autoClose: 3000,
            });
        }
    }, [orderDetails]);

    if (!orderDetails) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Không tìm thấy đơn hàng</h2>
                <Link 
                    to="/home" 
                    className="text-green-600 hover:text-green-700 font-medium"
                >
                    Quay lại trang chủ
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
                <div className="text-center mb-6">
                    <svg
                        className="mx-auto h-16 w-16 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                    <h2 className="text-2xl font-bold text-gray-800 mt-4">
                        Đơn hàng của bạn đã được tiếp nhận!
                    </h2>
                    <p className="text-gray-600 mt-2">
                        Cảm ơn bạn đã mua sắm tại cửa hàng chúng tôi
                    </p>
                </div>

                <div className="border-t border-b border-gray-200 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h3 className="font-medium text-gray-700">Mã đơn hàng</h3>
                            <p className="text-green-600 font-semibold">#{orderDetails.orderId}</p>
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-700">Ngày đặt hàng</h3>
                            <p>{orderDetails.orderDate}</p>
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-700">Phương thức thanh toán</h3>
                            <p className="capitalize">{orderDetails.payment.paymentMethod.toLowerCase()}</p>
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-700">Trạng thái</h3>
                            <p className="text-blue-600">{orderDetails.orderStatus}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-3">Chi tiết đơn hàng</h3>
                    {orderDetails.orderItems.map((item) => (
                        <div key={item.orderItemId} className="flex justify-between py-3 border-b border-gray-100">
                            <div className="flex items-center">
                                <img
                                    src={`http://localhost:8080/api/public/products/image/${item.product.image}`}
                                    alt={item.product.productName}
                                    className="w-12 h-12 object-cover rounded-md mr-3"
                                />
                                <div>
                                    <h4 className="font-medium">{item.product.productName}</h4>
                                    <p className="text-sm text-gray-500">
                                        {item.quantity} × {item.orderedProductPrice.toLocaleString('vi-VN', {
                                            style: 'currency',
                                            currency: 'VND'
                                        })}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold">
                                    {(item.orderedProductPrice * item.quantity).toLocaleString('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND'
                                    })}
                                </p>
                                {item.discount > 0 && (
                                    <p className="text-xs text-green-500">Giảm {item.discount}%</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 text-right">
                    <div className="text-lg font-medium text-gray-700">
                        Tổng cộng:{" "}
                        <span className="text-xl font-bold text-green-600">
                            {orderDetails.totalAmount.toLocaleString('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                            })}
                        </span>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <Link
                        to="/home"
                        className="inline-block bg-green-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-green-700 transition-colors"
                    >
                        Tiếp tục mua sắm
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default OrderSuccess;