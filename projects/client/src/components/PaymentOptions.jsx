import React, { useState, useCallback, useEffect } from "react";
import { Link, useLocation, useParams, useNavigate } from "react-router-dom";
import { AddAddressModal } from "./AddAddressModal";
import { showLoginModal } from "../slices/authModalSlices";
import getProfile from "../api/profile/getProfile";
import getUserAddress from "../api/Address/getUserAddress";
import { toast } from "sonner";
import { PiClipboard } from "react-icons/pi";
import { useDispatch, useSelector } from "react-redux";
import AddressListModal from "./UserAddressModal";
import createOrder from "../api/order/createOrder";
import OrderCreatedModal from "./OrderCreatedModal";
import { setCartItems } from "../slices/cartSlices";

const PaymentOptions = ({ shippingCost, productOnCart, warehouseId, totalPrice }) => {
  const username = useSelector((state) => state?.account?.profile?.data?.profile?.username);
  const [selectedOption, setSelectedOption] = useState("MANDIRI");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalEditOpen, setIsModalEditOpen] = useState(false);
  const [userData, setUserData] = useState({});
  const [address, setAddress] = useState(null);
  const dispatch = useDispatch();
  const [isOrderCreatedOpen, setIsOrderCreatedOpen] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const fetchAddress = useCallback(async () => {
    try {
      const response = await getProfile({ username });
      setUserData(response.detail);
      const responseLists = await getUserAddress({ userId: response.detail.id });
      // Filter addresses where setAsDefault is true
      const defaultAddresses = responseLists.detail.filter((address) => address.setAsDefault);

      setAddress(defaultAddresses[0].id);
    } catch (error) {
      toast.error(error.message);
    }
  }, [username]);

  const handleEditModalOpen = () => {
    setIsModalEditOpen(true);
  };

  const handleEditModalClose = () => {
    setIsModalEditOpen(false);
  };

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleOrderModalOpen = () => {
    setIsOrderCreatedOpen(true);
  };

  const handleOrderModalClose = () => {
    setIsOrderCreatedOpen(false);
  };

  useEffect(() => {
    fetchAddress();
  }, [fetchAddress]);

  const handleScrollToTop = () => {
    window.scrollTo(0, 0);
  };

  const handleConfirm = async () => {
    try {
      const result = await createOrder({
        shippingCost: shippingCost,
        productOnCart: productOnCart,
        warehouseId: warehouseId,
        addressId: address,
        paymentBy: selectedOption,
      });

      handleOrderModalOpen();
      setOrderId(result.order.id);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="mt-2 lg:mt-4 p-6 flex flex-col h-62 border rounded-md lg:w-[48vw] bg-white">
      <div className="mb-4">
        <h2 className="font-bold text-xl mb-2">2. Payment Method</h2>
        <hr className="border-gray-300 my-4 mx-[-1.5rem]" />
        <div className="flex items-center mb-4 flex-col">
          A bank account number will be showed after you choose the bank destination. Please use the account number to complete the payment using your internet or via an ATM. Your order will be cancelled if you do not complete the payment
          within the expiry period.
          <br />
          <div className="text-gray-600 text-[12px] mt-2">*After your bank transfer payment has been successfully completed, our system will take approximately 2 working day for verification and confirmation status of your payment.</div>
        </div>
        <div className="flex items-center">
          <input id="mandiriPayment" type="radio" name="payment" value="mandiri" checked={selectedOption === "MANDIRI"} onChange={() => setSelectedOption("MANDIRI")} className="h-4 w-4 border-gray-300 focus:ring-2 focus:ring-blue-300" />
          <label htmlFor="standardShipping" className="ml-2 block text-sm font-medium text-gray-700">
            Mandiri
          </label>
        </div>
        <div className="flex items-center mt-4">
          <input id="BCAPayment" type="radio" name="payment" value="BCA" checked={selectedOption === "BCA"} onChange={() => setSelectedOption("BCA")} className="h-4 w-4 border-gray-300 focus:ring-2 focus:ring-blue-300" />
          <label htmlFor="expressShipping" className="ml-2 block text-sm font-medium text-gray-700">
            BCA
          </label>
        </div>
        <div className="flex items-center mt-4">
          <input id="BCAPayment" type="radio" name="payment" value="BCA" checked={selectedOption === "BNI"} onChange={() => setSelectedOption("BNI")} className="h-4 w-4 border-gray-300 focus:ring-2 focus:ring-blue-300" />
          <label htmlFor="expressShipping" className="ml-2 block text-sm font-medium text-gray-700">
            BNI
          </label>
        </div>
      </div>
      {/* Buttons */}
      <div className="flex justify-between items-center pt-4">
        <button
          className="bg-gray-900 enabled:hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => {
            handleConfirm();
            handleScrollToTop();
          }}
        >
          Confirm
        </button>
      </div>
      <OrderCreatedModal isOpen={isOrderCreatedOpen} onClose={handleOrderModalClose} paymentMethod={selectedOption} totalPrice={totalPrice} orderId={orderId} />
    </div>
  );
};

export default PaymentOptions;
