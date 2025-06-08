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
                password: 'yourpassword', // TODO: Thay bằng cơ chế an toàn
            });
            const token = response.data.token;
            localStorage.setItem('authToken', token);
            return token;
        } catch (error) {
            setMessages(prev => [...prev, { role: 'bot', content: '⚠️ Lỗi đăng nhập. Vui lòng <a href="/login">đăng nhập lại</a>.' }]);
            return null;
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

    // Hàm định dạng sản phẩm
    const formatProduct = (p) => {
        const price = p.discount > 0
            ? (p.price * (100 - p.discount) / 100).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
            : p.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
        const originalPrice = p.discount > 0
            ? p.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
            : null;
        return `📱 <a href="/product/${p.productId}">${p.productName}</a><br/>💰 Giá: ${price}${p.discount > 0 ? ` <span style="text-decoration: line-through; color: gray;">${originalPrice}</span> (-${p.discount}%)` : ''}<br/>📝 Mô tả: ${p.description || 'Không có mô tả'}<br/>📋 Danh mục: ${p.category?.categoryName || 'Không xác định'}<br/>🔗 Xem chi tiết: <a href="/product/${p.productId}">Tại đây</a>`;
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const newUserMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, newUserMessage]);
        setInput('');
        setLoading(true);

        try {
            const lowerInput = input.toLowerCase().trim();

            // 1. Chào hỏi và giới thiệu
            if (lowerInput.includes('chào') || lowerInput.includes('hi') || lowerInput.includes('hello')) {
                const reply = `Chào bạn! 😊 Tôi là MHP Chatbot, sẵn sàng giúp bạn khám phá MHP Store. Bạn muốn tìm sản phẩm, xem khuyến mãi, kiểm tra đơn hàng hay biết thêm về chúng tôi? Hãy hỏi tôi bất cứ điều gì!`;
                setMessages(prev => [...prev, { role: 'bot', content: reply }]);
                return;
            }

            // 2. Sản phẩm bán chạy nhất
            if (lowerInput.includes('bán chạy') || lowerInput.includes('nổi bật') || lowerInput.includes('hot')) {
                const params = { pageNumber: 0, pageSize: 3, sortBy: 'quantity', sortOrder: 'asc' };
                const response = await GET_ALL('public/products', params);
                const products = response.content || [];
                if (products.length === 0) {
                    setMessages(prev => [...prev, {
                        role: 'bot',
                        content: `Hiện tại không có sản phẩm nào nổi bật. Hãy xem <a href="/products">tất cả sản phẩm</a> nhé!`
                    }]);
                    return;
                }
                const productList = products.map(formatProduct).join('<br/><br/>');
                setMessages(prev => [...prev, {
                    role: 'bot',
                    content: `Sản phẩm bán chạy nhất:<br/><br/>${productList}<br/><br/>👉 Xem thêm tại <a href="/products">trang sản phẩm</a>`
                }]);
                return;
            }

            // 3. Giá sản phẩm
            if (lowerInput.includes('giá') && (lowerInput.includes('của') || lowerInput.includes('sản phẩm'))) {
                const nameMatch = lowerInput.match(/(?:giá của|giá)\s*(.+)/i);
                if (nameMatch) {
                    const keyword = nameMatch[1].trim();
                    const params = {
                        pageNumber: 0,
                        pageSize: 3,
                        sortBy: 'productId',
                        sortOrder: 'asc',
                        categoryId: 0
                    };
                    const response = await GET_ALL(`public/products/keyword/${encodeURIComponent(keyword)}`, params);
                    const products = response.content || [];
                    if (products.length === 0) {
                        setMessages(prev => [...prev, {
                            role: 'bot',
                            content: `⚠️ Không tìm thấy sản phẩm với từ khóa "${keyword}". Hãy thử lại hoặc xem <a href="/products">tất cả sản phẩm</a>.`
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
                        return `📱 ${p.productName}<br/>💰 Giá: ${price}${p.discount > 0 ? ` <span style="text-decoration: line-through; color: gray;">${originalPrice}</span> (-${p.discount}%)` : ''}`;
                    }).join('<br/><br/>');
                    setMessages(prev => [...prev, {
                        role: 'bot',
                        content: `Giá của sản phẩm liên quan đến "${keyword}":<br/><br/>${productList}`
                    }]);
                    return;
                }
            }

            // 4. Tìm sản phẩm theo tên
            if (lowerInput.includes('tìm') || lowerInput.includes('thông tin') || lowerInput.includes('sản phẩm')) {
                const nameMatch = lowerInput.match(/(?:tìm|thông tin|sản phẩm)\s*(.+)/i);
                if (nameMatch) {
                    const keyword = nameMatch[1].trim();
                    const params = {
                        pageNumber: 0,
                        pageSize: 5,
                        sortBy: 'productId',
                        sortOrder: 'asc',
                        categoryId: 0
                    };
                    const response = await GET_ALL(`/products/keyword/${encodeURIComponent(keyword)}`, params);
                    const products = response.content || [];
                    if (products.length === 0) {
                        setMessages(prev => [...prev, {
                            role: 'bot',
                            content: `⚠️ Không tìm thấy sản phẩm với từ khóa "${keyword}". Vui lòng thử với từ khóa khác hoặc xem <a href="/products">tất cả sản phẩm</a>.`
                        }]);
                        return;
                    }
                    const productList = products.map(formatProduct).join('<br/><br/>');
                    setMessages(prev => [...prev, {
                        role: 'bot',
                        content: `Kết quả tìm kiếm cho "${keyword}":<br/><br/>${productList}`
                    }]);
                    return;
                }
            }

            // 5. Sản phẩm khuyến mãi
            if (lowerInput.includes('khuyến mãi') || lowerInput.includes('giảm giá') || lowerInput.includes('promotion')) {
                const params = { pageNumber: 0, pageSize: 10, sortBy: 'productId', sortOrder: 'asc' };
                const response = await GET_ALL('products/promotions', params);
                const products = response.content || [];
                if (products.length === 0) {
                    setMessages(prev => [...prev, {
                        role: 'bot',
                        content: `Hiện tại không có sản phẩm khuyến mãi nào. Hãy theo dõi <a href="/products">trang sản phẩm</a> để cập nhật nhé!`
                    }]);
                    return;
                }
                const productList = products.map(formatProduct).join('<br/><br/>');
                setMessages(prev => [...prev, {
                    role: 'bot',
                    content: `Danh sách sản phẩm khuyến mãi:<br/><br/>${productList}`
                }]);
                return;
            }

            // 6. Danh mục sản phẩm
            if (lowerInput.includes('danh mục') || lowerInput.includes('category') || lowerInput.includes('loại sản phẩm')) {
                const params = { pageNumber: 0, pageSize: 100, sortBy: 'categoryId', sortOrder: 'asc' };
                const response = await GET_ALL('categories', params);
                const categories = response.content || [];
                if (categories.length === 0) {
                    setMessages(prev => [...prev, {
                        role: 'bot',
                        content: `Hiện tại không có danh mục nào. Hãy xem <a href="/products">tất cả sản phẩm</a>.`
                    }]);
                    return;
                }
                const categoryList = categories.map(c =>
                    `📘 <a href="/category/${c.categoryId}">${c.categoryName || c.categoryName}</a> - ${c.description || 'Không có mô tả'}`
                ).join('<br/>');
                setMessages(prev => [...prev, {
                    role: 'bot',
                    content: `Danh sách danh mục:<br/><br/>${categoryList}`
                }]);
                return;
            }

            // 7. Giỏ hàng
            if (lowerInput.includes('giỏ hàng') || lowerInput.includes('cart')) {
                if (!userEmail) {
                    setMessages(prev => [...prev, {
                        role: 'bot',
                        content: '⚠️ Vui lòng <a href="/login">đăng nhập</a> để xem giỏ hàng của bạn.'
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
                if (cartItems.length === 0) {
                    setMessages(prev => [...prev, {
                        role: 'bot',
                        content: `Giỏ hàng của bạn đang trống. Hãy <a href="/products">mua sắm ngay</a>!`
                    }]);
                    return;
                }
                const cartList = cartItems.map(item =>
                    `🛒 <a href="/product/${item.productId}">${item.productName}</a> x${item.cartItemQuantity} - ${(item.price * item.cartItemQuantity).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}`
                ).join('<br/>');
                setMessages(prev => [...prev, {
                    role: 'bot',
                    content: `Giỏ hàng của bạn:<br/><br/>${cartList}<br/><br/>👉 <a href="/cart">Xem giỏ hàng</a> hoặc <a href="/checkout">Thanh toán</a>`
                }]);
                return;
            }

            // 8. Đơn hàng
            if (lowerInput.includes('đơn hàng') || lowerInput.includes('order')) {
                if (!userEmail) {
                    setMessages(prev => [...prev, {
                        role: 'bot',
                        content: '⚠️ Vui lòng <a href="/login">đăng nhập</a> để xem đơn hàng của bạn.'
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
                if (orders.length === 0) {
                    setMessages(prev => [...prev, {
                        role: 'bot',
                        content: `Bạn chưa có đơn hàng nào. Hãy <a href="/products">mua sắm ngay</a>!`
                    }]);
                    return;
                }
                const orderList = orders.map(o =>
                    `📦 <a href="/order/${o.orderId}">Đơn hàng #${o.orderId}</a> - ${o.orderStatus} - ${o.totalAmount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}`
                ).join('<br/>');
                setMessages(prev => [...prev, {
                    role: 'bot',
                    content: `Danh sách đơn hàng của bạn:<br/><br/>${orderList}`
                }]);
                return;
            }

            // 9. Thông tin cá nhân
            if (lowerInput.includes('thông tin cá nhân') || lowerInput.includes('profile') || lowerInput.includes('tài khoản') || lowerInput.includes('tôi là ai')) {
                if (!userEmail) {
                    setMessages(prev => [...prev, {
                        role: 'bot',
                        content: '⚠️ Vui lòng <a href="/login">đăng nhập</a> để xem thông tin cá nhân.'
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
                const reply = `Thông tin cá nhân của bạn:<br/><br/>📧 Email: ${user.email}<br/>👤 Tên: ${user.firstName} ${user.lastName}<br/>📍 Địa chỉ: ${formatAddress(user.address)}<br/><br/>👉 <a href="/profile">Cập nhật thông tin</a>`;
                setMessages(prev => [...prev, { role: 'bot', content: reply }]);
                return;
            }

            // 10. Địa chỉ
            if (lowerInput.includes('địa chỉ') || lowerInput.includes('address') || lowerInput.includes('cửa hàng')) {
                if (!userEmail) {
                    // Gọi API để lấy địa chỉ cửa hàng có status ACTIVE
                    try {
                        const configResponse = await axios.get(
                            'http://localhost:8080/api/public/configs?pageNumber=0&pageSize=100&sortBy=id&sortOrder=ASC',
                            { headers: { Accept: '*/*' } }
                        );

                        const activeConfigs = configResponse.data.content.filter(c => c.status === 'ACTIVE');

                        const storeInfo = activeConfigs.map(c =>
                            `📍 ${c.siteName}: ${c.address}<br/>📞 Hotline: ${c.hotline || 'Không có'}`
                        ).join('<br/><br/>');

                        const reply = `Bạn chưa đăng nhập. Nếu muốn xem địa chỉ cửa hàng, đây là thông tin chung:<br/><br/>${storeInfo}<br/><br/>Vui lòng <a href="/login">đăng nhập</a> để xem địa chỉ cá nhân.`;
                        setMessages(prev => [...prev, { role: 'bot', content: reply }]);
                        return;
                    } catch (error) {
                        console.error('Lỗi khi lấy thông tin cửa hàng:', error);
                        setMessages(prev => [...prev, { role: 'bot', content: 'Đã xảy ra lỗi khi lấy thông tin cửa hàng. Vui lòng thử lại sau.' }]);
                        return;
                    }
                }

                let token = localStorage.getItem('authToken');
                if (!token) {
                    token = await authenticate();
                    if (!token) return;
                }

                try {
                    const userResponse = await axios.get(
                        `http://localhost:8080/api/public/users/email/${encodeURIComponent(userEmail)}`,
                        { headers: { Authorization: `Bearer ${token}`, Accept: '*/*' } }
                    );
                    const user = userResponse.data;

                    // Lấy thông tin cửa hàng đang hoạt động
                    const configResponse = await axios.get(
                        'http://localhost:8080/api/public/configs?pageNumber=0&pageSize=100&sortBy=id&sortOrder=ASC',
                        { headers: { Accept: '*/*' } }
                    );

                    const activeConfigs = configResponse.data.content.filter(c => c.status === 'ACTIVE');

                    const storeInfo = activeConfigs.map(c =>
                        `📍 ${c.siteName}: ${c.address}<br/>📞 Hotline: ${c.hotline || 'Không có'}`
                    ).join('<br/><br/>');

                    const reply = `Địa chỉ của bạn:<br/><br/>📍 ${formatAddress(user.address) || 'Chưa cập nhật địa chỉ'}<br/><br/>👉 <a href="/profile">Cập nhật địa chỉ</a><br/><br/>${storeInfo}`;
                    setMessages(prev => [...prev, { role: 'bot', content: reply }]);
                    return;
                } catch (error) {
                    console.error('Lỗi khi lấy địa chỉ người dùng hoặc cấu hình:', error);
                    setMessages(prev => [...prev, { role: 'bot', content: 'Đã xảy ra lỗi khi lấy thông tin. Vui lòng thử lại sau.' }]);
                    return;
                }
            }


            // 11. Liên hệ
            if (lowerInput.includes('liên hệ') || lowerInput.includes('contact') || lowerInput.includes('hỗ trợ')) {
                const response = await GET_ALL('public/contacts', { pageNumber: 0, pageSize: 1 });
                const contacts = response.content || [];
                const contactInfo = contacts.length > 0
                    ? `📧 Email: ${contacts[0].email}<br/>📞 Điện thoại: ${contacts[0].phone}<br/>📝 Nội dung: ${contacts[0].message || 'Không có thông tin'}`
                    : '📍 MHP Store: 123 Đường ABC, Quận 1, TP.HCM, Việt Nam<br/>📞 Hotline: 0909 123 456<br/>📧 Email: support@mhpstore.com';
                const reply = `Thông tin liên hệ:<br/><br/>${contactInfo}<br/><br/>👉 Gửi yêu cầu hỗ trợ tại <a href="/contact">trang liên hệ</a>`;
                setMessages(prev => [...prev, { role: 'bot', content: reply }]);
                return;
            }

            // 12. Blog
            if (lowerInput.includes('blog') || lowerInput.includes('bài viết') || lowerInput.includes('tin tức')) {
                const params = { pageNumber: 0, pageSize: 5, sortBy: 'id', sortOrder: 'desc' };
                const response = await GET_ALL('public/blogs', params);
                const blogs = response.content || [];
                if (blogs.length === 0) {
                    setMessages(prev => [...prev, {
                        role: 'bot',
                        content: `Hiện tại chưa có bài viết nào. Hãy ghé thăm <a href="/blog">trang blog</a> để cập nhật sau!`
                    }]);
                    return;
                }
                const blogList = blogs.map(b =>
                    `📝 <a href="/blog/${b.id}">${b.title}</a> - ${new Date(b.createdAt).toLocaleDateString('vi-VN')}`
                ).join('<br/>');
                setMessages(prev => [...prev, {
                    role: 'bot',
                    content: `Danh sách bài viết mới nhất:<br/><br/>${blogList}<br/><br/>👉 Xem tất cả tại <a href="/blog">trang blog</a>`
                }]);
                return;
            }

            // 13. Cấu hình trang web
            if (lowerInput.includes('cấu hình') || lowerInput.includes('config') || lowerInput.includes('thông tin cửa hàng')) {
                const response = await GET_ALL('public/configs', { pageNumber: 0, pageSize: 1 });
                const configs = response.content || [];
                const configInfo = configs.length > 0
                    ? `🏬 Tên cửa hàng: ${configs[0].storeName || 'MHP Store'}<br/>📜 Mô tả: ${configs[0].description || 'Không có mô tả'}<br/>📧 Email: ${configs[0].email || 'support@mhpstore.com'}`
                    : '🏬 MHP Store: Cửa hàng thương mại điện tử hàng đầu<br/>📧 Email: support@mhpstore.com';
                setMessages(prev => [...prev, {
                    role: 'bot',
                    content: `Thông tin cửa hàng:<br/><br/>${configInfo}<br/><br/>👉 Liên hệ chúng tôi tại <a href="/contact">trang liên hệ</a>`
                }]);
                return;
            }

            // 14. Tổng quan về trang web
            if (lowerInput.includes('mọi thứ') || lowerInput.includes('trang web') || lowerInput.includes('có gì')) {
                let reply = `Tổng quan về MHP Store:<br/><br/>`;

                const productResponse = await GET_ALL('public/products', { pageNumber: 0, pageSize: 3 });
                const products = productResponse.content || [];
                reply += `📱 <strong>Sản phẩm</strong>: ${productResponse.totalElements || 0} sản phẩm. Ví dụ:<br/>${products.map(formatProduct).join('<br/>') || 'Không có sản phẩm.'}<br/><br/>`;

                const promoResponse = await GET_ALL('public/products/promotions', { pageNumber: 0, pageSize: 3 });
                const promos = promoResponse.content || [];
                reply += `🎉 <strong>Khuyến mãi</strong>:<br/>${promos.map(formatProduct).join('<br/>') || 'Không có khuyến mãi.'}<br/><br/>`;

                const categoryResponse = await GET_ALL('public/categories', { pageNumber: 0, pageSize: 3 });
                const categories = categoryResponse.content || [];
                reply += `📋 <strong>Danh mục</strong>:<br/>${categories.map(c => `<a href="/category/${c.categoryId}">${c.categoryName}</a>`).join('<br/>') || 'Không có danh mục.'}<br/><br/>`;

                const blogResponse = await GET_ALL('public/blogs', { pageNumber: 0, pageSize: 2 });
                const blogs = blogResponse.content || [];
                reply += `📝 <strong>Bài viết</strong>:<br/>${blogs.map(b => `<a href="/blog/${b.id}">${b.title}</a>`).join('<br/>') || 'Không có bài viết.'}<br/><br/>`;

                reply += `👉 Khám phá thêm tại <a href="/">trang chủ</a>`;
                setMessages(prev => [...prev, { role: 'bot', content: reply }]);
                return;
            }

            // 15. Câu hỏi không liên quan (gọi Gemini AI)
            const res = await axios.post(
                'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyAgCIH5TI_2GaNBzPRLI55Wk4VGWL84jpk',
                {
                    contents: [{
                        parts: [{
                            text: `Bạn là chatbot của MHP Store, một cửa hàng thương mại điện tử tại Việt Nam. Hãy trả lời câu hỏi sau một cách tự nhiên, thân thiện và ngắn gọn bằng tiếng Việt: "${input}"`
                        }]
                    }]
                },
                { headers: { 'Content-Type': 'application/json' } }
            );
            const geminiResponse = res.data.candidates?.[0]?.content?.parts?.[0]?.text || 'Xin lỗi, tôi chưa hiểu câu hỏi của bạn. Hãy thử hỏi rõ hơn nhé! 😊';
            setMessages(prev => [...prev, { role: 'bot', content: geminiResponse }]);
        } catch (error) {
            console.error('Lỗi:', error);
            let errorMessage = '⚠️ Có lỗi xảy ra. Vui lòng thử lại sau!';
            if (error.response?.status === 401) {
                errorMessage = '⚠️ Phiên đăng nhập hết hạn. Vui lòng <a href="/login">đăng nhập lại</a>.';
            } else if (error.response?.status === 404) {
                errorMessage = '⚠️ Không tìm thấy dữ liệu. Hãy kiểm tra câu hỏi hoặc thử lại!';
            }
            setMessages(prev => [...prev, { role: 'bot', content: errorMessage }]);
        } finally {
            setLoading(false);
        }
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
                            __html: `<strong>${msg.role === 'user' ? 'Bạn: ' : 'MHP Bot: '}</strong>${msg.content}`
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
                    placeholder="Hỏi tôi bất cứ điều gì..."
                    disabled={loading}
                />
                <button
                    onClick={handleSend}
                    disabled={loading}
                >
                    {loading ? 'Đang xử lý...' : 'Gửi'}
                </button>
            </div>
        </div>
    );
};

export default ChatBotGemini;