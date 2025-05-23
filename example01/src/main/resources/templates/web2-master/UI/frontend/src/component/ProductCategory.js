import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { GET_ALL } from './../api/apiService';

function ProductCategory() {
    const [products, setProducts] = useState([]);
    const [error, setError] = useState(null);
    const { priceRange } = useParams(); // Lấy giá trị tham số từ URL
    const priceLimits = {
        under100000: 100000,
        under200000: 200000,
        under300000: 300000,
    };

    // Mức giá cần lọc
    const priceLimit = priceLimits[priceRange];

    useEffect(() => {
        if (priceLimit) {
            const params = {
                pageNumber: 1,
                pageSize: 20,
                priceLimit: priceLimit,
            };

            console.log("Gửi request với params:", params);

            GET_ALL('http://localhost:8080/api/public/products', params)
                .then((response) => {
                    console.log("Kết quả API:", response);
                    setProducts(response.content);
                    setError(null);
                })
                .catch((error) => {
                    console.error('Lỗi khi fetch sản phẩm:', error);
                    setError('Không thể tải sản phẩm, vui lòng thử lại sau.');
                });
        }
    }, [priceRange, priceLimit]);

    return (
        <div>
            <h1>Sản phẩm {priceRange === 'under100000' ? 'Dưới 100.000' :
                priceRange === 'under200000' ? 'Dưới 200.000' :
                    priceRange === 'under300000' ? 'Dưới 300.000' : ''}</h1>

            {error && <p>{error}</p>}

            <div className="product-list">
                {products.length > 0 ? (
                    products.map((product) => (
                        <div className="product-item" key={product.productId}>
                            <img src={product.imageUrl} alt={product.name} />
                            <h2>{product.name}</h2>
                            <p>{product.price} VND</p>
                        </div>
                    ))
                ) : (
                    <p>Không có sản phẩm nào trong phạm vi giá này</p>
                )}
            </div>
        </div>
    );
}

export default ProductCategory;
