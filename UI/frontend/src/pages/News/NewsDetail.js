import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

// Tách cấu hình API
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

const NewsDetail = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hàm lấy bài viết
  const fetchArticle = useCallback(async (signal) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/public/blogs/${id}`, {
        signal,
        headers: {
          "Content-Type": "application/json",
        },
      });
      setArticle(response.data);
    } catch (error) {
      if (axios.isCancel(error)) return;
      const errorMessage =
        error.response?.status === 404
          ? "Bài viết không tồn tại!"
          : "Lỗi khi tải bài viết. Vui lòng thử lại!";
      toast.error(errorMessage);
      console.error("Error fetching article:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const controller = new AbortController();
    fetchArticle(controller.signal);
    return () => controller.abort();
  }, [fetchArticle]);

  // Format ngày
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Skeleton loading
  const SkeletonArticle = () => (
    <div className="bg-white rounded-lg shadow-md p-8 animate-pulse">
      <div className="w-full h-96 bg-gray-200 rounded-lg mb-6"></div>
      <div className="h-8 bg-gray-200 rounded mb-4"></div>
      <div className="h-4 bg-gray-200 rounded mb-6 w-1/3"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    </div>
  );

  if (loading) return <div className="container mx-auto px-4 py-12"><SkeletonArticle /></div>;
  if (!article) return <div className="text-center py-12 text-gray-600">Bài viết không tồn tại!</div>;

  // Schema.org JSON-LD
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title || "Bài viết",
    image: article.image && article.image !== "default.png"
      ? `${API_BASE_URL}/api/public/images/${article.image}`
      : "https://via.placeholder.com/300",
    author: {
      "@type": "Person",
      email: article.authorEmail || "N/A",
    },
    datePublished: article.createdAt || new Date().toISOString(),
    description: article.content ? article.content.slice(0, 160) : "Không có mô tả",
    publisher: {
      "@type": "Organization",
      name: "MHP Store",
      logo: {
        "@type": "ImageObject",
        url: "https://your-site.com/logo.png", // Thay bằng URL logo thực tế
      },
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Trang chủ",
        item: "https://your-site.com/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Tin tức",
        item: "https://your-site.com/news",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: article.title || "Bài viết",
        item: `https://your-site.com/news/${id}`,
      },
    ],
  };

  return (
    <section className="bg-gray-50 min-h-screen py-12">
      {/* Schema JSON-LD */}
      <script type="application/ld+json">{JSON.stringify(schemaData)}</script>
      <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>

      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link
                to="/"
                className="text-gray-700 hover:text-blue-600 inline-flex items-center"
                title="Quay về trang chủ"
              >
                <i className="fas fa-chevron-left mr-1"></i>
                Trang chủ
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <i className="fas fa-chevron-right text-gray-400 mx-1"></i>
                <Link
                  to="/news"
                  className="text-gray-700 hover:text-blue-600"
                  title="Quay về danh sách tin tức"
                >
                  Tin tức
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <i className="fas fa-chevron-right text-gray-400 mx-1"></i>
                <span className="text-gray-500 line-clamp-1">{article.title || "Bài viết"}</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Nội dung bài viết */}
        <article className="bg-white rounded-lg shadow-md p-8">
          <header className="mb-6">
            <img
              src={
                article.image && article.image !== "default.png"
                  ? `${API_BASE_URL}/api/public/images/${article.image}`
                  : "https://via.placeholder.com/300"
              }
              alt={article.title || "Hình ảnh bài viết"}
              onError={(e) => {
                console.warn(`Failed to load image: ${article.image}`);
                e.target.src = "https://via.placeholder.com/300";
              }}
              className="w-full h-96 object-cover rounded-lg mb-6"
            />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              {article.title || "Không có tiêu đề"}
            </h1>
            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <time dateTime={article.createdAt}>
                <i className="fas fa-calendar-alt mr-1"></i>
                {formatDate(article.createdAt)}
              </time>
              <span>Tác giả: {article.authorEmail || "N/A"}</span>
            </div>
          </header>
          <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed">
            {article.content || "Không có nội dung"}
          </div>
          <div className="mt-8">
            <Link
              to="/new"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
              title="Quay lại danh sách tin tức"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Quay lại danh sách tin tức
            </Link>
          </div>
        </article>

        {/* Gợi ý bài viết liên quan (giả lập) */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Bài viết liên quan</h2>
          <p className="text-gray-600">
            Hiện chưa có bài viết liên quan. Vui lòng quay lại sau!
          </p>
        </div>
      </div>
    </section>
  );
};

export default NewsDetail;