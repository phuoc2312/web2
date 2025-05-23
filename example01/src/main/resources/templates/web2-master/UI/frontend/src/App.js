import Header from './layouts/Header'
import "./assets/sass/app.scss";
import Footer from './layouts/Footer';
import Main from './layouts/Main';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';


function App() {

  return (
    <div>
      <Header />
      <Main />
      <Footer />
    </div>
  );
}

export default App;