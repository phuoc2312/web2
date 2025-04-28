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
