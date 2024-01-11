import axios from "axios";

// const baseURL = "https://jcwd250402.purwadhikabootcamp.com";
const baseURL = "http://localhost:8000/";

// Interceptor for regular use requests
const regularInterceptor = (config) => {
  // Retrieve the regular use token from local storage
  const regularToken = JSON.parse(localStorage.getItem("profile"))?.data?.token;

  // Attach the regular use token to the Authorization header
  if (regularToken) {
    config.headers.Authorization = `Bearer ${regularToken}`;
  }

  return config;
};

const defaultInstance = axios.create({
  baseURL,
});

// Add the regular use interceptor
defaultInstance.interceptors.request.use(regularInterceptor);

const createAdminInstance = () => {
  const adminInstance = axios.create({
    baseURL,
  });

  adminInstance.interceptors.request.use((config) => {
    const adminToken = JSON.parse(localStorage.getItem("adminProfile"))?.data?.token;

    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }

    return config;
  });

  return adminInstance;
};

const api = {
  // Default instance for regular use
  ...defaultInstance,

  // Admin-specific instance
  admin: createAdminInstance(),
};

export default api;