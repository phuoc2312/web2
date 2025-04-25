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
import ProductList from '../component/ProductList';
import ProductCategory from '../component/ProductCategory';
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

    </Routes>
  </main>
)

export default Main;