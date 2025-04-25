import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import us from "../assets/images/icons/flags/US.png";
import logo from "../assets/images/logo.svg";
import { GET_ALL } from './../api/apiService';

function Header() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isPriceDropdownOpen, setIsPriceDropdownOpen] = useState(false);

    useEffect(() => {
        const loggedInStatus = localStorage.getItem('authToken');
        if (loggedInStatus) {
            setIsLoggedIn(true);
        }
    }, []);

    const handleNangcao = () => {
        navigate('/Nangcao');
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?query=${encodeURIComponent(searchQuery)}&pageNumber=1&pageSize=10&sortBy=id&sortOrder=ASC`);
        }
    };

    const handleCategorySelect = (categoryId) => {
        navigate(`/ListingGrid?categoryId=${categoryId}`);
    };

    const handleAllProducts = () => {
        navigate('/ListingGrid');
    };

    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('authToken');
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        navigate('/Home');
    };

    useEffect(() => {
        const params = {
            pageNumber: 0,
            pageSize: 5,
            sortBy: 'categoryId',
            sortOrder: 'asc',
        };

        GET_ALL('http://localhost:8080/api/public/categories', params)
            .then((response) => {
                setCategories(response.content);
            })
            .catch(error => {
                console.error('Failed to fetch categories:', error);
            });
    }, []);

    return (
        <header className="bg-white shadow-sm">
            {/* Top navigation */}
            <nav className="hidden md:flex border-b border-gray-200">
                <div className="container mx-auto px-4 py-2 flex justify-between items-center">
                    <ul className="flex space-x-4">
                        <li>
                            {isLoggedIn ? (
                                <span
                                    className="text-gray-600 hover:text-blue-600 cursor-pointer transition-colors duration-200"
                                    onClick={handleLogout}
                                >
                                    Đăng xuất
                                </span>
                            ) : (
                                <span className="text-gray-600">
                                    Xin chào, <Link to="/Login" className="text-blue-600 hover:underline">Đăng nhập</Link> hoặc <Link to="/Register" className="text-blue-600 hover:underline">đăng ký</Link>
                                </span>
                            )}
                        </li>
                        <li><Link to="/promotions" className="text-gray-600 hover:text-blue-600 transition-colors duration-200">Khuyến mãi</Link></li>
                        <li><Link to="#" className="text-gray-600 hover:text-blue-600 transition-colors duration-200">Bán hàng</Link></li>
                        <li><Link to="#" className="text-gray-600 hover:text-blue-600 transition-colors duration-200">Trợ giúp</Link></li>
                    </ul>
                    <ul className="flex space-x-4">
                        <li><Link to="#" className="flex items-center text-gray-600 hover:text-blue-600 transition-colors duration-200"><img src={us} alt="us" className="h-4 mr-1" /> Giao hàng tới</Link></li>
                        <li><Link to="#" className="text-gray-600 hover:text-blue-600 transition-colors duration-200">Cửa hàng của tôi</Link></li>
                        <li><Link to="#" className="text-gray-600 hover:text-blue-600 transition-colors duration-200"><i className="fa fa-bell"></i></Link></li>
                        <li><Link to="/cart" className="text-gray-600 hover:text-blue-600 transition-colors duration-200"><i className="fa fa-shopping-cart"></i></Link></li>
                    </ul>
                </div>
            </nav>

            {/* Main navigation and search */}
            <div className="container mx-auto px-4 py-4">
                <div className="flex flex-wrap items-center gap-4">
                    <Link to="/Home" className="flex-shrink-0">
                        <img className="h-12" src={logo} alt="Logo" />
                    </Link>

                    <div className="flex-grow max-w-2xl">
                        <form className="flex" onSubmit={handleSubmit}>
                            <input
                                type="text"
                                className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Tìm kiếm sản phẩm..."
                            />
                            <select className="border border-gray-300 px-2 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">Tất cả loại</option>
                                {categories.map((category) => (
                                    <option value={category.categoryId} key={category.categoryId}>
                                        {category.categoryName}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-6 py-2 rounded-r-md hover:bg-blue-700 transition-colors duration-200"
                            >
                                Tìm
                            </button>
                        </form>
                    </div>



                    {/* Mobile icons */}
                    <div className="md:hidden flex space-x-2">
                        <Link to="#" className="p-2 text-gray-600 hover:text-blue-600"><i className="fa fa-bell"></i></Link>
                        <Link to="#" className="p-2 text-gray-600 hover:text-blue-600"><i className="fa fa-user"></i></Link>
                        <Link to="/cart" className="p-2 text-gray-600 hover:text-blue-600"><i className="fa fa-shopping-cart"></i></Link>
                    </div>
                </div>
            </div>

            {/* Bottom navigation */}
            <nav className="container mx-auto px-4 py-2">
                <ul className="flex flex-wrap gap-6">
                    <li><Link to="/Home" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">Trang chủ</Link></li>

                    <li
                        className="relative"
                        onMouseEnter={() => setIsDropdownOpen(true)}
                        onMouseLeave={() => setIsDropdownOpen(false)}
                    >
                        <Link
                            to="/ListingGrid"
                            className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 flex items-center"
                        >
                            Danh sách sản phẩm
                            <i className="fa fa-chevron-down ml-1"></i>
                        </Link>
                        {isDropdownOpen && (
                            <div className="absolute z-10 mt-2 w-48 bg-white shadow-lg rounded-md py-2">
                                {categories.map((category) => (
                                    <button
                                        key={category.categoryId}
                                        onClick={() => handleCategorySelect(category.categoryId)}
                                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                                    >
                                        {category.categoryName}
                                    </button>
                                ))}
                                <hr className="my-2" />
                                <button
                                    onClick={handleAllProducts}
                                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                                >
                                    Tất cả sản phẩm
                                </button>
                            </div>
                        )}
                    </li>

                    <li
                        className="relative"
                        onMouseEnter={() => setIsPriceDropdownOpen(true)}
                        onMouseLeave={() => setIsPriceDropdownOpen(false)}
                    >
                        <Link
                            to="#"
                            className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 flex items-center"
                        >
                            Mức giá
                            <i className="fa fa-chevron-down ml-1"></i>
                        </Link>
                        {isPriceDropdownOpen && (
                            <div className="absolute z-10 mt-2 w-48 bg-white shadow-lg rounded-md py-2">
                                <Link to="/under100000" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Dưới 100.000</Link>
                                <Link to="/under200000" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Dưới 200.000</Link>
                                <Link to="/under300000" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Dưới 300.000</Link>
                            </div>
                        )}
                    </li>

                    <li><Link to="/promotions" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">Khuyến mãi</Link></li>
                </ul>
            </nav>
        </header>
    );
}

export default Header;