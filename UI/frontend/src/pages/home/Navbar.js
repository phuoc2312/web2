import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GET_CART } from '../../api/apiService';

function Navbar() {
  const [totalQuantity, setTotalQuantity] = useState(0);

  const fetchCart = async () => {
    try {
      const response = await GET_CART();
      const cartItems = response.products || [];
      const quantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
      setTotalQuantity(quantity);
    } catch (error) {
      console.error('Lỗi khi lấy giỏ hàng:', error);
      setTotalQuantity(0); // Nếu lỗi (chưa đăng nhập, token hết hạn), hiển thị 0
    }
  };

  useEffect(() => {
    fetchCart();
  }, []); // Gọi API khi component mount

  return (
    <div className="md:hidden flex space-x-2">
      <Link to="#" className="p-2 text-gray-600 hover:text-blue-600">
        <i className="fa fa-bell"></i>
      </Link>
      <Link to="#" className="p-2 text-gray-600 hover:text-blue-600">
        <i className="fa fa-user"></i>
      </Link>
      <Link to="/cart" className="p-2 text-gray-600 hover:text-blue-600 relative">
        <i className="fa fa-shopping-cart"></i>
        {totalQuantity > 0 && (
          <span className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {totalQuantity}
          </span>
        )}
      </Link>
    </div>
  );
}

export default Navbar;