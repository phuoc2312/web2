
import React from "react";
import { Link } from "react-router-dom";

const AboutPage = () => {
  return (
    <section className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Tiêu đề */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 uppercase tracking-wide">
            Giới thiệu về MHP Store
          </h1>
          <div className="w-24 h-1 bg-green-600 mt-4 mx-auto"></div>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Chào mừng bạn đến với MHP Store - điểm đến mua sắm trực tuyến hàng đầu, nơi mang đến sản phẩm chất lượng với giá ưu đãi!
          </p>
        </div>

        {/* Phần Giới thiệu tổng quan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-16">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Chúng tôi là ai?
            </h2>
            <p className="text-gray-600 leading-relaxed">
              MHP Store được thành lập với sứ mệnh mang đến trải nghiệm mua sắm trực tuyến tiện lợi, nhanh chóng và đáng tin cậy. Chúng tôi cung cấp đa dạng sản phẩm từ thời trang, điện tử, đồ gia dụng đến mỹ phẩm, tất cả đều được chọn lọc kỹ lưỡng để đảm bảo chất lượng cao nhất.
            </p>
            <p className="text-gray-600 leading-relaxed mt-4">
              Với các chương trình khuyến mãi hấp dẫn và giá cả cạnh tranh, ShopTrend cam kết giúp bạn tiết kiệm chi phí mà vẫn sở hữu những sản phẩm tuyệt vời.
            </p>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80"
              alt="About ShopTrend"
              className="w-full h-80 object-cover rounded-lg shadow-md"
            />
          </div>
        </div>

        {/* Phần Sứ mệnh và Tầm nhìn */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-center">
              <i className="fas fa-bullseye text-4xl text-green-600 mb-4"></i>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Sứ mệnh
              </h3>
              <p className="text-gray-600">
                Mang đến cho khách hàng những sản phẩm chất lượng với mức giá tốt nhất, đồng thời xây dựng một cộng đồng mua sắm trực tuyến đáng tin cậy.
              </p>
            </div>
            <div className="text-center">
              <i className="fas fa-eye text-4xl text-green-600 mb-4"></i>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Tầm nhìn
              </h3>
              <p className="text-gray-600">
                Trở thành nền tảng thương mại điện tử hàng đầu, nơi mọi khách hàng đều tìm thấy sản phẩm ưa thích với trải nghiệm mua sắm tuyệt vời.
              </p>
            </div>
          </div>
        </div>

        {/* Phần Tính năng nổi bật */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-wide text-center mb-8">
            Tại sao chọn ShopTrend?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6 text-center group hover:shadow-lg transition-shadow duration-300">
              <i className="fas fa-tags text-3xl text-green-600 mb-4 group-hover:text-green-700"></i>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Khuyến mãi hấp dẫn
              </h3>
              <p className="text-gray-600">
                Nhiều chương trình giảm giá với các sản phẩm có giá ưu đãi đặc biệt, giúp bạn tiết kiệm tối đa.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center group hover:shadow-lg transition-shadow duration-300">
              <i className="fas fa-shipping-fast text-3xl text-green-600 mb-4 group-hover:text-green-700"></i>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Giao hàng nhanh chóng
              </h3>
              <p className="text-gray-600">
                Hệ thống giao hàng toàn quốc, đảm bảo sản phẩm đến tay bạn trong thời gian ngắn nhất.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center group hover:shadow-lg transition-shadow duration-300">
              <i className="fas fa-headset text-3xl text-green-600 mb-4 group-hover:text-green-700"></i>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Hỗ trợ 24/7
              </h3>
              <p className="text-gray-600">
                Đội ngũ hỗ trợ khách hàng luôn sẵn sàng giải đáp mọi thắc mắc của bạn bất cứ lúc nào.
              </p>
            </div>
          </div>
        </div>

        {/* Lời kêu gọi hành động */}
        <div className="text-center bg-green-600 text-white py-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">
            Sẵn sàng khám phá ShopTrend?
          </h2>
          <p className="text-lg mb-6">
            Tham gia ngay để trải nghiệm mua sắm trực tuyến với hàng ngàn sản phẩm chất lượng và ưu đãi hấp dẫn!
          </p>
          <Link
            to="/ListingGrid"
            className="inline-block bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
          >
            Mua sắm ngay
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AboutPage;