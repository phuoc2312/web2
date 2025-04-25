import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { GET_ALL, GET_ID } from "../../api/apiService";
import { Dropdown } from 'react-bootstrap';
const SectionContent = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState(null);
    const [allCategories, setAllCategories] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    const queryParams = new URLSearchParams(location.search);
    const currentPage = parseInt(queryParams.get("page")) || 1;
    const categoryId = queryParams.get("categoryId");

    const numItems = 4;

    const handlePageChange = (page) => {
        navigate(`/ListingGrid?page=${page}${categoryId ? `&categoryId=${categoryId}` : ""}`);
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

    const handleCategoryChange = (e) => {
        const selectedId = e.target.value;
        navigate(`/ListingGrid?page=1${selectedId ? `&categoryId=${selectedId}` : ""}`);
    };

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await GET_ALL("categories");
                if (Array.isArray(res)) {
                    setAllCategories(res);
                } else if (res?.content && Array.isArray(res.content)) {
                    setAllCategories(res.content);
                } else {
                    setAllCategories([]);
                }
            } catch (err) {
                console.error("Lỗi lấy danh mục:", err);
                setAllCategories([]);
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const params = {
                pageNumber: 0,
                pageSize: numItems * 100,
                sortBy: "productId",
                sortOrder: "asc",
            };

            try {
                let productResponse;
                if (categoryId) {
                    productResponse = await GET_ALL(`categories/${categoryId}/products`, params);
                    const categoryResponse = await GET_ID("categories", categoryId);
                    setCategories(categoryResponse);
                } else {
                    productResponse = await GET_ALL("products", params);
                    setCategories({ categoryName: "Tất cả sản phẩm" });
                }

                setProducts(productResponse.content || []);
                setTotalPages(Math.ceil((productResponse.totalElements || productResponse.content?.length || 0) / numItems));
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentPage, categoryId]);

    const currentProducts = products.slice((currentPage - 1) * numItems, currentPage * numItems);

    return (
        <section className="section-content padding-y">
            <div className="container">
                

                <hr />

                {/* Filters */}

                <header className="mb-3">
                    <div className="form-inline">
                        <strong className="mr-md-auto">Kết quả tìm kiếm:</strong>
                        <select className="mr-2 form-control">
                            <option>Sản phẩm mới nhất</option>
                            <option>Đang định hình hành</option>
                            <option>Phổ biến nhất</option>
                            <option>Rẻ nhất</option>
                        </select>
                        <div className="btn-group">
                            <button className="btn btn-light active"><i className="fa fa-bars"></i></button>
                            <button className="btn btn-light"><i className="fa fa-th"></i></button>
                        </div>
                    </div>
                </header>

                <div className="row">
                    {!loading ? (
                        currentProducts.length > 0 ? (
                            currentProducts.map((row) => (
                                <div className="col-md-3" key={row.productId}>
                                    <figure className="card card-product-grid">
                                        <Link to={`/product/${row.productId}`} className="img-wrap">
                                            <img src={`http://localhost:8080/api/public/products/image/${row.image}`} alt={row.productName} />
                                        </Link>
                                        <figcaption className="info-wrap">
                                            <Link to={`/product/${row.productId}`} className="title mb-2">{row.productName}</Link>
                                            <div className="price-wrap">
                                                <span className="price">{row.specialPrice}VND</span>
                                                <small className="text-muted">mỗi sản phẩm</small>
                                            </div>
                                            <p className="mb-2">
                                                {row.quantity} Cái <small className="text-muted">(Số lượng tối thiểu)</small>
                                            </p>
                                            <p className="text-muted">{row.category.categoryName}</p>
                                            <hr />
                                            <p className="mb-3">
                                                <span className="tag"><i className="fa fa-check"></i> Đã xác minh</span>
                                            </p>
                                            <label className="custom-control mb-3 custom-checkbox">
                                                <input type="checkbox" className="custom-control-input" />
                                                <div className="custom-control-label">Thêm vào so sánh</div>
                                            </label>
                                        </figcaption>
                                    </figure>
                                </div>
                            ))
                        ) : (
                            <p>Không có sản phẩm nào</p>
                        )
                    ) : (
                        <p>Loading...</p>
                    )}
                </div>

                <nav>
                    <ul className="pagination">
                        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                            <button className="page-link" onClick={handlePrevious}>Trang trước</button>
                        </li>
                        {renderPageNumbers()}
                        <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                            <button className="page-link" onClick={handleNext}>Trang sau</button>
                        </li>
                    </ul>
                </nav>

                <div className="box text-center mt-4">
                    <p>Bạn đã tìm thấy điều bạn đang tìm kiếm chưa?</p>
                    <Link to="#" className="btn btn-light">Có</Link>
                    <Link to="#" className="btn btn-light" style={{ marginLeft: "10px" }}>Không</Link>
                </div>
            </div>
        </section>
    );
};

export default SectionContent;
