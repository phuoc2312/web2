import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { GET_ALL, GET_ID } from "../../api/apiService";
import { ShoppingCart, Heart, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';
const SectionContent = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState(null);
    const [allCategories, setAllCategories] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [sortOption, setSortOption] = useState("newest");
    const [quantity, setQuantity] = useState(1);
    const navigate = useNavigate();
    const location = useLocation();

    const queryParams = new URLSearchParams(location.search);
    const currentPage = parseInt(queryParams.get("page")) || 1;
    const categoryId = queryParams.get("categoryId");
    const numItems = 8;

    // Hàm xử lý phân trang
    const handlePageChange = (page) => {
        navigate(`/ListingGrid?page=${page}${categoryId ? `&categoryId=${categoryId}` : ""}`);
    };

    const handlePrevious = () => currentPage > 1 && handlePageChange(currentPage - 1);
    const handleNext = () => currentPage < totalPages && handlePageChange(currentPage + 1);

    const renderPageNumbers = () => {
        const pageNumbers = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        if (startPage > 1) {
            pageNumbers.push(
                <li key={1} className={`page-item ${currentPage === 1 ? "active" : ""}`}>
                    <button className="page-link" onClick={() => handlePageChange(1)}>1</button>
                </li>
            );
            if (startPage > 2) {
                pageNumbers.push(<li key="start-ellipsis" className="page-item disabled"><span className="page-link">...</span></li>);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(
                <li key={i} className={`page-item ${currentPage === i ? "active" : ""}`}>
                    <button className="page-link" onClick={() => handlePageChange(i)}>{i}</button>
                </li>
            );
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pageNumbers.push(<li key="end-ellipsis" className="page-item disabled"><span className="page-link">...</span></li>);
            }
            pageNumbers.push(
                <li key={totalPages} className={`page-item ${currentPage === totalPages ? "active" : ""}`}>
                    <button className="page-link" onClick={() => handlePageChange(totalPages)}>{totalPages}</button>
                </li>
            );
        }

        return pageNumbers;
    };

    const handleCategoryChange = (e) => {
        const selectedId = e.target.value;
        navigate(`/ListingGrid?page=1${selectedId ? `&categoryId=${selectedId}` : ""}`);
    };

    const handleSortChange = (e) => {
        setSortOption(e.target.value);
        // Thêm logic sắp xếp sản phẩm ở đây
    };

    // Fetch danh mục
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                // Thêm tham số phân trang nếu API yêu cầu
                const params = {
                    pageNumber: 0,
                    pageSize: 100, // Lấy nhiều danh mục
                    sortBy: "categoryId",
                    sortOrder: "asc"
                };

                const res = await GET_ALL("categories", params);
                console.log("Categories API Response:", res); // Debug

                // Xử lý nhiều định dạng response khác nhau
                let categoriesData = [];
                if (Array.isArray(res)) {
                    categoriesData = res;
                } else if (res?.content && Array.isArray(res.content)) {
                    categoriesData = res.content;
                } else if (res?.data && Array.isArray(res.data)) {
                    categoriesData = res.data;
                }

                console.log("Extracted Categories:", categoriesData); // Debug
                setAllCategories(categoriesData);

            } catch (err) {
                console.error("Lỗi lấy danh mục:", err);
                setAllCategories([]);
            }
        };

        fetchCategories();
    }, []);
    // Fetch sản phẩm
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const params = {
                pageNumber: currentPage - 1,
                pageSize: numItems,
                sortBy: sortOption === "newest" ? "productId" :
                    sortOption === "price-asc" ? "price" :
                        sortOption === "price-desc" ? "price" : "productId",
                sortOrder: sortOption === "price-desc" ? "desc" : "asc",
            };

            try {
                let productResponse;
                if (categoryId) {
                    productResponse = await GET_ALL(`categories/${categoryId}/products`, params);
                    const categoryResponse = await GET_ID("categories", categoryId);
                    setCategories(categoryResponse);
                } else {
                    productResponse = await GET_ALL("products", params);
                    setCategories({ categoryName: "Tất cả sản phẩm" });
                }

                setProducts(productResponse.content || []);
                setTotalPages(productResponse.totalPages || 1);
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentPage, categoryId, sortOption]);
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
        <section className="py-12 bg-gray-50">
            <div className="container mx-auto px-4">
                {/* Breadcrumb và tiêu đề */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <div className="mb-4 md:mb-0">
                        <nav className="flex" aria-label="Breadcrumb">
                            <ol className="inline-flex items-center space-x-1 md:space-x-3">
                                <li className="inline-flex items-center">
                                    <Link to="/" className="text-gray-700 hover:text-green-600 inline-flex items-center">
                                        Trang chủ
                                    </Link>
                                </li>
                                <li>
                                    <div className="flex items-center">
                                        <ChevronRight className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-500 ml-1 md:ml-2">
                                            {categories?.categoryName || "Sản phẩm"}
                                        </span>
                                    </div>
                                </li>
                            </ol>
                        </nav>
                        <h1 className="text-2xl font-bold text-gray-800 mt-2">
                            {categories?.categoryName || "Tất cả sản phẩm"}
                        </h1>
                    </div>

                    {/* Bộ lọc và sắp xếp */}
                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <select
                            className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            onChange={handleCategoryChange}
                            value={categoryId || ""}
                        >
                            <option value="">Tất cả danh mục</option>
                            {allCategories.map(category => (
                                <option key={category.categoryId} value={category.categoryId}>
                                    {category.categoryName}
                                </option>
                            ))}
                        </select>
                        <select
                            className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            onChange={handleSortChange}
                            value={sortOption}
                        >
                            <option value="newest">Mới nhất</option>
                            <option value="price-asc">Giá: Thấp đến cao</option>
                            <option value="price-desc">Giá: Cao đến thấp</option>
                        </select>
                    </div>
                </div>

                {/* Danh sách sản phẩm */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                    </div>
                ) : products.length > 0 ? (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                            {products.map(product => (
                                <div key={product.productId} className="bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
                                    {/* Hình ảnh sản phẩm */}
                                    <Link to={`/product/${product.productId}`}>
                                        <div className="relative overflow-hidden">
                                            <img
                                                src={`http://localhost:8080/api/public/products/image/${product.image}`}
                                                alt={product.productName}
                                                className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                        </div>
                                    </Link>


                                    {/* Thông tin sản phẩm */}
                                    <div className="p-4">
                                        <Link to={`/product/${product.productId}`}>
                                            <h3 className="text-base font-semibold text-gray-800 hover:text-green-600 line-clamp-2 mb-2">
                                                {product.productName}
                                            </h3>
                                        </Link>

                                        {/* Giá sản phẩm */}
                                        <div className="mt-2">
                                            {product.discount > 0 ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg font-bold text-green-600">
                                                        {(product.price * (100 - product.discount) / 100).toLocaleString('vi-VN')}₫
                                                    </span>
                                                    <span className="text-sm text-gray-500 line-through">
                                                        {product.price.toLocaleString('vi-VN')}₫
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-lg font-bold text-green-600">
                                                    {product.price.toLocaleString('vi-VN')}₫
                                                </span>
                                            )}
                                        </div>

                                        {/* Nút hành động */}
                                        <div className="mt-4 flex justify-between items-center">
                                            <button
                                                onClick={() => addToCart(product)}
                                                className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-md text-sm flex items-center gap-1 transition-colors duration-200"
                                            >
                                                <i className="fas fa-shopping-cart"></i>
                                                <span>Thêm vào giỏ hàng</span>
                                            </button>

                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Phân trang */}
                        {totalPages > 1 && (
                            <div className="mt-10 flex justify-center">
                                <nav className="inline-flex rounded-md shadow-sm">
                                    <button
                                        onClick={handlePrevious}
                                        disabled={currentPage === 1}
                                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>

                                    <div className="hidden sm:flex">
                                        {renderPageNumbers()}
                                    </div>

                                    <button
                                        onClick={handleNext}
                                        disabled={currentPage === totalPages}
                                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </button>
                                </nav>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-12">
                        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">Không tìm thấy sản phẩm</h3>
                        <p className="text-gray-500 mb-6">Xin lỗi, chúng tôi không tìm thấy sản phẩm nào phù hợp với lựa chọn của bạn.</p>
                        <Link
                            to="/ListingGrid"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            Xem tất cả sản phẩm
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
};

export default SectionContent;