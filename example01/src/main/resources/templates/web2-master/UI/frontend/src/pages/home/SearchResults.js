import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { GET_ALL } from '../../api/apiService';
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
function SearchResults() {
    const location = useLocation();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1); // State to manage quantity

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const query = params.get('query') || '';
        const cateid = params.get('cateid') || '';
        const pageNumber = params.get('pageNumber') || 1;
        const pageSize = params.get('pageSize') || 10;
        const sortBy = params.get('sortBy') || 'id';
        const sortOrder = params.get('sortOrder') || 'ASC';

        let url = `http://localhost:8080/api/public/products/keyword/${encodeURIComponent(query)}?pageNumber=${pageNumber}&pageSize=${pageSize}&sortBy=${sortBy}&sortOrder=${sortOrder}`;

        // Thêm categoryId vào URL nếu có
        if (cateid) {
            url += `&categoryId=${cateid}`;
        }
        // Gọi API để lấy danh sách sản phẩm
        GET_ALL(url)
            .then((response) => {
                const datapo = response.content;
                setProducts(datapo); // Lưu dữ liệu sản phẩm vào state
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching products:", error);
                setLoading(false);
            });
    }, [location.search]);

    if (loading) {
        return <div>Loading...</div>;
    }
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
                    <div className="font-bold">✅ Thêm vào giỏ hàng thành công</div>
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
                    <div className="font-bold">❌ Thêm vào giỏ thất bại</div>
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
        <div>
            <h2>Kết quả tìm kiếm cho từ khóa: "{new URLSearchParams(location.search).get('query')}"</h2>
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
        </div>
    );
}

export default SearchResults;
