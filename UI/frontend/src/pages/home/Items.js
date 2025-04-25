import React, { useEffect, useState } from 'react';
import { GET_ALL } from '../../api/apiService';
import { Link } from 'react-router-dom';

function Items() {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        GET_ALL(`http://localhost:8080/api/public/products?pageNumber=1&pageSize=10&sortBy=id&sortOrder=ASC`)
            .then((data) => {
                const product = data.content;
                setProducts(product);
            })
            .catch((error) => {
                console.error("Error fetching products:", error);
            });
    }, []);

    return (
        <section className="py-8 bg-gray-50">
            <div className="container mx-auto px-4">
                <header className="mb-6">
                    <h4 className="text-2xl font-bold text-gray-800 uppercase tracking-wide">
                        Request for Quotation
                    </h4>
                    <div className="w-16 h-1 bg-blue-600 mt-2"></div>
                </header>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {products.map((product) => (
                        <div key={product.id} className="group">
                            <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 group-hover:shadow-lg group-hover:-translate-y-1">
                                <Link to={`/product/${product.productId}`}>
                                    <div className="relative overflow-hidden">
                                        <img 
                                            src={`http://localhost:8080/api/public/products/image/${product.image}`} 
                                            alt={product.productName}
                                            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                    </div>
                                </Link>
                                <div className="p-4">
                                    <Link to={`/product/${product.productId}`}>
                                        <h5 className="text-sm font-medium text-gray-800 group-hover:text-blue-600 line-clamp-2 min-h-[40px]">
                                            {product.productName}
                                        </h5>
                                    </Link>
                                    <div className="mt-2 text-lg font-semibold text-blue-600">
                                        {product.price.toLocaleString('vi-VN')} VND
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default Items;