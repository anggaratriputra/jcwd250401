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
import { ChevronDownIcon } from "@chakra-ui/icons";
import EditProductModal from "./EditProductModal";
import { EditCategoryModal } from "./EditCategoryModal";
import ArchiveProductModal from "./ArchiveProductModal";
import DeleteProductModal from "./DeleteProductModal";
import { logoutAdmin } from "../slices/accountSlices";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import getProducts from "../api/products/getProducts";
import { UpdateStockModal } from "./UpdateStockModal";
import { DeleteProductStockModal } from "./DeleteProductStockModal";

function ProductList() {
  const [sortCriteria, setSortCriteria] = useState("date-desc"); // Default sorting criteria that matches the backend;
  const [searchInput, setSearchInput] = useState(""); // Initialize with "All"
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedFilterStock, setSelectedFilterStock] = useState("all");
  const [selectedFilter, setSelectedFilter] = useState("All Genders");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const productsPerPage = 10; // Number of products to display per page
  const dispatch = useDispatch();
  const [categories, setCategories] = useState([]); // Initialize with empty array
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openEditProductModal, setOpenEditProductModal] = useState(false);
  const [openUpdateProductStockModal, setOpenUpdateProductStockModal] = useState(false);
  const [openDeleteProductStockModal, setOpenDeleteProductStockModal] = useState(false);
  const [openArchiveProductModal, setOpenArchiveProductModal] = useState(false);
  const [openDeleteProductModal, setOpenDeleteProductModal] = useState(false);
  const navigate = useNavigate();
  const isWarehouseAdmin = useSelector((state) => state.account.isWarehouseAdmin);
  const newProducts = useSelector((state) => state.product?.productList);
  const categoryLists = useSelector((state) => state?.category?.categoryLists);
  const location = useLocation();

  const handleSearchInputChange = _debounce((e) => {
    setSearchInput(e.target.value);
    const queryParams = new URLSearchParams(location.search);
    queryParams.set("search", e.target.value);

    navigate({
      pathname: location.pathname,
      search: queryParams.toString(),
    });
  }, 600); // 600 milliseconds debounce time (adjust as needed)

  const formatToRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(number);
  };

  const fetchProducts = useCallback(async () => {
    try {
      const result = await getProducts({
        page: currentPage,
        limit: productsPerPage,
        sort: sortCriteria,
        category: selectedCategory,
        search: searchInput,
        filterBy: selectedFilter,
        stockFilter: selectedFilterStock,
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
  }, [currentPage, sortCriteria, selectedCategory, searchInput, selectedFilter, totalPages, totalData, newProducts, categoryLists, selectedFilterStock]);

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

  useEffect(() => {
    // Parse the URL to get the sort and page parameters
    const queryParams = new URLSearchParams(location.search);
    const sortParam = queryParams.get("sort");
    const pageParam = queryParams.get("page");
    const categoryParam = queryParams.get("category");
    const searchParam = queryParams.get("search");
    const stockParam = queryParams.get("stock");
    const genderParam = queryParams.get("gender");
  
    // Check if the sort parameter is present and update the state
    if (sortParam) {
      setSortCriteria(sortParam);
    }
  
    // Check if the page parameter is present and update the state
    if (pageParam) {
      setCurrentPage(parseInt(pageParam, 10));
    }
  
    // Check if the category parameter is present and update the state
    if (categoryParam === "all") {
      setSelectedCategory("All");
    } else if (categoryParam) {
      // Capitalize the first letter of each word
      const formattedCategory = categoryParam.replace(/\b\w/g, match => match.toUpperCase());
      setSelectedCategory(formattedCategory);
    }

    // Check if the search parameter is present and update the state
    if (searchParam) {
      setSearchInput(searchParam);
    }
  
    // Check if the stock parameter is present and update the state
    if (stockParam) {
      setSelectedFilterStock(stockParam);
    }
  
    // Check if the gender parameter is present and update the state
    if (genderParam) {
      setSelectedFilter(genderParam);
    }
  
    // Fetch products based on the updated state
    fetchProducts();
  }, [location.search]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
    const queryParams = new URLSearchParams(location.search);
    queryParams.set("page", newPage);

    navigate({
      pathname: location.pathname,
      search: queryParams.toString(),
    });
  };

  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value.toLowerCase();
    setSelectedCategory(selectedCategory);

    const queryParams = new URLSearchParams(location.search);
    queryParams.set("category", selectedCategory);

    navigate({
      pathname: location.pathname,
      search: queryParams.toString(),
    });
  };

  const handleSortChange = (event) => {
    const selectedSortValue = event.target.value;
    setSortCriteria(selectedSortValue);

    const queryParams = new URLSearchParams(location.search);
    queryParams.set("sort", selectedSortValue);

    navigate({
      pathname: location.pathname,
      search: queryParams.toString(),
    });
  };

  const handleFilterChange = (event) => {
    const selectedFilterValue = event.target.value;
    setSelectedFilter(selectedFilterValue);

    const queryParams = new URLSearchParams(location.search);
    queryParams.set("gender", selectedFilterValue);

    navigate({
      pathname: location.pathname,
      search: queryParams.toString(),
    });
  };

  const handleFilterStockChange = (event) => {
    const selectedFilterStockValue = event.target.value;
    setSelectedFilterStock(selectedFilterStockValue);

    const queryParams = new URLSearchParams(location.search);
    queryParams.set("stock", selectedFilterStockValue);

    navigate({
      pathname: location.pathname,
      search: queryParams.toString(),
    });
  };

  const stockFilter = [
    { label: "All Stock", value: "all" },
    { label: "In Stock", value: "in-stock" },
    { label: "Out of Stock", value: "out-of-stock" },
  ];

  const sortingOptions = [
    { label: "Date DESC", value: "date-desc" },
    { label: "Date ASC", value: "date-asc" },
    { label: "(A-Z)", value: "alphabetical-asc" },
    { label: "(Z-A)", value: "alphabetical-desc" },
    { label: "Price ASC", value: "price-asc" },
    { label: "Price DESC", value: "price-desc" },
  ];

  const filterOptions = [
    { label: "All Genders", value: "all genders" },
    { label: "Men", value: "men" },
    { label: "Women", value: "women" },
    { label: "Unisex", value: "unisex" },
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

  const toggleEditModal = (product) => {
    setSelectedProduct(product);
    setOpenEditProductModal(!openEditProductModal);
  };

  const toggleUpdateProductStockModal = (product) => {
    setSelectedProduct(product);
    setOpenUpdateProductStockModal(!openUpdateProductStockModal);
  };

  const handleCloseUpdateProductStockModal = () => {
    setOpenUpdateProductStockModal(false);
    fetchProducts();
  };

  const toggleDeleteProductStockModal = (product) => {
    setSelectedProduct(product);
    setOpenDeleteProductStockModal(!openUpdateProductStockModal);
  };

  const handleCloseDeleteProductStockModal = () => {
    setOpenDeleteProductStockModal(false);
    fetchProducts();
  };

  const toggleArchiveModal = (product) => {
    setSelectedProduct(product);
    setOpenArchiveProductModal(!openArchiveProductModal);
  };

  const toggleDeleteModal = (product) => {
    setSelectedProduct(product);
    setOpenDeleteProductModal(!openDeleteProductModal);
  };

  return (
    <div className="flex flex-col gap-4 w-full h-screen">
      <div className="hidden w-full lg:flex justify-between space-x-16">
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
          <div className="w-full">
            <select className="py-2 border-2 rounded-lg w-full text-sm shadow-md focus:outline-none focus:border-gray-800 border-gray-400 focus:ring-transparent" onChange={handleFilterStockChange}
            value={selectedFilterStock}>
              <option value="" disabled className="text-gray-400">
                Stock
              </option>
              {stockFilter.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full">
            <select className="py-2 border-2 rounded-lg w-full text-sm shadow-md focus:outline-none focus:border-gray-800 border-gray-400 focus:ring-transparent" onChange={handleFilterChange}
            value={selectedFilter}>
              <option value="" disabled className="text-gray-400">
                Gender
              </option>
              {filterOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full">
            <select className="py-2 border-2 rounded-lg w-full text-sm shadow-md focus:outline-none focus:border-gray-800 border-gray-400 focus:ring-transparent" onChange={handleCategoryChange}
            value={selectedCategory}>
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
            <select className="py-2 border-2 rounded-lg w-full text-sm shadow-md focus:outline-none focus:border-gray-800 border-gray-400 focus:ring-transparent" onChange={handleSortChange}
            value={sortCriteria}>
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

      {/* Mobile View */}
      <div className="w-full flex flex-col space-y-2 lg:hidden">
        <div className="w-[full]">
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
        <div className="flex flex-wrap justify-center gap-2 w-full">
          <div className="w-[48%]">
            <select className="py-2 border-2 rounded-lg w-full text-sm shadow-md focus:outline-none focus:border-gray-800 border-gray-400 focus:ring-transparent" onChange={handleFilterStockChange}>
              <option value="" disabled className="text-gray-400">
                Stock
              </option>
              {stockFilter.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="w-[48%]">
            <select className="py-2 border-2 rounded-lg w-full text-sm shadow-md focus:outline-none focus:border-gray-800 border-gray-400 focus:ring-transparent " onChange={handleFilterChange}>
              <option value="" disabled className="text-gray-400">
                Gender
              </option>
              {filterOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="w-[48%]">
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

          <div className="w-[48%]">
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
      <div className={`space-y-6 overflow-y-scroll scrollbar-hide ${isWarehouseAdmin ? "h-[60vh]" : "h-[56vh]"}`}>
        {products.length === 0 ? (
          <Text textAlign={"center"} fontStyle={"italic"}>
            No data matches.
          </Text>
        ) : (
          ""
        )}
        {products.map((product) => (
          <div key={product.id} className="bg-white lg:items-center lg:justify-between flex lg:flex-row flex-col gap-6 lg:h-36 w-full px-6 lg:py-2  py-6 rounded-lg shadow-sm">
            <div className="w-full flex justify-center lg:hidden">
              <div className="h-[200px] w-[200px] lg:h-[100px] lg:w-[100px]">
                {product.totalStockAllWarehouses !== 0 ? (
                  <img src={`http://localhost:8000/public/${product.productImages[0].imageUrl}`} className="w-full h-full object-cover shadow-xl" alt="Product Image" />
                ) : (
                  <img src={`http://localhost:8000/public/${product.productImages[0].imageUrl}`} className="w-full h-full object-cover shadow-xl" alt="Product Image" style={{ filter: "grayscale(100%)" }} />
                )}
              </div>
            </div>
            <div className="hidden lg:block h-[100px] w-[100px]">
              {product.totalStockAllWarehouses !== 0 ? (
                <img src={`http://localhost:8000/public/${product.productImages[0].imageUrl}`} className="w-full h-full object-cover shadow-xl" alt="Product Image" />
              ) : (
                <img src={`http://localhost:8000/public/${product.productImages[0].imageUrl}`} className="w-full h-full object-cover shadow-xl" alt="Product Image" style={{ filter: "grayscale(100%)" }} />
              )}
            </div>

            <div className="flex w-60 flex-col">
              {product.totalStockAllWarehouses !== 0 ? <span className="font-bold">{product.name}</span> : <span className="font-bold">(Out of stock) {product.name}</span>}
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
            {!isWarehouseAdmin ? (
              <div>
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
                    <MenuItem onClick={() => toggleEditModal(product)}>Edit product</MenuItem>
                    <MenuItem onClick={() => toggleUpdateProductStockModal(product)}>Update / Add stock</MenuItem>
                    <MenuItem onClick={() => toggleDeleteProductStockModal(product)}>Delete stock</MenuItem>
                    <MenuItem onClick={() => toggleArchiveModal(product)}>Archive</MenuItem>
                    <MenuItem onClick={() => toggleDeleteModal(product)}>Delete</MenuItem>
                  </MenuList>
                </Menu>
              </div>
            ) : (
              <div>
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
                      <Text fontWeight="bold">Update</Text>
                      <PiCaretDown size="20px" />
                    </Flex>
                  </MenuButton>
                  <MenuList>
                    <MenuItem onClick={() => toggleUpdateProductStockModal(product)}>Update / Add stock</MenuItem>
                    <MenuItem onClick={() => toggleDeleteProductStockModal(product)}>Delete stock</MenuItem>
                  </MenuList>
                </Menu>
              </div>
            )}
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
              variant={currentPage === 1 ? "solid" : "solid"}
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
                  variant={currentPage === index + 2 ? "solid" : "solid"}
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
      {openArchiveProductModal && <ArchiveProductModal isOpen={openArchiveProductModal} data={selectedProduct} isClose={toggleArchiveModal} />}
      {openEditProductModal && <EditProductModal isOpen={openEditProductModal} data={selectedProduct} isClose={toggleEditModal} />}
      {openDeleteProductModal && <DeleteProductModal isOpen={openDeleteProductModal} data={selectedProduct} isClose={toggleDeleteModal} />}
      {openUpdateProductStockModal && <UpdateStockModal isOpen={openUpdateProductStockModal} data={selectedProduct} onClose={handleCloseUpdateProductStockModal} />}
      {openDeleteProductStockModal && <DeleteProductStockModal isOpen={openDeleteProductStockModal} data={selectedProduct} onClose={handleCloseDeleteProductStockModal} />}
    </div>
  );
}

export default ProductList;
