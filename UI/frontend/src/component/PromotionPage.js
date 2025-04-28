import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { GET_ALL } from "../api/apiService";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const PromotionSectionContent = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [quantity, setQuantity] = useState(1);
    const navigate = useNavigate();
    const location = useLocation();

    const queryParams = new URLSearchParams(location.search);
    const currentPage = parseInt(queryParams.get("page")) || 1;
    // SỬA: Đặt numItems = 4 giống phiên bản trước
    const numItems = 4;

    // SỬA: Bỏ kiểm tra giới hạn trang
    const handlePageChange = (page) => {
        navigate(`/promotions?page=${page}`);
    };

    const handlePrevious = () => {
        if (currentPage > 1) {
            handlePageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            handlePageChange(currentPage + 1);
        }
    };

    // SỬA: Hiển thị tất cả số trang, bỏ dấu ba chấm
    const renderPageNumbers = () => {
        const pageNumbers = [];
        for (let i = 1; i <= totalPages; i++) {
            pageNumbers.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`px-3 py-1 border ${i === currentPage ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                >
                    {i}
                </button>
            );
        }
        return pageNumbers;
    };

    useEffect(() => {
        const fetchPromotionProducts = async () => {
            setLoading(true);
            // SỬA: Đặt pageSize = numItems * 100 để lấy nhiều dữ liệu
            const params = {
                pageNumber: 0, // Lấy tất cả dữ liệu từ trang 0
                pageSize: numItems * 100,
                sortBy: "productId",
                sortOrder: "asc",
            };

            try {
                const response = await GET_ALL("http://localhost:8080/api/public/products/promotions", params);
                setProducts(response.content || []);
                // SỬA: Tính totalPages giống phiên bản trước
                setTotalPages(Math.ceil((response.totalElements || response.content?.length || 0) / numItems));
            } catch (err) {
                console.error("Lỗi lấy sản phẩm khuyến mãi:", err);
                toast.error("Lỗi lấy sản phẩm khuyến mãi. Vui lòng thử lại.");
            } finally {
                setLoading(false);
            }
        };

        fetchPromotionProducts();
    }, []); // SỬA: Bỏ currentPage khỏi dependencies để chỉ gọi API một lần

    // THÊM: Cắt danh sách sản phẩm để hiển thị đúng trang
    const currentProducts = products.slice((currentPage - 1) * numItems, currentPage * numItems);

    const addToCart = async (item, qty = 1) => {
        try {
            // Lấy thông tin từ localStorage
            const authEmail = localStorage.getItem("authEmail") || "mai@gmail.com";
            const authToken = localStorage.getItem("authToken");
            let cart = JSON.parse(localStorage.getItem("cart")) || [];
            let cartId = localStorage.getItem("cartId");
    
            // Nếu chưa có cartId, tạo giỏ hàng mới
            if (!cartId) {
                const createCartResponse = await fetch(`http://localhost:8080/api/public/users/${encodeURIComponent(authEmail)}/carts`, {
                    method: "POST",
                    headers: {
                        "Accept": "*/*",
                        "Authorization": `Bearer ${authToken}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({}),
                });
    
                if (!createCartResponse.ok) {
                    throw new Error("Không thể tạo giỏ hàng mới");
                }
    
                const createCartData = await createCartResponse.json();
                cartId = createCartData.cartId;
                localStorage.setItem("cartId", cartId);
            }
    
            // Gọi API để thêm/cập nhật sản phẩm vào giỏ hàng
            const addProductResponse = await fetch(`http://localhost:8080/api/public/carts/${cartId}/products/${item.productId}/quantity/${qty}`, {
                method: "POST",
                headers: {
                    "Accept": "*/*",
                    "Authorization": `Bearer ${authToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({}),
            });
    
            if (!addProductResponse.ok) {
                throw new Error("Không thể thêm sản phẩm vào giỏ hàng");
            }
    
            // Cập nhật giỏ hàng cục bộ trong localStorage
            const cartItem = {
                productId: item.productId,
                productName: item.productName,
                price: item.price,
                image: item.image,
                quantity: qty,
            };
    
            const existingItemIndex = cart.findIndex((cartItem) => cartItem.productId === item.productId);
            if (existingItemIndex > -1) {
                cart[existingItemIndex].quantity += qty;
            } else {
                cart.push(cartItem);
            }
    
            localStorage.setItem("cart", JSON.stringify(cart));
    
            // Kích hoạt sự kiện cập nhật giỏ hàng
            window.dispatchEvent(new Event("cartUpdated"));
    
            // Hiển thị thông báo thành công
            toast.success(`${cartItem.productName} đã được thêm vào giỏ hàng!`, {
                position: "top-right",
                autoClose: 3000,
            });
        } catch (error) {
            console.error("Lỗi khi thêm sản phẩm vào giỏ hàng:", error);
            toast.error("Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng!", {
                position: "top-right",
                autoClose: 3000,
            });
        }
    };

    return (
        <section className="section-content py-5 bg-gray-50">
            <div className="container mx-auto px-4">
                <header className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Sản phẩm khuyến mãi</h2>
                </header>

                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                    </div>
                ) : currentProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {currentProducts.map((product) => (
                            <div key={product.productId} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                                <Link to={`/product/${product.productId}`} className="block relative">
                                    <div className="aspect-w-1 aspect-h-1">
                                        <img
                                            src={`http://localhost:8080/api/public/products/image/${product.image}`}
                                            alt={product.productName}
                                            className="object-contain w-full h-48 p-2"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "https://via.placeholder.com/400x400?text=No+Image";
                                            }}
                                        />
                                    </div>
                                    {product.discount > 0 && (
                                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                            -{product.discount}%
                                        </div>
                                    )}
                                </Link>
                                
                                <div className="p-4">
                                    <Link to={`/product/${product.productId}`} className="block mb-2">
                                        <h3 className="text-lg font-semibold text-gray-800 hover:text-green-600 transition-colors duration-200 line-clamp-2">
                                            {product.productName}
                                        </h3>
                                    </Link>

                                    <div className="flex flex-col space-y-2">
                                        <div className="flex items-center space-x-2">
                                            {product.discount > 0 ? (
                                                <>
                                                    <span className="text-xl font-bold text-red-600">
                                                        {(product.price * (100 - product.discount) / 100).toLocaleString('vi-VN')}₫
                                                    </span>
                                                    <span className="text-sm text-gray-500 line-through">
                                                        {product.price.toLocaleString('vi-VN')}₫
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="text-xl font-bold text-green-600">
                                                    {product.price.toLocaleString('vi-VN')}₫
                                                </span>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => addToCart(product)}
                                            className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center space-x-2 transition-colors duration-200"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                                            </svg>
                                            <span>Thêm vào giỏ</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="mt-4 text-lg font-medium text-gray-600">Không có sản phẩm khuyến mãi</h3>
                        <p className="mt-1 text-gray-500">Hiện tại không có sản phẩm nào đang khuyến mãi</p>
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="mt-10 flex justify-center items-center space-x-1">
                        <button
                            onClick={handlePrevious}
                            disabled={currentPage === 1}
                            className={`p-2 rounded-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                        >
                            <FiChevronLeft className="w-5 h-5" />
                        </button>
                        
                        <div className="flex space-x-1">
                            {renderPageNumbers()}
                        </div>
                        
                        <button
                            onClick={handleNext}
                            disabled={currentPage === totalPages}
                            className={`p-2 rounded-md ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                        >
                            <FiChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};

export default PromotionSectionContent;