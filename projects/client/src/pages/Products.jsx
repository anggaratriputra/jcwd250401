import Sidebar from "../components/Sidebar";
import Navigationadmin from "../components/Navigationadmin";
import { Button } from "flowbite-react";
import { Input, InputGroup, InputLeftElement } from "@chakra-ui/react";
import { PiMagnifyingGlass } from "react-icons/pi";
import { useState } from "react";
import AddProductModal from "../components/AddProductModal";
import AddCategoryModal from "../components/AddCategoryModal";
import { CategoryLists } from "../components/CategoryLists";
import ProductList from "../components/ProductList";
import { useEffect } from "react";
import { useRef } from "react";
import ArchivedProductList from "../components/ArchivedProductList";
import { logoutAdmin } from "../slices/accountSlices";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { useSelector } from "react-redux";


function Product() {
  const navList = ["All Products", "Category", "Archive"];
  const [openProductModal, setOpenProductModal] = useState(false);
  const [openCategoryModal, setOpenCategoryModal] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState("All Products");
  const [pillWidth, setPillWidth] = useState(0); // State to store the width of the pill
  const handleSelectComponent = (nav) => setSelectedComponent(nav);
  const navRefs = useRef([]); // Refs to store references to each navigation item
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isWarehouseAdmin = useSelector((state) => state?.account?.isWarehouseAdmin);

  useEffect(() => {
    // Calculate the width of the selected navigation item
    if (navRefs[selectedComponent]) {
      setPillWidth(navRefs[selectedComponent].offsetWidth);
    }
  }, [selectedComponent]);

  const openAddProductModal = () => setOpenProductModal(true);
  const closeAddProductModal = () => setOpenProductModal(false);
  const openAddCategoryModal = () => setOpenCategoryModal(true);
  const closeAddCategoryModal = () => setOpenCategoryModal(false);

  return (
    <div className="flex flex-row justify-between h-screen">
      <Sidebar />
      <div className="w-[82vw] lg:w-[84vw] bg-[#f0f0f0] overflow-hidden flex flex-col">
        <div className="shadow-md fixed top-0 left-[18vw] lg:left-[16vw] right-0 z-50 bg-white">
          <Navigationadmin />
        </div>
        <div className="flex flex-col overflow-hidden mt-16 py-8 px-4 md:p-8">
          {!isWarehouseAdmin && (
            <div className="flex justify-end items-center gap-2">
              <Button color="light" size="medium" className="md:p-2 w-52 shadow-sm" onClick={openAddCategoryModal}>
                Add Categories
              </Button>
              <Button color="dark" size="medium" className="md:p-2 w-52 shadow-sm" onClick={openAddProductModal}>
                Add Products
              </Button>
            </div>
          )}
          <div className="flex items-center p-2 md:p-4 mt-4 bg-white rounded-lg shadow-sm">
            <div className="hidden md:flex flex-wrap gap-3 lg:gap-14 mx-4">
              {navList.map((nav, index) => (
                <span
                  key={index}
                  className={`text-sm font-bold ${selectedComponent === nav ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"} cursor-pointer hover:text-gray-700 relative 
                  }`}
                  onClick={() => handleSelectComponent(nav)}
                  ref={(ref) => (navRefs[nav] = ref)} // Save a reference to the navigation item
                >
                  {nav}
                  {selectedComponent === nav && <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-4 pill-animation bg-black h-1 rounded-lg" style={{ width: `${pillWidth}px` }}></div>}
                </span>
              ))}
            </div>
            <div className=" ml-2 flex md:hidden flex-wrap">
              <select className="text-sm font-bold text-gray-900 dark:text-white cursor-pointer hover:text-gray-700 w-[150px] rounded-md" onChange={(e) => handleSelectComponent(e.target.value)}>
                {navList.map((nav, index) => (
                  <option key={index} value={nav}>
                    {nav}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center mt-4">
            {selectedComponent === "All Products" && <ProductList />}
            {selectedComponent === "Category" && <CategoryLists />}
            {selectedComponent === "Archive" && <ArchivedProductList />}
          </div>
        </div>
      </div>
      <AddProductModal isOpen={openProductModal} isClose={closeAddProductModal} />
      <AddCategoryModal isOpen={openCategoryModal} isClose={closeAddCategoryModal} />
    </div>
  );
}

export default Product;
