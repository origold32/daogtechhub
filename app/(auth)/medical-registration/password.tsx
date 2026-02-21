"use client";

import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Password() {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [matchError, setMatchError] = useState(false);

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    setMatchError(password !== value);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <h6 className="text-sm font-semibold">CREATE PASSWORD</h6>

        <div className="flex flex-col space-y-2">
          <label htmlFor="password">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-[#ECECEC] rounded-md p-2 pr-10 w-full"
            />
            <div
              className="absolute top-1/2 right-3 transform -translate-y-1/2 text-[#292D32] cursor-pointer"
              onClick={handleShowPassword}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <label htmlFor="confirm-password">Confirm Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="confirm-password"
              name="confirm-password"
              value={confirmPassword}
              onChange={(e) => handleConfirmPasswordChange(e.target.value)}
              className={`border ${
                matchError ? "border-red-500" : "border-[#ECECEC]"
              } rounded-md p-2 pr-10 w-full`}
            />
            <div
              className="absolute top-1/2 right-3 transform -translate-y-1/2 text-[#292D32] cursor-pointer"
              onClick={handleShowPassword}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </div>
          </div>
          {matchError && (
            <span className="text-xs text-red-500">Passwords do not match</span>
          )}
        </div>
      </div>
    </div>
  );
}
