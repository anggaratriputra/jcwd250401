import React, { useEffect } from "react";
import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";

import CartSection from "../components/CartSection";
import OrderSummary from "../components/OrderSummary";
import CartBreadcrumbs from "../components/CartBreadcrumbs";
import DeliveryOptions from "../components/DeliveryOptions"; // Import the DeliveryOptions component
import Footer from "../components/Footer";
import PaymentOptions from "../components/PaymentOptions";

function CheckoutPage() {
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [shippingCost, setShippingCost] = useState([]);
  const [productOnCart, setProductOnCart] = useState([]);
  const [warehouseId, setWarehouseId] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);

  useEffect(() => {
    // Scroll to the top when the component is first rendered
    window.scrollTo(0, 0);
  }, []);


  const handlePaymentOpen = () => {
    setIsPaymentOpen(!isPaymentOpen);
  };

  const handleShippingCost = (cost) => {
    setShippingCost(cost);
  };

  const handleProductOnCart = (product) => {
    setProductOnCart(product);
  };

  const handleWarehouseId = (id) => {
    setWarehouseId(id);
  }

  const handleTotalPrice = (price) => {
    setTotalPrice(price);
  }

  const handleTotalQuantity = (quantity) => {
    setTotalQuantity(quantity);
  }


  return (
    <div className="w-full min-h-screen bg-gray-100">
      <div className="px-6 lg:px-32 pt-4">
        <CartBreadcrumbs />
      </div>
      <div className="px-6 w-full lg:pl-32 mt-4 flex lg:flex-row flex-col justify-between">
        {/* Main content area with DeliveryOptions, adjusted for responsive width */}
        <div className="w-full lg:flex-col">
          <DeliveryOptions handlePaymentOpen={handlePaymentOpen} onShippingCost={handleShippingCost} nearestWarehouseId={handleWarehouseId} totalQuantity={totalQuantity} />
          {!isPaymentOpen && (
            <div className="mt-2 lg:mt-4 p-6 flex flex-col h-62 border rounded-md lg:w-[48vw]  bg-gray-200">
              <h2 className="font-bold text-xl mb-2">2. Payment Method</h2>
            </div>
          )}
          {isPaymentOpen && <PaymentOptions shippingCost={shippingCost} productOnCart={productOnCart} warehouseId={warehouseId} totalPrice={totalPrice} />}
        </div>
        {/* Sidebar area with OrderSummary */}
        <div className="w-full lg:px-6 flex justify-start lg:justify-center lg:h-64">
          <OrderSummary shippingCost={shippingCost} onCartItem={handleProductOnCart} onTotalPrice= {handleTotalPrice} onQuantityProduct={handleTotalQuantity} />
        </div>
      </div>
      <div className="mt-32">
        <Footer />
      </div>
    </div>
  );
}

export default CheckoutPage;
