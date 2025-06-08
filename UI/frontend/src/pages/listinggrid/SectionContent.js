import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { GET_ALL, GET_ID } from "../../api/apiService";
import { ShoppingCart, Heart, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';

const SectionContent = () => {
    const [allProducts, setAllProducts] = useState([]); // Lưu tất cả sản phẩm
    const [products, setProducts] = useState([]); // Sản phẩm hiển thị trên trang hiện tại
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
    const numItems = 5;

    // Hàm xử lý phân trang
    const handlePageChange = (page) => {
        navigate(`/ListingGrid?page=${page}${categoryId ? `&categoryId=${categoryId}` : ""}`);
    };

    const handlePrevious = () => currentPage > 1 && handlePageChange(currentPage - 1);
    const handleNext = () => currentPage < totalPages && handlePageChange(currentPage + 1);

    // Render số trang - đơn giản hiển thị tất cả các trang
    const renderPageNumbers = () => {
        const pageNumbers = [];
        for (let i = 1; i <= totalPages; i++) {
            pageNumbers.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`px-3 py-1 border ${i === currentPage ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                >
                    {i}
                </button>
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
    };

    // Fetch danh mục
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const params = {
                    pageNumber: 0,
                    pageSize: 100,
                    sortBy: "categoryId",
                    sortOrder: "asc"
                };

                const res = await GET_ALL("categories", params);
                let categoriesData = Array.isArray(res) ? res :
                    res?.content && Array.isArray(res.content) ? res.content :
                    res?.data && Array.isArray(res.data) ? res.data : [];
                setAllCategories(categoriesData);
            } catch (err) {
                console.error("Lỗi lấy danh mục:", err);
                setAllCategories([]);
            }
        };

        fetchCategories();
    }, []);

    // Fetch tất cả sản phẩm một lần
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Tham số để lấy tất cả sản phẩm
                const params = {
                    pageNumber: 0, // Lấy từ trang đầu tiên
                    pageSize: 1000, // Lấy số lượng lớn để có tất cả sản phẩm
                    sortBy: sortOption === "newest" ? "productId" :
                        sortOption === "price-asc" ? "price" :
                            sortOption === "price-desc" ? "price" : "productId",
                    sortOrder: sortOption === "price-desc" ? "desc" : "asc",
                };

                let productResponse;
                if (categoryId) {
                    productResponse = await GET_ALL(`categories/${categoryId}/products`, params);
                    const categoryResponse = await GET_ID("categories", categoryId);
                    setCategories(categoryResponse);
                } else {
                    productResponse = await GET_ALL("products", params);
                    setCategories({ categoryName: "Tất cả sản phẩm" });
                }

                // Lưu tất cả sản phẩm vào state
                const allProductsData = productResponse.content || [];
                setAllProducts(allProductsData);
                
                // Tính toán tổng số trang
                setTotalPages(Math.ceil(allProductsData.length / numItems));
                
            } catch (error) {
                console.error("Failed to fetch data:", error);
                toast.error("Lỗi khi tải dữ liệu sản phẩm");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [categoryId, sortOption]);

    // Cắt sản phẩm hiển thị theo trang hiện tại
    useEffect(() => {
        const startIndex = (currentPage - 1) * numItems;
        const endIndex = startIndex + numItems;
        setProducts(allProducts.slice(startIndex, endIndex));
    }, [currentPage, allProducts]);

    const addToCart = async (item, qty = 1) => {
        try {
            if (!item?.productId) {
                throw new Error("Thông tin sản phẩm không hợp lệ");
            }

            // Kiểm tra đăng nhập
            const authEmail = localStorage.getItem("authEmail");
            const authToken = localStorage.getItem("authToken");
            if (!authEmail || !authToken) {
                toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.", {
                    position: "top-right",
                    autoClose: 3000,
                });
                navigate("/Login");
                return;
            }

            // Kiểm tra số lượng
            if (qty <= 0) throw new Error("Số lượng phải lớn hơn 0");
            if (qty > item.quantity) {
                throw new Error(`Số lượng vượt quá tồn kho (còn ${item.quantity})`);
            }

            // Xử lý giỏ hàng
            let cart = JSON.parse(localStorage.getItem("cart")) || [];
            let cartId = localStorage.getItem("cartId");

            // Tạo giỏ hàng mới nếu cần
            if (!cartId) {
                const response = await fetch(
                    `http://localhost:8080/api/public/users/${encodeURIComponent(authEmail)}/carts`,
                    {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${authToken}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (!response.ok) throw new Error("Tạo giỏ hàng thất bại");

                const data = await response.json();
                cartId = data.cartId;
                localStorage.setItem("cartId", cartId);
            }

            // Thêm vào giỏ hàng API
            const apiResponse = await fetch(
                `http://localhost:8080/api/public/carts/${cartId}/products/${item.productId}/quantity/${qty}`,
                {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${authToken}` },
                }
            );

            if (!apiResponse.ok) throw new Error("Thêm vào giỏ hàng thất bại");

            // Cập nhật giỏ hàng local
            const existingIndex = cart.findIndex(i => i.productId === item.productId);
            const productDisplayName = item.productName.length > 20
                ? `${item.productName.substring(0, 20)}...`
                : item.productName;

            if (existingIndex >= 0) {
                const newQty = cart[existingIndex].quantity + qty;
                if (newQty > item.quantity) {
                    throw new Error(`Giỏ hàng đã có ${cart[existingIndex].quantity} sản phẩm, không thể thêm ${qty}`);
                }
                cart[existingIndex].quantity = newQty;
            } else {
                cart.push({
                    ...item,
                    quantity: qty,
                    stock: item.quantity
                });
            }

            localStorage.setItem("cart", JSON.stringify(cart));

            // Hiển thị thông báo thành công
            toast.success(
                <div>
                    <div className="font-bold"> Thêm vào giỏ hàng thành công</div>
                    <div>{productDisplayName}</div>
                    <div>Số lượng: <span className="font-bold">{qty}</span></div>
                    {item.specialPrice > 0 && (
                        <div className="text-green-600">
                            Giá: {item.specialPrice.toLocaleString("vi-VN")}₫
                        </div>
                    )}
                </div>,
                {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                }
            );

            // Cập nhật UI
            window.dispatchEvent(new CustomEvent("cartUpdated", {
                detail: { productId: item.productId, quantity: qty }
            }));

        } catch (error) {
            console.error("[ERROR] addToCart:", error);
            toast.error(
                <div>
                    <div className="font-bold"> Thêm vào giỏ thất bại</div>
                    <div>{error.message}</div>
                </div>,
                {
                    position: "top-right",
                    autoClose: 3000,
                }
            );
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {products.map((product) => (
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
                                                <ShoppingCart className="w-5 h-5" />
                                                <span>Thêm vào giỏ</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Phân trang */}
                        {totalPages > 1 && (
                            <div className="mt-10 flex justify-center items-center space-x-1">
                                <button
                                    onClick={handlePrevious}
                                    disabled={currentPage === 1}
                                    className={`p-2 rounded-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>

                                <div className="flex space-x-1">
                                    {renderPageNumbers()}
                                </div>

                                <button
                                    onClick={handleNext}
                                    disabled={currentPage === totalPages}
                                    className={`p-2 rounded-md ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
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