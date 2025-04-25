import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { GET_ALL } from "../api/apiService";

const PromotionSectionContent = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();
    const location = useLocation();

    const queryParams = new URLSearchParams(location.search);
    const currentPage = parseInt(queryParams.get("page")) || 1;
    const numItems = 4;

    const handlePageChange = (page) => {
        navigate(`/promotions?page=${page}`);
    };

    const handlePrevious = () => {
        if (currentPage > 1) {
            handlePageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            handlePageChange(currentPage + 1);
        }
    };

    const renderPageNumbers = () => {
        const pageNumbers = [];
        for (let i = 1; i <= totalPages; i++) {
            pageNumbers.push(
                <li key={i} className={`page-item ${currentPage === i ? "active" : ""}`}>
                    <button className="page-link" onClick={() => handlePageChange(i)}>
                        {i}
                    </button>
                </li>
            );
        }
        return pageNumbers;
    };

    useEffect(() => {
        const fetchPromotionProducts = async () => {
            setLoading(true);
            const params = {
                pageNumber: currentPage - 1,
                pageSize: numItems * 100,
                sortBy: "productId",
                sortOrder: "asc",
            };

            try {
                const response = await GET_ALL("http://localhost:8080/api/public/products/promotions", params);
                setProducts(response.content || []);
                setTotalPages(Math.ceil((response.totalElements || response.content?.length || 0) / numItems));
            } catch (err) {
                console.error("Lỗi lấy sản phẩm khuyến mãi:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPromotionProducts();
    }, [currentPage]);

    const currentProducts = products.slice((currentPage - 1) * numItems, currentPage * numItems);

    return (
        <section className="section-content padding-y">
            <div className="container">
                <header className="mb-4">
                    <h4>Sản phẩm khuyến mãi</h4>
                </header>

                <div className="row">
                    {!loading ? (
                        currentProducts.length > 0 ? (
                            currentProducts.map((product) => (
                                <div className="col-md-3" key={product.productId}>
                                    <figure className="card card-product-grid">
                                        <Link to={`/product/${product.productId}`} className="img-wrap">
                                            <img src={`http://localhost:8080/api/public/products/image/${product.image}`} alt={product.productName} />
                                        </Link>
                                        <figcaption className="info-wrap">
                                            <Link to={`/product/${product.productId}`} className="title mb-2">{product.productName}</Link>
                                            <div className="price-wrap">
                                                <span className="price">{product.specialPrice}VND</span>
                                                <small className="text-muted">/ sản phẩm</small>
                                            </div>
                                            <p className="mb-2">{product.quantity} cái</p>
                                        </figcaption>
                                    </figure>
                                </div>
                            ))
                        ) : (
                            <p>Không có sản phẩm khuyến mãi.</p>
                        )
                    ) : (
                        <p>Đang tải...</p>
                    )}
                </div>

                <nav>
                    <ul className="pagination">
                        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                            <button className="page-link" onClick={handlePrevious}>Trước</button>
                        </li>
                        {renderPageNumbers()}
                        <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                            <button className="page-link" onClick={handleNext}>Sau</button>
                        </li>
                    </ul>
                </nav>
            </div>
        </section>
    );
};

export default PromotionSectionContent;
