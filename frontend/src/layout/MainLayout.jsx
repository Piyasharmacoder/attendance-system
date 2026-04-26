import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function MainLayout({ children }) {
  return (
    // 🟢 Body ka background ab Indigo se badal kar Light Green/Grey kar diya gaya hai
    <div className="flex min-h-screen bg-[#F8FAFC]"> 

      {/* SIDEBAR: Isko hum fixed width dete hain desktop par */}
      <div className="hidden md:block">
         <Sidebar />
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">

        {/* NAVBAR: Jo upar sticky rahega */}
        <Navbar />

        {/* PAGE CONTENT: Yahan scrolls honge aur dashboard ke cards dikhenge */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-green-50/50 via-white to-emerald-50/30 p-4 md:p-8">
          
          {/* Max-width container taaki bahut badi screen par UI faile na */}
          <div className="max-w-7xl mx-auto animate-fadeIn">
            {children}
          </div>

        </main>
      </div>
    </div>
  );
}