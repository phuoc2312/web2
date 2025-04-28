
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    // Giả lập gửi dữ liệu (có thể thay bằng API)
    console.log("Dữ liệu liên hệ:", formData);
    toast.success("Tin nhắn của bạn đã được gửi! Chúng tôi sẽ liên hệ sớm.");
    setFormData({ name: "", email: "", message: "" });
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
                className="text-gray-700 hover:text-green-600 inline-flex items-center"
                aria-label="Trang chủ"
              >
                <i className="fas fa-chevron-left mr-1"></i>
                Trang chủ
              </Link>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <i className="fas fa-chevron-right text-gray-400 mx-1"></i>
                <span className="text-gray-500">Liên hệ</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Tiêu đề */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 uppercase tracking-wide">
            Liên hệ với MHP Store
          </h1>
          <div className="w-24 h-1 bg-green-600 mt-4 mx-auto"></div>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Chúng tôi luôn sẵn sàng hỗ trợ bạn! Hãy liên hệ qua biểu mẫu hoặc thông tin bên dưới để được giải đáp nhanh chóng.
          </p>
        </div>

        {/* Thông tin liên hệ và biểu mẫu */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Thông tin liên hệ */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Thông tin liên hệ
            </h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <i className="fas fa-map-marker-alt text-2xl text-green-600 mr-4 mt-1"></i>
                <div>
                  <h3 className="text-lg font-medium text-gray-800">Địa chỉ</h3>
                  <p className="text-gray-600">
                    123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh, Việt Nam
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <i className="fas fa-envelope text-2xl text-green-600 mr-4 mt-1"></i>
                <div>
                  <h3 className="text-lg font-medium text-gray-800">Email</h3>
                  <p className="text-gray-600">support@MHP Store.com</p>
                </div>
              </div>
              <div className="flex items-start">
                <i className="fas fa-phone-alt text-2xl text-green-600 mr-4 mt-1"></i>
                <div>
                  <h3 className="text-lg font-medium text-gray-800">Hotline</h3>
                  <p className="text-gray-600">0123 456 789 (8:00 - 22:00)</p>
                </div>
              </div>
            </div>
            {/* Bản đồ nhúng */}
            <div className="mt-8">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.447373629852!2d106.698293614623!3d10.776389692316!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f38b3d450ad%3A0x2b70e41931eb4168!2sLe%20Loi%2C%20District%201%2C%20Ho%20Chi%20Minh%2C%20Vietnam!5e0!3m2!1sen!2s!4v1634567890123!5m2!1sen!2s"
                width="100%"
                height="250"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                title="MHP Store Location"
              ></iframe>
            </div>
          </div>

          {/* Biểu mẫu liên hệ */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Gửi tin nhắn cho chúng tôi
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Họ và tên
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-600 focus:border-green-600"
                  placeholder="Nhập họ và tên"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-600 focus:border-green-600"
                  placeholder="Nhập email của bạn"
                  required
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Tin nhắn
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-600 focus:border-green-600"
                  placeholder="Nhập tin nhắn của bạn"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200"
              >
                Gửi tin nhắn
              </button>
            </form>
          </div>
        </div>

        {/* Lời kêu gọi hành động */}
        <div className="text-center bg-green-600 text-white py-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">
            Khám phá các sản phẩm tại MHP Store!
          </h2>
          <p className="text-lg mb-6">
            Xem ngay các ưu đãi và sản phẩm chất lượng đang chờ bạn!
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

export default ContactPage;
