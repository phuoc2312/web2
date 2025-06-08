import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { GET_ID, GET_ALL } from "../api/apiService";
import { toast } from 'react-toastify';
import { ShoppingCart, ChevronLeft, ChevronRight, Minus, Plus, Heart } from 'lucide-react';

const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [isWishlisted, setIsWishlisted] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await GET_ID("products", id);
                setProduct(response);

                if (response.category?.categoryId) {
                    const relatedResponse = await GET_ALL(
                        `products?pageNumber=0&pageSize=4&categoryId=${response.category.categoryId}`
                    );
                    const filteredProducts = (relatedResponse.content || [])
                        .filter(item => item.productId !== response.productId);
                    setRelatedProducts(filteredProducts);
                }
            } catch (error) {
                console.error("Error fetching product:", error);
                toast.error("Không thể tải thông tin sản phẩm");
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const incrementQuantity = () => setQuantity(prev => prev + 1);
    const decrementQuantity = () => setQuantity(prev => Math.max(prev - 1, 1));

    const addToCart = async (item, qty = 1) => {
        try {
            // 1. Validate input
            if (!item?.productId) {
                throw new Error("Thông tin sản phẩm không hợp lệ");
            }
    
            console.log("[DEBUG] Adding to cart:", { 
                product: item.productName, 
                quantity: qty,
                stock: item.quantity,
                cartId: localStorage.getItem("cartId"),
                user: localStorage.getItem("authEmail") 
            });
    
            // 2. Validate quantity
            if (qty <= 0) throw new Error("Số lượng phải lớn hơn 0");
            if (qty > item.quantity) {
                throw new Error(`Số lượng vượt quá tồn kho (còn ${item.quantity})`);
            }
    
            // 3. Get user session
            const authEmail = localStorage.getItem("authEmail") || "guest";
            const authToken = localStorage.getItem("authToken");
            let cart = JSON.parse(localStorage.getItem("cart")) || [];
            let cartId = localStorage.getItem("cartId");
    
            // 4. Create new cart if needed
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
                console.log("[DEBUG] New cart created:", cartId);
            }
    
            // 5. Add to cart API
            const apiResponse = await fetch(
                `http://localhost:8080/api/public/carts/${cartId}/products/${item.productId}/quantity/${qty}`,
                {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${authToken}` },
                }
            );
    
            if (!apiResponse.ok) throw new Error("Thêm vào giỏ hàng thất bại");
    
            // 6. Update local cart
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
    
            // 7. Show success message with proper quantity
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
    
            // 8. Sync with server and update UI
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
    const toggleWishlist = () => {
        setIsWishlisted(!isWishlisted);
        toast.success(isWishlisted ? "Đã xóa khỏi yêu thích" : "Đã thêm vào yêu thích");
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
    );

    if (!product) return (
        <div className="container mx-auto px-4 py-12 text-center">
            <div className="bg-white rounded-lg shadow-sm p-8 max-w-md mx-auto">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Không tìm thấy sản phẩm</h2>
                <p className="text-gray-600 mb-6">Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
                <Link
                    to="/products"
                    className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
                >
                    Quay lại cửa hàng
                </Link>
            </div>
        </div>
    );

    const displayPrice = product.specialPrice > 0 ? product.specialPrice : product.specialPrice;
    const discountPercent = product.specialPrice > 0
        ? Math.round((1 - product.specialPrice / product.price) * 100)
        : 0;

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="container mx-auto px-4">
                {/* Breadcrumb */}
                <nav className="flex mb-6" aria-label="Breadcrumb">
                    <ol className="inline-flex items-center space-x-1 md:space-x-3">
                        <li className="inline-flex items-center">
                            <Link to="/" className="text-gray-700 hover:text-green-600 inline-flex items-center">
                                <ChevronLeft className="w-4 h-4 mr-1" />
                                Trang chủ
                            </Link>
                        </li>
                        <li>
                            <div className="flex items-center">
                                <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
                                <Link to="/products" className="text-gray-700 hover:text-green-600 ml-1">
                                    Sản phẩm
                                </Link>
                            </div>
                        </li>
                        <li aria-current="page">
                            <div className="flex items-center">
                                <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
                                <span className="text-gray-500 ml-1">{product.productName}</span>
                            </div>
                        </li>
                    </ol>
                </nav>

                {/* Main Product Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white rounded-xl shadow-sm p-6">
                    {/* Product Image */}
                    <div className="relative h-96 w-full overflow-hidden rounded-lg bg-gray-100">
                        <img
                            src={`http://localhost:8080/api/public/products/image/${product.image}`}
                            alt={product.productName}
                            className="h-full w-full object-contain"
                        />
                        {discountPercent > 0 && (
                            <div className="absolute top-4 left-4 bg-red-500 text-white font-bold px-3 py-1 rounded-full text-sm">
                                -{discountPercent}%
                            </div>
                        )}
                        <button
                            onClick={toggleWishlist}
                            className={`absolute top-4 right-4 p-2 rounded-full ${isWishlisted ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                        >
                            <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-current' : ''}`} />
                        </button>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{product.productName}</h1>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl font-bold text-red-600">
                                    {displayPrice.toLocaleString('vi-VN')}₫
                                </span>
                                {discountPercent > 0 && (
                                    <span className="text-lg text-gray-500 line-through">
                                        {product.price.toLocaleString('vi-VN')}₫
                                    </span>
                                )}
                            </div>
                            {product.quantity > 0 ? (
                                <p className="text-green-600 text-sm">Còn hàng ({product.quantity} sản phẩm)</p>
                            ) : (
                                <p className="text-red-500 text-sm">Tạm hết hàng</p>
                            )}
                        </div>

                        <div className="border-t border-b border-gray-200 py-4">
                            <p className="text-gray-700">{product.description || "Không có mô tả chi tiết."}</p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center border rounded-lg">
                                    <button
                                        onClick={decrementQuantity}
                                        className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-l-lg"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="w-12 text-center border-none focus:outline-none">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={incrementQuantity}
                                        className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-r-lg"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                                <button
                                    onClick={() => addToCart(product)}
                                    disabled={product.quantity <= 0}
                                    className={`flex-1 py-3 rounded-lg font-semibold text-white flex items-center justify-center space-x-2 transition-colors duration-200 ${product.quantity > 0
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : 'bg-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    <span>Thêm vào giỏ hàng</span>
                                </button>
                            </div>
                            <button className="w-full py-3 border border-green-600 text-green-600 rounded-lg font-semibold hover:bg-green-50 transition-colors duration-200">
                                Mua ngay
                            </button>
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                            <div className="flex items-center text-sm text-gray-500 space-x-4">
                                <span>Danh mục: {product.category?.categoryName || "Không xác định"}</span>
                                <span>Mã SP: {product.productId}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
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
                                                        className="object-contain w-full h-48 p-2"
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
                                                    <span className="text-lg font-bold text-red-600">
                                                        {(relatedProduct.specialPrice > 0 ? relatedProduct.specialPrice : relatedProduct.specialPrice).toLocaleString('vi-VN')} VND
                                                    </span>
                                                </div>



                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-600">Không có sản phẩm liên quan.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetail;