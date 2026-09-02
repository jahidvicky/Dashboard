import { Link, Outlet, useLocation } from "react-router-dom";

export default function AdminDashboard() {
  const location = useLocation();

const menuItems = [
  // Overview
  { name: "Home", path: "/admin/home" },

  // Catalog
  { name: "Category", path: "/admin/category" },
  { name: "Sub-Category", path: "/admin/subCategory" },
  { name: "Products", path: "/admin/product" },
  { name: "All Brands", path: "/admin/brand" },
  { name: "Inventory Management", path: "/admin/inventory" },

  // Orders & Fulfillment
  { name: "Manage Order", path: "/admin/admin-order" },
  { name: "Return Requests", path: "/admin/return-requests" },
  { name: "Exchange Requests", path: "/admin/exchangeRequest" },

  // Sales & Reports
  { name: "Admin Sales Report", path: "/admin/admin-sales" },
  { name: "Vendor Sales Report", path: "/admin/vendor-sales" },

  // Vendors
  { name: "Vendor", path: "/admin/vendor" },
  { name: "Vendor Product", path: "/admin/vendor-product" },

  // Marketing
  { name: "Coupon", path: "/admin/coupons" },
  { name: "Review", path: "/admin/review" },
  { name: "Testimonial", path: "/admin/testimonials" },

  // Insurance
  { name: "Insurance Company", path: "/admin/company" },
  { name: "Customer Policies", path: "/admin/customer-policy" },
  { name: "Customer Claims", path: "/admin/customer-claims" },

  // Eye Care Services & Appointments
  { name: "Eye Services", path: "/admin/eye-services" },
  { name: "Eye Check", path: "/admin/eyeCheck" },
  { name: "Eye Exam", path: "/admin/eye-exam" },
  { name: "Free Eye Checkup Requests", path: "/admin/free-eye-checkup" },
  { name: "All Appointments", path: "/admin/appointments" },
  { name: "Doctor Schedule", path: "/admin/doctor-schedule" },
  { name: "Create Clinic", path: "/admin/createClinic" },
  { name: "Eyewear Tips", path: "/admin/eyewearTips" },

  // Locations
  { name: "Our Location", path: "/admin/location" },

  // Content & Support
  { name: "FAQ", path: "/admin/faq" },
  { name: "Disclaimer", path: "/admin/disclaimer" },
  { name: "Inquiries", path: "/admin/inquiries" },
  { name: "Frame Donation Requests", path: "/admin/frameDonation" },
  { name: "Manager Policy Pages", path: "/admin/policy-manager" },
  { name: "Chat", path: "/admin/chat" },
  { name: "Support Chat", path: "/admin/supportChat" },

  // Account
  { name: "Profile", path: "/admin/profile" },
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
                ? "bg-[#f00000] text-white"
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
