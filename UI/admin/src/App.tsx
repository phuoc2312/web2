import { Admin, Resource, CustomRoutes } from "react-admin";
import { Route } from "react-router-dom";
import { Layout } from "./Layout";
import PeopleIcon from '@mui/icons-material/People';
import CategoryIcon from '@mui/icons-material/Category';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import ArticleIcon from '@mui/icons-material/Article';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import ListAltIcon from '@mui/icons-material/ListAlt';
import SettingsIcon from '@mui/icons-material/Settings';
import { dataProvider } from "./dataProvider";
import { Dashboard } from "./component/Dashboard/Dashboard";
import { authProvider } from "./authProvider";
import { CategoryList, CategoryCreate, CategoryEdit } from "./component/Category/category";
import { ProductList, ProductCreate, ProductEdit } from "./component/Product/product";
import { CartList, CartShow } from "./component/Cart/Carts";
import ProductImageUpdate from "./component/Product/ProductImageUpdate";
import OrderList from "./component/Order/OrderList";
import OrderShow from "./component/Order/OrderShow";
import { BlogPostCreate, BlogPostEdit, BlogPostList, BlogPostShow } from "./component/Blog/BlogPost";
import { ContactList, ContactShow } from "./component/Contact/Contacts";
import { ConfigList, ConfigCreate, ConfigEdit } from "./component/Config/Config";
import { UserList } from "./component/Users/UserList";
export const App = () => (
  <Admin authProvider={authProvider} layout={Layout} dataProvider={dataProvider} dashboard={Dashboard}>
    <CustomRoutes>
      <Route path="/products/:id/update-image" element={<ProductImageUpdate />} />
    </CustomRoutes>

    <Resource
      name="categories"
      list={CategoryList}
      create={CategoryCreate}
      edit={CategoryEdit}
      icon={CategoryIcon}
    />

    <Resource
      name="products"
      list={ProductList}
      create={ProductCreate}
      edit={ProductEdit}
      icon={Inventory2Icon}
    />

    <Resource
      name="carts"
      list={CartList}
      show={CartShow}
      icon={ShoppingCartIcon}
    />

    <Resource
      name="orders"
      list={OrderList}
      show={OrderShow}
      icon={ListAltIcon}
    />
    <Resource
      name="BlogPosts"
      list={BlogPostList}
      create={BlogPostCreate}
      edit={BlogPostEdit}
      show={BlogPostShow}
      icon={ArticleIcon}
    />
    <Resource
      name="contacts"
      list={ContactList}
      show={ContactShow}
      icon={ContactMailIcon}
    />
    <Resource
      name="configs"
      list={ConfigList}
      create={ConfigCreate}
      edit={ConfigEdit}
      icon={SettingsIcon}

    />
    <Resource
      name="users"
      list={UserList}
      icon={PeopleIcon}
    />


  </Admin>
);

export default App;