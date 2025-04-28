
import React from "react";
import { Link } from "react-router-dom";

const newsArticles = [
  {
    id: 1,
    title: "Khuyến mãi lớn tháng 5 - Giảm giá đến 50%!",
    summary:
      "MHP Store tung chương trình khuyến mãi lớn nhất trong năm với hàng loạt sản phẩm giảm giá lên đến 50%. Đừng bỏ lỡ cơ hội sở hữu các sản phẩm chất lượng với giá siêu hời!",
    image: "https://images.unsplash.com/photo-1543503109-04b47b6637dc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80",
    date: "25/04/2025",
  },
  {
    id: 2,
    title: "Ra mắt bộ sưu tập thời trang hè 2025",
    summary:
      "Khám phá bộ sưu tập thời trang hè mới nhất từ MHP Store, với thiết kế trẻ trung, hiện đại, phù hợp cho mọi phong cách. Sản phẩm đang có sẵn với nhiều ưu đãi đặc biệt!",
    image: "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80",
    date: "20/04/2025",
  },
  {
    id: 3,
    title: "MHP Store hợp tác với thương hiệu công nghệ hàng đầu",
    summary:
      "Chúng tôi tự hào công bố hợp tác với các thương hiệu công nghệ lớn, mang đến các sản phẩm điện tử hiện đại với giá cạnh tranh. Hãy theo dõi để cập nhật thêm thông tin!",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80",
    date: "15/04/2025",
  },
  {
    id: 4,
    title: "Hướng dẫn mua sắm trực tuyến tại MHP Store",
    summary:
      "Bạn mới bắt đầu mua sắm tại MHP Store? Xem ngay hướng dẫn chi tiết của chúng tôi để đặt hàng nhanh chóng, tận hưởng ưu đãi, và nhận giao hàng tận nơi!",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80",
    date: "10/04/2025",
  },
];

const NewsPage = () => {
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {newsArticles.map((article) => (
            <div
              key={article.id}
              className="group bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <Link to={`/news/${article.id}`}>
                <div className="relative overflow-hidden">
                  <img
                    src={article.image}
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
                  {article.summary}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    <i className="fas fa-calendar-alt mr-1"></i>
                    {article.date}
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
