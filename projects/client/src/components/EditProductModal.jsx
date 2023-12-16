import React, { useEffect, useRef, useState } from "react";
import { Button } from "flowbite-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import api from "../api";
import { toast } from "sonner";
import { hideForgotPasswordModal, setEmail } from "../slices/authModalSlices";
import { AiOutlineLoading } from "react-icons/ai";
import { useDispatch } from "react-redux";

import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Text } from "@chakra-ui/react";
import { useDropzone } from "react-dropzone";
import { PiImage, PiImageThin, PiWarningCircleBold } from "react-icons/pi";
import { addProduct } from "../slices/productSlices";

function EditProductModal({ isOpen, isClose, data }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const dispatch = useDispatch();
  const [formattedValue, setFormattedValue] = useState("");
  const [dropzoneImages, setDropzoneImages] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  const handleInputChange = (event) => {
    const rawValue = event.target.value.replace(/[^\d]/g, ""); // Remove non-numeric characters
    const numericValue = parseInt(rawValue, 10); // Parse the numeric value

    const formatted = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(rawValue);

    setFormattedValue(formatted);
    formik.setFieldValue("productPrice", numericValue);
  };

  useEffect(() => {
    const formatted = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(data?.price || 0); // Use data?.price or a default value if it's undefined
    setFormattedValue(formatted);
  }, [data?.price]);

  useEffect(() => {
    const fetchPreviewImages = async () => {
      try {
        const images = data?.productImages || [];
        const previewImagePromises = images.map(async (image, index) => {
          const response = await fetch(`http://localhost:8000/public/${image.imageUrl}`);
          const blob = await response.blob();
          if (blob.type.startsWith("image/")) {
            // Create an object with file, preview, and index properties
            return {
              file: new File([blob], image.name, { type: blob.type }),
              preview: URL.createObjectURL(blob),
              index, // Add index property
            };
          }
          return null; // Filter out non-image blobs
        });

        const updatedPreviewImages = (await Promise.all(previewImagePromises)).filter((image) => image !== null);
        setPreviewImages(updatedPreviewImages);
        setDropzoneImages(updatedPreviewImages);

        formik.setFieldValue(
          "productImages",
          updatedPreviewImages.map((img) => img.file)
        );
      } catch (error) {
        // Handle errors if necessary
        console.error("Error fetching preview images:", error);
      }
    };

    fetchPreviewImages();
  }, [data?.productImages]);

  const formik = useFormik({
    initialValues: {
      productName: data?.name,
      productGender: data?.gender === "Unisex" ? "" : data?.gender,
      productMainCategory: data?.categories[0]?.name,
      productSubCategory: data?.categories[1]?.name,
      productDescription: data?.description,
      productMaterial: data?.material,
      productLining: data?.lining,
      productWaterproofRating: data?.waterproofRating,
      weight: data?.weight || "",
      length: data?.length || "",
      width: data?.width || "",
      height: data?.height || "",
      productPrice: data?.price || "",
      productImages: "",
    },
    validationSchema: Yup.object({
      productName: Yup.string().required("Please enter your product name").min(6, "Product name must be at least 6 characters"),
      productMainCategory: Yup.string().required("Please enter your product main category"),
      productSubCategory: Yup.string().required("Please enter your product sub category"),
      productDescription: Yup.string().required("Please enter your description").min(10, "Product description must be at least 10 characters"),
      productMaterial: Yup.string().required("Please enter your product material"),
      productLining: Yup.string().required("Please enter your product lining"),
      productWaterproofRating: Yup.string().required("Please enter your product waterproof rating"),
      weight: Yup.number().optional(),
      length: Yup.number().optional(),
      width: Yup.number().optional(),
      height: Yup.number().optional(),
      productPrice: Yup.string().required("Please enter your product price"),
      productGender: Yup.string().when("productMainCategory", {
        is: (productMainCategory) => !(productMainCategory === "Bags" || productMainCategory === "Accessories"),
        then: (productGender) => Yup.string().required("Please select a gender"),
      }),
    }),
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);

        const datas = new FormData();
        datas.append("productName", values.productName);
        datas.append("productGender", values.productGender);
        datas.append("productMainCategory", values.productMainCategory);
        datas.append("productSubCategory", values.productSubCategory);
        datas.append("productDescription", values.productDescription);
        datas.append("productPrice", values.productPrice);
        datas.append("productMaterial", values.productMaterial);
        datas.append("productLining", values.productLining);
        datas.append("productWaterproofRating", values.productWaterproofRating);

        if (values.weight) {
          datas.append("weight", values.weight);
        }

        if (values.length) {
          datas.append("length", values.length);
        }

        if (values.width) {
          datas.append("width", values.width);
        }

        if (values.height) {
          datas.append("height", values.height);
        }

        if (values.productImages) {
          values.productImages.forEach((image) => {
            datas.append("productImages", image);
          });
        }



        const response = await api.admin.put(`/product/${data.id}`, datas, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        const responseData = response.data.details;
        if (response.status === 200) {
          setTimeout(() => {
            isClose();
            setIsSubmitting(false);
            dispatch(addProduct(responseData));
            toast.success("Update product success", {
              autoClose: 1000,
              onAutoClose: (t) => {
                formik.resetForm();
                setDropzoneImages([]);
                setPreviewImages([]);
                setFormattedValue("");
              },
            });
          }, 3000);
        }
      } catch (error) {
        if (error.response.status === 400) {
          setTimeout(() => {
            setIsSubmitting(false);
            toast.error("Please upload at least one photo of the product.");
          }, 3000);
        } else if (error.response.status === 404) {
          setTimeout(() => {
            setIsSubmitting(false);
            toast.error("Product not found.");
          }, 3000);
        } else if (error.request) {
          // Handle request errors
          setTimeout(() => {
            setIsSubmitting(false);
            toast.error("Network error, please try again later");
          }, 3000);
        }
      } finally {
        setTimeout(() => {
          setIsSubmitting(false);
        }, 8000);
      }
    },
  });

  useEffect(() => {
    const fetchSubCategories = async () => {
      try {
        const response = await api.admin.get("/category/sub-categories", {
          params: {
            mainCategory: formik.values.productMainCategory,
          },
        });

        if (response.data.ok) {
          setSubCategories(response.data.detail);
        } else {
          toast.error(response.data.message, {
            description: response.data.detail,
          });
        }
      } catch (error) {
        // Handle different error scenarios based on the HTTP status code
      }
    };

    fetchSubCategories();
  }, [formik.values.productMainCategory]);

  // React Dropzone Configuration

  useEffect(() => {
    // Update component or perform actions after state changes
    console.log("State updated:", dropzoneImages);
  }, [dropzoneImages]);

  const fileInputRef = useRef(null);

  const onDrop = (acceptedFiles) => {
    if (activeIndex !== null) {
      const file = acceptedFiles[0];

      if (file) {
        if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
          console.error("Invalid file type. Please upload a JPEG or PNG file.");
          return;
        }

        const maxSizeInBytes = 2 * 1024 * 1024; // 2MB
        if (file.size > maxSizeInBytes) {
          console.error("File size exceeds the 2MB limit.");
          return;
        }

        const newPreviewImage = {
          file,
          preview: URL.createObjectURL(file),
          index: activeIndex,
        };

        // Update the dropzoneImages state
        setDropzoneImages((prevImages) => {
          const updatedImages = [...prevImages];
          const currentImageIndex = updatedImages.findIndex((img) => img.index === activeIndex);

          if (currentImageIndex !== -1) {
            updatedImages[currentImageIndex] = newPreviewImage;
          } else {
            updatedImages.push(newPreviewImage);
          }

          // Update the productImages array in formik values
          formik.setFieldValue(
            "productImages",
            updatedImages.map((img) => img.file)
          );

          return updatedImages;
        });

        // Reset the activeIndex after updating the preview image
        setActiveIndex(null);
      } else {
        console.error("Invalid file dropped.");
      }
    }
  };

  const handleClick = (index) => {
    setActiveIndex(index);
    fileInputRef.current.click();
  };

  const genders = [
    { label: "Men", value: "Men" },
    { label: "Women", value: "Women" },
  ];

  const mainCategories = [
    { label: "Jackets", value: "Jackets" },
    { label: "Tops", value: "Tops" },
    { label: "Bottom", value: "Bottom" },
    { label: "Bags", value: "Bags" },
    { label: "Accessories", value: "Accessories" },
    // ... more main categories
  ];

  const waterproofRating = [
    { label: "W1 - Protection from light mositure", value: "W1 - Protection from light mositure" },
    { label: "W2 - Protection from intermittent light rain", value: "W2 - Protection from intermittent light rain" },
    { label: "W3 - Waterproof protection from light rain", value: "W3 -  Waterproof protection from light rain" },
    { label: "W4 - Waterproof protection from moderate rain", value: "W4 - Waterproof protection from moderate rain" },
  ];

  return (
    <>
      <Modal closeOnOverlayClick={false} isOpen={isOpen} size={{ lg: "6xl" }} motionPreset="slideInRight" scrollBehavior="inside" onClose={isClose} isCentered>
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(1px)" />
        <ModalContent>
          <ModalHeader py={0}>
            <div className="px-4 lg:mt-7 mt-10 lg:mb-0 mb-4">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Product</h3>
            </div>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody className="scrollbar-hide">
            <form onSubmit={formik.handleSubmit}>
              <div className="space-y-4 lg:space-y-3 px-4 mb-6">
                <div className="lg:flex flex lg:flex-row lg:space-x-20 lg:space-y-0 space-y-4 lg:justify-between lg:items-center flex-col">
                  <div className="lg:w-[20vw] w-full">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Product Name</h4>
                  </div>
                  <div className="w-full">
                    <input
                      type="productName"
                      id="productName"
                      name="productName"
                      placeholder="Enter product name..."
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg shadow-md shadow-gray-200 focus:ring-transparent focus:border-gray-500"
                      {...formik.getFieldProps("productName")}
                    />
                    {formik.touched.productName && formik.errors.productName ? (
                      <div className="ml-2 text-xs flex items-center gap-1 text-red-500">
                        <PiWarningCircleBold /> {formik.errors.productName}
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="lg:flex flex lg:flex-row lg:space-x-20 lg:space-y-0 space-y-4 lg:justify-between lg:items-center flex-col">
                  <div className="lg:w-[20vw] w-full">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Product Price</h4>
                  </div>
                  <div className="w-full">
                    <input
                      type="text"
                      id="productPrice"
                      name="productPrice"
                      placeholder="Enter product price..."
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg shadow-md shadow-gray-200 focus:ring-transparent focus:border-gray-500"
                      value={formattedValue}
                      onChange={handleInputChange}
                    />
                    {formik.touched.productPrice && formik.errors.productPrice ? (
                      <div className="ml-2 text-xs flex items-center gap-1 text-red-500">
                        <PiWarningCircleBold />
                        {formik.errors.productPrice}
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="lg:flex lg:flex-row flex flex-col lg:space-x-20 space-y-2 lg:space-y-0 justify-between items-center">
                  <div className="lg:w-[20vw] w-full">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Product Category</h4>
                    <h4 className="text-xs font-light text-gray-900 dark:text-white">Select product main category, sub category, and gender if needed.</h4>
                  </div>
                  <div className="flex lg:flex-row space-y-2 lg:space-y-0 flex-col w-full ">
                    {formik.values.productMainCategory !== "Bags" && formik.values.productMainCategory !== "Accessories" ? (
                      <>
                        <div className="flex flex-col w-full">
                          <div>
                            <select
                              id="productMainCategory"
                              name="productMainCategory"
                              className="w-full px-4 py-2 border-2 border-gray-300 outline-none  lg:rounded-l-lg lg:rounded-none rounded-lg shadow-md shadow-gray-200 focus:ring-transparent focus:border-gray-500"
                              {...formik.getFieldProps("productMainCategory")}
                            >
                              <option value="" disabled className="text-gray-400">
                                Select main category
                              </option>
                              {mainCategories.map((category) => (
                                <option key={category.value} value={category.value}>
                                  {category.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          {formik.touched.productMainCategory && formik.errors.productMainCategory ? (
                            <div className="ml-2 text-xs flex items-center gap-1 text-red-500">
                              <PiWarningCircleBold />
                              {formik.errors.productMainCategory}
                            </div>
                          ) : null}
                        </div>

                        <div className="flex w-full flex-col">
                          <div>
                            <select
                              id="productSubCategory"
                              name="productSubCategory"
                              className="w-full px-4 py-2 border-2 border-gray-300 shadow-md shadow-gray-200  lg:rounded-none rounded-lg focus:ring-transparent focus:border-gray-500"
                              {...formik.getFieldProps("productSubCategory")}
                            >
                              <option value="" disabled className="text-gray-400">
                                Select sub category
                              </option>
                              {subCategories.map((subcategory) => (
                                <option key={subcategory.id} value={subcategory.name}>
                                  {subcategory.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          {formik.touched.productSubCategory && formik.errors.productSubCategory ? (
                            <div className="ml-2 text-xs flex items-center gap-1 text-red-500">
                              <PiWarningCircleBold />
                              {formik.errors.productSubCategory}
                            </div>
                          ) : null}
                        </div>
                        <div className="flex w-full flex-col">
                          <div>
                            <select
                              id="productGender"
                              name="productGender"
                              className="w-full px-4 py-2 border-2 border-gray-300 lg:rounded-r-lg lg:rounded-none rounded-lg shadow-md shadow-gray-20 focus:ring-transparent focus:border-gray-500"
                              {...formik.getFieldProps("productGender")}
                            >
                              <option value="" disabled className="text-gray-400">
                                Select gender
                              </option>
                              {genders.map((category) => (
                                <option key={category.value} value={category.value}>
                                  {category.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          {formik.touched.productGender && formik.errors.productGender ? (
                            <div className="ml-2 text-xs flex items-center gap-1 text-red-500">
                              <PiWarningCircleBold />
                              {formik.errors.productGender}
                            </div>
                          ) : null}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex flex-col w-full">
                          <div>
                            <select
                              id="productMainCategory"
                              name="productMainCategory"
                              className="w-full px-4 py-2 border-2 border-gray-300 outline-none lg:rounded-l-lg lg:rounded-none rounded-lg  shadow-md shadow-gray-200 focus:ring-transparent focus:border-gray-500"
                              {...formik.getFieldProps("productMainCategory")}
                            >
                              <option value="" disabled className="text-gray-400">
                                Select main category
                              </option>
                              {mainCategories.map((category) => (
                                <option key={category.value} value={category.value}>
                                  {category.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          {formik.touched.productMainCategory && formik.errors.productMainCategory ? (
                            <div className="ml-2 text-xs flex items-center gap-1 text-red-500">
                              <PiWarningCircleBold />
                              {formik.errors.productMainCategory}
                            </div>
                          ) : null}
                        </div>
                        <div className="flex w-full flex-col">
                          <div>
                            <select
                              id="productSubCategory"
                              name="productSubCategory"
                              className="w-full px-4 py-2 border-2 border-gray-300 shadow-md shadow-gray-200  lg:rounded-none rounded-lg focus:ring-transparent focus:border-gray-500"
                              {...formik.getFieldProps("productSubCategory")}
                            >
                              <option value="" disabled className="text-gray-400">
                                Select sub category
                              </option>
                              {subCategories.map((subcategory) => (
                                <option key={subcategory.id} value={subcategory.name}>
                                  {subcategory.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          {formik.touched.productSubCategory && formik.errors.productSubCategory ? (
                            <div className="ml-2 text-xs flex items-center gap-1 text-red-500">
                              <PiWarningCircleBold />
                              {formik.errors.productSubCategory}
                            </div>
                          ) : null}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="lg:flex lg:flex-row flex flex-col lg:space-x-20 lg:space-y-0 space-y-4 justify-between ">
                  <div className="lg:w-[20vw] w-full space-y-1">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Product Description</h4>
                    <h4 className="text-xs font-light text-gray-900 dark:text-white">Make sure the product description contains a detailed explanation regarding your product so that buyers can easily understand and find your product.</h4>
                  </div>
                  <div className="w-full">
                    <textarea
                      type="productDescription"
                      id="productDescription"
                      name="productDescription"
                      placeholder="Describe the product..."
                      className="w-full h-56 px-4 py-2 border-2 scrollbar-hide border-gray-300 rounded-lg shadow-md shadow-gray-200 focus:ring-transparent resize-none focus:border-gray-500"
                      {...formik.getFieldProps("productDescription")}
                    />
                    {formik.touched.productDescription && formik.errors.productDescription ? (
                      <div className="ml-2 text-xs flex items-center gap-1 text-red-500">
                        <PiWarningCircleBold />
                        {formik.errors.productDescription}
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="lg:flex lg:flex-row flex items-center flex-col lg:space-x-20 lg:space-y-0 space-y-4 justify-between ">
                  <div className="lg:w-[20vw] w-full space-y-1">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Product Material</h4>
                  </div>
                  <div className="w-full">
                    <input
                      type="productMaterial"
                      id="productMaterial"
                      name="productMaterial"
                      placeholder="Enter product material..."
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg shadow-md shadow-gray-200 focus:ring-transparent focus:border-gray-500"
                      {...formik.getFieldProps("productMaterial")}
                    />
                    {formik.touched.productMaterial && formik.errors.productMaterial ? (
                      <div className="ml-2 text-xs flex items-center gap-1 text-red-500">
                        <PiWarningCircleBold />
                        {formik.errors.productMaterial}
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="lg:flex lg:flex-row flex items-center flex-col lg:space-x-20 lg:space-y-0 space-y-4 justify-between ">
                  <div className="lg:w-[20vw] w-full space-y-1">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Product Lining</h4>
                  </div>
                  <div className="w-full">
                    <input
                      type="productLining"
                      id="productLining"
                      name="productLining"
                      placeholder="Enter product lining..."
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg shadow-md shadow-gray-200 focus:ring-transparent focus:border-gray-500"
                      {...formik.getFieldProps("productLining")}
                    />
                    {formik.touched.productLining && formik.errors.productLining ? (
                      <div className="ml-2 text-xs flex items-center gap-1 text-red-500">
                        <PiWarningCircleBold />
                        {formik.errors.productLining}
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="lg:flex lg:flex-row flex items-center flex-col lg:space-x-20 lg:space-y-0 space-y-4 justify-between ">
                  <div className="lg:w-[20vw] w-full space-y-1">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Product Waterproof Rating</h4>
                  </div>
                  <div className="w-full">
                    <select
                      id="productWaterproofRating"
                      name="productWaterproofRating"
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg shadow-md shadow-gray-200 focus:ring-transparent focus:border-gray-500"
                      {...formik.getFieldProps("productWaterproofRating")}
                    >
                      <option value="" disabled className="text-gray-400">
                        Select waterproof rating
                      </option>
                      {waterproofRating.map((rating) => (
                        <option key={rating.value} value={rating.value}>
                          {rating.label}
                        </option>
                      ))}
                    </select>
                    {formik.touched.productWaterproofRating && formik.errors.productWaterproofRating ? (
                      <div className="ml-2 text-xs flex items-center gap-1 text-red-500">
                        <PiWarningCircleBold />
                        {formik.errors.productWaterproofRating}
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="lg:flex lg:flex-row flex flex-col items-center lg:space-x-20 lg:space-y-0 space-y-4 justify-between ">
                  <div className="lg:w-[20vw] w-full space-y-1">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Weight (Optional)</h4>
                  </div>
                  <div className="w-full">
                    <div className="relative">
                      <input
                        type="number"
                        id="weight"
                        name="weight"
                        placeholder="Enter product weight (optional)..."
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg shadow-md shadow-gray-200 focus:ring-transparent focus:border-gray-500"
                        {...formik.getFieldProps("weight")}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center p-4 pointer-events-none bg-gray-200 border-2 border-gray-300 rounded-r-lg shadow-md shadow-gray-200 focus:ring-transparent focus:border-gray-500">
                        <span className="text-gray-500">gr</span>
                      </div>
                    </div>
                    {formik.touched.weight && formik.errors.weight ? (
                      <div className="ml-2 text-xs flex items-center gap-1 text-red-500">
                        <PiWarningCircleBold /> {formik.errors.weight}
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="lg:flex lg:flex-row flex flex-col items-center lg:space-x-20 lg:space-y-0 space-y-4 justify-between ">
                  <div className="lg:w-[20vw] w-full space-y-1">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Length (Optional)</h4>
                  </div>
                  <div className="w-full">
                    <div className="relative">
                      <input
                        type="number"
                        id="length"
                        name="length"
                        placeholder="Enter product length (optional)..."
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg shadow-md shadow-gray-200 focus:ring-transparent focus:border-gray-500"
                        {...formik.getFieldProps("length")}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center p-4 pointer-events-none bg-gray-200 border-2 border-gray-300 rounded-r-lg shadow-md shadow-gray-200 focus:ring-transparent focus:border-gray-500">
                        <span className="text-gray-500">cm</span>
                      </div>
                    </div>
                    {formik.touched.length && formik.errors.length ? (
                      <div className="ml-2 text-xs flex items-center gap-1 text-red-500">
                        <PiWarningCircleBold /> {formik.errors.length}
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="lg:flex lg:flex-row flex flex-col items-center lg:space-x-20 lg:space-y-0 space-y-4 justify-between ">
                  <div className="lg:w-[20vw] w-full space-y-1">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Width (Optional)</h4>
                  </div>
                  <div className="w-full">
                    <div className="relative">
                      <input
                        type="number"
                        id="width"
                        name="width"
                        placeholder="Enter product width (optional)..."
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg shadow-md shadow-gray-200 focus:ring-transparent focus:border-gray-500"
                        {...formik.getFieldProps("width")}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center p-4 pointer-events-none bg-gray-200 border-2 border-gray-300 rounded-r-lg shadow-md shadow-gray-200 focus:ring-transparent focus:border-gray-500">
                        <span className="text-gray-500">cm</span>
                      </div>
                    </div>
                    {formik.touched.width && formik.errors.width ? (
                      <div className="ml-2 text-xs flex items-center gap-1 text-red-500">
                        <PiWarningCircleBold /> {formik.errors.width}
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="lg:flex lg:flex-row flex flex-col items-center lg:space-x-20 lg:space-y-0 space-y-4 justify-between ">
                  <div className="lg:w-[20vw] w-full space-y-1">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Height (Optional)</h4>
                  </div>
                  <div className="w-full">
                    <div className="relative">
                      <input
                        type="number"
                        id="height"
                        name="height"
                        placeholder="Enter product height (optional)..."
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg shadow-md shadow-gray-200 focus:ring-transparent focus:border-gray-500"
                        {...formik.getFieldProps("height")}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center p-4 pointer-events-none bg-gray-200 border-2 border-gray-300 rounded-r-lg shadow-md shadow-gray-200 focus:ring-transparent focus:border-gray-500">
                        <span className="text-gray-500">cm</span>
                      </div>
                    </div>
                    {formik.touched.height && formik.errors.height ? (
                      <div className="ml-2 text-xs flex items-center gap-1 text-red-500">
                        <PiWarningCircleBold /> {formik.errors.height}
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="lg:flex flex lg:flex-row flex-col lg:space-x-20 lg:space-y-0 space-y-4 justify-between">
                  <div className="w-full flex-col space-y-2">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Product Image</h4>
                    <h4 className="text-xs font-light text-gray-900 dark:text-white">Add at least 3 photos of the product to showcase its unique qualities and grab the attention of your followers.</h4>
                  </div>
                  <input type="file" accept="image/*" style={{ display: "none" }} ref={fileInputRef} onChange={(e) => onDrop([e.target.files[0]])} />
                  <div className="lg:flex flex w-full lg:flex-row flex-col lg:justify-start lg:items-center justify-center items-center lg:space-x-5 space-y-4 lg:space-y-0">
                    {[0, 1, 2, 3, 4].map((index) => {
                      const previewImage = dropzoneImages.find((img) => img.index === index);
                      return (
                        <div key={index} className="lg:w-[139px] lg:h-[200px] w-[80%] h-[250px] relative">
                          <div
                            onClick={() => handleClick(index)}
                            className={`w-full h-full border-dashed border-2 border-gray-300 rounded-md flex shadow-md shadow-gray-200 focus:ring-transparent items-center justify-center bg-transparent ${
                              activeIndex === index ? "bg-gray-100" : ""
                            }`}
                          >
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              {previewImage ? (
                                <img src={previewImage.preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover rounded-md shadow-lg" />
                              ) : (
                                <>
                                  {index === 0 ? (
                                    <>
                                      <PiImageThin className="text-gray-400" size={44} />
                                      <p className="text-gray-400">Main Photo</p>
                                    </>
                                  ) : (
                                    <>
                                      <PiImageThin className="text-gray-400" size={44} />
                                      <p className="text-gray-400">Photo {index + 1}</p>
                                    </>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  {isSubmitting ? (
                    <Button
                      className="w-full shadow-md shadow-gray-200 focus:ring-transparent bg-[#40403F] enabled:hover:bg-[#40403F] outline-none"
                      size="lg"
                      isProcessing
                      processingSpinner={<AiOutlineLoading className="h-6 w-6 animate-spin" />}
                    >
                      Updating Product...
                    </Button>
                  ) : (
                    <Button className="w-full shadow-md shadow-gray-200 focus:ring-transparent bg-[#40403F] enabled:hover:bg-[#777777]" size="lg" type="submit" disabled={isSubmitting}>
                      Update Product
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

export default EditProductModal;
