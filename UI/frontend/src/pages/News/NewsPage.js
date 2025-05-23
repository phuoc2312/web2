import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const NewsPage = () => {
  const [articles, setArticles] = useState([]);
  const [pageNumber, setPageNumber] = useState(0);
  const [pageSize] = useState(9); // 9 bài để hiển thị 3x3 grid
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  // Gọi API để lấy danh sách bài viết
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:8080/api/public/blogs", {
          params: {
            pageNumber,
            pageSize,
            sortBy: "createdAt",
            sortOrder: "desc", // Bài mới nhất trước
          },
          headers: {
            "Content-Type": "application/json",
          },
        });
        const { content, totalPages } = response.data;
        setArticles(content);
        setTotalPages(totalPages);
      } catch (error) {
        toast.error("Không thể tải tin tức!");
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, [pageNumber, pageSize]);

  // Format ngày
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Xử lý phân trang
  const handlePreviousPage = () => {
    if (pageNumber > 0) {
      setPageNumber(pageNumber - 1);
    }
  };

  const handleNextPage = () => {
    if (pageNumber < totalPages - 1) {
      setPageNumber(pageNumber + 1);
    }
  };

  return (
    <section className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link
                to="/"
                className="text-gray-700 hover:text-blue-600 inline-flex items-center"
                aria-label="Trang chủ"
              >
                <i className="fas fa-chevron-left mr-1"></i>
                Trang chủ
              </Link>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <i className="fas fa-chevron-right text-gray-400 mx-1"></i>
                <span className="text-gray-500">Tin tức</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Tiêu đề */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 uppercase tracking-wide">
            Tin tức từ MHP Store
          </h1>
          <div className="w-24 h-1 bg-blue-600 mt-4 mx-auto"></div>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Cập nhật các thông tin mới nhất về khuyến mãi, sản phẩm, và sự kiện từ MHP Store!
          </p>
        </div>

        {/* Danh sách bài viết */}
        {loading ? (
          <div className="text-center text-gray-600">Đang tải tin tức...</div>
        ) : articles.length === 0 ? (
          <div className="text-center text-gray-600">Không có tin tức nào!</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {articles.map((article) => (
              <div
                key={article.id}
                className="group bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <Link to={`/news/${article.id}`}>
                  <div className="relative overflow-hidden">
                    <img
                      src={article.image || "https://via.placeholder.com/300"}
                      alt={article.title}
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                </Link>
                <div className="p-6">
                  <Link to={`/news/${article.id}`}>
                    <h2 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 line-clamp-2 mb-2">
                      {article.title}
                    </h2>
                  </Link>
                  <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                    {article.content}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      <i className="fas fa-calendar-alt mr-1"></i>
                      {formatDate(article.createdAt)}
                    </span>
                    <Link
                      to={`/news/${article.id}`}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      Đọc thêm <i className="fas fa-arrow-right ml-1"></i>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="flex justify-center space-x-4 mb-16">
            <button
              onClick={handlePreviousPage}
              disabled={pageNumber === 0}
              className={`px-4 py-2 rounded-lg ${
                pageNumber === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              Trang trước
            </button>
            <span className="text-gray-600">
              Trang {pageNumber + 1} / {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={pageNumber >= totalPages - 1}
              className={`px-4 py-2 rounded-lg ${
                pageNumber >= totalPages - 1
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              Trang sau
            </button>
          </div>
        )}

        {/* Lời kêu gọi hành động */}
        <div className="text-center bg-blue-600 text-white py-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">
            Khám phá các ưu đãi mới nhất!
          </h2>
          <p className="text-lg mb-6">
            Đừng bỏ lỡ các chương trình khuyến mãi và sản phẩm hot tại MHP Store!
          </p>
          <Link
            to="/products"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
          >
            Mua sắm ngay
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NewsPage;