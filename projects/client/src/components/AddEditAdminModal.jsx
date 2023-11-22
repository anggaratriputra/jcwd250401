import api from "../api";
import { useFormik } from "formik";
import * as yup from "yup";
import { toast } from "sonner";
import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text } from "@chakra-ui/react";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export const AddEditAdminModal = ({ isOpen, onClose, data, modalFor }) => {
  const [toggleInput, setToggleInput] = useState(false);

  const handleToggleInput = () => setToggleInput(!toggleInput);
  const formik = useFormik({
    initialValues: {
      username: data?.username,
      email: data?.email,
      role: data?.isWarehouseAdmin,
      password: modalFor === "Create" ? "" : undefined,
      confirmPassword: "",
    },
    validationSchema: yup.object({
      username: yup.string().required("Please enter your username"),
      email: yup.string().required("Please enter your email"),
      role: yup.boolean().required("Please select role"),
      password: modalFor === "Create" ? yup.string().required("Please enter your password") : yup.string(),
      confirmPassword:
        modalFor === "Create"
          ? yup
              .string()
              .oneOf([yup.ref("password"), null], "Passwords must match")
              .required("Please confirm your password")
          : yup.string(),
    }),
    onSubmit: async (values) => {
      try {
        if (modalFor === "Edit") {
          const response = await api.admin.patch(`/users/admin/${data.id}`, {
            username: values.username,
            email: values.email,
            isWarehouseAdmin: values.role,
            password: values.password ? values.password : data?.password,
          });
          if (response.data.ok) {
            toast.success("Update admin success");
            formik.resetForm();
            onClose();
          }
        } else if (modalFor === "Create") {
          const response = await api.admin.post("/users", {
            username: values.username,
            email: values.email,
            isWarehouseAdmin: values.role,
            password: values.password,
          });
          if (response.data.ok) {
            toast.success("Add admin success");
            formik.resetForm();
            onClose();
          }
        }
      } catch (error) {
        if (error.response && (error.response.status === 404 || error.response.status === 500 || error.response.status === 400 || error.response.status === 401 || error.response.status === 403)) {
          toast.error(error.response.data.message, {
            description: error.response.data.detail,
          });
          if (error.response.status === 500) console.error("Internal Server Error: Something went wrong");
        }
      }
    },
  });
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size={"lg"}>
      <ModalOverlay bg="none" backdropFilter="auto" backdropBlur="2px" />
      <ModalContent>
        <ModalHeader>
          <Text fontWeight={"bold"}>{modalFor === "Create" ? "New" : "Edit"} Staff</Text>
        </ModalHeader>
        <ModalCloseButton />
        <form onSubmit={formik.handleSubmit}>
          <ModalBody>
            <div className="flex flex-col gap-4">
              <div className="flex gap-2">
                <label htmlFor="username" className="min-w-[150px] md:min-w-[170px]">
                  Username
                </label>
                <div className="w-full">
                  <input type="text" name="username" id="username" placeholder="Username" {...formik.getFieldProps("username")} className="rounded-md w-full" />
                  {formik.touched.username && formik.errors.username && <p className="text-red-500">{formik.errors.username}</p>}
                </div>
              </div>

              <div className="flex gap-2">
                <label htmlFor="email" className="min-w-[150px] md:min-w-[170px]">
                  Email
                </label>
                <div className="w-full">
                  <input type="text" name="email" id="email" placeholder="Email" {...formik.getFieldProps("email")} className="rounded-md w-full" />
                  {formik.touched.email && formik.errors.email && <p className="text-red-500">{formik.errors.email}</p>}
                </div>
              </div>

              <div className="flex gap-2">
                <label htmlFor="password" className="min-w-[150px] md:min-w-[170px]">
                  Password {modalFor === "Edit" && " (Optional)"}
                </label>
                <div className="relative w-full">
                  <div>
                    <input type={toggleInput ? "text" : "password"} name="password" id="password" placeholder="password" {...formik.getFieldProps("password")} className="rounded-md w-full" />
                    <span className="absolute top-3 right-3 cursor-pointer" onClick={handleToggleInput}>
                      {toggleInput ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                  {formik.touched.password && formik.errors.password && <p className="text-red-500">{formik.errors.password}</p>}
                </div>
              </div>

              {modalFor === "Create" && (
                <div className="flex gap-2">
                  <label htmlFor="confirmPassword" className="min-w-[150px] md:min-w-[170px]">
                    Confirm Password
                  </label>
                  <div className="relative w-full">
                    <div>
                      <input type={toggleInput ? "text" : "password"} name="confirmPassword" id="confirmPassword" placeholder="Confirm Password" {...formik.getFieldProps("confirmPassword")} className="rounded-md w-full" />
                      <span className="absolute top-3 right-3 cursor-pointer" onClick={handleToggleInput}>
                        {toggleInput ? <FaEyeSlash /> : <FaEye />}
                      </span>
                    </div>
                    {formik.touched.confirmPassword && formik.errors.confirmPassword && <p className="text-red-500">{formik.errors.confirmPassword}</p>}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <label htmlFor="role" className="min-w-[150px] md:min-w-[170px]">
                  Role
                </label>
                <div className="w-full">
                  <select name="role" id="role" {...formik.getFieldProps("role")} className="border border-black rounded-md p-2 w-full">
                    <option value={""}>Select Role</option>
                    <option value={1}>Warehouse Admin</option>
                    <option value={0}>Super Admin</option>
                  </select>
                  {formik.touched.role && formik.errors.role && <p className="text-red-500">{formik.errors.role}</p>}
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <button className="border border-[#40403F] text-[#40403F] w-20 p-2 rounded-md mr-2" onClick={onClose}>
              Discard
            </button>
            <button className="bg-[#40403F] hover:bg-[#515150] p-2 text-white w-20 rounded-md" type="submit">
              Save
            </button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};
