"use client";

import { useState, useEffect } from "react";

export default function PasswordStrengthComponent({
  password
}: {
  password: string;
}) {
  const [passwordChecks, setPasswordChecks] = useState({
    minLength: false,
    hasLowercase: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  useEffect(() => {
    setPasswordChecks({
      minLength: password.length >= 8,
      hasLowercase: /[a-z]/.test(password),
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  }, [password]);

  return (
    <ul className="text-sm -mt-2 space-y-1">
      <li className={passwordChecks.minLength ? "text-green-500" : "text-zinc-400"}>
        {passwordChecks.minLength ? "✔" : "✖"} Password must be at least 8 characters long
      </li>
      <li className={passwordChecks.hasLowercase ? "text-green-500" : "text-zinc-400"}>
        {passwordChecks.hasLowercase ? "✔" : "✖"} Password must contain at least one lowercase letter
      </li>
      <li className={passwordChecks.hasUppercase ? "text-green-500" : "text-zinc-400"}>
        {passwordChecks.hasUppercase ? "✔" : "✖"} Password must contain at least one uppercase letter
      </li>
      <li className={passwordChecks.hasNumber ? "text-green-500" : "text-zinc-400"}>
        {passwordChecks.hasNumber ? "✔" : "✖"} Password must contain at least one number
      </li>
      <li className={passwordChecks.hasSpecialChar ? "text-green-500" : "text-zinc-400"}>
        {passwordChecks.hasSpecialChar ? "✔" : "✖"} Password must contain at least one special character
      </li>
    </ul>
  );
};