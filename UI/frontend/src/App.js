import Header from './layouts/Header';
import React, { useState } from 'react';
import "./assets/sass/app.scss";
import Footer from './layouts/Footer';
import Main from './layouts/Main';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import ChatBotGemini from './layouts/ChatBotGemini';
import { ToastContainer } from 'react-toastify';

function App() {
  const [showChatBot, setShowChatBot] = useState(true);

  return (
    <div>
      <Header />
      <Main />
      <Footer />

      {/* Nút tắt/mở */}
      <button
        style={{
          position: 'fixed',
          bottom: 60, // nhích lên trên
          right: 20,
          zIndex: 10000,
          width: 40, // thu nhỏ nút
          height: 40,
          borderRadius: '50%',
          backgroundColor: '#007bff',
          color: 'white',
          fontSize: 18, // nhỏ chữ
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
          bottom: 110, // để chatbot nằm trên nút một chút
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
