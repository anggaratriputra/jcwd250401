import React, { useCallback, useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import getProductsUser from "../api/products/getProductsUser";
import { Divider, HStack, Input, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, SimpleGrid, Select } from "@chakra-ui/react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Button } from "flowbite-react";
import { useDispatch } from "react-redux";
import { showLoginModal } from "../slices/authModalSlices";
import ZoomableImage from "./ZoomableImage";
import addToCart from "../api/cart/addToCart";
import { AiOutlineLoading } from "react-icons/ai";
import AddToCartConfirmation from "./AddToCartConfirmation";
import { addToCartItems } from "../slices/cartSlices";

function ProductCard() {
  const { gender, mainCategory, subCategory, productName } = useParams();
  const [showPopup, setShowPopup] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeImageIndexMobile, setActiveImageIndexMobile] = useState(0);
  const sliderRef = useRef(null);
  const sliderRefMobile = useRef(null);
  const isLoggedIn = JSON.parse(localStorage.getItem("isLoggedIn"));
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmationOpen, setConfirmationOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const formatSubCategory = (subCategory) => {
    const words = subCategory.split("-");
    const formattedSubCategory = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
    return formattedSubCategory;
  };

  const formatProductName = (productName) => {
    const words = productName.split("-");
    const formattedProductName = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
    return formattedProductName;
  };

  const fetchProducts = useCallback(async () => {
    try {
      const category = subCategory ? formatSubCategory(subCategory) : mainCategory;
      const result = await getProductsUser({
        category,
        filterBy: gender,
        productName: formatProductName(productName),
      });

      setSelectedProduct(result.details);
    } catch (error) {
      if (error?.response?.status === 404) {
        setSelectedProduct([]);
      } else if (error.request) {
        setTimeout(() => {
          toast.error("Network error, please try again later");
        }, 2000);
      }
    }
  }, [gender, mainCategory, subCategory, productName]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleImageClick = (imageId) => {
    const index = selectedProduct[0].productImages.findIndex((image) => image.id === imageId);
    if (index !== -1) {
      setActiveImageIndex(index);
      if (sliderRef.current) {
        sliderRef.current.slickGoTo(index);
      }
    }
  };

  const handleImageClickMobile = (imageId) => {
    const index = selectedProduct[0].productImages.findIndex((image) => image.id === imageId);
    if (index !== -1) {
      setActiveImageIndexMobile(index);
      if (sliderRefMobile.current) {
        sliderRefMobile.current.slickGoTo(index);
      }
    }
  };

  const formatToRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(number);
  };

  function SampleNextArrow(props) {
    const { className, style, onClick } = props;
    return (
      <div
        className={className}
        style={{
          ...style,
          display: "block",
          marginRight: "44px",
          zIndex: "20",
          transform: "scale(2)",
        }}
        onClick={onClick}
      ></div>
    );
  }

  function SamplePrevArrow(props) {
    const { className, style, onClick } = props;
    return (
      <div
        className={className}
        style={{
          ...style,
          display: "block",
          marginLeft: "44px",
          zIndex: "20",
          transform: "scale(2)",
        }}
        onClick={onClick}
      ></div>
    );
  }

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    afterChange: (current) => {
      setActiveImageIndex(current);
      setActiveImageIndexMobile(current);
    },
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
  };

  function handleQuantityChange(newQuantity) {
    setQuantity(newQuantity);
  }

  const handleAddToCart = async () => {
    try {
      // Check if the user is logged in
      if (!isLoggedIn) {
        // If not logged in, show login modal and stop further execution
        toast.info("Please login first to perform this action", {
          duration: 1700,
          onAutoClose: (t) => {
            // Await the dispatch before continuing
            dispatch(showLoginModal());
          },
        });
        return;
      }

      // If logged in, proceed with adding to cart
      setIsSubmitting(true);

      const response = await addToCart({
        productId: selectedProduct[0].id,
        quantity: quantity,
      });
      setConfirmationOpen(true);

      dispatch(addToCartItems(response.detail.CartItems));
    } catch (error) {
      // Handle errors
      if (error?.response?.status === 500 || error?.response?.status === 400 || error?.response?.status === 403 || error?.response?.status === 401) {
        toast.error(error.response.data.message, {
          description: error.response.data.detail,
        });
      }
    }
  };

  const handleAddToWishlist = () => {
    if (!isLoggedIn) {
      toast.info("Please login first to perform this action", {
        duration: 1700,
        onAutoClose: (t) => {
          dispatch(showLoginModal());
        },
      });
    }
    console.log("add to wishlist");
  };

  useEffect(() => {
    // Scroll to the top when the component is first rendered
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex lg:flex-row flex-col px-6 lg:px-32 space-y-6 lg:space-y-20 scrollbar-hide">
      {selectedProduct.length !== 0 ? (
        <>
          <div className="hidden lg:flex w-full mt-14 gap-2">
            <div className="flex flex-col w-[58vw] lg:h-[80vh] overflow-y-auto scrollbar-hide space-y-20">
              {selectedProduct.map((product) => (
                <div key={product.id} className="flex space-x-5">
                  <SimpleGrid columns={2} spacing={5} h="184px">
                    {product.productImages.map((image, idx) => (
                      <div key={`simpleGrid-${idx}`} className={`w-[82px] h-[82px] object-cover shadow-xl cursor-pointer ${idx === activeImageIndex ? "border-2 border-[#777777]" : ""}`} onClick={() => handleImageClick(image.id)}>
                        <img src={`http://localhost:8000/public/${image.imageUrl}`} alt={`Product Image ${idx}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </SimpleGrid>
                  <div className="flex flex-col space-y-10 cursor-zoom-in" key={`slider-${product.id}`}>
                    <Slider {...settings} className="w-[480px] h-[480px] shadow-xl" ref={sliderRef}>
                      {product.productImages.map((image, idx) => (
                        <ZoomableImage key={`zoomableImage-${idx}`} imageUrl={`http://localhost:8000/public/${image.imageUrl}`} alt={`Product Image ${idx}`} images={selectedProduct[0].productImages} />
                      ))}
                    </Slider>
                  </div>
                </div>
              ))}

              <div className="hidden lg:flex pb-10 flex-col space-y-4 lg:space-y-8 w-full">
                <div className="flex flex-col space-y-4">
                  <span className="font-bold text-2xl">Description</span>
                  <div className="flex flex-col">
                    {selectedProduct[0]?.description.split("\n").map((paragraph, index) => (
                      <p key={index} className="text-md mb-2 leading-snug">
                        {paragraph.trim()}
                      </p>
                    ))}
                  </div>
                  <div className="mt-8 border-t border border-gray-200"></div>
                </div>
                <div className="flex flex-col space-y-4">
                  <span className="font-bold text-2xl">Details</span>
                  <div className="flex flex-col space-y-4">
                    <div className="flex flex-col">
                      <span className="text-md text-gray-500"> Material:</span>
                      <span className="text-md">{selectedProduct[0]?.material}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-md text-gray-500"> Lining:</span>
                      <span className="text-md">{selectedProduct[0]?.lining}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-md text-gray-500"> Waterproof Rating:</span>
                      <span className="text-md">{selectedProduct[0]?.waterproofRating}</span>
                    </div>
                    {selectedProduct[0]?.height && selectedProduct[0].length && selectedProduct[0].width && selectedProduct[0].weight && (
                      <>
                        <div className="flex flex-col">
                          <span className="text-md text-gray-500"> Measurements:</span>
                          <span className="text-md">
                            H{selectedProduct[0]?.height} x W{selectedProduct[0]?.width} x L{selectedProduct[0]?.length} cm / H{Math.floor((selectedProduct[0]?.height / 2.54) * 10) / 10} x W
                            {Math.floor((selectedProduct[0]?.width / 2.54) * 10) / 10} x L{Math.floor((selectedProduct[0]?.length / 2.54) * 10) / 10} inches
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-md text-gray-500"> Volume:</span>
                          <span className="text-md">
                            {Math.floor(((selectedProduct[0]?.height * selectedProduct[0]?.width * selectedProduct[0]?.length) / 1000) * 10) / 10} liters /{" "}
                            {Math.floor(((selectedProduct[0]?.height * selectedProduct[0]?.width * selectedProduct[0]?.length) / 3785.41) * 10) / 10} gallons
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-md text-gray-500"> Weight:</span>
                          <span className="text-md">
                            {selectedProduct[0]?.weight} g / {Math.floor(selectedProduct[0]?.weight * 0.03527396 * 10) / 10} oz
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {selectedProduct.map((product) => (
              <div className="flex flex-col ml-28 w-[30vw]">
                <div className="flex flex-col space-y-5">
                  <div className="flex flex-col space-y-2">
                    <span className="font-bold text-2xl">{product.name}</span>
                    <span className="text-md leading-snug">{product.description.split(".").slice(0, 2).join(".") + "."}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-2xl">{formatToRupiah(product.price)}</span>
                    <div className="mt-2 mb-1 border-t border border-gray-200"></div>
                    {product.totalStockAllWarehouses > 0 ? (
                      product.totalStockAllWarehouses >= 10 ? (
                        <span className="font-medium text-md">In Stock</span>
                      ) : (
                        <span className="font-medium text-md">Only {product.totalStockAllWarehouses} left</span>
                      )
                    ) : (
                      <span className="font-medium text-md">Out of Stock</span>
                    )}
                  </div>
                </div>
                <div className="space-y-6 flex flex-col justify-end">
                  <div className="mt-4 flex space-x-4 justify-between">
                    <div className="w-full space-y-4">
                      <span className="font-bold text-xl">Size</span>
                      <select className="w-full h-10 rounded-md border-gray-200 focus:outline-transparent transition-all ease-in-out duration-500" disabled={product.totalStockAllWarehouses === 0}>
                        <option>All Size</option>
                      </select>
                    </div>
                    <div className="w-full space-y-4">
                      <span className="font-bold text-xl">Quantity</span>
                      <NumberInput
                        defaultValue={product.totalStockAllWarehouses === 0 ? 0 : 1}
                        min={product.totalStockAllWarehouses === 0 ? 0 : 1}
                        max={product.totalStockAllWarehouses}
                        isDisabled={product.totalStockAllWarehouses === 0}
                        value={product.totalStockAllWarehouses !== 0 ? quantity : 0}
                        onChange={(valueString, valueNumber) => handleQuantityChange(valueNumber)}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Button className="w-full shadow-md" color="light" size="lg" onClick={handleAddToWishlist}>
                      Add To Wishlist
                    </Button>
                    {product.totalStockAllWarehouses !== 0 ? (
                      <Button className="w-full bg-Grey-1 enabled:hover:bg-[#777777] shadow-md" size="lg" onClick={handleAddToCart}>
                        Add To Cart
                      </Button>
                    ) : (
                      <Button className="w-full bg-Grey-1 enabled:hover:bg-[#777777] shadow-md" size="lg" disabled>
                        Out Of Stock
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Mobile */}
          <div className="flex flex-col w-full mt-14 gap-5 lg:hidden">
            {selectedProduct.map((product) => (
              <div className="flex flex-col justify-center items-center space-y-10 cursor-zoom-in" key={product.id}>
                <Slider {...settings} className="w-[350px] h-[480px] shadow-xl" ref={sliderRefMobile}>
                  {product.productImages.map((image, idx) => (
                    <ZoomableImage imageUrl={`http://localhost:8000/public/${image.imageUrl}`} alt={`Product Image ${idx}`} images={selectedProduct[0].productImages} />
                  ))}
                </Slider>
              </div>
            ))}
            <div className="flex justify-center">
              {selectedProduct.map((product) => (
                <div className="flex justify-center">
                  <SimpleGrid columns={5} spacing={2} key={product.id}>
                    {product.productImages.map((image, idx) => (
                      <div key={idx} className={`w-[62px] h-[82px] object-cover shadow-xl cursor-pointer ${idx === activeImageIndexMobile ? "border-2 border-[#777777]" : ""}`} onClick={() => handleImageClickMobile(image.id)}>
                        <img src={`http://localhost:8000/public/${image.imageUrl}`} alt={`Product Image ${idx}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </SimpleGrid>
                </div>
              ))}
            </div>
            {selectedProduct.map((product) => (
              <div className="flex flex-col justify-between">
                <div className="flex flex-col space-y-5">
                  <div className="flex flex-col space-y-2">
                    <span className="font-bold text-2xl">{product.name}</span>
                    <span className="text-md leading-snug">{product.description.split(".").slice(0, 2).join(".") + "."}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-2xl">{formatToRupiah(product.price)}</span>
                    <div className="mt-2 mb-1 border-t border border-gray-200"></div>
                    {product.totalStockAllWarehouses > 0 ? (
                      product.totalStockAllWarehouses >= 10 ? (
                        <span className="font-medium text-md">In Stock</span>
                      ) : (
                        <span className="font-medium text-md">Only {product.totalStockAllWarehouses} left</span>
                      )
                    ) : (
                      <span className="font-medium text-md">Out of Stock</span>
                    )}
                  </div>
                </div>
                <div className="mt-4 space-y-6">
                  <div className="flex space-x-4 justify-between">
                    <div className="w-full space-y-4">
                      <span className="font-bold text-xl">Size</span>
                      <select className="w-full h-10 rounded-md border-gray-200 focus:outline-transparent transition-all ease-in-out duration-500" disabled={product.totalStockAllWarehouses === 0}>
                        <option>All Size</option>
                      </select>
                    </div>
                    <div className="w-full space-y-4">
                      <span className="font-bold text-xl">Quantity</span>
                      <NumberInput defaultValue={product.totalStockAllWarehouses === 0 ? 0 : 1} min={product.totalStockAllWarehouses === 0 ? 0 : 1} max={product.totalStockAllWarehouses} isDisabled={product.totalStockAllWarehouses === 0}>
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Button className="w-full shadow-md" color="light" size="lg" onClick={handleAddToWishlist}>
                      Add To Wishlist
                    </Button>
                    {product.totalStockAllWarehouses !== 0 ? (
                      <Button className="w-full bg-Grey-1 enabled:hover:bg-[#777777]" size="lg" onClick={handleAddToCart}>
                        Add To Cart
                      </Button>
                    ) : (
                      <Button className="w-full bg-Grey-1 enabled:hover:bg-[#777777] shadow-md" size="lg" disabled>
                        Out Of Stock
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="lg:hidden pb-10 flex-col space-y-4 lg:space-y-8">
            <div className="flex flex-col space-y-4">
              <span className="font-bold text-2xl">Description</span>
              <div className="flex flex-col">
                {selectedProduct[0]?.description.split("\n").map((paragraph, index) => (
                  <p key={index} className="text-md mb-2 leading-snug">
                    {paragraph.trim()}
                  </p>
                ))}
              </div>
              <div className="mt-8 border-t border border-gray-200"></div>
            </div>
            <div className="flex flex-col space-y-4">
              <span className="font-bold text-2xl">Details</span>
              <div className="flex flex-col space-y-4">
                <div className="flex flex-col">
                  <span className="text-md text-gray-500"> Material:</span>
                  <span className="text-md">{selectedProduct[0]?.material}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-md text-gray-500"> Lining:</span>
                  <span className="text-md">{selectedProduct[0]?.lining}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-md text-gray-500"> Waterproof Rating:</span>
                  <span className="text-md">{selectedProduct[0]?.waterproofRating}</span>
                </div>
                {selectedProduct[0]?.height && selectedProduct[0].length && selectedProduct[0].width && selectedProduct[0].weight && (
                  <>
                    <div className="flex flex-col">
                      <span className="text-md text-gray-500"> Measurements:</span>
                      <span className="text-md">
                        H{selectedProduct[0]?.height} x W{selectedProduct[0]?.width} x L{selectedProduct[0]?.length} cm / H{Math.floor((selectedProduct[0]?.height / 2.54) * 10) / 10} x W
                        {Math.floor((selectedProduct[0]?.width / 2.54) * 10) / 10} x L{Math.floor((selectedProduct[0]?.length / 2.54) * 10) / 10} inches
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-md text-gray-500"> Volume:</span>
                      <span className="text-md">
                        {Math.floor(((selectedProduct[0]?.height * selectedProduct[0]?.width * selectedProduct[0]?.length) / 1000) * 10) / 10} liters /{" "}
                        {Math.floor(((selectedProduct[0]?.height * selectedProduct[0]?.width * selectedProduct[0]?.length) / 3785.41) * 10) / 10} gallons
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-md text-gray-500"> Weight:</span>
                      <span className="text-md">
                        {selectedProduct[0]?.weight} g / {Math.floor(selectedProduct[0]?.weight * 0.03527396 * 10) / 10} oz
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex justify-center items-center h-full">
          <span className="text-xl ">No product matches. </span>
        </div>
      )}
      <AddToCartConfirmation isOpen={isConfirmationOpen} onClose={() => setConfirmationOpen(false)} quantity={quantity} price={selectedProduct[0]?.price} />
    </div>
  );
}

export default ProductCard;
