import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, Text } from "@chakra-ui/react";
import { useFormik } from "formik";
import * as yup from "yup";
import { toast } from "sonner";
import api from "../api";
import updateCategory from "../api/categories/updateCategory";

export const EditCategoryModal = ({ isOpen, onClose, data, mainCategories }) => {
  const categories = mainCategories;

  const handleCategoryChange = (e) => {
    const selectedValue = e.target.value;
    formik.setFieldValue("mainCategory", selectedValue);
  };

  const formik = useFormik({
    initialValues: {
      name: data?.name,
      mainCategory: "",
    },
    validationSchema: yup.object({
      name: yup.string().required("Please enter your category name"),
      mainCategory: yup.string().required("Please select the main category"),
    }),
    onSubmit: async (values) => {
      try {
        const response = await updateCategory({
          id: data?.id,
          name: values.name,
          mainCategory: values.mainCategory,
        })

        if (response.ok) {
          toast.success(response.message, {
            duration: 1000,
            autoClose: 500,
            description: response.detail,
            onAutoClose: () => {
              formik.resetForm();
              onClose();
            }
          });
        }
      } catch (error) {
        if (error.response && (error.response.status === 400 || error.response.status === 403)) {
          toast.error(error.response.data.message, {
            description: error.response.data.detail,
          });
        } else if (error.response && error.response.status === 500) {
          toast.error(error.response.data.message, {
            description: error.response.data.detail,
          });
          console.error("Internal Server Error: Something went wrong");
        }
      }
    },
  });

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="xl" motionPreset="slideInBottom" isCentered>
        <ModalContent boxShadow="md" bgColor="white" px={4} py={2}>
          <ModalHeader>
            <Text fontWeight="bold">Edit Category</Text>
          </ModalHeader>
          <ModalCloseButton textColor="white" />
          <form onSubmit={formik.handleSubmit}>
            <ModalBody>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="name">
                    Category Name
                  </label>
                  <input type="text" name="name" id="name" className="border border-black rounded-md p-2" placeholder="Category Name" {...formik.getFieldProps("name")} />
                  {formik.errors.name && formik.touched.name && <p className="text-red-500">{formik.errors.name}</p>}
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="mainCategory">
                    Main Category
                  </label>
                  <select name="mainCategory" id="mainCategory" className="border border-black rounded-md p-2" {...formik.getFieldProps("mainCategory")} onChange={handleCategoryChange}>
                    <option value="">Select a main category</option>
                    {categories?.map((category, index) => (
                      <option key={index} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {formik.errors.mainCategory && formik.touched.mainCategory && <p className="text-red-500">{formik.errors.mainCategory}</p>}
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <button className="bg-slate-900 hover:bg-slate-700 text-white w-20 p-2 rounded-md mr-2" onClick={onClose}>
                Cancel
              </button>
              <button className="bg-red-700 hover:bg-red-800 p-2 text-white w-20 rounded-md" type="submit">
                Save
              </button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
};
