import { Link, useLocation, useNavigate } from "react-router-dom";
import { NavPage } from "../components/NavPage";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { showLoginModal } from "../slices/authModalSlices";
import api from "../api";
import { toast } from "sonner";
import { PaymentProofModal } from "../components/PaymentProofModal";
import getProfile from "../api/profile/getProfile";
import getUserOrder from "../api/order/getUserOrder";
import { Box, Button, Flex, Text } from "@chakra-ui/react";

export const Order = () => {
  let isLoggedIn = JSON.parse(localStorage.getItem("isLoggedIn"));
  const listsMenu = ["Profile", "Address Book", "My Order", "Change Password"];
  const orderStatus = ["All", "Waiting for Payment", "Waiting for Payment Confirmation", "On Process", "On Delivery", "Delivered", "Cancelled"];
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openModalProof, setOpenModalProof] = useState(false);
  const [orderLists, setOrderLists] = useState([]);
  const [page, setPage] = useState(1);
  const size = 5;
  const [sort, setSort] = useState("date-desc");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [totalPages, setTotalPages] = useState(1);
  const location = useLocation();

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
    const queryParams = new URLSearchParams(location.search);
    queryParams.set("page", newPage);

    navigate({
      pathname: location.pathname,
      search: queryParams.toString(),
    });
  };

  const [expandedOrders, setExpandedOrders] = useState([]);

  const toggleExpand = (index) => {
    const newExpandedOrders = [...expandedOrders];
    newExpandedOrders[index] = !newExpandedOrders[index];
    setExpandedOrders(newExpandedOrders);
  };

  const handleStatusChange = (status) => {
    setPage(1);

    const queryParams = new URLSearchParams(location.search);
    queryParams.set("status", status);

    navigate({
      pathname: location.pathname,
      search: queryParams.toString(),
    });

    setSelectedStatus(status);
  };

  const handleSortChange = (e) => {
    setSort(e.target.value);

    const queryParams = new URLSearchParams(location.search);
    queryParams.set("sort", e.target.value);

    navigate({
      pathname: location.pathname,
      search: queryParams.toString(),
    });
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const page = queryParams.get("page");
    const status = queryParams.get("status");
    const sort = queryParams.get("sort");

    if (page) {
      setPage(parseInt(page));
    }

    if (status) {
      setSelectedStatus(status);
    }

    if (sort) {
      setSort(sort);
    }
  }, [location.search]);

  const handleOpenModalProof = (orderId) => {
    setSelectedOrder(orderId);
    setOpenModalProof(true);
  };

  const getOrderLists = async () => {
    try {
      const response = await getUserOrder({
        status: selectedStatus,
        page,
        size,
        sort,
      });
      setOrderLists(response.detail);
      setTotalPages(response.pagination.totalPages);

      console.log(response.detail);
    } catch (error) {
      if (error.response.status === 401 || error.response.status === 403) {
        toast.error(error.response.data.message);
        setOrderLists([]);
        navigate("/");
        dispatch(showLoginModal());
      } else if (error.response.status === 404) {
        setOrderLists([]);
      } else if (error.response.status === 500) {
        toast.error(error.response.data.message);
        setOrderLists([]);
      }
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      getOrderLists();
    }
  }, [selectedStatus, page, size, sort]);

  const formatToRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(number);
  };

  const sortingOptions = [
    { label: "Date DESC", value: "date-desc" },
    { label: "Date ASC", value: "date-asc" },
    { label: "Price ASC", value: "price-asc" },
    { label: "Price DESC", value: "price-desc" },
  ];

  return (
    <>
      <NavPage pageName={"Order"} />
      <div className="flex lg:px-36 lg:justify-normal justify-center  font-sagoe">
        <div className="hidden lg:flex flex-col w-[20vw]">
          {listsMenu.map((list, index) => {
            const joinedList = list.toLowerCase().replace(/\s/g, "-");
            const isMyOrder = list === "My Order";
            return (
              <Link key={index} to={`/account/${joinedList}`} className={`block py-2 text-sm font-sagoe text-gray-700 hover:underline ${isMyOrder ? "font-black" : ""}`}>
                {list}
              </Link>
            );
          })}
        </div>

        <div className="w-full min-h-[40vh] lg:w-[60vw] overflow-y-hidden shadow-md">
          {isLoggedIn ? (
            <div className="p-4 w-full">
              <div id="orderStatus" className="hidden sm:flex flex-col">
                <span className="font-bold text-2xl">Status</span>
                <div className="flex justify-between ">
                  <div className="w-[43vw] overflow-x-auto ">
                    <div className="flex w-[65vw]">
                      {orderStatus.map((status, index) => {
                        const joinedStatus = status.toLowerCase().replace(/\s/g, "-");
                        const isSelected = selectedStatus === joinedStatus;

                        return (
                          <button
                            key={index}
                            className={`m-2 bg-gray-100 ${isSelected && "bg-gray-800 text-white"} px-4 py-1 rounded-md text-sm font-sagoe text-gray-700 hover:bg-gray-800 hover:text-white`}
                            onClick={() => handleStatusChange(joinedStatus)}
                            style={{ order: isSelected ? 0 : 1 }}
                          >
                            <span>{status}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mr-2">
                    <span className="font-bold min-w-[55px]">Sort by</span>
                    <select value={sort} onChange={handleSortChange} className="px-2 py-1 my-2 bg-gray-100 rounded-md text-sm font-sagoe text-gray-700 hover:bg-gray-200">
                      {sortingOptions.map((option, index) => {
                        return (
                          <option key={index} value={option.value}>
                            {option.label}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <p className="font-bold sm:hidden">Status</p>
                <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="block sm:hidden px-2 py-1 my-2 bg-gray-100 rounded-md text-sm font-sagoe text-gray-700 hover:bg-gray-200">
                  {orderStatus.map((status, index) => {
                    return (
                      <option key={index} value={status}>
                        {status}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div id="orderList" className="mt-4 flex flex-col overflow-y-auto space-y-4">
                {orderLists.length > 0 ? (
                  orderLists.map((orderItem, index) => {
                    const updatedAt = new Date(orderItem.updatedAt);
                    const date = `${updatedAt.getDate()} ${updatedAt.toLocaleString("default", { month: "short" })} ${updatedAt.getFullYear()}`;
                    const time = updatedAt.toLocaleTimeString();

                    return (
                      <div key={index} className="border border-gray-200 rounded-md px-6 py-4 bg-gray-100">
                        <div className="flex justify-between items-center">
                          <span className="bg-gray-900 text-white px-4 rounded-full">{orderItem.status}</span>
                          <span>
                            {date}, {time}
                          </span>
                        </div>
                        <div className="mt-6 flex justify-between">
                          <div className="flex justify-between w-full">
                            <div className="flex flex-col space-y-4 mb-4">
                              {orderItem.Products.slice(0, expandedOrders[index] ? orderItem.Products.length : 1).map((product, productIndex) => (
                                <div className="flex items-center space-x-4" key={productIndex}>
                                  <img src={`http://localhost:8000/public/${product.Product.productImages[0].imageUrl}`} alt="product" className="w-[100px] h-[100px] object-cover rounded-md" />
                                  <span>{product.quantity}x</span>
                                  <div className="flex flex-col">
                                    <span>{product.Product.productName}</span>
                                    <span>{formatToRupiah(product.Product.productPrice)}</span>
                                  </div>
                                </div>
                              ))}
                              {orderItem.Products.length > 1 && (
                                <button onClick={() => toggleExpand(index)} className="text-blue-500 cursor-pointer focus:outline-none">
                                  {expandedOrders[index] ? `Collapse` : `+${orderItem.Products.length - 1} Other${orderItem.Products.length > 2 ? "s" : ""}`}
                                </button>
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span>Total Quantity: {orderItem.totalQuantity}</span>
                              <span className="font-bold"> Subtotal: {formatToRupiah(orderItem.totalPrice)} </span>
                              {orderItem.status === "waiting-for-payment" && (
                                <button onClick={() => handleOpenModalProof(orderItem.orderId)} className="px-2 py-1 bg-gray-900 rounded-md text-sm font-sagoe text-gray-100 hover:bg-gray-700 w-full">
                                  Upload Payment Proof
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex justify-center items-center h-full py-2 mx-2 border border-gray-100 rounded-md">
                    <p className="text-xl font-bold font-sagoe">No data matches</p>
                  </div>
                )}
              </div>
              {totalPages > 1 && (
                <Box display="flex" justifyContent="right" gap={2} mt={4} textAlign="right" mr={4}>
                  <Flex alignItems={"center"} gap={2}>
                    <Text mr={2} fontWeight={"bold"}>
                      {" "}
                      Page{" "}
                    </Text>
                    <Box>
                      <Button
                        boxShadow="md"
                        key={1}
                        size="xs"
                        w="30px"
                        borderRadius="lg"
                        onClick={() => handlePageChange(1)}
                        variant={page === 1 ? "solid" : "solid"}
                        bgColor={page === 1 ? "gray.900" : "white"}
                        textColor={page === 1 ? "white" : "gray.900"}
                        _hover={{ bgColor: "gray.900", textColor: "white" }}
                        mr="5px"
                        transition={"ease-in-out 0.3s"}
                      >
                        1
                      </Button>
                      {totalPages > 1 &&
                        Array.from({ length: totalPages - 1 }, (_, index) => (
                          <Button
                            boxShadow="md"
                            key={index + 2}
                            size="xs"
                            w="30px"
                            borderRadius="lg"
                            onClick={() => handlePageChange(index + 2)}
                            variant={page === index + 2 ? "solid" : "solid"}
                            bgColor={page === index + 2 ? "gray.900" : "gray.white"}
                            textColor={page === index + 2 ? "white" : "gray.900"}
                            _hover={{ bgColor: "gray.900", textColor: "white" }}
                            mr="5px"
                            transition={"ease-in-out 0.3s"}
                          >
                            {index + 2}
                          </Button>
                        ))}
                    </Box>
                  </Flex>
                </Box>
              )}
            </div>
          ) : (
            <div className="flex justify-center items-center h-full">
              <p className="text-xl font-bold">You are not logged in</p>
            </div>
          )}
        </div>
      </div>
      <PaymentProofModal isOpen={openModalProof} onClose={() => setOpenModalProof(false)} orderId={selectedOrder} />
    </>
  );
};
