import React, { useCallback, useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { addProduct } from "../slices/productSlices";
import api from "../api";
import { useSelector } from "react-redux";
import { PiCaretDown, PiEye, PiInfo, PiShoppingBag } from "react-icons/pi";
import { Box, Button, Flex, Menu, MenuButton, MenuItem, MenuList, Text } from "@chakra-ui/react";
import { setProductList } from "../slices/productSlices";
import _debounce from "lodash/debounce";
import UnarchiveProductModal from "./UnarchiveProductModal";
import { toast } from "sonner";
import { logoutAdmin } from "../slices/accountSlices";
import { useNavigate } from "react-router-dom";
import getProducts from "../api/products/getProducts";
import getArchivedProducts from "../api/products/getArchivedProducts";

function ArchivedProductList() {
  const [sortCriteria, setSortCriteria] = useState("date-desc"); // Default sorting criteria that matches the backend;
  const [searchInput, setSearchInput] = useState(""); // Initialize with "All"
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedWarehouse, setSelectedWarehouse] = useState("All Warehouse");
  const [selectedFilter, setSelectedFilter] = useState("All Genders");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const productsPerPage = 10; // Number of products to display per page
  const dispatch = useDispatch();
  const [categories, setCategories] = useState([]); // Initialize with empty array
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openUnarchiveProductModal, setOpenUnarchiveProductModal] = useState(false);

  const newProducts = useSelector((state) => state.product?.productList);
  const isWarehouseAdmin = useSelector((state) => state?.account?.isWarehouseAdmin);
  const navigate = useNavigate();
  const categoryLists = useSelector((state) => state.category?.categoryList);

  const handleSearchInputChange = _debounce((e) => {
    setSearchInput(e.target.value);
  }, 600); // 600 milliseconds debounce time (adjust as needed)

  const handleWarehouseChange = (e) => {
    setSelectedWarehouse(e.target.value);
  };

  const formatToRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(number);
  };

  const fetchProducts = useCallback(async () => {
    try {
      const result = await getArchivedProducts({
        page: currentPage,
        limit: productsPerPage,
        sort: sortCriteria,
        category: selectedCategory,
        search: searchInput,
        filterBy: selectedFilter,
      });
      const totalData = result.pagination.totalData;
      const totalPages = Math.ceil(totalData / productsPerPage);
      console.log(totalData, totalPages);

      setTotalData(totalData);
      setTotalPages(totalPages);
      setProducts(result.details);
    } catch (error) {
      if (error?.response?.status === 404) {
        setTotalData(0);
        setTotalPages(0);
        setProducts([]);
      } else if (error?.response?.status === 401) {
        setTimeout(() => {
          toast.error(error.response.data.message, {
            autoClose: 1000,
            onAutoClose: (t) => {
              dispatch(logoutAdmin());
              navigate("/adminlogin");
            },
          });
        }, 600);
      } else if (error?.response?.status === 403) {
        setTimeout(() => {
          toast.error(error.response.data.message, {
            autoClose: 1000,
            onAutoClose: (t) => {
              dispatch(logoutAdmin());
              navigate("/adminlogin");
            },
          });
        }, 600);
      } else if (error.request) {
        // Handle request errors
        setTimeout(() => {
          toast.error("Network error, please try again later");
        }, 2000);
      }
    }
  }, [currentPage, sortCriteria, selectedCategory, searchInput, selectedFilter, totalPages, totalData, newProducts]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.admin.get("/category/child-categories");
      const categoryData = response.data.details;
      setCategories(categoryData);
    } catch (error) {
      if (error?.response?.status === 404) {
        setCategories([]);
      }
    }
  }, [categoryLists]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    setSelectedCategory(selectedCategory);
  };

  const handleSortChange = (event) => {
    const selectedSortValue = event.target.value;
    setSortCriteria(selectedSortValue);
  };

  const handleFilterChange = (event) => {
    const selectedFilterValue = event.target.value;
    setSelectedFilter(selectedFilterValue);
  };

  // const warehouse = [
  //   { label: "All Warehouse", value: "All" },
  //   { label: "Jakarta", value: "Jakarta" },
  //   { label: "Bandung", value: "Bandung" },
  //   { label: "Medan", value: "Medan" },
  // ];

  const sortingOptions = [
    { label: "Date DESC", value: "date-desc" },
    { label: "Date ASC", value: "date-asc" },
    { label: "(A-Z)", value: "alphabetical-asc" },
    { label: "(Z-A)", value: "alphabetical-desc" },
    { label: "Price ASC", value: "price-asc" },
    { label: "Price DESC", value: "price-desc" },
  ];

  const filterOptions = [
    { label: "All Genders", value: "All Genders" },
    { label: "Men", value: "Men" },
    { label: "Women", value: "Women" },
    { label: "Unisex", value: "Unisex" },
  ];

  const sortingProduct = [
    { label: "All Category", value: "All" }, // Default "All" option
    ...categories.map((category) => {
      const mainCategoryOption = {
        label: category.name,
        value: category.name,
      };

      if (category.subcategories && category.subcategories.length > 0) {
        mainCategoryOption.subOpts = category.subcategories.map((subCategory) => ({
          label: subCategory.name,
          value: subCategory.name,
        }));
      }

      return mainCategoryOption;
    }),
  ];

  const toggleUnarchiveModal = (product) => {
    setSelectedProduct(product);
    setOpenUnarchiveProductModal(!openUnarchiveProductModal);
  };

  return (
    <div className="flex flex-col gap-4 w-full h-screen">
      <div className="w-full flex justify-between space-x-16">
        <div className="w-[30vw]">
          <div className="relative">
            <span className="absolute inset-y-0 left-2 pl-1 flex items-center">
              <FaSearch className="text-gray-400" />
            </span>
            <input
              type="text"
              className="pl-10 pr-3 py-2 border-2 rounded-lg w-full text-sm shadow-md focus:outline-none focus:border-gray-800 border-gray-400 focus:ring-transparent"
              placeholder="Search by product or SKU"
              onChange={handleSearchInputChange}
            />
          </div>
        </div>
        <div className="flex gap-4 w-full">
          {/* <div className="w-full">
            <select className="py-2 border-2 rounded-lg w-full text-sm shadow-md focus:outline-none focus:border-gray-800 border-gray-400 focus:ring-transparent">
              <option value="" disabled className="text-gray-400">
                Warehouse
              </option>
              {warehouse.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div> */}
          <div className="w-full">
            <select className="py-2 border-2 rounded-lg w-full text-sm shadow-md focus:outline-none focus:border-gray-800 border-gray-400 focus:ring-transparent " onChange={handleFilterChange}>
              <option value="" disabled className="text-gray-400">
                Filter
              </option>
              {filterOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full">
            <select className="py-2 border-2 rounded-lg w-full text-sm shadow-md focus:outline-none focus:border-gray-800 border-gray-400 focus:ring-transparent" onChange={handleCategoryChange}>
              <option value="" disabled className="text-gray-400">
                Category
              </option>
              {sortingProduct.map((opt) => (
                <React.Fragment key={opt.value}>
                  <option
                    value={opt.value}
                    disabled={opt.subOpts}
                    style={{
                      fontWeight: opt.subOpts ? "bold" : "normal",
                    }}
                  >
                    {opt.label}
                  </option>
                  {opt.subOpts &&
                    opt.subOpts.map((subOpt) => (
                      <option key={subOpt.value} value={subOpt.value}>
                        {subOpt.label}
                      </option>
                    ))}
                </React.Fragment>
              ))}
            </select>
          </div>

          <div className="w-full">
            <select className="py-2 border-2 rounded-lg w-full text-sm shadow-md focus:outline-none focus:border-gray-800 border-gray-400 focus:ring-transparent" onChange={handleSortChange}>
              <option value="" disabled className="text-gray-400">
                Sort
              </option>
              {sortingOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className={`space-y-6 overflow-y-scroll scrollbar-hide ${isWarehouseAdmin ? "h-[62vh]" : "h-[56vh]"}`}>
        {products.length == 0 ? (
          <Text textAlign={"center"} fontStyle={"italic"}>
            No data matches.
          </Text>
        ) : (
          ""
        )}
        {products.map((product) => (
          <div key={product.id} className="bg-white items-center justify-between flex gap-6 h-36 w-full px-6 py-2 rounded-lg shadow-sm">
            <div className="h-[100px] w-[100px] flex justify-center items-center">
              {product.productImages[0].imageUrl ? (
                <img src={`http://localhost:8000/public/${product.productImages[0].imageUrl}`} className="w-full h-full object-cover shadow-lg" alt="Product Image" style={{ filter: "grayscale(100%)" }} />
              ) : (
                <div className="w-full h-full flex justify-center items-center bg-gray-200 text-gray-400">
                  <div className="flex flex-col items-center justify-center">
                    <PiInfo className="h-8 w-8" />
                    <span>No Image</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex w-60 flex-col">
              <span className="font-bold">(Archived)</span>
              <span className="font-bold">{product.name}</span>
              <span>
                SKU : {product.sku} ({product.gender}){" "}
              </span>
            </div>
            <div className="flex w-40 flex-col">
              <span className="font-bold">Statistic</span>
              <div className="flex flex-row items-center gap-4">
                <div className="flex flex-row items-center gap-1">
                  {" "}
                  <PiEye /> {product.viewCount}{" "}
                </div>
                <div className="flex flex-row items-center gap-1">
                  {" "}
                  <PiShoppingBag /> {product.soldCount}{" "}
                </div>
              </div>
            </div>
            <div className="flex flex-col w-48 ">
              <span className="font-bold">Price</span>
              <span>{formatToRupiah(product.price)}</span>
            </div>
            <div className="flex flex-col w-44">
              <span className="font-bold">Stock</span>
             <span>{product.totalStockAllWarehouses}</span>
            </div>
            <div>
              {!isWarehouseAdmin && (
                <Menu>
                  <MenuButton
                    px={2}
                    py={2}
                    transition="all 0.2s"
                    borderRadius="lg"
                    textColor="gray.600"
                    boxShadow="md"
                    borderColor="gray.500"
                    borderWidth="2px"
                    _hover={{ bg: "gray.900", textColor: "white" }}
                    _expanded={{ bg: "gray.900", textColor: "white" }}
                  >
                    <Flex justifyContent="between" gap={4} px={2} alignItems="center">
                      <Text fontWeight="bold">Edit</Text>
                      <PiCaretDown size="20px" />
                    </Flex>
                  </MenuButton>
                  <MenuList>
                    <MenuItem onClick={() => toggleUnarchiveModal(product)}>Unarchive</MenuItem>
                  </MenuList>
                </Menu>
              )}
            </div>
          </div>
        ))}
      </div>
      <Box display="flex" justifyContent="right" gap={2} textAlign="right" mr={4}>
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
              variant={currentPage === 1 ? "solid" : "outline"}
              bgColor={currentPage === 1 ? "gray.900" : "white"}
              textColor={currentPage === 1 ? "white" : "gray.900"}
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
                  variant={currentPage === index + 2 ? "solid" : "outline"}
                  bgColor={currentPage === index + 2 ? "gray.900" : "gray.white"}
                  textColor={currentPage === index + 2 ? "white" : "gray.900"}
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
      {openUnarchiveProductModal && <UnarchiveProductModal isOpen={openUnarchiveProductModal} data={selectedProduct} isClose={toggleUnarchiveModal} />}
    </div>
  );
}

export default ArchivedProductList;
