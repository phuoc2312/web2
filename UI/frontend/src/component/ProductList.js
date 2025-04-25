import React, { useState, useEffect } from 'react';
import { GET_ALL } from './../api/apiService';  // Đảm bảo rằng bạn đã có API lấy sản phẩm

function ProductList() {
    const [products, setProducts] = useState([]);
    const [selectedPriceRanges, setSelectedPriceRanges] = useState([100000]);  // Mặc định là dưới 100.000
    const [loading, setLoading] = useState(true);

    // Lọc sản phẩm theo giá
    const filterProductsByPrice = (products, priceRanges) => {
        return products.filter(product =>
            priceRanges.some(range => product.price < range)
        );
    };

    useEffect(() => {
        const params = {
            pageNumber: 0,
            pageSize: 20,  // Bạn có thể điều chỉnh số lượng sản phẩm trên trang
            sortBy: 'price',
            sortOrder: 'asc',
        };

        GET_ALL('http://localhost:8080/api/products', params)
            .then(response => {
                const filteredProducts = filterProductsByPrice(response.content, selectedPriceRanges);
                setProducts(filteredProducts);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching products:', error);
                setLoading(false);
            });
    }, [selectedPriceRanges]);

    const handlePriceRangeChange = (event) => {
        const { value, checked } = event.target;
        const price = parseInt(value);

        if (checked) {
            setSelectedPriceRanges(prevRanges => [...prevRanges, price]);
        } else {
            setSelectedPriceRanges(prevRanges => prevRanges.filter(range => range !== price));
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="product-list">
            <h2>Sản phẩm</h2>

            {/* Chọn mức giá */}
            <div>
                <h4>Chọn mức giá:</h4>
                <div>
                    <label>
                        <input
                            type="checkbox"
                            value="100000"
                            checked={selectedPriceRanges.includes(100000)}
                            onChange={handlePriceRangeChange}
                        />
                        Dưới 100.000
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            value="200000"
                            checked={selectedPriceRanges.includes(200000)}
                            onChange={handlePriceRangeChange}
                        />
                        Dưới 200.000
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            value="300000"
                            checked={selectedPriceRanges.includes(300000)}
                            onChange={handlePriceRangeChange}
                        />
                        Dưới 300.000
                    </label>
                </div>
            </div>

            {/* Hiển thị sản phẩm */}
            <div className="row">
                {products.length > 0 ? (
                    products.map(product => (
                        <div className="col-md-4" key={product.productId}>
                            <div className="product-card">
                                <img src={product.imageUrl} alt={product.productName} />
                                <h4>{product.productName}</h4>
                                <p>{product.description}</p>
                                <p>Price: {product.price} VNĐ</p>
                                <button className="btn btn-primary">Thêm vào giỏ</button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>Không có sản phẩm nào đáp ứng yêu cầu của bạn.</p>
                )}
            </div>
        </div>
    );
}

export default ProductList;
