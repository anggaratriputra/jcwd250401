import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { Homepage } from "./pages/Homepage";
import ResetPassword from "./pages/ResetPassword";
import { Profile } from "./pages/Profile";
import { Address } from "./pages/Address";
import { ChangePassword } from "./pages/ChangePassword";
import { NotFound } from "./pages/NotFound";
import Navigationbar from "./components/Navigationbar";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import AdminLoginPage from "./pages/AdminLoginPage";
import { Order } from "./pages/Order";
import CartPage from "./pages/CartPage";
import { Customers } from "./pages/Customers";
import { Staff } from "./pages/Staff";
import Warehouse from "./pages/Warehouse";
import HomeProducts from "./pages/HomeProducts";
import { Stock } from "./pages/Stock";
import OrderCust from "./pages/OrderCust";
import CheckoutPage from "./pages/CheckoutPage";
import { WarehouseOrder } from "./pages/WarehouseOrder";
import MenCollections from "./pages/MenCollections";
import WomenCollections from "./pages/WomenCollections";
import UnisexCollections from "./pages/UnisexCollections";
import "./App.css"; // Add your CSS file for transitions
import SalesReport from "./pages/SalesReport";

const adminPaths = [
  "/adminlogin",
  "/reset-password-admin",
  "/dashboard/products",
  "/dashboard/customers",
  "/dashboard/staff",
  "/dashboard/warehouse",
  "/dashboard/report/stock",
  "/dashboard/report/sales",

  "/dashboard/order/customers",
  "/dashboard/order/warehouse",
];

export default function App() {
  const location = useLocation();
  const isAdminPath = adminPaths.some((path) => location.pathname.startsWith(path));
  const showNavigationbar = !isAdminPath;

  return (
    <div>
      {showNavigationbar && (
        <div className="shadow-md fixed top-0 left-0 right-0 z-50">
          <Navigationbar />
        </div>
      )}
      <div className={showNavigationbar ? "mt-20" : ""}>
        <TransitionGroup>
          {isAdminPath ? (
            <div>
              <Routes>
                {/* admin routes */}
                <Route path="/adminlogin" element={<AdminLoginPage />} />
                <Route path="/reset-password-admin" element={<ResetPassword userType={"admin"} />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dashboard/products" element={<Products />} />
                <Route path="/dashboard/customers" element={<Customers />} />
                <Route path="/dashboard/staff" element={<Staff />} />
                <Route path="/dashboard/warehouse" element={<Warehouse />} />
                <Route path="/dashboard/report/stock" element={<Stock />} />
                <Route path="/dashboard/report/sales" element={<SalesReport />} />
                <Route path="/dashboard/order/customers" element={<OrderCust />} />
                <Route path="/dashboard/order/warehouse" element={<WarehouseOrder />} />
                {/* Add more admin routes as needed */}
              </Routes>
            </div>
          ) : (
            <CSSTransition key={location.key} classNames="fade" timeout={700}>
              <div>
                <Routes>
                  {/* client routes */}
                  <Route path="/" element={<Homepage />} />
                  <Route path="/reset-password" element={<ResetPassword userType={"user"} />} />
                  <Route path="/account/profile" element={<Profile />} />
                  <Route path="/account/my-order" element={<Order />} />
                  <Route path="/account/address-book" element={<Address />} />
                  <Route path="/account/change-password" element={<ChangePassword />} />
                  <Route path="/account/shopping-cart" element={<CartPage />} />
                  <Route path="/account/shopping-cart/checkout" element={<CheckoutPage />} />
                  <Route path="/collections/men" element={<MenCollections />} />
                  <Route path="/collections/women" element={<WomenCollections />} />
                  <Route path="/collections/unisex" element={<UnisexCollections />} />
                  <Route path="/products/:gender/:mainCategory?/:subCategory?/:productName?" element={<HomeProducts />} />
                  {/* Add more route configurations as needed */}
                  <Route path="/*" element={<NotFound />} />
                </Routes>
              </div>
            </CSSTransition>
          )}
        </TransitionGroup>
      </div>
    </div>
  );
}
