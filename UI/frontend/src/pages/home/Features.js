import { Cpu, Truck, ShieldCheck, Star } from 'lucide-react';

const Features = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Feature 1 - Chất lượng */}
          <div className="flex flex-col items-center text-center p-6 rounded-lg bg-gray-50 hover:shadow-md transition-shadow">
            <div className="bg-green-100 p-3 rounded-full mb-4">
              <Cpu className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Công nghệ tiên tiến</h3>
            <p className="text-gray-600">Sản phẩm sử dụng linh kiện cao cấp, công nghệ mới nhất từ các hãng uy tín.</p>
          </div>

          {/* Feature 2 - Giao hàng */}
          <div className="flex flex-col items-center text-center p-6 rounded-lg bg-gray-50 hover:shadow-md transition-shadow">
            <div className="bg-green-100 p-3 rounded-full mb-4">
              <Truck className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Giao hàng nhanh</h3>
            <p className="text-gray-600">Miễn phí giao hàng cho đơn từ 1.000.000đ, giao ngay trong ngày tại Hà Nội & TP.HCM.</p>
          </div>

          {/* Feature 3 - Bảo hành */}
          <div className="flex flex-col items-center text-center p-6 rounded-lg bg-gray-50 hover:shadow-md transition-shadow">
            <div className="bg-green-100 p-3 rounded-full mb-4">
              <ShieldCheck className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Bảo hành dài hạn</h3>
            <p className="text-gray-600">Bảo hành chính hãng từ 12-24 tháng, hỗ trợ 1 đổi 1 trong 30 ngày đầu.</p>
          </div>

          {/* Feature 4 - Đánh giá */}
          <div className="flex flex-col items-center text-center p-6 rounded-lg bg-gray-50 hover:shadow-md transition-shadow">
            <div className="bg-green-100 p-3 rounded-full mb-4">
              <Star className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Sản phẩm chất lượng</h3>
            <p className="text-gray-600">Hàng chính hãng, nguyên seal, đầy đủ phụ kiện đi kèm và phiếu bảo hành.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;