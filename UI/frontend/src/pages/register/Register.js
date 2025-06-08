import React, { useState } from 'react';
import { REGISTER } from '../../api/apiService';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const body = {
      userId: 0,
      firstName,
      lastName,
      mobileNumber,
      email,
      password,
      "roles": [
        {
          "roleId": 102,
          "roleName": "USER"
        }
      ],
      "address": {
        "addressId": 0,
        "street": "string",
        "buildingName": "string",
        "city": "string",
        "state": "string",
        "country": "string",
        "pincode": "string"
      },
      "cart": {
        "cartId": 0,
        "totalPrice": 0,
        "products": [
          {
            "productId": 0,
            "productName": "string",
            "image": "string",
            "description": "string",
            "quantity": 0,
            "price": 0,
            "discount": 0,
            "specialPrice": 0,
            "category": {
              "categoryId": 0,
              "categoryName": "string"
            }
          }
        ]
      }
    };

    try {
      const response = await REGISTER(body);
      if (response) {
        window.alert("Registration successful!");
        navigate("/login"); // Redirect to the login page after successful registration
      } else {
        window.alert("Registration failed");
      }
    } catch (error) {
      window.alert("Registration failed: " + error.message);
    }
  };

  return (
    <section className="section-conten padding-y" style={{ minHeight: "84vh" }}>
      <div className="card mx-auto" style={{ maxWidth: "380px", marginTop: "100px" }}>
        <div className="card-body">
          <h4 className="card-title mb-4">Register</h4>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                name="firstName"
                className="form-control"
                placeholder="First Name"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <input
                name="lastName"
                className="form-control"
                placeholder="Last Name"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <input
                name="mobileNumber"
                className="form-control"
                placeholder="Mobile Number"
type="text"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
              />
            </div>
            <div className="form-group">
              <input
                name="email"
                className="form-control"
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              />
            </div>
            <div className="form-group">
              <button type="submit" className="btn btn-success btn-block"> Sign Up </button>
            </div>
          </form>
        </div>
      </div>
      <p className="text-center mt-4">Already have an account? <a href="/login">Login</a></p>
      <br />
      <br />
    </section>
  );
}

export default Register;