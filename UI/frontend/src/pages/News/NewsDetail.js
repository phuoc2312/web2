import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const NewsDetail = () => {
    const { id } = useParams();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/public/blogs/${id}`);
                setArticle(response.data);
            } catch (error) {
                toast.error("Không thể tải bài viết!");
            } finally {
                setLoading(false);
            }
        };
        fetchArticle();
    }, [id]);

    if (loading) return <div className="text-center py-12">Đang tải...</div>;
    if (!article) return <div className="text-center py-12">Bài viết không tồn tại!</div>;

    return (
        <section className="bg-gray-50 min-h-screen py-12">
            <div className="container mx-auto px-4">
                {/* Breadcrumb */}
                <nav className="flex mb-6" aria-label="Breadcrumb">
                    <ol className="inline-flex items-center space-x-1 md:space-x-3">
                        <li className="inline-flex items-center">
                            <Link to="/" className="text-gray-700 hover:text-blue-600">
                                Trang chủ
                            </Link>
                        </li>
                        <li>
                            <Link to="/news" className="text-gray-700 hover:text-blue-600">
                                Tin tức
                            </Link>
                        </li>
                        <li aria-current="page">
                            <span className="text-gray-500">{article.title}</span>
                        </li>
                    </ol>
                </nav>

                {/* Nội dung bài viết */}
                <div className="bg-white rounded-lg shadow-md p-8">
                    <img
                        src={`http://localhost:8080/api/public/blogs/image/${article.image}`}
                        alt={article.title}
                        className="w-full h-96 object-cover rounded-lg mb-6"
                    />
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">{article.title}</h1>
                    <div className="flex items-center justify-between mb-6">
                        <span className="text-sm text-gray-500">
                            <i className="fas fa-calendar-alt mr-1"></i>
                            {new Date(article.createdAt).toLocaleDateString("vi-VN")}
                        </span>
                        <span className="text-sm text-gray-500">Tác giả: {article.authorEmail}</span>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{article.content}</p>
                </div>
            </div>
        </section>
    );
};

export default NewsDetail;