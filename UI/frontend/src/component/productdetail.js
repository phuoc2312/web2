import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { GET_ID, GET_ALL } from "../api/apiService";
import { toast } from 'react-toastify';

const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                // Lấy sản phẩm hiện tại
                const response = await GET_ID("products", id);
                console.log("Product data:", response);
                setProduct(response);

                // Lấy sản phẩm liên quan (chỉ từ cùng categoryId)
                let relatedResponse = [];
                if (response.category && response.category.categoryId) {
                    console.log(`Fetching related products with categoryId: ${response.category.categoryId}`);
                    relatedResponse = await GET_ALL(
                        `http://localhost:8080/api/public/products?pageNumber=1&pageSize=10&sortBy=productId&sortOrder=ASC&categoryId=${response.category.categoryId}`
                    );
                } else {
                    console.warn("No categoryId found for this product");
                    setRelatedProducts([]);
                }

                console.log("Related products raw data:", relatedResponse);

                // Xử lý dữ liệu trả về
                const products = Array.isArray(relatedResponse.content) 
                    ? relatedResponse.content 
                    : Array.isArray(relatedResponse) 
                        ? relatedResponse 
                        : [];
                
                if (products.length > 0) {
                    const filteredProducts = products
                        .filter((item) => String(item.productId) !== String(response.productId))
                        .slice(0, 4);
                    console.log("Filtered related products:", filteredProducts);
                    setRelatedProducts(filteredProducts);
                } else {
                    console.warn("No valid related products found");
                    setRelatedProducts([]);
                }
            } catch (error) {
                console.error("Không thể lấy dữ liệu:", error);
                setRelatedProducts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const incrementQuantity = () => setQuantity((prev) => prev + 1);
    const decrementQuantity = () => setQuantity((prev) => Math.max(prev - 1, 1));

    const addToCart = (item, qty = quantity) => {
        const cartItem = {
            productId: item.productId,
            productName: item.productName,
            price: item.price,
            image: item.image,
            quantity: qty,
        };

        const currentCart = JSON.parse(localStorage.getItem("cart")) || [];
        const existingItemIndex = currentCart.findIndex((cartItem) => cartItem.productId === item.productId);
        if (existingItemIndex > -1) {
            currentCart[existingItemIndex].quantity += qty;
        } else {
            currentCart.push(cartItem);
        }

        localStorage.setItem("cart", JSON.stringify(currentCart));
        window.dispatchEvent(new Event("cartUpdated"));
        toast.success(`${cartItem.productName} đã được thêm vào giỏ hàng!`, {
            position: "top-right",
            autoClose: 3000,
        });
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
        </div>
    );
    if (!product) return (
        <div className="container mx-auto px-4 py-8 text-center">
            <p className="text-xl text-gray-600">Không tìm thấy sản phẩm.</p>
        </div>
    );

    // Xử lý giá hiển thị (ưu tiên price nếu specialPrice âm)
    const displayPrice = product.specialPrice > 0 ? product.specialPrice : product.price;

    return (
        <div className="container mx-auto px-4 py-12 bg-gray-50">
            {/* Chi tiết sản phẩm */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Hình ảnh sản phẩm */}
                <div className="relative">
                    <img
                        src={`http://localhost:8080/api/public/products/image/${product.image}`}
                        alt={product.productName}
                        className="w-full h-[500px] object-cover rounded-xl shadow-lg transition-transform duration-300 hover:scale-105"
                    />
                </div>

                {/* Thông tin sản phẩm */}
                <div className="flex flex-col space-y-6">
                    <h2 className="text-3xl font-bold text-gray-900">{product.productName}</h2>
                    
                    {/* Mô tả sản phẩm */}
                    <div className="text-gray-600 leading-relaxed">
                        {product.description ? (
                            <p>{product.description}</p>
                        ) : (
                            <p>Không có mô tả cho sản phẩm này.</p>
                        )}
                    </div>

                    {/* Giá */}
                    <div className="space-y-2">
                        <p className="text-2xl font-semibold text-blue-600">
                            {(quantity * displayPrice).toLocaleString('vi-VN')} VND
                        </p>
                        <p className="text-sm text-gray-500">
                            Giá mỗi đơn vị: {displayPrice.toLocaleString('vi-VN')} VND
                        </p>
                        {product.specialPrice > 0 && product.specialPrice < product.price && (
                            <p className="text-sm text-gray-500 line-through">
                                Giá gốc: {product.price.toLocaleString('vi-VN')} VND
                            </p>
                        )}
                    </div>

                    {/* Số lượng và nút thêm vào giỏ hàng */}
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center border rounded-lg">
                            <button
                                onClick={decrementQuantity}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-l-lg transition-colors duration-200"
                            >
                                −
                            </button>
                            <input
                                type="text"
                                value={quantity}
                                readOnly
                                className="w-16 text-center border-none focus:outline-none"
                            />
                            <button
                                onClick={incrementQuantity}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-r-lg transition-colors duration-200"
                            >
                                +
                            </button>
                        </div>
                        <button
                            onClick={() => addToCart(product)}
                            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-200 flex items-center justify-center space-x-2"
                        >
                            <i className="fas fa-shopping-cart"></i>
                            <span>Thêm vào giỏ hàng</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Sản phẩm liên quan */}
            <div className="mt-16">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Sản phẩm liên quan</h3>
                {relatedProducts.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                        {relatedProducts.map((relatedProduct) => (
                            <div key={relatedProduct.productId} className="group relative">
                                <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
                                    <Link to={`/product/${relatedProduct.productId}`}>
                                        <div className="relative overflow-hidden">
                                            <img
                                                src={`http://localhost:8080/api/public/products/image/${relatedProduct.image}`}
                                                alt={relatedProduct.productName}
                                                className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        </div>
                                    </Link>
                                    <div className="p-4">
                                        <Link to={`/product/${relatedProduct.productId}`}>
                                            <h5 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 line-clamp-2 min-h-[48px] transition-colors duration-200">
                                                {relatedProduct.productName}
                                            </h5>
                                        </Link>
                                        <div className="mt-2">
                                            <span className="text-lg font-bold text-blue-600">
                                                {(relatedProduct.specialPrice > 0 ? relatedProduct.specialPrice : relatedProduct.price).toLocaleString('vi-VN')} VND
                                            </span>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <button
                                            onClick={() => addToCart(relatedProduct, 1)}
                                            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full flex items-center space-x-2 hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
                                        >
                                            <i className="fas fa-cart-plus"></i>
                                            <span>Thêm</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-600">Không có sản phẩm liên quan.</p>
                )}
            </div>
        </div>
    );
};

export default ProductDetail;