import React, { useState, useCallback, useEffect } from "react";
import { Link, useLocation, useParams, useNavigate } from "react-router-dom";
import { AddAddressModal } from "./AddAddressModal";
import { showLoginModal } from "../slices/authModalSlices";
import getProfile from "../api/profile/getProfile";
import getUserAddress from "../api/Address/getUserAddress";
import getWarehouses from "../api/warehouse/getWarehouses";
import getShippingCost from "../api/order/getShippingCost";
import { toast } from "sonner";
import { PiCheckBold, PiCheckFat, PiClipboard } from "react-icons/pi";
import { useDispatch, useSelector } from "react-redux";
import AddressListModal from "./UserAddressModal";
import getNearestWarehouses from "../api/warehouse/getNearestWarehouse";
import { Button } from "flowbite-react";
import getCart from "../api/cart/getCart";

const DeliveryOptions = ({ handlePaymentOpen, onShippingCost, nearestWarehouseId, totalQuantity }) => {
  const username = useSelector((state) => state?.account?.profile?.data?.profile?.username);
  const [selectedOption, setSelectedOption] = useState("standard");
  const [showButtons, setShowButtons] = useState(true);
  const [lockButton, setLockButton] = useState(false); // Lock button to prevent double click
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalEditOpen, setIsModalEditOpen] = useState(false);
  const [userData, setUserData] = useState({});
  const [address, setAddress] = useState([]);
  const [shippingCost, setShippingCost] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [editDeliveryButton, setEditDeliveryButton] = useState(false);
  const [deliveryCheckmarks, setDeliveryCheckmarks] = useState(false);

  const fetchAddressAndCost = async () => {
    try {
      const warehouseResponse = await getNearestWarehouses({});
      const addressResponse = await getProfile({ username });
      const cartResponse = await getCart({});
      const totalWeight = cartResponse.detail.CartItems.reduce((acc, item) => acc + 1000 * item.quantity, 0);
      const addressLists = await getUserAddress({ userId: addressResponse.detail.id });
      const defaultAddress = addressLists.detail.find((address) => address.setAsDefault);
      setUserData(addressResponse.detail);
      setAddress(addressLists.detail);
      const destinationCityId = String(defaultAddress.cityId);
      const cityIdAsString = String(warehouseResponse.data[0].WarehouseAddress.cityId);
      const warehouseId = warehouseResponse.data[0].id;
      const originId = cityIdAsString;
      const destinationId = destinationCityId;
      const shippingCost = await getShippingCost({ origin: originId, destination: destinationId, weight: totalWeight });
      setShippingCost(shippingCost.detail);
      nearestWarehouseId(warehouseId);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchAddressAndCost();
  }, []);

  const handleEditModalOpen = () => {
    setIsModalEditOpen(true);
  };

  const handlePaymentMethodClick = () => {
    handlePaymentOpen();
    setShowButtons(false); // Hide buttons
    setLockButton(true); // Lock button
    setEditDeliveryButton(true);
    setDeliveryCheckmarks(true);

    if (selectedOption === "standard") {
      const cost = shippingCost[0].costs[0].cost[0].value;
      onShippingCost([selectedOption, cost]);
    } else {
      const cost = shippingCost[0].costs[1].cost[0].value;
      onShippingCost([selectedOption, cost]);
    }
  };

  const handleEditDelivery = () => {
    handlePaymentOpen();
    onShippingCost(0);
    setShowButtons(true);
    setLockButton(false);
    setEditDeliveryButton(false);
    setDeliveryCheckmarks(false);
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

  const handleSuccess = () => {
    fetchAddressAndCost();
    handleModalClose();
    handleEditModalClose();
  };

  return (
    <div className="mt-2 lg:mt-4 p-6 flex flex-col h-62 border rounded-md lg:w-[48vw] bg-white">
      <div className="mb-4">
        {deliveryCheckmarks === false ? (
          <h2 className="font-bold text-xl mb-2">1. Delivery Option</h2>
        ) : (
          <div className="flex justify-between">
            <div className="flex space-x-2 items-center">
              <PiCheckFat className="text-green-500 text-xl mb-2" />
              <h2 className="font-bold text-xl mb-2">Delivery Option</h2>
            </div>
            <Button color="light" size="sm" className="px-10" onClick={handleEditDelivery}>
              Edit
            </Button>
          </div>
        )}

        <hr className="border-gray-300 my-4 mx-[-1.5rem]" />
        <div className="flex flex-row justify-between">
          <div className="flex flex-col">
            <div className="flex items-center">
              <input
                id="standardShipping"
                type="radio"
                name="delivery"
                value="standard"
                checked={selectedOption === "standard"}
                onChange={() => setSelectedOption("standard")}
                className="h-4 w-4 border-gray-300 focus:ring-2 focus:ring-blue-300"
                disabled={lockButton}
              />
              <label htmlFor="standardShipping" className="ml-2 block text-sm font-medium text-gray-700">
                Standard Shipping
              </label>
            </div>
            <div className="ml-6 pl-1 text-gray-600 text-sm">
              JABODETABEK: next day <br />
              Java: 1-5 working days <br />
              Outside Java: 1-10 working days
            </div>
          </div>
          {shippingCost?.length > 0 && shippingCost[0]?.costs.length > 0 && (
            <div className="flex flex-col justify-center items-end">
              <p className="font-semibold text-gray-600 text-sm">Rp {shippingCost[0]?.costs[0]?.cost[0]?.value}</p>
            </div>
          )}
        </div>
        {shippingCost[0]?.costs[1]?.cost && (
          <div className="flex flex-row justify-between">
            <div className="flex flex-col">
              <div className="flex items-center mt-4">
                <input
                  id="expressShipping"
                  type="radio"
                  name="delivery"
                  value="express"
                  checked={selectedOption === "express"}
                  onChange={() => setSelectedOption("express")}
                  className="h-4 w-4 border-gray-300 focus:ring-2 focus:ring-blue-300"
                  disabled={lockButton}
                />
                <label htmlFor="expressShipping" className="ml-2 block text-sm font-medium text-gray-700">
                  Express Shipping
                </label>
              </div>
              <div className="ml-6 pl-1 text-gray-600 text-sm">
                JABODETABEK: next day <br />
                Java: 1-3 working days <br />
                Outside Java: 1-7 working days
              </div>
            </div>
            {shippingCost?.length > 0 && shippingCost[0]?.costs?.length > 0 && (
              <div className="flex flex-col justify-center items-end">
                <p className="font-semibold text-gray-600 text-sm">Rp {shippingCost[0]?.costs[1]?.cost[0]?.value}</p>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="mb-4">
        {/* Show the default address */}
        <div className="flex flex-row items-center justify-between">
          {address && address.length > 0 ? (
            <>
              {address
                .filter((address) => address.setAsDefault === true)
                .map((address) => (
                  <div className="flex flex-row justify-between">
                    <div className="w-[30%]">
                      <p className="text-md text-gray-600">{`${address.firstName.charAt(0).toUpperCase()}${address.firstName.slice(1)} ${address.lastName.charAt(0).toUpperCase()}${address.lastName.slice(1)}`}</p>
                    </div>
                    <div className="w-[40%] flex">
                      <p className="text-md text-gray-600">{`${address.street.charAt(0).toUpperCase()}${address.street.slice(1)}, ${address.district}, ${address.subDistrict}, ${address.city}, ${address.province}, ${
                        address.phoneNumber
                      }`}</p>
                    </div>
                    {showButtons ? (
                      <div className="w-[30%] flex justify-end">
                        <button className="w-[10vw] md:w-[10vw] lg:w-[10vw] h-[5vh] border border-gray-300 hover:bg-gray-100 rounded-md font-semibold" onClick={handleEditModalOpen}>
                          Edit
                        </button>
                      </div>
                    ) : (
                      <div className="w-[30%] flex justify-end"></div>
                    )}
                  </div>
                ))}
            </>
          ) : (
            <p className="text-md text-gray-600">No default address found</p>
          )}
        </div>
      </div>
      {/* Buttons */}
      {showButtons && (
        <div className="flex justify-between items-center pt-4">
          <button className="bg-gray-900 enabled:hover:bg-gray-700 text-white font-bold py-2 px-4 rounded" onClick={handlePaymentMethodClick}>
            Payment Method
          </button>
          <button className="bg-white enabled:hover:bg-gray-100 text-black border border-gray-300 font-bold py-2 px-4 rounded" onClick={handleModalOpen}>
            Register New Address
          </button>
        </div>
      )}
      <AddAddressModal
        isOpen={isModalOpen}
        onClose={() => {
          handleModalClose();
          fetchAddressAndCost();
        }}
        onSuccess={handleSuccess}
      />
      <AddressListModal
        isOpen={isModalEditOpen}
        onClose={() => {
          handleEditModalClose();
          fetchAddressAndCost();
        }}
        onSuccess={handleSuccess}
        username={username}
      />
    </div>
  );
};

export default DeliveryOptions;
