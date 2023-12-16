import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import getProductsUser from "../api/products/getProductsUser";
import { SimpleGrid, Button, Flex, Box, Text } from "@chakra-ui/react";
import { toast } from "sonner";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import api from "../api";

function ProductGrid() {
  const { gender, mainCategory, subCategory } = useParams();
  const [products, setProducts] = useState([]);
  const [totalData, setTotalData] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [sortCriteria, setSortCriteria] = useState("date-desc");
  const [currentImageIndexes, setCurrentImageIndexes] = useState({});
  const [sliderIntervals, setSliderIntervals] = useState({});
  const location = useLocation();
  const [categoriesData, setCategoriesData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize currentImageIndexes with default value 0 for each product ID
    const initialIndexes = {};
    products.forEach((product) => {
      initialIndexes[product.id] = 0;
    });
    setCurrentImageIndexes(initialIndexes);

    // Clean up intervals on component unmount
    return () => {
      Object.values(sliderIntervals).forEach((intervalId) => clearInterval(intervalId));
    };
  }, [products, sliderIntervals]);

  const formatSubCategory = (subCategory) => {
    const words = subCategory.split("-");
    const formattedSubCategory = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
    return formattedSubCategory;
  };

  const fetchProducts = useCallback(async () => {
    try {
      const category = subCategory ? formatSubCategory(subCategory) : mainCategory;
      const result = await getProductsUser({
        category,
        filterBy: gender,
        page: currentPage,
        sort: sortCriteria,
        limit: 8,
      });
      const totalData = result.pagination.totalData;
      const totalPages = result.pagination.totalPages;
      setTotalData(totalData);
      setTotalPages(totalPages);
      setProducts(result.details);
    } catch (error) {
      if (error?.response?.status === 404) {
        setTotalData(0);
        setTotalPages(0);
        setProducts([]);
      } else if (error.request) {
        setTimeout(() => {
          toast.error("Network error, please try again later");
        }, 2000);
      }
    }
  }, [currentPage, totalData, gender, mainCategory, sortCriteria, subCategory, totalPages, currentPage]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get(`/api/category/user/sub-categories?mainCategory=${mainCategory}`);
      const categoryData = response.data.detail;
      setCategoriesData(categoryData);
      console.log(categoryData);
    } catch (error) {
      if (error?.response?.status === 404) {
        setCategoriesData([]);
      }
    }
  }, [gender, mainCategory]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const formatToRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(number);
  };

  useEffect(() => {
    // Parse the URL to get the sort and page parameters
    const queryParams = new URLSearchParams(location.search);
    const sortParam = queryParams.get("sort");
    const pageParam = queryParams.get("page");
  
    // Check if the sort parameter is present and update the state
    if (sortParam) {
      setSortCriteria(sortParam);
    }
  
    // Check if the page parameter is present and update the state
    if (pageParam) {
      setCurrentPage(parseInt(pageParam, 10));
    }
  
    // Fetch products based on the sort and page parameters
    fetchProducts();
  }, [location.search]);

  const handleSortChange = ({ target }) => {
    const selectedSortValue = target.value;
    setSortCriteria(selectedSortValue);

    const queryParams = new URLSearchParams(location.search);
    queryParams.set("sort", selectedSortValue);

    navigate({
      pathname: location.pathname,
      search: queryParams.toString(),
    });
  };

  const handleImageSlider = (index, productId) => {
    setCurrentImageIndexes((prevIndexes) => ({
      ...prevIndexes,
      [productId]: index,
    }));

    const intervalId = setInterval(() => {
      setCurrentImageIndexes((prevIndexes) => ({
        ...prevIndexes,
        [productId]: (prevIndexes[productId] + 1) % products.find((p) => p.id === productId)?.productImages.length || 0,
      }));
    }, 2000);

    setSliderIntervals((prevIntervals) => ({ ...prevIntervals, [productId]: intervalId }));
  };

  const stopImageSlider = (productId) => {
    // Reset the currentImageIndex to 0 when the mouse leaves
    setCurrentImageIndexes((prevIndexes) => ({
      ...prevIndexes,
      [productId]: 0,
    }));
    clearInterval(sliderIntervals[productId]);
  };

  const sortingOptions = [
    { label: "Latest", value: "date-desc" },
    { label: "Oldest", value: "date-asc" },
    { label: "(A-Z)", value: "alphabetical-asc" },
    { label: "(Z-A)", value: "alphabetical-desc" },
    { label: "Lowest Price", value: "price-asc" },
    { label: "Highest Price", value: "price-desc" },
  ];

  const settings = {
    dots: true,
    infinite: true,
    fade: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    nextArrow: <></>,
    prevArrow: <></>,
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
  
      // Update URL with new page parameter
      const queryParams = new URLSearchParams(location.search);
      queryParams.set("page", newPage);
  
      navigate({
        pathname: location.pathname,
        search: queryParams.toString(),
      });
    }
  };
  
  useEffect(() => {
    // Scroll to the top when the component is first rendered
    window.scrollTo(0, 0);
  }, []);

  return (
    <div>
      {products.length === 0 && (
        <div className="flex flex-col space-y-10 lg:space-y-0">
          <div className="lg:hidden flex w-full space-x-2 items-center justify-between">
            <div className="w-[200px]">
              <select className="h-9 border-1 rounded-lg w-full text-sm shadow-sm focus:outline-none focus:border-gray-800 border-gray-400 focus:ring-transparent" onChange={handleSortChange}>
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
            <div className="flex w-full overflow-x-auto lg:hidden scrollbar-hide">
              <div className="flex space-x-2">
                <Button color="light" size="sm" className="w-32">
                  <Link className="hover:underline cursor-pointer" to={`/products/${gender}/${mainCategory}`}>
                    All {mainCategory.charAt(0).toUpperCase() + mainCategory.slice(1)}
                  </Link>
                </Button>
                {categoriesData.map((category, index) => (
                  <Button color="light" size="sm" className="w-32" key={index}>
                    <Link className="hover:underline cursor-pointer" to={`/products/${gender}/${mainCategory}/${category.name.replace(/\s+/g, "-").toLowerCase()}`}>
                      {category.name}
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-xl ">No products found. </span>
            <span className="text-xl w-[34vw]">&nbsp; </span>
          </div>
        </div>
      )}
      {products.length !== 0 && (
        <div className="flex lg:justify-between">
          <div className="hidden lg:block">&nbsp;</div>
          <div className="hidden lg:block w-full lg:w-[168px] space-y-2">
            <span className="font-bold"> Sort by</span>
            <select className="py-2 border-1 rounded-lg w-full text-sm shadow-sm focus:outline-none focus:border-gray-800 border-gray-400 focus:ring-transparent" onChange={handleSortChange} value={sortCriteria}>
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
          <div className="lg:hidden flex w-full space-x-2 items-center justify-between">
            <div className="w-[200px]">
              <select className="h-9 border-1 rounded-lg w-full text-sm shadow-sm focus:outline-none focus:border-gray-800 border-gray-400 focus:ring-transparent" onChange={handleSortChange}>
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
            <div className="flex w-full overflow-x-auto lg:hidden scrollbar-hide">
              <div className="flex space-x-2">
                <Button color="light" size="sm" className="w-32">
                  <Link className="hover:underline cursor-pointer" to={`/products/${gender}/${mainCategory}`}>
                    All {mainCategory.charAt(0).toUpperCase() + mainCategory.slice(1)}
                  </Link>
                </Button>
                {categoriesData.map((category, index) => (
                  <Button color="light" size="sm" className="w-32" key={index}>
                    <Link className="hover:underline cursor-pointer" to={`/products/${gender}/${mainCategory}/${category.name.replace(/\s+/g, "-").toLowerCase()}`}>
                      {category.name}
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="mt-6">
        <SimpleGrid columns={{ base: 2, lg: 4 }} spacing={{ base: 3, lg: 4 }} h={{ base: "68vh", lg: "63vh" }} borderRadius={{ base: "xl", lg: "md" }} overflowY="auto" className="scrollbar-hide">
          {products.map((product) => (
            <div className="flex flex-col items-center lg:justify-normal lg:items-start space-y-6 lg:space-y-10">
              <Slider {...settings} className="w-[180px] h-[260px] lg:w-[230px] lg:h-[280px]">
                {product.productImages.map((image, idx) => (
                  <div
                    key={idx}
                    className="w-[180px] h-[250px] lg:w-[230px] lg:h-[310px] cursor-pointer relative"
                    onClick={() =>
                      navigate(
                        `/products/${product.gender.toLowerCase()}/${product.categories[0].name.replace(/\s+/g, "-").toLowerCase()}/${product.categories[1].name.replace(/\s+/g, "-").toLowerCase()}/${product.name
                          .replace(/\s+/g, "-")
                          .toLowerCase()}`
                      )
                    }
                  >
                    {/* Product Image */}
                    <img src={`http://localhost:8000/public/${image.imageUrl}`} loading="lazy" className="w-full h-full object-cover shadow-md rounded-lg lg:rounded-none" alt={`Product Image ${idx}`} />

                    {/* Overlay for Out of Stock */}
                    {product.totalStockAllWarehouses === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black bg-opacity-30 w-full flex justify-center text-white p-1">
                          <span className="text-lg font-medium">Out of Stock</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </Slider>
              <div className="text-md flex flex-col">
                <span>{product.name}</span>
                <span className="font-bold">{formatToRupiah(product.price)}</span>
              </div>
            </div>
          ))}
        </SimpleGrid>
        {totalPages > 1 && (
          <Box display="flex" justifyContent="center" gap={2} mt={4} textAlign="right" mr={4}>
            <Flex alignItems={"center"} gap={2}>
              <Box>
                <Button
                  boxShadow="md"
                  key={1}
                  w="30px"
                  size={{ base: "md", lg: "sm" }}
                  borderRadius="50%"
                  onClick={() => handlePageChange(1)}
                  variant={currentPage === 1 ? "solid" : "solid"}
                  bgColor={currentPage === 1 ? "gray.900" : "white"}
                  textColor={currentPage === 1 ? "white" : "gray.900"}
                  _hover={{ bgColor: "gray.900", textColor: "white" }}
                  mr="5px"
                  transition={"ease-in-out 0.5s"}
                >
                  1
                </Button>
                {totalPages > 1 &&
                  Array.from({ length: totalPages - 1 }, (_, index) => (
                    <Button
                      boxShadow="md"
                      key={index + 2}
                      w="30px"
                      size={{ base: "md", lg: "sm" }}
                      borderRadius="50%"
                      onClick={() => handlePageChange(index + 2)}
                      variant={currentPage === index + 2 ? "solid" : "solid"}
                      bgColor={currentPage === index + 2 ? "gray.900" : "gray.white"}
                      textColor={currentPage === index + 2 ? "white" : "gray.900"}
                      _hover={{ bgColor: "gray.900", textColor: "white" }}
                      mr="5px"
                      transition={"ease-in-out 0.5s"}
                    >
                      {index + 2}
                    </Button>
                  ))}
              </Box>
            </Flex>
          </Box>
        )}
      </div>
    </div>
  );
}

export default ProductGrid;
