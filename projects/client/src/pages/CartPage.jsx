import React, { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import CartSection from "../components/CartSection";
import CartBreadcrumbs from "../components/CartBreadcrumbs";
import Footer from "../components/Footer";

function CartPage() {
  const { gender, mainCategory, subCategory, productName } = useParams();


  useEffect(() => {
    // Scroll to the top when the component is first rendered
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="w-full">
      <div className="px-6 lg:px-32 pt-4">
        <CartBreadcrumbs />
      </div>
      <div className="px-6 lg:px-32 mt-4">
        <CartSection />
      </div>
      <div className="mt-32">
        <Footer />
      </div>
    </div>
  );
}

export default CartPage;
