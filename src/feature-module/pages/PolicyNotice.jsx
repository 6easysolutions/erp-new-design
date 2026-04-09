import React from "react";
import { logo } from "../../utils/imagepath";
import { Link } from "react-router-dom";

const PolicyNotice = () => {
    return (
        <div className="main-wrapper" style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
            <div className="">
                <div className="card border-0 shadow-sm" style={{ borderRadius: "16px", overflow: "hidden" }}>
                    <div className="card-header bg-white border-0 pt-4 px-4 px-md-5 d-flex justify-content-between align-items-center">
                        <img src={logo} alt="Logo" style={{ height: "40px" }} />
                        <Link to="/" className="btn btn-outline-primary btn-sm rounded-pill px-4">Home</Link>
                    </div>
                    <div className="card-body p-4 p-md-5">
                        <h1 className="fw-bold mb-2" style={{ color: "#0f172a" }}>📄 Privacy Policy</h1>
                        <p className="text-muted mb-4">Effective Date:- 20-03-2026</p>
                        
                        <div className="policy-content" style={{ color: "#334155", lineHeight: "1.7" }}>
                            <p className="mb-4">
                                Welcome to our application. Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information when you use our mobile application.
                            </p>

                            <section className="mb-5">
                                <h3 className="fw-bold mb-3 h4" style={{ color: "#1e293b" }}>1. 📌 Information We Collect</h3>
                                <p>We may collect the following types of information:</p>
                                
                                <div className="row g-4 mt-1">
                                    <div className="col-md-4">
                                        <div className="p-3 bg-light rounded-3 h-100">
                                            <h5 className="fw-bold mb-2">👤 Personal Information</h5>
                                            <ul className="ps-3 mb-0">
                                                <li>Name (e.g., user/vendor name)</li>
                                                <li>Email address</li>
                                                <li>Phone number</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="p-3 bg-light rounded-3 h-100">
                                            <h5 className="fw-bold mb-2">📊 Business Data</h5>
                                            <ul className="ps-3 mb-0">
                                                <li>Customer details</li>
                                                <li>Sales and purchase records</li>
                                                <li>Expense and financial data</li>
                                                <li>Product and inventory details</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="p-3 bg-light rounded-3 h-100">
                                            <h5 className="fw-bold mb-2">📱 Device Information</h5>
                                            <ul className="ps-3 mb-0">
                                                <li>Device type</li>
                                                <li>Operating system</li>
                                                <li>App usage data</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="mb-5">
                                <h3 className="fw-bold mb-3 h4" style={{ color: "#1e293b" }}>2. 🔧 How We Use Your Information</h3>
                                <p>We use your information to:</p>
                                <ul className="ps-3">
                                    <li>Manage your business operations (sales, purchases, expenses)</li>
                                    <li>Store and display customer and user data</li>
                                    <li>Generate reports and analytics</li>
                                    <li>Improve app performance and user experience</li>
                                    <li>Provide customer support</li>
                                </ul>
                            </section>

                            <section className="mb-5">
                                <h3 className="fw-bold mb-3 h4" style={{ color: "#1e293b" }}>3. 🔐 Data Security</h3>
                                <p>We take appropriate security measures to protect your data:</p>
                                <ul className="ps-3">
                                    <li>Secure storage of user data</li>
                                    <li>Restricted access to authorised users only</li>
                                    <li>Protection against unauthorised access or disclosure</li>
                                </ul>
                            </section>

                            <section className="mb-5">
                                <h3 className="fw-bold mb-3 h4" style={{ color: "#1e293b" }}>4. 🔄 Data Sharing</h3>
                                <p>We do not sell or rent your personal data. We may share data only:</p>
                                <ul className="ps-3">
                                    <li>If required by law</li>
                                    <li>To protect legal rights</li>
                                    <li>With trusted service providers</li>
                                </ul>
                            </section>

                            <section className="mb-5">
                                <h3 className="fw-bold mb-3 h4" style={{ color: "#1e293b" }}>5. 📥 Data Storage</h3>
                                <p>Your data is stored securely within the app or on secure servers. We retain data only as long as necessary for app functionality.</p>
                            </section>

                            <section className="mb-5">
                                <h3 className="fw-bold mb-3 h4" style={{ color: "#1e293b" }}>6. 👥 User Access & Control</h3>
                                <p>You can:</p>
                                <ul className="ps-3">
                                    <li>Add, edit, or delete customers and users</li>
                                    <li>Manage your business data within the app</li>
                                    <li>Request data deletion (if backend exists)</li>
                                </ul>
                            </section>

                            <section className="mb-5">
                                <h3 className="fw-bold mb-3 h4" style={{ color: "#1e293b" }}>7. 🧒 Children’s Privacy</h3>
                                <p>This app is not intended for children under 13 years. We do not knowingly collect data from children.</p>
                            </section>

                            <section className="mb-5">
                                <h3 className="fw-bold mb-3 h4" style={{ color: "#1e293b" }}>8. 🔄 Updates to This Policy</h3>
                                <p>We may update this Privacy Policy from time to time. Changes will be notified within the app or via updates.</p>
                            </section>

                            <section className="mb-4">
                                <h3 className="fw-bold mb-3 h4" style={{ color: "#1e293b" }}>9. 📞 Contact Us</h3>
                                <p>If you have any questions, contact us:</p>
                                <div className="p-4 rounded-3 border-start border-4 border-primary" style={{ backgroundColor: "#eff6ff" }}>
                                    <p className="mb-1"><strong>Company Name:</strong> IOTRONCS PVT Limited</p>
                                    <p className="mb-1"><strong>Address:</strong> B Block 2005, Indis Onecity, KPHB Colony, Kukatpally, Hyderabad, Telangana, 500072, INDIA</p>
                                    <p className="mb-1"><strong>Email:</strong> info@iotroncs.com</p>
                                    <p className="mb-0"><strong>Phone:</strong> +91 98493 44919</p>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
                <div className="text-center mt-4 text-muted small">
                    &copy; 2026 IOTRONCS PVT Limited. All rights reserved.
                </div>
            </div>
        </div>
    );
};

export default PolicyNotice;
