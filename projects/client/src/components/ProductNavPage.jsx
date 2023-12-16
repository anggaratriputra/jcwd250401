import React, { useCallback, useState } from "react";
import Navigationbar from "./Navigationbar";
import { Link, useNavigate, useLocation, useParams } from "react-router-dom";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@chakra-ui/react";
import { useEffect } from "react";
import api from "../api";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";

import getProductsCountsUser from "../api/products/getProductsCountsUser";
import { Button } from "flowbite-react";

const formatSubCategory = (subCategory) => {
  // Split the subCategory into words
  const words = subCategory.split("-");

  // Capitalize each word and join them back
  const formattedSubCategory = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");

  return formattedSubCategory;
};

export const ProductNavPage = () => {
  const { gender, mainCategory, subCategory } = useParams();
  const [categories, setCategories] = useState([]);
  const [totalData, setTotalData] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchProducts = useCallback(async () => {
    try {
      const category = subCategory ? formatSubCategory(subCategory) : mainCategory;
      const result = await getProductsCountsUser({
        category,
        filterBy: gender,
      });

      const totalData = result.pagination.totalData;

      setTotalData(totalData);
    } catch (error) {
      if (error?.response?.status === 404) {
        setTotalData(0);
      } else if (error.request) {
        // Handle request errors
        setTimeout(() => {
          toast.error("Network error, please try again later");
        }, 2000);
      }
    }
  }, [currentPage, totalData, gender, mainCategory, subCategory]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get(`/category/user/sub-categories?mainCategory=${mainCategory}`);
      const categoryData = response.data.detail;
      setCategories(categoryData);
      console.log(categoryData);
    } catch (error) {
      if (error?.response?.status === 404) {
        setCategories([]);
      }
    }
  }, [gender, mainCategory]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter((segment) => segment !== "");

  return (
    <div className="space-y-0 lg:space-y-10 mt-2 lg:mt-8">
      <div className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2 ">
        <span className="font-bold"> Result</span>
        <span> {totalData} items </span>
      </div>
      <div className="flex flex-col space-y-0 lg:space-y-4">
        <div className="hidden lg:block">
          <span className="font-bold text-xl">{mainCategory.charAt(0).toUpperCase() + mainCategory.slice(1)}</span>
        </div>
        <div className="hidden lg:flex flex-col space-y-4">
          {categories.map((category, index) => (
            <Link className="hover:underline cursor-pointer" to={`/products/${gender}/${mainCategory}/${category.name.replace(/\s+/g, "-").toLowerCase()}`} key={index}>
              {category.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductNavPage;
