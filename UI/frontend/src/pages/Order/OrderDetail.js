import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const OrderDetail = () => {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isCanceling, setIsCanceling] = useState(false);
    const { orderId } = useParams();
    const navigate = useNavigate();
    const API_URL = 'http://localhost:8080/api/public';

    useEffect(() => {
        fetchOrderDetails();
    }, []);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            const email = localStorage.getItem('authEmail');
            const token = localStorage.getItem('authToken');

            if (!email || !token) {
                toast.error('Vui lòng đăng nhập lại');
                navigate('/login');
                return;
            }

            const response = await axios.get(`${API_URL}/users/${encodeURIComponent(email)}/orders/${orderId}`, {
                headers: {
                    'Accept': '*/*',
                    'Authorization': `Bearer ${token}`
                }
            });

            setOrder(response.data);
        } catch (error) {
            console.error('Error fetching order details:', error);
            if (error.response?.status === 401) {
                toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
                localStorage.removeItem('authToken');
                localStorage.removeItem('authEmail');
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async () => {


        try {
            setIsCanceling(true);
            const token = localStorage.getItem('authToken');

            if (!token) {
                toast.error('Vui lòng đăng nhập lại');
                navigate('/login');
                return;
            }

            await axios.delete(`${API_URL}/orders/${orderId}`, {
                headers: {
                    'Accept': '*/*',
                    'Authorization': `Bearer ${token}`
                }
            });

            toast.success('Đơn hàng đã được hủy thành công!');

            // Reload trang sau khi hủy thành công
            window.location.reload();
        } catch (error) {
            console.error('Error canceling order:', error);
            if (error.response?.status === 401) {
                toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
                localStorage.removeItem('authToken');
                localStorage.removeItem('authEmail');
                navigate('/login');
            } else {
                toast.error(error.response?.data?.message || 'Không thể hủy đơn hàng');
            }
        } finally {
            setIsCanceling(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-medium text-gray-900 mb-2">Không tìm thấy đơn hàng</h2>
                    <Link
                        to="/profile"
                        className="text-green-600 hover:text-green-800 font-medium"
                    >
                        Quay lại trang cá nhân
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Chi tiết đơn hàng #{order.orderId}</h1>
                    <div className="flex space-x-2">
                        {order.orderStatus !== 'Cancelled' && (
                            <button
                                onClick={handleCancelOrder}
                                disabled={isCanceling}
                                className={`inline-flex items-center px-4 py-2 rounded-md transition-colors ${isCanceling
                                    ? 'bg-gray-400 text-white cursor-not-allowed'
                                    : 'bg-red-600 text-white hover:bg-red-700'
                                    }`}
                            >
                                {isCanceling ? 'Đang hủy...' : 'Hủy đơn hàng'}
                            </button>
                        )}
                        <Link
                            to="/profile"
                            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        >
                            Quay lại
                        </Link>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Order Summary */}
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Thông tin đơn hàng</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Ngày đặt hàng</h3>
                                <p className="mt-1 text-sm text-gray-900">{order.orderDate}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Tổng tiền</h3>
                                <p className="mt-1 text-sm text-gray-900 font-semibold">
                                    {order.totalAmount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                </p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Phương thức thanh toán</h3>
                                <p className="mt-1 text-sm text-gray-900 capitalize">
                                    {order.payment?.paymentMethod?.toLowerCase() || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Trạng thái</h3>
                                <span
                                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${order.orderStatus === 'Order Accepted'
                                        ? 'bg-green-100 text-green-800'
                                        : order.orderStatus === 'Cancelled'
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                        }`}
                                >
                                    {order.orderStatus}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Sản phẩm</h2>
                        {order.orderItems && order.orderItems.length > 0 ? (
                            <div className="space-y-4">
                                {order.orderItems.map((item) => (
                                    <div
                                        key={item.orderItemId}
                                        className="flex items-center border-b border-gray-200 py-4"
                                    >
                                        {/* Product Image */}
                                        <div className="flex-shrink-0 w-16 h-16">
                                            <img
                                                src={`${API_URL}/products/image/${item.product.image}`}
                                                alt={item.product.productName}
                                                className="w-full h-full object-cover rounded-md"
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                                                    e.target.onerror = null;
                                                }}
                                            />
                                        </div>

                                        {/* Product Details */}
                                        <div className="ml-4 flex-1">
                                            <h3 className="text-sm font-medium text-gray-900">
                                                {item.product.productName}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                Số lượng: {item.quantity}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Giá: {item.orderedProductPrice.toLocaleString('vi-VN', {
                                                    style: 'currency',
                                                    currency: 'VND'
                                                })}
                                            </p>
                                            {item.discount > 0 && (
                                                <p className="text-sm text-green-600">
                                                    Chiết khấu: {item.discount}%
                                                </p>
                                            )}
                                        </div>

                                        {/* Total Price */}
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-gray-900">
                                                {(item.orderedProductPrice * item.quantity).toLocaleString('vi-VN', {
                                                    style: 'currency',
                                                    currency: 'VND'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">Không có sản phẩm trong đơn hàng.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;