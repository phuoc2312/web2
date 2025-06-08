import Header from './layouts/Header';
import React, { useState, useEffect } from 'react';
import "./assets/sass/app.scss";
import Footer from './layouts/Footer';
import Main from './layouts/Main';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import ChatBotGemini from './layouts/ChatBotGemini';
import { ToastContainer } from 'react-toastify';

function App() {
  // Khởi tạo state từ localStorage hoặc mặc định là true
  const [showChatBot, setShowChatBot] = useState(() => {
    const savedState = localStorage.getItem('showChatBot');
    return savedState !== null ? JSON.parse(savedState) : true;
  });

  // Lưu trạng thái showChatBot vào localStorage khi nó thay đổi
  useEffect(() => {
    localStorage.setItem('showChatBot', JSON.stringify(showChatBot));
  }, [showChatBot]);

  return (
    <div>
      <Header />
      <Main />
      <Footer />

      {/* Nút tắt/mở */}
      <button
        style={{
          position: 'fixed',
          bottom: 60,
          right: 20,
          zIndex: 10000,
          width: 40,
          height: 40,
          borderRadius: '50%',
          backgroundColor: '#007bff',
          color: 'white',
          fontSize: 18,
          border: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          cursor: 'pointer',
          transition: 'background 0.3s ease-in-out',
        }}
        onClick={() => setShowChatBot(prev => !prev)}
        title={showChatBot ? 'Ẩn Chatbot' : 'Hiện Chatbot'}
      >
        {showChatBot ? '✖' : '💬'}
      </button>

      {/* Hiển thị chatbot nếu được bật */}
      {showChatBot && (
        <div style={{
          position: 'fixed',
          bottom: 110,
          right: 20,
          zIndex: 9998,
        }}>
          <ChatBotGemini />
        </div>
      )}

      <ToastContainer />
    </div>
  );
}

export default App;