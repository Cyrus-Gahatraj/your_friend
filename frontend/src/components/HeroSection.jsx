import { useState } from "react";
import SignUp from "../modals/SignUp"
import Login from "../modals/Login";

const HeroSection = () => {
    const [openSignup, setOpenSignup] = useState(false);
    const [openLogin, setOpenLogin] = useState(false);
    return (
      <header className="flex flex-col gap-3 items-center justify-center flex-1 text-center">
        <h1 className="text-5xl font-bold mb-4 text-gray-900 tracking-tight">
          your_friend
        </h1>
        <p className="text-lg text-gray-600 max-w-md mb-8">
          Your personal AI companion — connect, chat, and share with
          intelligence that feels human.
        </p>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition" onClick={()=>setOpenSignup(true)}>
            Get Started
          </button>

        <SignUp open={openSignup} setOpen={setOpenSignup} />

          <button className="px-4 py-2 border border-gray-400 text-gray-700 rounded-xl hover:bg-gray-100 transition" onClick={()=>setOpenLogin(true)}>
            Log In
          </button>

          <Login open={openLogin} setOpen={setOpenLogin}/>
        </div>
      </header>
    );
}

export default HeroSection;