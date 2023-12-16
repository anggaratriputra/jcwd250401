import { useCallback, useEffect, useState } from "react";
import getCart from "../api/cart/getCart";
import updateCartItems from "../api/cart/updateCartItems";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { showLoginModal } from "../slices/authModalSlices";
import { NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper } from "@chakra-ui/react";
import { Button } from "flowbite-react";
import { PiTrash } from "react-icons/pi";
import DeleteCartItemModal from "./DeleteCartItemModal";
import CartSummary from "./CartSummary";
import { setCartItems, updateCartItem } from "../slices/cartSlices";
import { set } from "lodash";

function CartSection() {
  const [carts, setCarts] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [openDeleteCartModal, setOpenDeleteCartModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState({});
  const isLoggedIn = JSON.parse(localStorage.getItem("isLoggedIn"));

  const fetchCarts = useCallback(async () => {
    try {
      const result = await getCart({});
      setCarts(result.detail.CartItems);
      // Calculate total price and quantity
      calculateTotal(result.detail.CartItems);
      dispatch(setCartItems(result.detail.CartItems));
    } catch (error) {
      if (error?.response?.status === 404) {
        setCarts([]);
      } else if (error.response && error.response.status === 401) {
        dispatch(showLoginModal());
        navigate("/");
        setCarts([]);
        setTotalPrice(0);
        setTotalQuantity(0);
        toast.error(error.response.data.message, {
          description: error.response.data.detail,
        });
      } else if (error.response && error.response.status === 403) {
        dispatch(showLoginModal());
        navigate("/");
        setCarts([]);
        setTotalPrice(0);
        setTotalQuantity(0);
        toast.error(error.response.data.message, {
          description: error.response.data.detail,
        });
      } else if (error.request) {
        // Handle request errors
        setTimeout(() => {
          toast.error("Network error, please try again later");
        }, 2000);
      }
    }
  }, [isLoggedIn]);

  const calculateTotal = (cartItems) => {
    let total = 0;
    let quantity = 0;

    cartItems.forEach((cart) => {
      total += cart.Product.price * cart.quantity;
      quantity += cart.quantity;
    });

    setTotalPrice(total);
    setTotalQuantity(quantity);
  };

  const handleQuantityChange = async (newQuantity, cartIndex) => {
    // Update the quantity in the state

    const updatedCarts = carts.map((cart, index) => (index === cartIndex ? { ...cart, quantity: newQuantity } : cart));
    setCarts(updatedCarts);

    // Recalculate total price and quantity
    calculateTotal(updatedCarts);

    dispatch(setCartItems(updatedCarts));

    const { productId } = updatedCarts[cartIndex];
    await updateCartItems({ productId, newQuantity });

    fetchCarts();
  };

  useEffect(() => {
    fetchCarts();
  }, [fetchCarts]);

  
  const formatToRupiah = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const toggleDeleteModal = (cart) => {
    setSelectedProduct(cart);
    setOpenDeleteCartModal(!openDeleteCartModal);
  };

  return (
    <div className="w-full">
      <span className="text-2xl font-bold"> Shopping Cart</span>
      <div className="flex lg:flex-row flex-col justify-between">
        <div className="flex mt-8 flex-col space-y-4 lg:mr-2 h-96 lg:h-[60vh] overflow-y-auto overflow-x-hidden ">
          {carts.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-gray-600 text-lg">No items found.</p>
            </div>
          )}
          {carts.map((cart, index) => (
            <div className="flex flex-col lg:w-[52vw]" key={index}>
              <div className="flex lg:flex-row flex-col gap-4">
                <div className="flex lg:justify-start justify-center">
                  <div className="w-[150px] h-[150px] lg:w-[180px] lg:h-[180px] relative">
                    {cart.Product.Mutations.length === 0 || cart.Product.Mutations[0].stock === 0 ? (
                      <img className="w-full h-full object-cover" loading="lazy" src={`http://localhost:8000/public/${cart.Product.productImages[0].imageUrl}`} />
                    ) : (
                      <img className="w-full h-full object-cover" loading="lazy" src={`http://localhost:8000/public/${cart.Product.productImages[0].imageUrl}`} />
                    )}
                    {cart.Product.Mutations.length === 0 || cart.Product.Mutations[0].stock === 0 ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black bg-opacity-30 w-full flex justify-center text-white p-1">
                          <span className="text-lg font-medium">Out of Stock</span>
                        </div>
                      </div>
                    ) : (
                      <></>
                    )}
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="flex lg:w-[35vw] justify-between items-center">
                    <span className="font-bold">{cart.Product.name}</span>
                    <PiTrash size={24} className="mr-2  cursor-pointer" onClick={() => toggleDeleteModal(cart)} />
                  </div>
                  <span className="text-sm mt-1">
                    SKU: {cart.Product.sku} ({cart.Product.gender})
                  </span>
                  <span className="text-sm mt-1">Size: All Size</span>
                  <span className="text-sm font-bold mt-2">{formatToRupiah(cart.Product.price)}</span>
                  <div className="flex flex-col mt-2 space-y-2">
                    <span className="font-bold text-md">Quantity</span>
                    <div className="flex items-center space-x-32">
                      {cart.Product.Mutations.length === 0 || cart.Product.Mutations[0].stock === 0 ? (
                        <>
                          <span className="font-bold"> OUT OF STOCK</span>
                          {cart.quantity !== 0 && handleQuantityChange(0, index)}
                        </>
                      ) : (
                        <NumberInput
                          defaultValue={cart.quantity}
                          size={"md"}
                          min={1}
                          max={cart.Product.Mutations[0].stock}
                          onChange={(valueString) => {
                            let value = Number(valueString);

                            // Check if the entered quantity exceeds the available stock
                            if (value > cart.Product.Mutations[0].stock) {
                              value = cart.Product.Mutations[0].stock;
                            }

                            // Update the quantity and handle the change
                            handleQuantityChange(value, index);
                          }}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      )}
                      {cart.Product.Mutations.length === 0 || cart.Product.Mutations[0].stock === 0 ? <></> : <span className="font-bold text-md">Subtotal: {formatToRupiah(cart.Product.price * cart.quantity)}</span>}
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full lg:w-[94%] mt-6 lg:mt-14 mb-1 border-t border border-gray-200"></div>
            </div>
          ))}
        </div>
        {totalQuantity > 0 && <CartSummary totalPrice={totalPrice} totalQuantity={totalQuantity} />}
      </div>
      {openDeleteCartModal && <DeleteCartItemModal isOpen={openDeleteCartModal} data={selectedProduct} isClose={toggleDeleteModal} onSuccess={() => fetchCarts()} />}
    </div>
  );
}

export default CartSection;
