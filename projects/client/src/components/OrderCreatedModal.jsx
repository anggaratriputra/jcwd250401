import React, { useEffect, useState } from "react";
import { Modal, ModalOverlay, ModalContent, ModalBody, ModalCloseButton, ModalHeader } from "@chakra-ui/react";
import { Button } from "flowbite-react";
import { useNavigate } from "react-router-dom";
import { deleteAllCartItem } from "../slices/cartSlices";
import { useDispatch } from "react-redux";
import { set } from "lodash";
import { Checkmark } from "react-checkmark";
import { PaymentProofModal } from "./PaymentProofModal";

function OrderCreatedModal({ isOpen, onClose, paymentMethod, totalPrice, orderId }) {
  const [paymentProofModalOpen, setPaymentProofModalOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  console.log(orderId);
  const handleDeleteAll = () => {
    dispatch(deleteAllCartItem());
  };

  const handleContinueShopping = () => {
    handleDeleteAll();
    navigate("/");
    onClose();
  };

  const formatToRupiah = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleOpenModalProof = () => {
    setPaymentProofModalOpen(true);
    onClose();
  };


  return (
    <>
      <Modal closeOnOverlayClick={false} isOpen={isOpen} size="md" onClose={handleContinueShopping} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <span className="font-bold">Order Created</span>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <div className="flex flex-col justify-center items-center">
              <Checkmark size="130px" color="#223344" />
              <span className="text-center mt-4 mb-4">Your order has been created</span>
              <span> Please transfer to :</span>
              {paymentMethod === "MANDIRI" && (
                <div className="flex flex-col items-center">
                  <span className="font-bold"> Bank Mandiri 15900039222</span>
                  <span>PT. RAINS INDONESIA Tbk.</span>
                </div>
              )}
              {paymentMethod === "BCA" && (
                <div className="flex flex-col items-center">
                  <span className="font-bold"> Bank Central Asia 122938888022</span>
                  <span>PT. RAINS INDONESIA Tbk.</span>
                </div>
              )}
              {paymentMethod === "BNI" && (
                <div className="flex flex-col items-center">
                  <span className="font-bold"> Bank Negara Indonesia 128273777779</span>
                  <span>PT. RAINS INDONESIA Tbk.</span>
                </div>
              )}
              <div className="flex flex-col items-center mt-2">
                <span className="text-md font-sans"> Payment total : </span>
                <span className="text-lg font-bold font-sans"> {formatToRupiah(totalPrice)}</span>
              </div>
            </div>
            <div className="flex flex-col mt-4 space-y-4">
              <p className="text-sm text-left">
                After your bank transfer payment has been successfully completed, our system will take approximately 2 working day <br /> for verification and confirmation status of your payment.{" "}
              </p>
              <div className="flex flex-col space-y-1">
                <span className="text-xs italic">*Your order will automatically cancelled if not payed within 24 hours or product out of stock.</span>
                <span className="text-xs italic">*You can upload your payment proof later in your order pages.</span>
              </div>
            </div>

            <div className="flex justify-between mt-4 mb-4 gap-4">
              <Button className="w-full border border-gray-500" color="light" size="sm" onClick={handleContinueShopping}>
                Continue Shopping
              </Button>
              <Button className="w-full bg-gray-900 enabled:hover:bg-gray-700" size="sm" onClick={handleOpenModalProof}>
                Upload Payment Proof
              </Button>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
      <PaymentProofModal isOpen={paymentProofModalOpen} onClose={() => setPaymentProofModalOpen(false)} orderId={orderId} />
    </>
  );
}

export default OrderCreatedModal;
