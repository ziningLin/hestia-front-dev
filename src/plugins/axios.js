import axios from "axios";

const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 10000,
});

instance.interceptors.response.use(function (response) {
    return response;
}, function (error) {
    if (error.response && error.response.status && error.response.status == 403) {
        window.location.href = "/403";
    }
    return Promise.reject(error);
}
);
// 攜帶 cookie
instance.defaults.withCredentials = true;
export default instance;
