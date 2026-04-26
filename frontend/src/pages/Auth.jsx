import { useState } from "react";
import { useLoginMutation, useRegisterMutation } from "../api/apiSlice";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../app/authSlice";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [showPass, setShowPass] = useState(false);

  // 🔥 RTK Hooks
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const [register, { isLoading: isRegistering }] = useRegisterMutation();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (isLogin) {
        res = await login({ email: form.email, password: form.password }).unwrap();
      } else {
        res = await register({
          name: form.name,
          email: form.email,
          password: form.password,
        }).unwrap();
      }

      dispatch(setCredentials({ user: res.user, token: res.token }));
      navigate("/dashboard");
    } catch (err) {
      alert(err?.data?.message || "Authentication Failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] relative overflow-hidden font-sans">
      
      {/* ✨ BACKGROUND ELEMENTS */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-100/50 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-green-100/50 rounded-full blur-[120px]"></div>

      <div className="max-w-5xl w-full mx-4 flex bg-white/70 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white overflow-hidden min-h-[600px]">
        
        {/* 🌿 LEFT SIDE (Artistic) */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-emerald-500 to-teal-700 p-12 text-white flex-col justify-between relative">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
                <span className="text-xl">🚀</span>
              </div>
              <h1 className="text-2xl font-black tracking-tighter italic">DTable</h1>
            </div>
            <h2 className="text-4xl font-black leading-tight mb-4">
              Manage Attendance <br /> 
              <span className="text-emerald-200">With Precision.</span>
            </h2>
            <p className="text-emerald-50 opacity-80 leading-relaxed font-medium">
              Join thousands of teams tracking time, overtime, and reports in the most modern way possible.
            </p>
          </div>

          <div className="relative z-10">
            <div className="flex gap-4 items-center">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-emerald-500 bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
                    U{i}
                  </div>
                ))}
              </div>
              <p className="text-xs font-semibold text-emerald-100">Trusted by 500+ Companies</p>
            </div>
          </div>

          {/* Decorative Circles */}
          <div className="absolute top-20 right-[-50px] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        {/* 📝 RIGHT SIDE (Form) */}
        <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center">
          <div className="max-w-sm mx-auto w-full">
            <div className="mb-10 text-center md:text-left">
              <h2 className="text-3xl font-black text-slate-800 mb-2">
                {isLogin ? "Welcome Back" : "Create Account"}
              </h2>
              <p className="text-slate-400 font-medium text-sm">
                {isLogin ? "Enter your details to access your workspace." : "Start your journey with a free account today."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Full Name</label>
                  <input
                    name="name"
                    type="text"
                    required
                    placeholder="John Doe"
                    onChange={handleChange}
                    className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:border-emerald-400 focus:bg-white transition-all text-slate-700 font-medium"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Email Address</label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="name@company.com"
                  onChange={handleChange}
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:border-emerald-400 focus:bg-white transition-all text-slate-700 font-medium"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center ml-1">
                   <label className="text-xs font-bold text-slate-500 uppercase">Password</label>
                   {isLogin && <span className="text-[10px] text-emerald-600 font-bold cursor-pointer hover:underline">Forgot?</span>}
                </div>
                <div className="relative">
                  <input
                    name="password"
                    type={showPass ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    onChange={handleChange}
                    className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:border-emerald-400 focus:bg-white transition-all text-slate-700 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-500 text-xs font-bold"
                  >
                    {showPass ? "HIDE" : "SHOW"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn || isRegistering}
                className="w-full bg-slate-900 text-white font-black p-4 rounded-2xl shadow-xl shadow-slate-200 hover:bg-emerald-600 hover:shadow-emerald-100 transition-all active:scale-[0.98] mt-4"
              >
                {isLoggingIn || isRegistering ? "Processing..." : (isLogin ? "Sign In" : "Get Started")}
              </button>
            </form>

            <p className="text-center mt-8 text-sm font-semibold text-slate-400">
              {isLogin ? "New to DTable?" : "Already a member?"}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 text-emerald-600 hover:text-emerald-700 font-black hover:underline transition-all"
              >
                {isLogin ? "Create an account" : "Sign in to existing"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}