import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { GET_ALL } from '../../api/apiService';

function SearchResults() {
    const location = useLocation();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

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

    return (
        <div>
            <h2>Kết quả tìm kiếm cho từ khóa: "{new URLSearchParams(location.search).get('query')}"</h2>
            <div className="row row-sm">
                {products.length > 0 ? (
                    products.map((product) => (
                        <div key={product.id} className="col-xl-2 col-lg-3 col-md-4 col-6">
                            <div className="card card-sm card-product-grid">
                                <a href="#" className="img-wrap">
                                    <img src={`http://localhost:8080/api/public/products/image/${product.image}`} alt={product.productName} />
                                </a>
                                <figcaption className="info-wrap">
                                    <a href="#" className="title">{product.productName}</a>
                                    <div className="price mt-1">{product.price}$</div>
                                </figcaption>
                            </div>
                        </div>
                    ))
                ) : (
                    <div>No products found.</div>
                )}
            </div>
        </div>
    );
}

export default SearchResults;
