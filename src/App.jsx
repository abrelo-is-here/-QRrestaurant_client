import { BrowserRouter, Routes, Route } from "react-router-dom";
import MenuPage from "../pages/MenuPage";
import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import OrderTracking from "../pages/OrderTracking";

import ProtectedRoute from "../components/ProtectedRoute";

import CreateRestaurant from '../pages/Admin/CreateRestaurant';
import AdminDashBoard from '../pages/Admin/AdminDashBoard';
import Owners from '../pages/Admin/Owners';
import Staff from '../pages/Staff';
import Restaurants from "../pages/Admin/Restaurants";
import EditRestaurant from "../pages/Admin/EditRestaurant";
import CreateOwners from "../pages/Admin/CreateOwners";
import MyStaffs from "../pages/MyStaffs";

import Menu from '../pages/Menu';
import CreateMenu from "../pages/CreateMenu";
import TableCreate from '../pages/TableCreate';

import UpdateCata from '../pages/UpdateCata';
import UpdateMenu from '../pages/UpdateMenu';

import { InvalidAccess } from "../components/InvalidAccess";
import UpdateCurrency from "../components/UpdateCurrency"
import CreateCurrency from "../components/CreateCurrency";

import PageNotFound from '../components/PageNotFound'
const token = localStorage.getItem("token");
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/menu/:restaurantId" element={<MenuPage />} />
        <Route path="/" element={token ? <Dashboard /> : <Login />} />

        <Route path="/order/:id" element={<OrderTracking />} />
        <Route path="/mystaffs/:restaurantId" element={<MyStaffs />} />

        <Route path="/my-menu" element={<Menu />} />
        <Route path="/create-menu" element={<CreateMenu />} />

        <Route path="/tables" element={<TableCreate />} />
        <Route path="/edit-cat/:id" element={<UpdateCata />} />
        <Route path="/edit-menu/:id" element={<UpdateMenu />} />

        <Route path="/invalid-access" element={<InvalidAccess />} />
        <Route path="/update-currency" element={<UpdateCurrency/>} />
        <Route path="/create-currency" element={<CreateCurrency/>} />
        <Route path="/owner/create-staff" element={<Staff />} />

        {/* admin */}
        <Route path="/admin/create-restaurant" element={
          <ProtectedRoute role={'admin'}>
            <CreateRestaurant />
          </ProtectedRoute>
        } />
        <Route path="/admin/edit-restaurant/:id" element={
          <ProtectedRoute role={'admin'}>
            <EditRestaurant />
          </ProtectedRoute>
        } />
        
        <Route path="/admin" element={
          <ProtectedRoute role={'admin'}>
            <AdminDashBoard />
          </ProtectedRoute>
        } />
        <Route path="/admin/restaurant-owners" element={
          <ProtectedRoute role={'admin'}>
            <Owners />
          </ProtectedRoute>
        } />
        <Route path="/admin/all-restaurants" element={
          <ProtectedRoute role={'admin'}>
            <Restaurants />
          </ProtectedRoute>
        } />
        <Route path="/admin/create-owners" element={
          <ProtectedRoute role={['admin', 'owner']}>
            <CreateOwners />
          </ProtectedRoute>
        } />

        <Route path="*" element={<PageNotFound/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;