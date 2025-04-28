import React from 'react';
import { Carousel } from 'react-bootstrap';
import slide1 from '../../assets/images/banners/slide1.jpg';
import slide2 from '../../assets/images/banners/slide2.jpg';
import slide3 from '../../assets/images/banners/slide3.jpg';
import { Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './Slide.css';

const Slider = () => {
    return (
        <section className="relative h-[500px] bg-green-50">
            <Carousel fade interval={3000} controls={false} indicators={false}>
                {/* Slide 1 */}
                <Carousel.Item>
                    <div className="container mx-auto px-4 h-full flex items-center">
                        <div className="w-full md:w-1/2 space-y-6 z-10">
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-200 px-3 py-1 text-sm">
                                Công nghệ mới
                            </Badge>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                                Điện thoại <span className="text-green-600">thế hệ mới</span> với tính năng vượt trội
                            </h1>
                            <p className="text-lg text-gray-600 max-w-md">
                                Cung cấp các dòng điện thoại thông minh với hiệu năng vượt trội và camera chất lượng cao.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full" as={Link} to="/ListingGrid">
                                    Mua ngay
                                </Button>
                                <Button
                                    variant="outline"
                                    className="border-green-600 text-green-600 hover:bg-green-50 px-6 py-2 rounded-full"
                                    as={Link}
                                    to="/about"
                                >
                                    Tìm hiểu thêm
                                </Button>
                            </div>
                        </div>
                        <div className="hidden md:block absolute right-0 top-0 h-full w-1/2">
                            <img 
                                src={slide1} 
                                alt="New Smartphones" 
                                className="h-full w-full object-cover"
                            />
                            <div className="absolute left-0 top-0 h-full w-20 bg-gradient-to-r from-green-50 to-transparent pointer-events-none"></div>
                        </div>
                    </div>
                </Carousel.Item>

                {/* Slide 2 */}
                <Carousel.Item>
                    <div className="container mx-auto px-4 h-full flex items-center">
                        <div className="w-full md:w-1/2 space-y-6 z-10">
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-200 px-3 py-1 text-sm">
                                Sản phẩm mới
                            </Badge>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                                Laptop <span className="text-green-600">hiệu suất cao</span> cho công việc
                            </h1>
                            <p className="text-lg text-gray-600 max-w-md">
                                Laptop mạnh mẽ với chip mới nhất và thời gian pin lâu dài, phù hợp với công việc và giải trí.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full" as={Link} to="/ListingGrid">
                                    Khám phá ngay
                                </Button>
                                <Button
                                    variant="outline"
                                    className="border-green-600 text-green-600 hover:bg-green-50 px-6 py-2 rounded-full"
                                    as={Link}
                                    to="/laptops"
                                >
                                    Xem laptop
                                </Button>
                            </div>
                        </div>
                        <div className="hidden md:block absolute right-0 top-0 h-full w-1/2">
                            <img 
                                src={slide2} 
                                alt="High Performance Laptops" 
                                className="h-full w-full object-cover"
                            />
                            <div className="absolute left-0 top-0 h-full w-20 bg-gradient-to-r from-green-50 to-transparent pointer-events-none"></div>
                        </div>
                    </div>
                </Carousel.Item>

                {/* Slide 3 */}
                <Carousel.Item>
                    <div className="container mx-auto px-4 h-full flex items-center">
                        <div className="w-full md:w-1/2 space-y-6 z-10">
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-200 px-3 py-1 text-sm">
                                Khuyến mãi đặc biệt
                            </Badge>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                                Giảm giá <span className="text-green-600">lên đến 50%</span> cho sản phẩm công nghệ
                            </h1>
                            <p className="text-lg text-gray-600 max-w-md">
                                Chương trình khuyến mãi hấp dẫn với nhiều ưu đãi cho các sản phẩm công nghệ cao cấp.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full" as={Link} to="/promotions">
                                    Xem khuyến mãi
                                </Button>
                                <Button
                                    variant="outline"
                                    className="border-green-600 text-green-600 hover:bg-green-50 px-6 py-2 rounded-full"
                                    as={Link}
                                    to="/membership"
                                >
                                    Thành viên VIP
                                </Button>
                            </div>
                        </div>
                        <div className="hidden md:block absolute right-0 top-0 h-full w-1/2">
                            <img 
                                src={slide3} 
                                alt="Special Tech Offers" 
                                className="h-full w-full object-cover"
                            />
                            <div className="absolute left-0 top-0 h-full w-20 bg-gradient-to-r from-green-50 to-transparent pointer-events-none"></div>
                        </div>
                    </div>
                </Carousel.Item>
            </Carousel>
        </section>
    );
};

export default Slider;