import React, { useContext, useDebugValue, useState } from 'react'
import axios from 'axios'
import { UserContext } from '../contexts/UserContext'

function Register() {
  const [userData, setUserData] = useState(
    {
      username: "",
      password: "",
    }
  );

  const [isLoginOrRegister, setIsLoginOrRegister] = useState("register");

  const { setUserId, setUsername } = useContext(UserContext);

  const [error, setError] = useState();

  function handleInputChange(e) {
    setUserData((prev) => {
      return { ...prev, [e.target.name]: e.target.value }
    })
  }

  async function handleFormSubmit(e) {

    e.preventDefault();
    
    const url = isLoginOrRegister === "register" ? "register" : "login";

    try {

      const response = await axios.post(`${import.meta.env.VITE_APP_BASE_URL}/users/${url}`, userData)

      setUsername(userData.username);
      setUserId(response.data.id);

    }
    catch (error) {
      setError(error);
    }
  }

  return (


    <div className='bg-blue-50 h-screen flex flex-col items-center justify-center'>


      <h1 className='mb-4 text-xl'>Please {isLoginOrRegister}</h1>

      <form className='w-64 mx-auto flex flex-col gap-2' onSubmit={handleFormSubmit}>
        <input type="text" placeholder="username" name="username" className='block w-full rounded-sm py-2 px-4 border'
          onChange={handleInputChange}
        />

        <input type="password" placeholder="password" name="password" className='block w-full rounded-sm py-2 px-4 border'
          onChange={handleInputChange}
        />

        <button className='bg-blue-500 text-white block w-full rounded-sm py-2'>

          {isLoginOrRegister == "register" ? "Register" : "Login"}

        </button>

        <div className='text-center mt-2'>
          {isLoginOrRegister == "register" && (
            <div>
              Already Registered?
              <button onClick={() => setIsLoginOrRegister("login")}>Login</button>
            </div>
          )}

          {isLoginOrRegister == "login" && (
            <div>
              Don't have an account?

              <button onClick={() => setIsLoginOrRegister("register")}>Register</button>
            </div>
          )}
        </div>
      </form>
    </div>
  )
}

export default Register