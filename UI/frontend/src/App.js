import Header from './layouts/Header'
import "./assets/sass/app.scss";
import Footer from './layouts/Footer';
import Main from './layouts/Main';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import ChatBotGemini from './layouts/ChatBotGemini';
import { ToastContainer } from 'react-toastify';

function App() {

  return (
    <div>
      <Header />
      <Main />
      <Footer />
      <div style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 9999,
      }}>
        <ChatBotGemini />
      </div>
      <ToastContainer />
    </div>
  );
}

export default App;