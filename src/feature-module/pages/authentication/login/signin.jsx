import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { all_routes } from "../../../../routes/all_routes";
import {URLS} from "../../../../Urls"
import {
  appleLogo,
  authentication01,
  facebook,
  googleLogo,
  logo,
  logoWhite,
} from "../../../../utils/imagepath";

const Signin = () => {
  const route = all_routes;
  const navigate = useNavigate();
  
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      navigate("/sales-dashboard");
    }
  }, [navigate]);

  const togglePasswordVisibility = () => {
    setPasswordVisible((prevState) => !prevState);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleRememberMeChange = (e) => {
    setRememberMe(e.target.checked);
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      setError("Email address is required");
      return false;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (!formData.password) {
      setError("Password is required");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(URLS.LogIn, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store authentication data
        localStorage.setItem("authToken", data.token);
        // localStorage.setItem("vendorData", JSON.stringify(data.vendor));
        
        // Store email if remember me is checked
        if (rememberMe) {
          localStorage.setItem("rememberedEmail", formData.email);
        } else {
          localStorage.removeItem("rememberedEmail");
        }

        // Show success message (optional - remove if not needed)
        // You can use a toast notification library here
        console.log("Login successful:", data.message);

        // Redirect to sales dashboard
        navigate("/sales-dashboard");
      } else {
        // Handle API error response
        setError(data.message || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Load remembered email on component mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setFormData((prev) => ({
        ...prev,
        email: rememberedEmail,
      }));
      setRememberMe(true);
    }
  }, []);

  return (
    <>
      {/* Main Wrapper */}
      <div className="main-wrapper">
        <div className="account-content">
          <div className="row login-wrapper m-0">
            <div className="col-lg-7 p-0">
              <div className="login-img">
                <img src={authentication01} alt="img" />
              </div>
            </div>
            <div className="col-lg-5 p-0">
              <div className="login-content">
                <form onSubmit={handleSubmit}>
                  <div className="login-userset">
                    <div className="login-logo logo-normal">
                      <img src={logo} alt="img" />
                    </div>
                    <Link to={route.dashboard} className="login-logo logo-white">
                      <img src={logoWhite} alt="Img" />
                    </Link>
                    <div className="login-userheading">
                      <h3>Sign In</h3>
                      <h4>Access the Admin panel using your email and passcode.</h4>
                    </div>

                    {/* Error Message */}
                    {error && (
                      <div className="alert alert-danger alert-dismissible fade show" role="alert">
                        <i className="ti ti-alert-circle me-2"></i>
                        {error}
                        <button
                          type="button"
                          className="btn-close"
                          onClick={() => setError("")}
                          aria-label="Close"
                        ></button>
                      </div>
                    )}

                    <div className="mb-3">
                      <label className="form-label">Email Address</label>
                      <div className="input-group">
                        <input
                          type="text"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="form-control border-end-0"
                          placeholder="Enter your email"
                          disabled={loading}
                        />
                        <span className="input-group-text border-start-0">
                          <i className="ti ti-mail" />
                        </span>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Password</label>
                      <div className="pass-group">
                        <input
                          type={isPasswordVisible ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="pass-input form-control"
                          placeholder="Enter your password"
                          disabled={loading}
                        />
                        <span
                          className={`ti toggle-password text-gray-9 ${
                            isPasswordVisible ? "ti-eye" : "ti-eye-off"
                          }`}
                          onClick={togglePasswordVisibility}
                          style={{ cursor: "pointer" }}
                        ></span>
                      </div>
                    </div>

                    <div className="form-login authentication-check">
                      <div className="row">
                        <div className="col-6">
                          <div className="custom-control custom-checkbox">
                            <label className="checkboxs ps-4 mb-0 pb-0 line-height-1">
                              <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={handleRememberMeChange}
                                disabled={loading}
                              />
                              <span className="checkmarks" />
                              Remember me
                            </label>
                          </div>
                        </div>
                        <div className="col-6 text-end">
                          <Link className="forgot-link" to={route.forgotPasswordTwo}>
                            Forgot Password?
                          </Link>
                        </div>
                      </div>
                    </div>

                    <div className="form-login">
                      <button
                        type="submit"
                        className="btn btn-login"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Signing In...
                          </>
                        ) : (
                          "Sign In"
                        )}
                      </button>
                    </div>

                    <div className="signinform">
                      <h4>
                        New on our platform?
                        <Link to={route.registerTwo} className="hover-a">
                          {" "}
                          Create an account
                        </Link>
                      </h4>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Main Wrapper */}
    </>
  );
};

export default Signin;
