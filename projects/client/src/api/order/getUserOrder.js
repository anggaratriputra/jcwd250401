import api from "../../api"

const getUserOrder = async ({ userId, status,page, size, sort, order } = {}) => {
    try {
        const url = `/order/${userId}` +
        (status ? `?status=${status}` : "") +
        (page ? `&page=${page}` : "") +
        (size ? `&size=${size}` : "") +
        (sort ? `&sort=${sort}` : "") +
        (order ? `&order=${order}` : "");
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error("Error in getUserOrder:", error);
        throw error;
    }
}

export default getUserOrder