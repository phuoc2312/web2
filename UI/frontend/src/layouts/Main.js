import React from 'react'
import { Routes, Route } from 'react-router-dom';
import Home from './Home'
import UserLogin from './UserLogin';
import SectionContent from './../pages/listinggrid/SectionContent';
import SearchResults from './../pages/home/SearchResults';
import Register from './../pages/register/Register';
import ProductDetail from '../component/productdetail';
import Cart from '../component/Cart';
import PromotionPage from '../component/PromotionPage';
import AboutPage from '../pages/About/AboutPage';
import ProductCategory from '../component/ProductCategory';
import NewsPage from '../pages/News/NewsPage';
import ContactPage from '../pages/Contacts/ContactPage';
import Checkout from '../pages/Checkout/Checkout';import OrderSuccess from '../pages/Order/OrderSuccess';
import Profile from './Profile';
import OrderDetail from '../pages/Order/OrderDetail';
;
const Main = () => (
  <main>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/Home" element={<Home />} />
      <Route path="/Login" element={<UserLogin />} />
      <Route path="/ListingGrid" element={<SectionContent />} />
      <Route path="/search" element={<SearchResults />} />
      <Route path="/products/:priceRange" element={<ProductCategory />} />
      <Route path="/Register" element={<Register />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/promotions" element={<PromotionPage />} />
      <Route path="/AboutPage" element={<AboutPage />} />
      <Route path="/blog" element={<NewsPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/order-success" element={<OrderSuccess />} />
      <Route path="/orders/:orderId" element={<OrderDetail />} />

      <Route path="/profile" element={<Profile />} />

    </Routes>
  </main>
)

export default Main;