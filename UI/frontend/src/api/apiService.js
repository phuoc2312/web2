import axiosInstance from "./axiosConfig";

function callApi(endpoint, method = "GET", body, params) {
    const token = localStorage.getItem("authToken");

    const queryString = new URLSearchParams(params).toString();
    const url = `${endpoint}?${queryString}`;

    const config = {
        method,
        url,
        headers: {
            "Content-Type": "application/json",
            "Authorization": token ? `Bearer ${token}` : undefined,
        },
        data: body ? JSON.stringify(body) : null,
    };

    console.log("callApi url: ", url);
    console.log("callApi token: ", token);

    return axiosInstance(config)
        .then((response) => response.data)
        .catch((error) => {
            console.error("API call error:", error);
            throw error;
        });
}

export function GET_ALL(endpoint, params) {
    return callApi(endpoint, "GET", null, params);
}
export function GET_ID(endpoint, id) {
    return callApi("http://localhost:8080/api/public/" + endpoint + "/" + id, "GET");

}

export function POST_ADD(endpoint, data) {
    return callApi(endpoint, "POST", data);
}
export function PUT_EDIT(endpoint, data) {
    return callApi(endpoint, "PUT", data);
}
export function DELETE_ID(endpoint) {
    return callApi(endpoint, "DELETE");

}

export function LOGIN(body) {
    const API_URL_LOGIN = "http://localhost:8080/api/login";
    return axiosInstance.post(API_URL_LOGIN, body, {
        headers: {
            accept: "*/*",
            "Content-Type": "application/json",
        },
    })
        .then((response) => response)
        .catch((error) => {
            console.log(error);
            throw error;
        });
}
export function REGISTER(body) {
    const API_URL_REGISTER = "http://localhost:8080/api/register";
    return axiosInstance.post(API_URL_REGISTER, body, {
        headers: {
            accept: "*/*",
            "Content-Type": "application/json",
        },
    })
        .then((response) => response.data)
        .catch((error) => {
            console.error("Registration error:", error);
            throw error;
        });
}