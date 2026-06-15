import axios from "axios";

const API = axios.create({
    baseURL: "https://hotel-booking-system-production-417e.up.railway.app/api",
});

// Automatically inject JWT token into authorization header
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Automatically logout and redirect if API returns 401 Unauthorized
API.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem("token");
            alert("Sesi Anda tidak valid atau telah berakhir. Silakan login kembali.");
            
            // Check if current path is customer-related or admin-related
            const isCustomerRoute = 
                window.location.pathname === "/" || 
                window.location.pathname.startsWith("/rooms-list") ||
                window.location.pathname.startsWith("/about") ||
                window.location.pathname.startsWith("/history") ||
                window.location.pathname.startsWith("/profile") ||
                window.location.pathname.startsWith("/customer-");

            if (isCustomerRoute) {
                window.location.href = "/customer-login";
            } else {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default API;