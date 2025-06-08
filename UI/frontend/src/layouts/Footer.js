import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, MapPin, Phone, Mail } from 'lucide-react';
import { GET_ALL } from "./../api/apiService";
import logo from "../assets/images/banners/logo.png";

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const [categories, setCategories] = useState([]);
    const [activeConfigs, setActiveConfigs] = useState([]);

    useEffect(() => {
        // Fetch categories
        const categoryParams = {
            pageNumber: 0,
            pageSize: 5,
            sortBy: "categoryId",
            sortOrder: "asc",
        };

        GET_ALL("http://localhost:8080/api/public/categories", categoryParams)
            .then((response) => {
                setCategories(response.content || []);
            })
            .catch((error) => {
                console.error("Failed to fetch categories:", error);
            });

        // Fetch active configurations
        const configParams = {
            pageNumber: 0,
            pageSize: 10,
            sortBy: "id",
            sortOrder: "ASC",
        };

        GET_ALL("http://localhost:8080/api/public/configs", configParams)
            .then((response) => {
                // Filter for configurations with status: "ACTIVE"
                const active = (response.content || []).filter(config => config.status === "ACTIVE");
                setActiveConfigs(active);
            })
            .catch((error) => {
                console.error("Failed to fetch configs:", error);
            });
    }, []);

    return (
        <footer className="bg-gray-50 pt-12 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Company Info */}
                    <div>
                        <div className="flex items-center mb-4">
                            <div className="relative h-10 w-10 mr-2">
                                <Link to="/Home" className="flex items-center flex-shrink-0">
                                    <img className="h-12" src={logo} alt="MHP Store Logo" />
                                </Link>
                            </div>
                            <span className="text-xl font-bold text-green-600">MHP Store</span>
                        </div>
                        <p className="text-gray-600 mb-4">
                            Tinh hoa kỹ thuật số, hòa quyện cùng cuộc sống để tạo nên trải nghiệm hoàn mỹ!
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-green-600">
                                <Facebook className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-green-600">
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-green-600">
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-green-600">
                                <Youtube className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Liên kết nhanh</h3>
                        <ul className="space-y-2">
                            <li><Link to="/about" className="text-gray-600 hover:text-green-600">Giới thiệu</Link></li>
                            <li><Link to="/ListingGrid" className="text-gray-600 hover:text-green-600">Sản phẩm</Link></li>
                            <li><Link to="/blog" className="text-gray-600 hover:text-green-600">Tin tức</Link></li>
                            <li><Link to="/contact" className="text-gray-600 hover:text-green-600">Liên hệ</Link></li>
                            <li><Link to="/faq" className="text-gray-600 hover:text-green-600">Câu hỏi thường gặp</Link></li>
                        </ul>
                    </div>

                    {/* Categories (from API) */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Danh mục sản phẩm</h3>
                        <ul className="space-y-2">
                            {categories.length > 0 ? (
                                categories.map((category) => (
                                    <li key={category.categoryId}>
                                        <Link
                                            to={`/ListingGrid?categoryId=${category.categoryId}`}
                                            className="text-gray-600 hover:text-green-600"
                                        >
                                            {category.categoryName}
                                        </Link>
                                    </li>
                                ))
                            ) : (
                                <li className="text-gray-400 italic">Đang tải danh mục...</li>
                            )}
                        </ul>
                    </div>

                    {/* Contact Info (from API) */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Thông tin liên hệ</h3>
                        {activeConfigs.length > 0 ? (
                            activeConfigs.map((config) => (
                                <ul key={config.id} className="space-y-3">
                                    <li className="flex items-start">
                                        <MapPin className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                                        <span className="text-gray-600">{config.address}</span>
                                    </li>
                                    <li className="flex items-center">
                                        <Phone className="h-5 w-5 text-green-600 mr-2" />
                                        <span className="text-gray-600">{config.hotline}</span>
                                    </li>
                                    <li className="flex items-center">
                                        <Mail className="h-5 w-5 text-green-600 mr-2" />
                                        <span className="text-gray-600">{config.email}</span>
                                    </li>
                                </ul>
                            ))
                        ) : (
                            <p className="text-gray-400 italic">Đang tải thông tin liên hệ...</p>
                        )}
                    </div>
                </div>

                <div className="border-t border-gray-200 mt-8 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-600 text-sm mb-4 md:mb-0">© {currentYear} Organic Store. Tất cả quyền được bảo lưu.</p>
                        <div className="flex space-x-4">
                            <Link to="/terms" className="text-gray-600 hover:text-green-600 text-sm">Điều khoản dịch vụ</Link>
                            <Link to="/privacy" className="text-gray-600 hover:text-green-600 text-sm">Chính sách bảo mật</Link>
                            <Link to="/shipping" className="text-gray-600 hover:text-green-600 text-sm">Chính sách vận chuyển</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;