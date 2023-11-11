import { Link } from "react-router-dom";
import { NavPage } from "../components/NavPage";
import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import api from "../api";
import { toast } from "sonner";
import { AddAddressModal } from "../components/AddAddressModal";
import { ConfirmModal } from "../components/ConfirmModal";
import { EditAddressModal } from "../components/EditAddressModal";
import { addAddress } from "../slices/addressSlices";
import { BsFillPinAngleFill } from "react-icons/bs";

export const Address = () => {
  const isLogin = useSelector((state) => state?.account?.isLogin);
  const username = useSelector((state) => state?.account?.profile?.data?.profile?.username);
  const listsMenu = ["Profile", "Address Book", "My Order", "Change my password"];
  const [addressForm, setAddressForm] = useState(false);
  const [provinceLists, setProvinceLists] = useState([]);
  const [cityLists, setCityLists] = useState([]);
  const [userData, setUserData] = useState(null);
  const [userAddressLists, setUserAddressLists] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const defaultAddress = userAddressLists.find((address) => address.setAsDefault);
  const dispatch = useDispatch();

  const userId = userData?.id;
  const addressLists = useSelector((state) => state?.address?.addressLists);

  const handleRegisterAddressBtn = () => setAddressForm(!addressForm);
  const handleAddAddress = () => setOpenModal(!openModal);
  const handleConfirmModal = (address) => {
    setSelectedAddress(address);
    setConfirmModal(true);
  };
  const handleEditModal = (address) => {
    setSelectedAddress(address);
    setEditModal(true);
  };
  const handleCloseEditModal = () => {
    setSelectedAddress(null);
    setEditModal(false);
  }

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      street: "",
      province: "",
      city: "",
      district: "",
      subDistrict: "",
      phoneNumber: 0,
      setAsDefault: false,
    },
    validationSchema: yup.object({
      firstName: yup.string().required("First name is required"),
      lastName: yup.string().required("Last name is required"),
      street: yup.string().required("Street address is required"),
      province: yup.string().required("Province is required"),
      city: yup.string().required("City is required"),
      district: yup.string().required("District is required"),
      subDistrict: yup.string().required("Sub District is required"),
      phoneNumber: yup.number().min(8, "Phone number must be at least 8 characters").required("Phone number is required"),
    }),
    onSubmit: async (values) => {
      try {
        const response = await api.post(`/address/${userId}`, {
          street: values.street,
          firstName: values.firstName,
          lastName: values.lastName,
          province: values.province,
          city: values.city,
          district: values.district,
          subDistrict: values.subDistrict,
          phoneNumber: values.phoneNumber.toString(),
          setAsDefault: values.setAsDefault,
        });

        if (response.data.ok) {
          toast.success("Register address success");
          dispatch(addAddress(response.data.detail));
          formik.resetForm();
        }
      } catch (error) {
        if (error.response && error.response.status === 400) {
          toast.error("Register address failed");
        } else if (error.response && error.response.status === 500) {
          toast.error("Server error");
          console.error(error);
        }
      }
    },
  });

  useEffect(() => {
    const getProvinceLists = async () => {
      try {
        const response = await api.get("/address/province");
        setProvinceLists(response.data.detail);
      } catch (error) {
        toast.error("Get address lists failed");
      }
    };

    const getCityLists = async () => {
      try {
        const response = await api.get("/address/city");
        setCityLists(response.data.detail);
      } catch (error) {
        toast.error("Get city lists failed");
      }
    };

    const getUsersProfile = async () => {
      try {
        const response = await api.get(`/profile/${username}`);
        setUserData(response.data.detail);

        const responseLists = await api.get(`/address/${response.data.detail.id}`);
        setUserAddressLists(responseLists.data.detail);
      } catch (error) {
        toast.error("Failed to get user data");
      }
    };

    getUsersProfile();
    getProvinceLists();
    getCityLists();
  }, [addressLists]);

  return (
    <>
      <NavPage pageName={"Address Book"} />
      <div className="flex justify-center">
        <div className="h-[70vh] w-[90vw] lg:w-[76vw] flex flex-row overflow-y-hidden">
          <div className="hidden lg:flex flex-col w-[20vw]">
            {listsMenu.map((list, index) => {
              const joinedList = list.toLowerCase().replace(/\s/g, "-");
              return (
                <Link key={index} to={`/account/${joinedList}`} className="block py-2 text-sm text-gray-700 hover:underline">
                  {list}
                </Link>
              );
            })}
          </div>

          {isLogin ? (
            <>
              {userAddressLists.length > 0 ? (
                <div className="w-[90vw] h-[70vh] lg:w-[53vw] lg:h-[70vh] rounded-lg shadow-md flex flex-col px-5 border overflow-y-auto">
                  <h1 className="font-bold text-2xl mt-5">Address Book</h1>
                  <p className="text-sm text-gray-600 mt-2">
                    Disclaimer: We are able to serve home delivery service and Cash On Delivery (COD) except in very limited areas. Any order placed on out of service area will be cancelled automatically.
                  </p>

                  <div className="border border-gray-300 rounded-lg p-5 mt-5">
                    <h1 className="font-bold text-2xl">Register a New Address</h1>
                    <button className="w-[55vw] sm:w-[45vw] lg:w-[15vw] px-2 h-[7vh] mt-2 border bg-[#40403F] hover:bg-[#555554] text-white rounded-md font-semibold" onClick={handleAddAddress}>
                      Register New Address
                    </button>
                  </div>

                  {defaultAddress && (
                    <div className="border border-gray-300 rounded-lg p-5 mt-5">
                      <div className="flex flex-col justify-between">
                        <div className="flex flex-row">
                          <div className="w-[30%]">
                            <p className="text-md text-gray-600">{`${defaultAddress.firstName.charAt(0).toUpperCase()}${defaultAddress.firstName.slice(1)} ${defaultAddress.lastName.charAt(0).toUpperCase()}${defaultAddress.lastName.slice(
                              1
                            )}`}</p>
                          </div>

                          <div className="w-[70%] flex">
                            <p className="text-md text-gray-600">{`${defaultAddress.street.charAt(0).toUpperCase()}${defaultAddress.street.slice(1)}, ${defaultAddress.district}, ${defaultAddress.subDistrict}, ${defaultAddress.city}, ${
                              defaultAddress.province
                            }, ${defaultAddress.phoneNumber}`}</p>
                          </div>
                        </div>
                        <div className="flex justify-between mt-2">
                          <div className="flex gap-2">
                            <button className="w-[20vw] md:w-[10vw] h-[5vh] border border-gray-300 hover:bg-gray-100 rounded-md font-semibold" onClick={() => handleEditModal(defaultAddress)}>
                              Edit
                            </button>
                            <button className="w-[20vw] md:w-[10vw] h-[5vh] border border-gray-300 hover:bg-gray-100 rounded-md font-semibold" onClick={() => handleConfirmModal(defaultAddress)}>
                              Delete
                            </button>
                          </div>
                          <BsFillPinAngleFill className="text-2xl text-gray-500" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col mt-5">
                    {userAddressLists
                      .filter((address) => !address.setAsDefault)
                      .map((address, index) => (
                        <div key={index}>
                          <div className="flex flex-col rounded-lg p-5 mb-5 shadow-md">
                            <div className="flex flex-col justify-between">
                              <div className="flex flex-row">
                                <div className="w-[30%]">
                                  <p className="text-md text-gray-600">{`${address.firstName.charAt(0).toUpperCase()}${address.firstName.slice(1)} ${address.lastName.charAt(0).toUpperCase()}${address.lastName.slice(1)}`}</p>
                                </div>

                                <div className="w-[70%] flex">
                                  <p className="text-md text-gray-600">{`${address.street.charAt(0).toUpperCase()}${address.street.slice(1)}, ${address.district}, ${address.subDistrict}, ${address.city}, ${address.province}, ${
                                    address.phoneNumber
                                  }`}</p>
                                </div>
                              </div>
                              <div className="flex gap-2 mt-2">
                                <button className="w-[20vw] md:w-[10vw] h-[5vh] border border-gray-300 hover:bg-gray-100 rounded-md font-semibold" onClick={() => handleEditModal(address)}>
                                  Edit
                                </button>
                                <button className="w-[20vw] md:w-[10vw] h-[5vh] border border-gray-300 hover:bg-gray-100 rounded-md font-semibold" onClick={() => handleConfirmModal(address)}>
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    <ConfirmModal isOpen={confirmModal} onClose={() => setConfirmModal(!confirmModal)} addressData={selectedAddress} userId={userId} />
                    {selectedAddress && <EditAddressModal isOpen={editModal} onClose={handleCloseEditModal} addressData={selectedAddress} userId={userId} cityLists={cityLists} provinceLists={provinceLists} />}
                  </div>
                </div>
              ) : (
                <>
                  {addressForm ? (
                    <div className="w-[90vw] h-[70vh] lg:w-[53vw] lg:h-[70vh] rounded-lg shadow-md flex flex-col px-5 border overflow-y-auto">
                      <h1 className="font-bold text-2xl mt-5">Register a New Address</h1>
                      <p className="text-sm text-gray-600 mt-2">
                        Disclaimer: We are able to serve home delivery service and Cash On Delivery (COD) except in very limited areas. Any order placed on out of service area will be cancelled automatically.
                      </p>
                      <form onSubmit={formik.handleSubmit}>
                        <div className="flex flex-row items-center mt-5 w-full">
                          <label htmlFor="firstName" className="text-md text-gray-600 w-[35%] font-semibold cursor-pointer">
                            First Name <span className="text-red-500">*</span>
                          </label>

                          <div className="w-[55%] sm:w-[65%]">
                            <input
                              type="text"
                              id="firstName"
                              name="firstName"
                              placeholder="Enter your first name"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:border-gray-500"
                              {...formik.getFieldProps("firstName")}
                            />
                            {formik.touched.firstName && formik.errors.firstName ? <div className="text-red-500">{formik.errors.firstName}</div> : null}
                          </div>
                        </div>

                        <div className="flex flex-row items-center mt-5">
                          <label htmlFor="lastName" className="text-md text-gray-600 w-[35%] font-semibold cursor-pointer">
                            Last Name <span className="text-red-500">*</span>
                          </label>

                          <div className="w-[55%] sm:w-[65%]">
                            <input
                              type="text"
                              id="lastName"
                              name="lastName"
                              placeholder="Enter your last name"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:border-gray-500"
                              {...formik.getFieldProps("lastName")}
                            />
                            {formik.touched.lastName && formik.errors.lastName ? <div className="text-red-500">{formik.errors.lastName}</div> : null}
                          </div>
                        </div>

                        <div className="flex flex-row items-center mt-5">
                          <label htmlFor="street" className="text-md text-gray-600 w-[35%] font-semibold cursor-pointer">
                            Street / Address Detail <span className="text-red-500">*</span>
                          </label>

                          <div className="w-[55%] sm:w-[65%]">
                            <input
                              type="text"
                              id="street"
                              name="street"
                              placeholder="Enter your street or address detail"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:border-gray-500"
                              {...formik.getFieldProps("street")}
                            />
                            {formik.touched.street && formik.errors.street ? <div className="text-red-500">{formik.errors.street}</div> : null}
                          </div>
                        </div>

                        <div className="flex flex-row items-center mt-5">
                          <label htmlFor="province" className="text-md text-gray-600 w-[35%] font-semibold">
                            Province <span className="text-red-500">*</span>
                          </label>

                          <div className="w-[55%] sm:w-[65%]">
                            <select name="province" id="province" className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:border-gray-500 cursor-pointer" {...formik.getFieldProps("province")}>
                              {provinceLists.map((province, index) => (
                                <option key={index} value={province.province}>
                                  {province.province}
                                </option>
                              ))}
                            </select>
                            {formik.touched.province && formik.errors.province ? <div className="text-red-500">{formik.errors.province}</div> : null}
                          </div>
                        </div>

                        <div className="flex flex-row items-center mt-5">
                          <label htmlFor="city" className="text-md text-gray-600 w-[35%] font-semibold">
                            City <span className="text-red-500">*</span>
                          </label>

                          <div className="w-[55%] sm:w-[65%]">
                            <select name="city" id="city" className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:border-gray-500 cursor-pointer" {...formik.getFieldProps("city")}>
                              {cityLists.map((city, index) => (
                                <option key={index} value={city.city_name}>
                                  {city.city_name}
                                </option>
                              ))}
                            </select>
                            {formik.touched.city && formik.errors.city ? <div className="text-red-500">{formik.errors.city}</div> : null}
                          </div>
                        </div>

                        <div className="flex flex-row items-center mt-5">
                          <label htmlFor="district" className="text-md text-gray-600 w-[35%] font-semibold cursor-pointer">
                            District <span className="text-red-500">*</span>
                          </label>

                          <div className="w-[55%] sm:w-[65%]">
                            <input
                              type="text"
                              id="district"
                              name="district"
                              placeholder="Enter your district"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:border-gray-500"
                              {...formik.getFieldProps("district")}
                            />
                            {formik.touched.district && formik.errors.district ? <div className="text-red-500">{formik.errors.district}</div> : null}
                          </div>
                        </div>

                        <div className="flex flex-row items-center mt-5">
                          <label htmlFor="subDistrict" className="text-md text-gray-600 w-[35%] font-semibold cursor-pointer">
                            Sub District <span className="text-red-500">*</span>
                          </label>

                          <div className="w-[55%] sm:w-[65%]">
                            <input
                              type="text"
                              id="subDistrict"
                              name="subDistrict"
                              placeholder="Enter your Sub District"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:border-gray-500"
                              {...formik.getFieldProps("subDistrict")}
                            />
                            {formik.touched.subDistrict && formik.errors.subDistrict ? <div className="text-red-500">{formik.errors.subDistrict}</div> : null}
                          </div>
                        </div>

                        <div className="flex flex-row items-center mt-5">
                          <label htmlFor="phoneNumber" className="text-md text-gray-600 w-[35%] font-semibold cursor-pointer">
                            Phone Number <span className="text-red-500">*</span>
                          </label>

                          <div className="w-[55%] sm:w-[65%]">
                            <input
                              type="number"
                              id="phoneNumber"
                              name="phoneNumber"
                              placeholder="Enter your phone number"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:border-gray-500"
                              {...formik.getFieldProps("phoneNumber")}
                            />
                            {formik.touched.phoneNumber && formik.errors.phoneNumber ? <div className="text-red-500">{formik.errors.phoneNumber}</div> : null}
                          </div>
                        </div>

                        <div className="flex flex-row items-center mt-5">
                          <label htmlFor="setAsDefault" className="text-md text-gray-600 w-[35%] font-semibold cursor-pointer">
                            Set as default address
                          </label>
                          <input type="checkbox" name="setAsDefault" className="w-[5%] h-[5vh] px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:border-gray-500" />
                        </div>

                        <div className="flex flex-row items-center mt-5">
                          <button type="submit" className="w-[25%] sm:w-[35%] h-[7vh] border bg-[#40403F] hover:bg-[#555554] text-white rounded-md font-semibold mb-3">
                            Register
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div className="w-[80vw] lg:w-[53vw] h-[30vh] rounded-lg shadow-md flex flex-col justify-evenly p-5 border">
                      <h1 className="font-bold text-2xl">Address Book</h1>
                      <p className="text-sm text-gray-500">Currently there is not address yet to destine. Register new address please.</p>
                      <button className="w-[55vw] sm:w-[45vw] lg:w-[15vw] px-2 h-[7vh] mt-2 border bg-[#40403F] hover:bg-[#555554] text-white rounded-md font-semibold" onClick={handleRegisterAddressBtn}>
                        Register New Address
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full">
              <p className="text-lg text-gray-500">You are not logged in.</p>
            </div>
          )}
        </div>
      </div>
      <AddAddressModal isOpen={openModal} onClose={handleAddAddress} />
    </>
  );
};
