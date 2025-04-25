import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Cart() {
    const [cartItems, setCartItems] = useState([]);

    // Hàm làm phẳng dữ liệu từ localStorage
    const flattenCartItems = (data) => {
        if (!data || !Array.isArray(data)) return [];
        // Nếu là mảng phẳng với id
        if (data.length > 0 && data[0].id) return data;
        // Nếu là mảng phân cấp với products
        return data.reduce((acc, cart) => {
            if (cart.products && Array.isArray(cart.products)) {
                const mappedProducts = cart.products.map((product) => ({
                    id: product.productId,
                    productName: product.productName,
                    price: product.price,
                    image: product.image,
                    quantity: product.quantity,
                }));
                return acc.concat(mappedProducts);
            }
            return acc; // Nếu không có products, bỏ qua
        }, []);
    };

    const updateCartFromStorage = () => {
        const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
        console.log("Stored cart (no flatten):", storedCart); // Kiểm tra dữ liệu gốc
        setCartItems(storedCart);
    };
    
    

    useEffect(() => {
        // Cập nhật giỏ hàng ngay khi mount
        updateCartFromStorage();

        // Lắng nghe sự kiện từ localStorage hoặc ProductDetail.js
        window.addEventListener("storage", updateCartFromStorage);
        window.addEventListener("cartUpdated", updateCartFromStorage);

        return () => {
            window.removeEventListener("storage", updateCartFromStorage);
            window.removeEventListener("cartUpdated", updateCartFromStorage);
        };
    }, []);

    // Cập nhật localStorage khi cartItems thay đổi từ trong Cart.js
    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cartItems));
    }, [cartItems]);

    const removeFromCart = (id) => {
        const updatedCart = cartItems.filter((item) => item.id !== id);
        setCartItems(updatedCart);
    };

    const incrementQuantity = (id) => {
        const updatedCart = cartItems.map((item) =>
            item.id === id ? { ...item, quantity: item.quantity + 1 } : item
        );
        setCartItems(updatedCart);
    };

    const decrementQuantity = (id) => {
        const updatedCart = cartItems.map((item) =>
            item.id === id && item.quantity > 1
                ? { ...item, quantity: item.quantity - 1 }
                : item
        );
        setCartItems(updatedCart);
    };

    const calculateTotal = () => {
        return cartItems
            .reduce((total, item) => total + item.price * item.quantity, 0)
            .toFixed(2);
    };

    if (cartItems.length === 0) {
        return (
            <div className="container mt-5">
                <h2>Giỏ hàng của bạn</h2>
                <p>
                    Giỏ hàng trống.{" "}
                    <Link to="/" className="text-primary">
                        Quay lại mua sắm
                    </Link>
                </p>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <h2>Giỏ hàng của bạn</h2>
            <div className="row">
                <div className="col-md-8">
                    <div
                        className="card shadow-sm p-3"
                        style={{ maxHeight: "500px", overflowY: "auto" }}
                    >
                        {cartItems.map((item) => (
                            <div key={item.id} className="card mb-3 shadow-sm">
                                <div className="card-body d-flex align-items-center">
                                    <img
                                        src={`http://localhost:8080/api/public/products/image/${item.image}`}
                                        alt={item.productName}
                                        className="mr-3"
                                        style={{
                                            width: "140px",
                                            height: "100px",
                                            objectFit: "cover",
                                            borderRadius: "5px",
                                        }}
                                    />
                                    <div className="flex-grow-1">
                                        <h5 className="mb-1">{item.productName}</h5>
                                        <p className="text-muted mb-2">Đơn giá: ${item.price}</p>
                                        <div className="input-group input-spinner" style={{ width: "120px" }}>
                                            <button
                                                className="btn btn-outline-secondary"
                                                onClick={() => decrementQuantity(item.id)}
                                            >
                                                −
                                            </button>
                                            <input
                                                type="text"
                                                className="form-control text-center"
                                                value={item.quantity}
                                                readOnly
                                            />
                                            <button
                                                className="btn btn-outline-secondary"
                                                onClick={() => incrementQuantity(item.id)}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-weight-bold text-primary mb-2">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </p>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => removeFromCart(item.id)}
                                        >
                                            <i className="fas fa-trash"></i> Xóa
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card shadow-sm p-3">
                        <h4>Tổng cộng</h4>
                        <hr />
                        <div className="d-flex justify-content-between mb-3">
                            <span>Tổng giá:</span>
                            <span className="font-weight-bold text-primary">${calculateTotal()}</span>
                        </div>
                        <button className="btn btn-success btn-block mb-2">
                            Thanh toán
                        </button>
                        <Link to="/home" className="btn btn-outline-secondary btn-block">
                            Tiếp tục mua sắm
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Cart;