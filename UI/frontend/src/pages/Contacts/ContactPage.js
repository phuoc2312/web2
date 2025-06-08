import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Tùy chỉnh icon cho Marker
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState(null);
  const [mapCoordinates, setMapCoordinates] = useState({
    lat: 10.7764,
    lng: 106.7059
  }); // Tọa độ mặc định (TP.HCM)

  // Gọi API để lấy dữ liệu cấu hình
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/public/configs", {
          params: {
            pageNumber: 0,
            pageSize: 10,
            sortBy: "id",
            sortOrder: "ASC",
          },
          headers: {
            "Content-Type": "application/json",
          },
        });
        // Lấy cấu hình đầu tiên có status: "ACTIVE"
        const activeConfig = response.data.content.find(config => config.status === "ACTIVE");
        if (activeConfig) {
          setConfig(activeConfig);
          // Nếu có địa chỉ trong config, thực hiện chuyển đổi sang tọa độ
          if (activeConfig.address) {
            geocodeAddress(activeConfig.address);
          }
        } else {
          toast.error("Không tìm thấy thông tin liên hệ hợp lệ!");
        }
      } catch (error) {
        console.error("Failed to fetch configs:", error);
        toast.error("Không thể tải thông tin liên hệ!");
      }
    };
    fetchConfig();
  }, []);

  // Hàm chuyển đổi địa chỉ thành tọa độ
  const geocodeAddress = async (address) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const location = data[0];
        setMapCoordinates({
          lat: parseFloat(location.lat),
          lng: parseFloat(location.lon)
        });
      } else {
        console.warn("Không tìm thấy tọa độ cho địa chỉ:", address);
      }
    } catch (error) {
      console.error("Lỗi khi lấy tọa độ:", error);
      toast.error("Không thể tải bản đồ. Vui lòng thử lại sau!");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Email không hợp lệ!");
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        "http://localhost:8080/api/public/contacts",
        {
          name: formData.name,
          email: formData.email,
          message: formData.message,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Tin nhắn của bạn đã được gửi! Chúng tôi sẽ liên hệ sớm.");
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        if (status === 400) {
          toast.error(data.message || "Dữ liệu không hợp lệ!");
        } else {
          toast.error("Có lỗi xảy ra, vui lòng thử lại!");
        }
      } else {
        toast.error("Không thể kết nối đến server!");
      }
    } finally {
      setLoading(false);
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
            Liên hệ với {config?.siteName || "MHP Store"}
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
              {/* Địa chỉ */}
              <div className="flex items-start">
                <i className="fas fa-map-marker-alt text-2xl text-green-600 mr-4 mt-1"></i>
                <div>
                  <h3 className="text-lg font-medium text-gray-800">Địa chỉ</h3>
                  <p className="text-gray-600">
                    {config?.address || "Đang tải..."}
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start">
                <i className="fas fa-envelope text-2xl text-green-600 mr-4 mt-1"></i>
                <div>
                  <h3 className="text-lg font-medium text-gray-800">Email</h3>
                  <p className="text-gray-600">
                    {config?.email || "Đang tải..."}
                  </p>
                </div>
              </div>

              {/* Hotline */}
              <div className="flex items-start">
                <i className="fas fa-phone text-2xl text-green-600 mr-4 mt-1"></i>
                <div>
                  <h3 className="text-lg font-medium text-gray-800">Hotline</h3>
                  <p className="text-gray-600">
                    {config?.hotline || "Đang tải..."}
                  </p>
                </div>
              </div>
            </div>

            {/* Bản đồ */}
            <div className="mt-8 h-64 rounded-lg overflow-hidden">
              <MapContainer
                key={`${mapCoordinates.lat}-${mapCoordinates.lng}`}
                center={mapCoordinates}
                zoom={15}
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom={false}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={mapCoordinates}>
                  <Popup>
                    {config?.siteName || "MHP Store"} <br />
                    {config?.address || "Đang tải..."}
                  </Popup>
                </Marker>
              </MapContainer>
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
                  Họ và tên *
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
                  Email *
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
                  Tin nhắn *
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
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200 flex justify-center items-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang gửi...
                  </>
                ) : "Gửi tin nhắn"}
              </button>
            </form>
          </div>
        </div>

        {/* Lời kêu gọi hành động */}
        <div className="text-center bg-green-600 text-white py-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">
            Khám phá các sản phẩm tại {config?.siteName || "MHP Store"}!
          </h2>
          <p className="text-lg mb-6">
            Xem ngay các ưu đãi và sản phẩm chất lượng đang chờ bạn!
          </p>
          <Link
            to="/products"
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