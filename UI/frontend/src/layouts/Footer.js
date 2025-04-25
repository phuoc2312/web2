import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-800 text-white py-12">
            <div className="container mx-auto px-4">
                {/* Footer Top */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8">
                    {/* Brands */}
                    <div>
                        <h6 className="text-lg font-semibold text-white mb-4">Thương Hiệu</h6>
                        <ul className="space-y-2">
                            <li><Link to="#" className="text-gray-300 hover:text-blue-400 transition-colors duration-200">Adidas</Link></li>
                            <li><Link to="#" className="text-gray-300 hover:text-blue-400 transition-colors duration-200">Puma</Link></li>
                            <li><Link to="#" className="text-gray-300 hover:text-blue-400 transition-colors duration-200">Reebok</Link></li>
                            <li><Link to="#" className="text-gray-300 hover:text-blue-400 transition-colors duration-200">Nike</Link></li>
                        </ul>
                    </div>
                    {/* Company */}
                    <div>
                        <h6 className="text-lg font-semibold text-white mb-4">Công Ty</h6>
                        <ul className="space-y-2">
                            <li><Link to="#" className="text-gray-300 hover:text-blue-400 transition-colors duration-200">Về chúng tôi</Link></li>
                            <li><Link to="#" className="text-gray-300 hover:text-blue-400 transition-colors duration-200">Tuyển dụng</Link></li>
                            <li><Link to="#" className="text-gray-300 hover:text-blue-400 transition-colors duration-200">Tìm cửa hàng</Link></li>
                            <li><Link to="#" className="text-gray-300 hover:text-blue-400 transition-colors duration-200">Điều khoản</Link></li>
                            <li><Link to="#" className="text-gray-300 hover:text-blue-400 transition-colors duration-200">Sitemap</Link></li>
                        </ul>
                    </div>
                    {/* Help */}
                    <div>
                        <h6 className="text-lg font-semibold text-white mb-4">Hỗ Trợ</h6>
                        <ul className="space-y-2">
                            <li><Link to="#" className="text-gray-300 hover:text-blue-400 transition-colors duration-200">Liên hệ</Link></li>
                            <li><Link to="#" className="text-gray-300 hover:text-blue-400 transition-colors duration-200">Hoàn tiền</Link></li>
                            <li><Link to="#" className="text-gray-300 hover:text-blue-400 transition-colors duration-200">Trạng thái đơn hàng</Link></li>
                            <li><Link to="#" className="text-gray-300 hover:text-blue-400 transition-colors duration-200">Thông tin vận chuyển</Link></li>
                            <li><Link to="#" className="text-gray-300 hover:text-blue-400 transition-colors duration-200">Khiếu nại</Link></li>
                        </ul>
                    </div>
                    {/* Account */}
                    <div>
                        <h6 className="text-lg font-semibold text-white mb-4">Tài Khoản</h6>
                        <ul className="space-y-2">
                            <li><Link to="/login" className="text-gray-300 hover:text-blue-400 transition-colors duration-200">Đăng nhập</Link></li>
                            <li><Link to="/register" className="text-gray-300 hover:text-blue-400 transition-colors duration-200">Đăng ký</Link></li>
                            <li><Link to="#" className="text-gray-300 hover:text-blue-400 transition-colors duration-200">Cài đặt tài khoản</Link></li>
                            <li><Link to="#" className="text-gray-300 hover:text-blue-400 transition-colors duration-200">Đơn hàng của tôi</Link></li>
                        </ul>
                    </div>
                    {/* Social */}
                    <div>
                        <h6 className="text-lg font-semibold text-white mb-4">Mạng Xã Hội</h6>
                        <ul className="space-y-2">
                            <li>
                                <a href="#" className="flex items-center space-x-2 text-gray-300 hover:text-blue-400 transition-colors duration-200">
                                    <i className="fab fa-facebook"></i>
                                    <span>Facebook</span>
                                </a>
                            </li>
                            <li>
                                <a href="#" className="flex items-center space-x-2 text-gray-300 hover:text-blue-400 transition-colors duration-200">
                                    <i className="fab fa-twitter"></i>
                                    <span>Twitter</span>
                                </a>
                            </li>
                            <li>
                                <a href="#" className="flex items-center space-x-2 text-gray-300 hover:text-blue-400 transition-colors duration-200">
                                    <i className="fab fa-instagram"></i>
                                    <span>Instagram</span>
                                </a>
                            </li>
                            <li>
                                <a href="#" className="flex items-center space-x-2 text-gray-300 hover:text-blue-400 transition-colors duration-200">
                                    <i className="fab fa-youtube"></i>
                                    <span>Youtube</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Footer Bottom */}
                <div className="border-t border-gray-700 pt-6 text-center">
                    <p className="text-gray-300 mb-2">
                        <Link to="#" className="hover:text-blue-400 transition-colors duration-200">Chính sách bảo mật</Link> -{' '}
                        <Link to="#" className="hover:text-blue-400 transition-colors duration-200">Điều khoản sử dụng</Link> -{' '}
                        <Link to="#" className="hover:text-blue-400 transition-colors duration-200">Hướng dẫn pháp lý</Link>
                    </p>
                    <p className="text-gray-400">© {currentYear} Công ty ABC. Mọi quyền được bảo lưu.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;