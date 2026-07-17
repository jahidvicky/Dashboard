import React, { useState, useContext } from "react";
import { AuthContext } from "../../authContext/AuthContext";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import API from "../../API/Api";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import logo from "../../assets/image/logo.png";
import girl2 from "../../assets/image/girl2.jpg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [passwordVisible, setPasswordVisible] = useState(false);

  // Forgot password states
  const [step, setStep] = useState(0);
  const [resetEmail, setResetEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [loginLoading, setLoginLoading] = useState(false);
  const [otpSendLoading, setOtpSendLoading] = useState(false);
  const [otpVerifyLoading, setOtpVerifyLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleClick = () => setPasswordVisible(!passwordVisible);

  const Toast = Swal.mixin({
    toast: true,
    position: "top-right",
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
  });

  // Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const success = await login(email.trim(), password);

      if (success) {
        Toast.fire({ icon: "success", title: "Login successful!" });
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser?.role === "admin") navigate("/admin/home");
        if (storedUser?.role === "vendor") navigate("/vendor/home");
        if (storedUser?.role === "company") navigate("/company/home");
      } else {
        Toast.fire({ icon: "error", title: "Invalid email or password" });
      }
    } finally {
      setLoginLoading(false);
    }
  };

  // Step 1: Request OTP
  const sendOtp = async () => {
    setOtpSendLoading(true);
    try {
      await API.post("/auth/send-otp", { email: resetEmail });
      Toast.fire({ icon: "success", title: "OTP sent to email!" });
      setStep(2); // Move to OTP input
    } catch (err) {
      Toast.fire({
        icon: "error",
        title: err.response?.data?.message || "Failed to send OTP",
      });
    } finally {
      setOtpSendLoading(false);
    }
  };

  // Step 2: Verify OTP
  const verifyOtp = async () => {
    setOtpVerifyLoading(true);
    try {
      await API.post("/auth/verify-otp", { email: resetEmail, otp });
      Toast.fire({ icon: "success", title: "OTP verified!" });
      setStep(3); // Move to reset password
    } catch (err) {
      Toast.fire({ icon: "error", title: "Invalid OTP" });
    } finally {
      setOtpVerifyLoading(false);
    }
  };

  // Step 3: Reset Password
  const resetPassword = async () => {
    setResetLoading(true);
    try {
      await API.post("/auth/reset-password", { email: resetEmail, newPassword });
      Toast.fire({ icon: "success", title: "Password reset successfully!" });
      // Reset all states and go back to login
      setStep(0);
      setResetEmail("");
      setOtp("");
      setNewPassword("");
    } catch (err) {
      Toast.fire({ icon: "error", title: "Failed to reset password" });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-r from-gray-300 via-white to-gray-300">
      <div className="mb-4 mt-4 flex max-w-6xl flex-col sm:mx-2 xl:flex-row">
        {/* Left Side */}
        <div className="w-full bg-[#d7e0dd] shadow-2xl xl:w-2/3 xl:rounded-bl-2xl xl:rounded-tl-2xl">
          <div className="m-10 max-w-5xl">
            <form className="backdrop-blur-md p-6 rounded-lg shadow-md w-full">
              <img src={logo} loading="lazy" alt="logo" className="w-[150px] mb-6" />
              <div className="text-3xl font-bold mb-4 text-center">Welcome</div>

              {/* ===== Login Form ===== */}
              {step === 0 && (
                <>
                  {/* Email */}
                  <label className="text-xl mb-1 block">
                    Email <span className="text-[#f00000]">*</span>
                  </label>
                  <input
                    type="email"
                    className="w-full appearance-none rounded border px-3 py-2 pr-10 shadow focus:bg-slate-50 focus:shadow focus:outline-none focus:border-red-500 mb-4"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />

                  {/* Password */}
                  <label className="text-xl mb-1 block">
                    Password <span className="text-[#f00000]">*</span>
                  </label>
                  <div className="relative mb-6">
                    <input
                      type={passwordVisible ? "text" : "password"}
                      className="w-full appearance-none rounded border mb-2 px-3 py-2 pr-10 shadow focus:bg-slate-50 focus:shadow focus:outline-none focus:border-red-500"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-2 text-gray-400 hover:text-gray-700"
                      onClick={handleClick}
                    >
                      {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 text-xl font-semibold mb-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    onClick={handleSubmit}
                  >
                    {loginLoading && (
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                    )}
                    {loginLoading ? "Logging in..." : "Login"}
                  </button>

                  <p
                    className="text-[#f00000] cursor-pointer text-center hover:underline"
                    onClick={() => setStep(1)}
                  >
                    Forgot Password?
                  </p>
                </>
              )}

              {/* ===== Forgot Password Form ===== */}
              {step > 0 && (
                <>
                  {step === 1 && (
                    <>
                      <h2 className="text-2xl font-bold mb-4 text-center">Forgot Password</h2>
                      <input
                        type="email"
                        placeholder="Enter your email"
                        className="w-full border rounded px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                      />
                      <button
                        type="button"
                        disabled={otpSendLoading}
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition mb-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        onClick={sendOtp}
                      >
                        {otpSendLoading && (
                          <svg
                            className="animate-spin h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                          </svg>
                        )}
                        {otpSendLoading ? "Sending..." : "Send OTP"}
                      </button>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <h2 className="text-2xl font-bold mb-4 text-center">Enter OTP</h2>
                      <input
                        type="text"
                        placeholder="Enter OTP"
                        className="w-full border rounded px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                      />
                      <button
                        type="button"
                        disabled={otpVerifyLoading}
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition mb-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        onClick={verifyOtp}
                      >
                        {otpVerifyLoading && (
                          <svg
                            className="animate-spin h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                          </svg>
                        )}
                        {otpVerifyLoading ? "Verifying..." : "Verify OTP"}
                      </button>
                    </>
                  )}

                  {step === 3 && (
                    <>
                      <h2 className="text-2xl font-bold mb-4 text-center">Reset Password</h2>
                      <input
                        type="password"
                        placeholder="Enter new password"
                        className="w-full border rounded px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        disabled={resetLoading}
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition mb-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        onClick={resetPassword}
                      >
                        {resetLoading && (
                          <svg
                            className="animate-spin h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                          </svg>
                        )}
                        {resetLoading ? "Resetting..." : "Reset Password"}
                      </button>
                    </>
                  )}

                  <p
                    className="text-[#f00000] mt-2 cursor-pointer text-center hover:underline"
                    onClick={() => setStep(0)}
                  >
                    Cancel
                  </p>
                </>
              )}
            </form>
          </div>
        </div>

        {/* Right Side */}
        <div className="w-full bg-white shadow-2xl xl:w-auto xl:rounded-br-2xl xl:rounded-tr-2xl">
          <img
            src={girl2}
            loading="lazy"
            decoding="async"
            alt="frame"
            className="hidden w-full object-cover xl:block xl:w-[500px] xl:rounded-br-2xl xl:rounded-tr-2xl h-full"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;

