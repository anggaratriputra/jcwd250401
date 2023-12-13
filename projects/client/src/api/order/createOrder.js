import api from "../../api";

const createOrder = async ({ shippingCost, productOnCart, warehouseId, addressId, paymentBy } = {}) => {
  try {
    const response = await api.post("/order", { shippingCost, productOnCart, warehouseId, addressId, paymentBy});
    return response.detail;
  } catch (error) {
    console.error("Error in CreateOrder:", error);
    throw error;
  }
};

export default createOrder;
