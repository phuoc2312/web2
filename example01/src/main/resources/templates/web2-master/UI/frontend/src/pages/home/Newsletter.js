import React from 'react';
import { Send } from 'lucide-react';

const Newsletter = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-white via-gray-50 to-green-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center bg-white p-10 rounded-3xl shadow-xl">
          
          {/* Tiêu đề với icon */}
          <div className="flex justify-center items-center mb-6">
            <div className="bg-green-100 p-4 rounded-full mr-3 shadow-md">
              <Send className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800">
              Đăng Ký Nhận Bản Tin Công Nghệ
            </h2>
          </div>

          {/* Mô tả */}
          <p className="text-gray-600 mb-8 text-base sm:text-lg leading-relaxed">
            Cập nhật những xu hướng công nghệ mới nhất, khuyến mãi hấp dẫn và hướng dẫn sử dụng thiết bị hiệu quả mỗi tuần.
          </p>

          {/* Form đăng ký */}
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Nhập email của bạn"
              className="flex-1 px-5 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700 shadow-sm"
              required
            />
            <button 
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-md"
            >
              Đăng Ký Ngay
            </button>
          </form>

          {/* Thông tin bảo mật */}
          <div className="mt-6 flex items-center justify-center text-sm text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Chúng tôi cam kết bảo mật thông tin của bạn</span>
          </div>

          {/* Ưu đãi đặc biệt */}
          <div className="mt-8 p-4 bg-green-50 rounded-xl inline-block">
            <p className="text-green-700 font-medium text-sm sm:text-base">
              <span className="font-bold">Ưu đãi đặc biệt:</span> Giảm ngay <span className="text-red-500 font-bold">5%</span> cho đơn hàng đầu tiên khi đăng ký
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
