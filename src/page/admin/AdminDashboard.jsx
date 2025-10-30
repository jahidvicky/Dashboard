import { Link, Outlet, useLocation } from "react-router-dom";

export default function AdminDashboard() {
  const location = useLocation();

  const menuItems = [
    { name: "Home", path: "/admin/home" },
    { name: "Profile", path: "/admin/profile" },
    { name: "Category", path: "/admin/category" },
    { name: "Sub-Category", path: "/admin/subCategory" },
    { name: "Product", path: "/admin/product" },
    { name: "coupon", path: "/admin/coupons" },
    { name: "Inquiries", path: "/admin/inquiries" },
    { name: "Vendor", path: "/admin/vendor" },
    { name: "Vendor Product", path: "/admin/vendor-product" },
    { name: "Insurence Company", path: "/admin/company" },
    { name: "Eye Services", path: "/admin/eye-services" },
    { name: "Eye Check", path: "/admin/eyeCheck" },
    { name: "Eyewear Tips", path: "/admin/eyewearTips" },
    { name: "Disclaimer", path: "/admin/disclaimer" },
    { name: "Review", path: "/admin/review" },
    { name: "Testimonial", path: "/admin/testimonials" },
    { name: "FAQ", path: "/admin/faq" },
    { name: "Eye Exam", path: "/admin/eye-exam" },
    { name: "All Appointments", path: "/admin/appointments" },
    { name: "Doctor Schedule", path: "/admin/doctor-schedule" },
    { name: "Admin Order", path: "/admin/admin-order" },
    { name: "Chat", path: "/admin/chat" },
    { name: "Admin Policy", path: "/admin/privacy-policy" },

  ];

  return (
    <div className="flex bg-gray-100">
      {/* Sidebar */}
      <div className="fixed left-0 h-screen w-64 bg-white shadow-lg p-5 pt-20 overflow-y-auto">
        <nav className="space-y-2 text-center text-lg font-semibold mt-10 ">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-4 py-2 rounded border-b border-gray-200 hover:bg-red-500 hover:text-white hover:cursor-pointer ${location.pathname === item.path
                ? "bg-red-500 text-white"
                : "text-gray-700"
                }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64 flex flex-col pt-20">
        <main className="flex-1 p-6 pt-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
