import "../App.css";
import React, { useState } from "react";
import parkitechlogo from "../assets/parkitechlogo.png";
import { useNavigate } from "react-router-dom";

// Firebase imports for authentication
/* Firebase, 2026 */
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../config/firebase";

export const Register: React.FC = () => {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Password requirements 
  const passwordRequirements = {
    minLength: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>[\]\\/'`~;_+=-]/.test(password),
  };

  // Password is valid only when ALL requirements are met 
  const isPasswordValid =
    passwordRequirements.minLength &&
    passwordRequirements.uppercase &&
    passwordRequirements.lowercase &&
    passwordRequirements.number &&
    passwordRequirements.special;

  // Confirm password is valid only when it matches the password 
  const isConfirmPasswordValid =
    confirmPassword.length > 0 &&
    password === confirmPassword &&
    isPasswordValid;

  // Handles registration and authentication
  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    // Check that all fields have been completed
    if (!fullName || !username || !password || !confirmPassword) {
      setError("Please complete all fields.");
      return;
    }

    // Check password requirements 
    if (!isPasswordValid) {
      setError("Password does not meet all the required security requirements.");
      return;
    }

    // Check that passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      /* Firebase, 2026 */
      // Creates a new Firebase user account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        username,
        password
      );

      const user = userCredential.user;
      //Saves the user's name to their firebase account
      await updateProfile(user, {
        displayName: fullName.trim(),
      });

      console.log("Registration successful:", user);

      // Navigate to dashboard after successful registration
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Registration error:", error);

      // Firebase error handling
      if (error.code === "auth/email-already-in-use") {
        setError("An account with this email already exists.");
      } else if (error.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (error.code === "auth/weak-password") {
        setError("Password is too weak. Please choose a stronger password.");
      } else {
        setError("Registration failed. Please try again.");
      }
    }
  };

  return (
    <main className="login-page">
      <div className="login-card">

        {/* Logo */}
        <div className="login-brand">
          <div className="login-brand-mark">
            <img src={parkitechlogo} alt="Parkitech" />
          </div>

          <div>
            <strong>Parkitech</strong>
            <span>Security Dashboard</span>
          </div>
        </div>

        {/* Heading */}
        <div className="login-heading">
          <h1>Register</h1>
          <p>Create an account to access the parking dashboard</p>
        </div>

        <hr />

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="login-form">

          {/* Full Name */}
          <div className="login-field">

            <label htmlFor="fullName">
              Full Name

              {fullName && (
                <i
                  className="fa fa-check login-check"
                  aria-hidden="true"
                />
              )}
            </label>

            <input
              id="fullName"
              className="login-input"
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              autoComplete="name"
              placeholder="Enter your full name"
            />

          </div>

          {/* Username / Email */}
          <div className="login-field">
            <label htmlFor="username">
              Email
              {username && (
                <i
                  className="fa fa-check login-check"
                  aria-hidden="true"
                />
              )}
            </label>

            <input
              id="username"
              className="login-input"
              type="email"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="email"
              placeholder="Enter your email"
            />
          </div>

          {/* Password */}
          <div className="login-field">
            <label htmlFor="password">
              Password
              {isPasswordValid && (
                <i
                  className="fa fa-check login-check"
                  aria-hidden="true"
                />
              )}
            </label>

            <div className="password-input-container">
              <input
                id="password"
                className="login-input"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                placeholder="Enter your password"
              />

              {/* Show password while button is held (W3Schools, 2026).*/}
              <button
                type="button"
                className="password-toggle"
                onMouseDown={() => setShowPassword(true)}
                onMouseUp={() => setShowPassword(false)}
                onMouseLeave={() => setShowPassword(false)}
                onTouchStart={() => setShowPassword(true)}
                onTouchEnd={() => setShowPassword(false)}
                aria-label="Hold to show password"
              >
                <i
                  className="fa fa-eye"
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>

          {/* Password requirements */}
          {password.length > 0 && (
            <div className="password-requirements">
              <p>Password requirements:</p>

              <div
                className={
                  passwordRequirements.minLength
                    ? "requirement requirement-valid"
                    : "requirement"
                }
              >
                <span className="requirement">
                  {passwordRequirements.minLength ? (
                    <i className="fa fa-check login-check" aria-hidden="true" />
                  ) : (
                    "•"
                  )}
                </span>

                <span>At least 8 characters</span>
              </div>

              <div
                className={
                  passwordRequirements.uppercase
                    ? "requirement requirement-valid"
                    : "requirement"
                }
              >
                <span className="requirement-icon">
                  {passwordRequirements.uppercase ? (
                    <i className="fa fa-check login-check" aria-hidden="true" />
                  ) : (
                    "•"
                  )}
                </span>
                <span>One uppercase letter</span>
              </div>

              <div
                className={
                  passwordRequirements.lowercase
                    ? "requirement requirement-valid"
                    : "requirement"
                }
              >
                <span className="requirement-icon">
                  {passwordRequirements.lowercase ? (
                    <i className="fa fa-check login-check" aria-hidden="true" />
                  ) : (
                    "•"
                  )}
                </span>
                <span>One lowercase letter</span>
              </div>

              <div
                className={
                  passwordRequirements.number
                    ? "requirement requirement-valid"
                    : "requirement"
                }
              >
                <span className="requirement-icon">
                  {passwordRequirements.number ? (
                    <i className="fa fa-check login-check" aria-hidden="true" />
                  ) : (
                    "•"
                  )}
                </span>
                <span>One number</span>
              </div>

              <div
                className={
                  passwordRequirements.special
                    ? "requirement requirement-valid"
                    : "requirement"
                }
              >
                <span className="requirement-icon">
                  {passwordRequirements.special ? (
                    <i className="fa fa-check login-check" aria-hidden="true" />
                  ) : (
                    "•"
                  )}
                </span>
                <span>One special character</span>
              </div>
            </div>
          )}

          {/* Confirm Password */}
          <div className="login-field">
            <label htmlFor="confirmPassword">
              Confirm Password

              {/* Show checkmark when passwords match */}
              {isConfirmPasswordValid && (
                <i
                  className="fa fa-check login-check"
                  aria-hidden="true"
                />
              )}
            </label>

            <div className="password-input-container">
              <input
                id="confirmPassword"
                className="login-input"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                autoComplete="new-password"
                placeholder="Confirm your password"
              />
              <button
                type="button"
                className="password-toggle"
                onMouseDown={() => setShowConfirmPassword(true)}
                onMouseUp={() => setShowConfirmPassword(false)}
                onMouseLeave={() => setShowConfirmPassword(false)}
                onTouchStart={() => setShowConfirmPassword(true)}
                onTouchEnd={() => setShowConfirmPassword(false)}
                aria-label="Hold to show password"
              >
                <i
                  className="fa fa-eye"
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}

          <hr />

          {/* Register button (Rudderz243, 2026).*/}
          <button
            className="login-button"
            type="submit"
            disabled={!fullName || !username || !password || !confirmPassword}
          >
            REGISTER
          </button>
        </form>

        {/* Login link */}
        <p className="login-footer">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Log In
          </button>
        </p>

      </div>
    </main>
  );
};

export default Register;
/* References
Firebase, 2026. Get Started with Firebase Authentication in React Native. [source code] Available: <https://firebase.google.com/docs/auth/web/start> [Accessed 30 August. 2026].
Rudderz243, 2026. Frontend tsx. [source code] Available: <http://github.com/rudderz243/insy7314-library/blob/master/frontend/src/pages/BookPage.tsx> [Accessed 12 August. 2026].
W3Schools, 2026. onmouseup Event. (Version 2.0) [Source code] Available at: < https://www.w3schools.com/jsref/event_onmouseup.asp > [Accessed 27 August. 2026].
*/