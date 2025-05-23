import React, { useEffect, useState } from "react";
import { GET_ALL } from "../../api/apiService";
import startsActive from "../../assets/images/icons/stars-active.svg";
import startsDisable from "../../assets/images/icons/starts-disable.svg";
import { Link } from "react-router-dom";
const cardTextStyle = {
    maxWidth: "80%",
};

const Section1 = (category) => {
    const { categoryName, categoryId } = category;
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const params = {
            pageNumber: 0,
            pageSize: 5,
            sortBy: 'productId',
            sortOrder: 'asc',
        };

        GET_ALL(`categories/${categoryId}/products`, params)
            .then(response => {
                console.log("response", response.content);
                setProducts(response.content); // Set the products state
            })
            .catch(error => {
                console.error("Error fetching products:", error);
            });
    }, [categoryId]);

    return (
        <section className="padding-bottom">
            <header className="section-heading mb-4">
                <h3 className="title-section">{categoryName}</h3>
            </header>
            <div className="row">
                {products.length > 0 && products.map((product) => (
                    <div className="col-xl-3 col-lg-3 col-md-4 col-6" key={product.id}>
                        <div className="card card-product-grid">
                            <Link to={`/Detail?productId=${product.id}`} className="img-wrap">
                                <img src={`http://localhost:8080/api/public/products/image/${product.image}`} alt={product.productName} />
                            </Link>
                            <figcaption className="info-wrap">
                                <ul className="rating-stars mb-1">
                                    <li className="stars-active" style={cardTextStyle}>
                                        <img src={startsActive} alt="Active stars" />
                                    </li>
                                    <li>
                                        <img src={startsDisable} alt="Disabled stars" />
                                    </li>
                                </ul>
                                <div>
                                    <Link to={`/Detail?productId=${product.id}`} className="title">
                                        {product.productName}
                                    </Link>
                                </div>
                                <div className="price h5 mt-2">${product.price}</div>
                            </figcaption>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Section1;