import React, { useState } from 'react';
import Login from '../components/auth/Login';
import Register from '../components/auth/Register';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center">
      {isLogin ? <Login /> : <Register />}
      <div className="text-center mt-4">
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-white hover:text-red-500 transition"
        >
          {isLogin 
            ? "Don't have an account? Register" 
            : "Already have an account? Login"}
        </button>
      </div>
    </div>
  );
};

export default AuthPage;