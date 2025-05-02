import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GET_ALL } from "./../api/apiService";
import logo from "../assets/images/banners/logo.png";
import CartIcon from "./CartIcon";

export default function Header() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isPriceDropdownOpen, setIsPriceDropdownOpen] = useState(false);

    useEffect(() => {
        const loggedInStatus = localStorage.getItem("authToken");
        if (loggedInStatus) {
            setIsLoggedIn(true);
        }
    }, []);

    const handleSubmit = (event) => {
        event.preventDefault();
        if (searchQuery.trim()) {
            navigate(
                `/search?query=${encodeURIComponent(
                    searchQuery
                )}&pageNumber=1&pageSize=10&sortBy=id&sortOrder=ASC`
            );
        }
    };

    const handleCategorySelect = (categoryId) => {
        navigate(`/ListingGrid?categoryId=${categoryId}`);
    };

    const handleAllProducts = () => {
        navigate("/ListingGrid");
    };


    const handleLogout = () => {
        localStorage.clear(); // Xóa toàn bộ dữ liệu trong localStorage
        setIsLoggedIn(false);
        window.dispatchEvent(new Event("logout")); // Dispatch sự kiện logout
        navigate("/Home");
    };

    useEffect(() => {
        const params = {
            pageNumber: 0,
            pageSize: 5,
            sortBy: "categoryId",
            sortOrder: "asc",
        };

        GET_ALL("http://localhost:8080/api/public/categories", params)
            .then((response) => {
                setCategories(response.content);
            })
            .catch((error) => {
                console.error("Failed to fetch categories:", error);
            });
    }, []);

    return (
        <header className="bg-white shadow-sm">
            {/* Top bar */}
            <div className="bg-green-50 py-2 border-b border-gray-200">
                <div className="container mx-auto px-4 flex justify-between items-center text-sm">
                    <div className="text-gray-600">
                        <span className="mr-4">Hotline: 1900 1234</span>
                        <span>Email: info@organicstore.com</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        {isLoggedIn ? (
                            <span
                                className="text-gray-600 hover:text-green-600 cursor-pointer transition-colors duration-200"
                                onClick={handleLogout}
                            >
                                Đăng xuất
                            </span>
                        ) : (
                            <>
                                <Link
                                    to="/Login"
                                    className="text-gray-600 hover:text-green-600 transition-colors duration-200"
                                >
                                    Đăng nhập
                                </Link>
                                <span className="text-gray-400">|</span>
                                <Link
                                    to="/Register"
                                    className="text-gray-600 hover:text-green-600 transition-colors duration-200"
                                >
                                    Đăng ký
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Main header */}
            <div className="container mx-auto px-4 py-6">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/Home" className="flex items-center flex-shrink-0">
                        <img className="h-24" src={logo} alt="MHP Store Logo" />
                        <span className="ml-2 text-xl font-bold text-green-600">MHP Store</span>
                    </Link>

                    {/* Search bar - Desktop */}
                    <div className="hidden md:flex max-w-2xl mx-auto">
                        <form className="flex w-full" onSubmit={handleSubmit}>
                            <input
                                type="text"
                                className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Tìm kiếm sản phẩm..."
                            />
                            <select className="border border-gray-300 px-2 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-500">
                                <option value="">Tất cả loại</option>
                                {categories.map((category) => (
                                    <option value={category.categoryId} key={category.categoryId}>
                                        {category.categoryName}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="submit"
                                className="bg-green-600 text-white px-6 py-2 rounded-r-md hover:bg-green-700 transition-colors duration-200"
                            >
                                Tìm
                            </button>
                        </form>
                    </div>

                    {/* Navigation icons */}
                    <div className="flex items-center space-x-6">
                        <Link
                            to="#"
                            className="p-2 text-gray-600 hover:text-green-600 md:hidden"
                            aria-label="Tìm kiếm"
                        >
                            <i className="fa fa-search"></i>
                        </Link>
                        <Link
                            to="/account"
                            className="p-2 text-gray-600 hover:text-green-600 hidden sm:block"
                            aria-label="Tài khoản"
                        >
                            <i className="fa fa-user"></i>
                        </Link>
                        <CartIcon />
                        <Link
                            to="#"
                            className="p-2 text-gray-600 hover:text-green-600 hidden sm:block"
                            aria-label="Thông báo"
                        >
                            <i className="fa fa-bell"></i>
                        </Link>
                    </div>
                </div>

                {/* Mobile search bar */}
                <div className="md:hidden mt-4 px-2">
                    <form className="flex" onSubmit={handleSubmit}>
                        <input
                            type="text"
                            className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Tìm kiếm sản phẩm..."
                        />
                        <select className="border border-gray-300 px-2 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-500">
                            <option value="">Tất cả loại</option>
                            {categories.map((category) => (
                                <option value={category.categoryId} key={category.categoryId}>
                                    {category.categoryName}
                                </option>
                            ))}
                        </select>
                        <button
                            type="submit"
                            className="bg-green-600 text-white px-6 py-2 rounded-r-md hover:bg-green-700 transition-colors duration-200"
                        >
                            Tìm
                        </button>
                    </form>
                </div>
            </div>


            {/* Bottom navigation */}
            <nav className="container mx-auto px-4 py-2 hidden md:block">
                <ul className="flex flex-wrap gap-6">
                    <li>
                        <Link
                            to="/Home"
                            className="text-gray-700 hover:text-green-600 font-medium transition-colors duration-200"
                        >
                            Trang chủ
                        </Link>
                    </li>
                    <li
                        className="relative"
                        onMouseEnter={() => setIsDropdownOpen(true)}
                        onMouseLeave={() => setIsDropdownOpen(false)}
                    >
                        <Link
                            to="/ListingGrid"
                            className="text-gray-700 hover:text-green-600 font-medium transition-colors duration-200 flex items-center"
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


                    <li>
                        <Link
                            to="/promotions"
                            className="text-gray-700 hover:text-green-600 font-medium transition-colors duration-200"
                        >
                            Khuyến mãi
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/AboutPage"
                            className="text-gray-700 hover:text-green-600 font-medium transition-colors duration-200"
                        >
                            Giới thiệu
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/blog"
                            className="text-gray-700 hover:text-green-600 font-medium transition-colors duration-200"
                        >
                            Tin tức
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/contact"
                            className="text-gray-700 hover:text-green-600 font-medium transition-colors duration-200"
                        >
                            Liên hệ
                        </Link>
                    </li>
                </ul>
            </nav>
        </header>
    );
}