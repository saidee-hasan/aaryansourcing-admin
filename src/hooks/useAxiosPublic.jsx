import axios from "axios";

const axiosPublic = axios.create({
  baseURL: "https://admin.aaryansourcing.com/api/v1", // Your backend URL
  withCredentials: true, // Important for cookies/auth
  headers: {
    "Content-Type": "application/json",
  },
});

// Add response interceptor for better error handling
axiosPublic.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

function useAxiosPublic() {
  return axiosPublic;
}

export default useAxiosPublic;