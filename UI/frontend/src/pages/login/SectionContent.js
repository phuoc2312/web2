import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LOGIN } from "../../api/apiService";
import { toast } from "react-toastify";

const SectionContent = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const body = {
            email,
            password,
        };

        try {
            const response = await LOGIN(body);
            if (response && response.data) {
                const token = response.data["jwt-token"];
                if (token) {
                    localStorage.setItem("authToken", token);
                    localStorage.setItem("authEmail", email);

                    // Lấy hoặc khởi tạo cartId
                    try {
                        // Lấy userId từ email
                        const userResponse = await fetch(
                            `http://localhost:8080/api/public/users/email/${encodeURIComponent(email)}`,
                            {
                                method: "GET",
                                headers: {
                                    Accept: "*/*",
                                    Authorization: `Bearer ${token}`,
                                },
                            }
                        );

                        if (!userResponse.ok) {
                            if (userResponse.status === 401) {
                                localStorage.clear();
                                throw new Error("Phiên đăng nhập không hợp lệ");
                            }
                            throw new Error("Không thể lấy thông tin người dùng");
                        }

                        const userData = await userResponse.json();
                        const userId = userData.userId;
                        localStorage.setItem("userId", userId);

                        // Lấy cartId từ backend
                        let cartId = localStorage.getItem("cartId");
                        let isCartValid = false;

                        if (cartId) {
                            const checkCartResponse = await fetch(
                                `http://localhost:8080/api/public/users/${encodeURIComponent(email)}/carts/${cartId}`,
                                {
                                    method: "GET",
                                    headers: {
                                        Accept: "*/*",
                                        Authorization: `Bearer ${token}`,
                                    },
                                }
                            );

                            if (checkCartResponse.ok) {
                                isCartValid = true;
                            }
                        }

                        if (!isCartValid) {
                            const cartResponse = await fetch(
                                `http://localhost:8080/api/public/users/${encodeURIComponent(email)}/cart`,
                                {
                                    method: "GET",
                                    headers: {
                                        Accept: "*/*",
                                        Authorization: `Bearer ${token}`,
                                    },
                                }
                            );

                            if (cartResponse.ok) {
                                const cartData = await cartResponse.json();
                                cartId = cartData.cartId;
                            } else if (cartResponse.status === 404) {
                                // Tạo giỏ hàng mới
                                const createCartResponse = await fetch(
                                    `http://localhost:8080/api/public/users/${encodeURIComponent(email)}/carts`,
                                    {
                                        method: "POST",
                                        headers: {
                                            Accept: "*/*",
                                            Authorization: `Bearer ${token}`,
                                            "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({ userId }),
                                    }
                                );

                                if (!createCartResponse.ok) {
                                    const errorData = await createCartResponse.json();
                                    throw new Error(
                                        `Không thể tạo giỏ hàng: ${errorData.message || createCartResponse.statusText}`
                                    );
                                }

                                const createCartData = await createCartResponse.json();
                                cartId = createCartData.cartId;
                            } else {
                                throw new Error("Không thể lấy giỏ hàng");
                            }
                        }

                        localStorage.setItem("cartId", cartId);

                        window.dispatchEvent(new Event("authChanged"));

                        toast.success("Đăng nhập thành công!", {
                            position: "top-right",
                            autoClose: 3000,
                        });
                        navigate("/Home");
                    } catch (cartError) {
                        console.error("Lỗi khi lấy cartId:", cartError);
                        toast.warn(
                            "Đăng nhập thành công, nhưng không thể lấy cartId: " + cartError.message,
                            {
                                position: "top-right",
                                autoClose: 3000,
                            }
                        );
                        navigate("/Home");
                        window.location.reload();
                    }
                } else {
                    toast.error("Token không được trả về trong phản hồi", {
                        position: "top-right",
                        autoClose: 3000,
                    });
                }
            } else {
                toast.error("Phản hồi đăng nhập thiếu dữ liệu", {
                    position: "top-right",
                    autoClose: 3000,
                });
            }
        } catch (error) {
            toast.error("Đăng nhập thất bại: " + error.message, {
                position: "top-right",
                autoClose: 3000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="section-conten padding-y" style={{ minHeight: "84vh" }}>
            <div className="card mx-auto" style={{ maxWidth: "380px", marginTop: "100px" }}>
                <div className="card-body">
                    <h4 className="card-title mb-4">Sign in</h4>
                    <form onSubmit={handleSubmit}>
                        <a href="#" className="btn btn-facebook btn-block mb-2">
                            <i className="fab fa-facebook-f"></i> Sign in with Facebook
                        </a>
                        <a href="#" className="btn btn-google btn-block mb-4">
                            <i className="fab fa-google"></i> Sign in with Google
                        </a>
                        <div className="form-group">
                            <input
                                name="email"
                                className="form-control"
                                placeholder="Email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        <div className="form-group">
                            <input
                                name="password"
                                className="form-control"
                                placeholder="Password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>

                        <div className="form-group">
                            <a href="#" className="float-right">
                                Forgot password?
                            </a>
                            <label className="float-left custom-control custom-checkbox">
                                <input type="checkbox" className="custom-control-input" defaultChecked />
                                <div className="custom-control-label"> Remember </div>
                            </label>
                        </div>
                        <div className="form-group">
                            <button type="submit" className="btn btn-success btn-block" disabled={isLoading}>
                                {isLoading ? "Đang đăng nhập..." : "Login"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <p className="text-center mt-4">
                Don't have account? <a href="/Register">Sign up</a>
            </p>
            <br />
            <br />
        </section>
    );
};

export default SectionContent;