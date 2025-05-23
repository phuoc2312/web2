import React, { useState, useRef, useEffect } from 'react';
import { GET_ALL, LOGIN } from './../api/apiService';
import axios from 'axios';
import '../assets/css/ChatBotGemini.css';

const ChatBotGemini = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [userEmail, setUserEmail] = useState(localStorage.getItem('authEmail') || null);
    const chatBoxRef = useRef(null);

    // Tự động cuộn xuống tin nhắn mới
    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [messages]);

    // Hàm đăng nhập tự động nếu token hết hạn
    const authenticate = async () => {
        try {
            if (!userEmail) {
                throw new Error('Vui lòng đăng nhập để tiếp tục.');
            }
            const response = await LOGIN({
                email: userEmail,
                password: 'yourpassword', // Thay bằng mật khẩu thực hoặc yêu cầu người dùng nhập
            });
            const token = response.data.token;
            localStorage.setItem('authToken', token);
            return token;
        } catch (error) {
            setMessages(prev => [...prev, { role: 'bot', content: '⚠️ Lỗi đăng nhập. Vui lòng đăng nhập lại.' }]);
            return null;
        }
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const newUserMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, newUserMessage]);
        setInput('');
        setLoading(true);

        try {
            const lowerInput = input.toLowerCase();

            // 1. Xử lý câu hỏi tìm sản phẩm theo tên hoặc thông tin sản phẩm
            if (lowerInput.includes('tìm') || lowerInput.includes('thông tin') || lowerInput.includes('sản phẩm') || lowerInput.includes('giá')) {
                // Kiểm tra ID sản phẩm trước
                const idMatch = lowerInput.match(/sản phẩm\s+(\d+)|#(\d+)/i);
                if (idMatch) {
                    const productId = idMatch[1] || idMatch[2];
                    try {
                        const response = await axios.get(`http://localhost:8080/api/public/products/${productId}`);
                        const product = response.data;
                        const price = product.discount > 0 
                            ? (product.price * (100 - product.discount) / 100).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
                            : product.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
                        const originalPrice = product.discount > 0 
                            ? product.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) 
                            : null;
                        const reply = `Thông tin sản phẩm #${productId}:<br/><br/>📱 <a href="/product/${productId}">${product.productName}</a><br/>💰 Giá: ${price}${product.discount > 0 ? ` <span style="text-decoration: line-through; color: gray;">${originalPrice}</span> (-${product.discount}%)` : ''}<br/>📝 Mô tả: ${product.description || 'Không có mô tả'}<br/>📋 Danh mục: ${product.category?.categoryName || 'Không xác định'}<br/>🔗 Xem chi tiết: <a href="/product/${productId}">Tại đây</a>`;
                        setMessages(prev => [...prev, { role: 'bot', content: reply }]);
                        return;
                    } catch (error) {
                        setMessages(prev => [...prev, {
                            role: 'bot',
                            content: `⚠️ Không tìm thấy sản phẩm #${productId}. Vui lòng kiểm tra lại ID.`
                        }]);
                        return;
                    }
                }

                // Xử lý tìm kiếm theo tên sản phẩm
                const nameMatch = lowerInput.match(/(?:tìm|thông tin|giá|sản phẩm)\s*(.+)/i);
                if (nameMatch) {
                    const keyword = nameMatch[1].trim();
                    const response = await GET_ALL(`public/products/keyword/${encodeURIComponent(keyword)}`, {
                        pageNumber: 0,
                        pageSize: 5,
                        sortBy: 'id',
                        sortOrder: 'asc',
                    });
                    const products = response.content || [];
                    if (products.length === 0) {
                        setMessages(prev => [...prev, {
                            role: 'bot',
                            content: `⚠️ Không tìm thấy sản phẩm với tên "${keyword}". Vui lòng thử lại.`
                        }]);
                        return;
                    }
                    const productList = products.map(p => {
                        const price = p.discount > 0 
                            ? (p.price * (100 - p.discount) / 100).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
                            : p.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
                        const originalPrice = p.discount > 0 
                            ? p.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) 
                            : null;
                        return `📱 <a href="/product/${p.productId}">${p.productName}</a><br/>💰 Giá: ${price}${p.discount > 0 ? ` <span style="text-decoration: line-through; color: gray;">${originalPrice}</span> (-${p.discount}%)` : ''}<br/>📝 Mô tả: ${p.description || 'Không có mô tả'}<br/>📋 Danh mục: ${p.category?.categoryName || 'Không xác định'}<br/>🔗 Xem chi tiết: <a href="/product/${p.productId}">Tại đây</a>`;
                    }).join('<br/><br/>');
                    setMessages(prev => [...prev, {
                        role: 'bot',
                        content: `Thông tin sản phẩm liên quan đến "${keyword}":<br/><br/>${productList}`
                    }]);
                    return;
                }
            }

            // 2. Xử lý câu hỏi tổng quát về trang web
            if (lowerInput.includes('mọi thứ') || lowerInput.includes('trang web') || lowerInput.includes('có gì')) {
                let reply = `Tổng quan về trang web:<br/><br/>`;
                
                const productParams = { pageNumber: 0, pageSize: 3, sortBy: 'id', sortOrder: 'asc' };
                const productResponse = await GET_ALL('public/products', productParams);
                const products = productResponse.content || [];
                reply += `📱 <strong>Sản phẩm</strong>: Có ${productResponse.totalElements || 0} sản phẩm. Ví dụ:<br/>${products.map(p => `<a href="/product/${p.productId}">${p.productName}</a> - ${p.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}`).join('<br/>') || 'Không có sản phẩm.'}<br/><br/>`;

                const promoParams = { pageNumber: 0, pageSize: 3, sortBy: 'productId', sortOrder: 'asc' };
                const promoResponse = await GET_ALL('public/products/promotions', promoParams);
                const promos = promoResponse.content || [];
                reply += `🎉 <strong>Sản phẩm khuyến mãi</strong>:<br/>${promos.map(p => `<a href="/product/${p.productId}">${p.productName}</a> - ${(p.price * (100 - p.discount) / 100).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })} (-${p.discount}%)`).join('<br/>') || 'Không có khuyến mãi.'}<br/><br/>`;

                const categoryParams = { pageNumber: 0, pageSize: 3, sortBy: 'categoryId', sortOrder: 'asc' };
                const categoryResponse = await GET_ALL('public/categories', categoryParams);
                const categories = categoryResponse.content || [];
                reply += `📋 <strong>Danh mục</strong>:<br/>${categories.map(c => `${c.categoryName} - ${c.description || 'Không có mô tả'}`).join('<br/>') || 'Không có danh mục.'}<br/><br/>`;

                if (userEmail) {
                    let token = localStorage.getItem('authToken');
                    if (!token) {
                        token = await authenticate();
                        if (!token) {
                            reply += `🛒 <strong>Giỏ hàng</strong>: Vui lòng đăng nhập lại để xem.<br/><br/>📦 <strong>Đơn hàng</strong>: Vui lòng đăng nhập lại để xem.`;
                        }
                    }
                    if (token) {
                        let cartId = localStorage.getItem('cartId');
                        if (!cartId) {
                            const cartResponse = await axios.post(
                                `http://localhost:8080/api/public/users/${encodeURIComponent(userEmail)}/carts`,
                                {},
                                { headers: { Authorization: `Bearer ${token}` } }
                            );
                            cartId = cartResponse.data.cartId;
                            localStorage.setItem('cartId', cartId);
                        }
                        const cartResponse = await axios.get(
                            `http://localhost:8080/api/public/users/${encodeURIComponent(userEmail)}/carts/${cartId}`,
                            { headers: { Authorization: `Bearer ${token}`, Accept: '*/*' } }
                        );
                        const cartItems = cartResponse.data.products || [];
                        reply += `🛒 <strong>Giỏ hàng</strong>:<br/>${cartItems.map(item => `<a href="/product/${item.productId}">${item.productName}</a> x${item.cartItemQuantity}`).join('<br/>') || 'Giỏ hàng trống.'}<br/><br/>`;

                        const orderResponse = await axios.get(
                            `http://localhost:8080/api/public/users/${encodeURIComponent(userEmail)}/orders`,
                            { headers: { Authorization: `Bearer ${token}`, Accept: '*/*' } }
                        );
                        const orders = orderResponse.data || [];
                        reply += `📦 <strong>Đơn hàng</strong>:<br/>${orders.map(o => `Đơn hàng #${o.orderId} - ${o.orderStatus} - ${o.totalAmount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}`).join('<br/>') || 'Không có đơn hàng.'}<br/><br/>`;
                    }
                } else {
                    reply += `🛒 <strong>Giỏ hàng</strong>: Vui lòng <a href="/login">đăng nhập</a> để xem.<br/><br/>📦 <strong>Đơn hàng</strong>: Vui lòng <a href="/login">đăng nhập</a> để xem.<br/><br/>`;
                }

                if (userEmail) {
                    let token = localStorage.getItem('authToken');
                    if (!token) {
                        token = await authenticate();
                    }
                    if (token) {
                        const userResponse = await axios.get(
                            `http://localhost:8080/api/public/users/email/${encodeURIComponent(userEmail)}`,
                            { headers: { Authorization: `Bearer ${token}`, Accept: '*/*' } }
                        );
                        const user = userResponse.data;
                        reply += `👤 <strong>Thông tin cá nhân</strong>:<br/>Email: ${user.email}<br/>Tên: ${user.firstName} ${user.lastName}<br/>Địa chỉ: ${formatAddress(user.address)}`;
                    } else {
                        reply += `👤 <strong>Thông tin cá nhân</strong>: Vui lòng đăng nhập lại để xem.`;
                    }
                } else {
                    reply += `👤 <strong>Thông tin cá nhân</strong>: Vui lòng <a href="/login">đăng nhập</a> để xem.`;
                }

                setMessages(prev => [...prev, { role: 'bot', content: reply }]);
                return;
            }

            // 3. Xử lý câu hỏi về sản phẩm khuyến mãi
            if (lowerInput.includes('khuyến mãi') || lowerInput.includes('giảm giá') || lowerInput.includes('promotion')) {
                const params = {
                    pageNumber: 0,
                    pageSize: 10,
                    sortBy: 'productId',
                    sortOrder: 'asc',
                };
                const response = await GET_ALL('public/products/promotions', params);
                const products = response.content || [];
                const productList = products.map(p => {
                    const originalPrice = p.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
                    const discountedPrice = (p.price * (100 - p.discount) / 100).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
                    return `📱 <a href="/product/${p.productId}">${p.productName}</a> - ${discountedPrice} <span style="text-decoration: line-through; color: gray;">${originalPrice}</span> (-${p.discount}%)`;
                }).join('<br/>');
                setMessages(prev => [...prev, {
                    role: 'bot',
                    content: `Sản phẩm khuyến mãi:<br/><br/>${productList || 'Không có sản phẩm khuyến mãi.'}`
                }]);
                return;
            }

            // 4. Xử lý câu hỏi về danh mục
            if (lowerInput.includes('danh mục') || lowerInput.includes('category')) {
                const params = { pageNumber: 0, pageSize: 100, sortBy: 'categoryId', sortOrder: 'asc' };
                const response = await GET_ALL('public/categories', params);
                const categories = response.content || [];
                const categoryList = categories.map(c => 
                    `📋 ${c.categoryName} - ${c.description || 'Không có mô tả'}`
                ).join('<br/>');
                setMessages(prev => [...prev, {
                    role: 'bot',
                    content: `Danh sách danh mục:<br/><br/>${categoryList || 'Không có danh mục nào.'}`
                }]);
                return;
            }

            // 5. Xử lý câu hỏi về giỏ hàng
            if (lowerInput.includes('giỏ hàng') || lowerInput.includes('cart')) {
                if (!userEmail) {
                    setMessages(prev => [...prev, {
                        role: 'bot',
                        content: '⚠️ Vui lòng đăng nhập để xem giỏ hàng. <a href="/login">Đăng nhập</a>'
                    }]);
                    return;
                }
                let token = localStorage.getItem('authToken');
                if (!token) {
                    token = await authenticate();
                    if (!token) return;
                }
                let cartId = localStorage.getItem('cartId');
                if (!cartId) {
                    const response = await axios.post(
                        `http://localhost:8080/api/public/users/${encodeURIComponent(userEmail)}/carts`,
                        {},
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    cartId = response.data.cartId;
                    localStorage.setItem('cartId', cartId);
                }
                const response = await axios.get(
                    `http://localhost:8080/api/public/users/${encodeURIComponent(userEmail)}/carts/${cartId}`,
                    { headers: { Authorization: `Bearer ${token}`, Accept: '*/*' } }
                );
                const cartItems = response.data.products || [];
                const cartList = cartItems.map(item => 
                    `🛒 <a href="/product/${item.productId}">${item.productName}</a> x${item.cartItemQuantity} - ${(item.price * item.cartItemQuantity).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}`
                ).join('<br/>');
                setMessages(prev => [...prev, {
                    role: 'bot',
                    content: `Giỏ hàng của bạn:<br/><br/>${cartList || 'Giỏ hàng trống.'}`
                }]);
                return;
            }

            // 6. Xử lý câu hỏi về đơn hàng
            if (lowerInput.includes('đơn hàng') || lowerInput.includes('order')) {
                if (!userEmail) {
                    setMessages(prev => [...prev, {
                        role: 'bot',
                        content: '⚠️ Vui lòng đăng nhập để xem đơn hàng. <a href="/login">Đăng nhập</a>'
                    }]);
                    return;
                }
                let token = localStorage.getItem('authToken');
                if (!token) {
                    token = await authenticate();
                    if (!token) return;
                }
                const response = await axios.get(
                    `http://localhost:8080/api/public/users/${encodeURIComponent(userEmail)}/orders`,
                    { headers: { Authorization: `Bearer ${token}`, Accept: '*/*' } }
                );
                const orders = response.data || [];
                const orderList = orders.map(o => 
                    `📦 Đơn hàng #${o.orderId} - ${o.orderStatus} - ${o.totalAmount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}`
                ).join('<br/>');
                setMessages(prev => [...prev, {
                    role: 'bot',
                    content: `Danh sách đơn hàng:<br/><br/>${orderList || 'Không có đơn hàng nào.'}`
                }]);
                return;
            }

            // 7. Xử lý câu hỏi về thông tin cá nhân
            if (lowerInput.includes('thông tin') || lowerInput.includes('profile') || lowerInput.includes('tài khoản')) {
                if (!userEmail) {
                    setMessages(prev => [...prev, {
                        role: 'bot',
                        content: '⚠️ Vui lòng đăng nhập để xem thông tin cá nhân. <a href="/login">Đăng nhập</a>'
                    }]);
                    return;
                }
                let token = localStorage.getItem('authToken');
                if (!token) {
                    token = await authenticate();
                    if (!token) return;
                }
                const response = await axios.get(
                    `http://localhost:8080/api/public/users/email/${encodeURIComponent(userEmail)}`,
                    { headers: { Authorization: `Bearer ${token}`, Accept: '*/*' } }
                );
                const user = response.data;
                setMessages(prev => [...prev, {
                    role: 'bot',
                    content: `Thông tin cá nhân:<br/><br/>📧 Email: ${user.email}<br/>👤 Tên: ${user.firstName} ${user.lastName}<br/>📍 Địa chỉ: ${formatAddress(user.address)}`
                }]);
                return;
            }

            // 8. Gọi Gemini AI cho các câu hỏi khác
            const res = await axios.post(
                'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyAgCIH5TI_2GaNBzPRLI55Wk4VGWL84jpk',
                {
                    contents: [{ parts: [{ text: input }] }]
                },
                {
                    headers: { 'Content-Type': 'application/json' }
                }
            );
            const geminiResponse = res.data.candidates?.[0]?.content?.parts?.[0]?.text || 'Xin lỗi, tôi không hiểu.';
            setMessages(prev => [...prev, { role: 'bot', content: geminiResponse }]);
        } catch (error) {
            console.error('Lỗi:', error);
            if (error.response?.status === 401) {
                setMessages(prev => [...prev, {
                    role: 'bot',
                    content: '⚠️ Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại. <a href="/login">Đăng nhập</a>'
                }]);
            } else if (error.response?.status === 404) {
                setMessages(prev => [...prev, {
                    role: 'bot',
                    content: '⚠️ Không tìm thấy dữ liệu. Vui lòng thử lại hoặc kiểm tra câu hỏi.'
                }]);
            } else {
                setMessages(prev => [...prev, {
                    role: 'bot',
                    content: '⚠️ Lỗi kết nối. Vui lòng thử lại sau!'
                }]);
            }
        } finally {
            setLoading(false);
        }
    };

    // Hàm định dạng địa chỉ
    const formatAddress = (address) => {
        if (!address) return 'Chưa cập nhật';
        const { street, buildingName, city, state, country, pincode } = address;
        return [street, buildingName, city, state, country, pincode]
            .filter(Boolean)
            .join(', ');
    };

    // Xử lý nhấn Enter để gửi
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !loading) {
            handleSend();
        }
    };

    return (
        <div className="chatbot-container">
            <h2 className="chatbot-title">MHP Chatbot</h2>
            <div className="chatbox" ref={chatBoxRef}>
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`message ${msg.role === 'user' ? 'user-message' : 'bot-message'}`}
                        dangerouslySetInnerHTML={{
                            __html: `<strong>${msg.role === 'user' ? 'Bạn: ' : 'Bot: '}</strong>${msg.content}`
                        }}
                    />
                ))}
            </div>
            <div className="input-area">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Nhập tin nhắn..."
                    disabled={loading}
                />
                <button
                    onClick={handleSend}
                    disabled={loading}
                >
                    {loading ? 'Đang gửi...' : 'Gửi'}
                </button>
            </div>
        </div>
    );
};

export default ChatBotGemini;