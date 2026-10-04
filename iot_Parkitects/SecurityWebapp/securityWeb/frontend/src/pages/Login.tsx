//(rudderz243,2026)
//(Vincent,2016)
import React, { useState } from "react";
import parkitechlogo from "../assets/parkitechlogo.png";
import { useNavigate } from "react-router-dom";


//Firebase imports for authentication
/*Firebase, 2026*/ 
import {signInWithEmailAndPassword} from "firebase/auth"; 
import {auth} from "../config/firebase";


export const Login: React.FC = () => {
  const [username, setUsername] = useState("");

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); //eye
  const [error, setError] = useState("");

const navigate = useNavigate();//navigates to the dashboard page after successful login

//this handles the login form submission and authentication process
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError(""); //This is used to clear any previous error messages

    //Used to check if both the username and password fields are completed before allowing the user to login
    if (!username || !password) {
      setError("Please enter your username and password.");
      return;
    }

    try{

      /*Firebase, 2026*/ 
      //Calls Firebase authentication function to verify the user's credentials
      const userCredential = await signInWithEmailAndPassword(
         auth,
         username, 
         password
      );

        //Signed in successfully
        const user = userCredential.user; 
        console.log("Login successful:", user);

        navigate("/dashboard");
    } catch (error: any) {
      //displays the error message 
      console.error("Login error:", error);
      setError("Invalid username or password. Please try again.");
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
          <h1>Log In</h1>
          <p>Sign in to access the parking dashboard</p>
        </div>

        <hr />

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">

          {/* Username */}
          <div className="login-field">
            <label htmlFor="username">
              User Name
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
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              placeholder="Enter your email"
            />
          </div>

          {/* Password */}
          <div className="login-field">
            <label htmlFor="password">
              Password
              {password && (
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
              autoComplete="current-password"
              placeholder="Enter your password"
            />

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
          {/* Error message */}
          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}

          <hr />

          {/* Login button */}
          <button
            className="login-button"
            type="submit"
            disabled={!username || !password}
          >
            LOGIN
          </button>

        </form>

        <p className="login-footer">
          Parkitech Security System
        </p>

          <p className="login-footer">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/register")}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Register
          </button>
        </p>

      </div>
    </main>
  );
};

export default Login;
{

}
/* References
Firebase, 2026. Get Started with Firebase Authentication in React Native. [source code] Available: <https://firebase.google.com/docs/auth/web/start> [Accessed 30 August. 2026].
Rudderz243, 2026. Frontend tsx. [source code] Available: <http://github.com/rudderz243/insy7314-library/blob/master/frontend/src/pages/BookPage.tsx> [Accessed 12 August. 2026].
Vincent,M. 2016. login / sign up - React - Daily UI #001. (Version 2.0) [Source code] Available at: < https://codepen.io/matthewvincent/pen/JXOKbY > [Accessed 12 August. 2026]. 
*/