import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import VendorProductOrder from "./page/vender/VendorProductOrder";
import Chat from "./page/admin/Chat";
import VendorChat from "./page/vender/VendorChat";
import InsuranceChat from "./page/company/InsuranceChat";
import Loader from "./page/loader/Loader";
import CustomerPolicies from "./page/company/CustomerPolicy/CustomerPolicies";
import CustomerClaims from "./page/company/CustomerPolicy/CustomerClaims";
import VendorProductDiscount from "./page/vender/VendorProductDiscount";
import CompanyPrivacyPolicy from "./page/company/CompanyPrivacyPolicy";
import AdminPrivacyPolicy from "./page/admin/AdminPrivacyPolicy";
import VendorPrivacyPolicy from "./page/vender/VendorPrivacyPolicy";
import Appointment from "./page/eyeExamPage/Appointment";
import VendorOrderDetails from "./page/vender/VendorOrderDetails";
import AdminOrderDetails from "./page/ordderTracking/AdminOrderDetails";
import ClaimDetails from "./page/company/CustomerPolicy/ClaimDetails";
import VendorDetails from "./page/vender/VendorDetails";
import AdminCompanyDetailsPage from "./page/company/AdminCompanyDetailsPage";

// ---------- lazy imports ----------
const Login = lazy(() => import("./page/login/Login"));
const Unauthorized = lazy(() => import("./page/login/Unauthorized"));
const Layout = lazy(() => import("./component/Layout"));
const ErrorPage = lazy(() => import("./page/errorPage/ErrorPage"));
const AdminDashboard = lazy(() => import("./page/admin/AdminDashboard"));
const VenderDashboard = lazy(() => import("./page/vender/VenderDashboard"));
const CompanyDashboard = lazy(() => import("./page/company/CompanyDashboard"));
const ProtectedRoute = lazy(() => import("./component/ProtectedRoute"));
const FAQ = lazy(() => import("./page/faq/FAQ"));
const Category = lazy(() => import("./page/category/Category"));
const Review = lazy(() => import("./page/review/Review"));
const Subcategory = lazy(() => import("./page/subcategory/Subcategory"));
const Products = lazy(() => import("./page/product/Products"));
const AdminHome = lazy(() => import("./page/admin/AdminHome"));
const EyeCheck = lazy(() => import("./page/eyeCheck/Eyecheck"));
const VendorHome = lazy(() => import("./page/vender/VendorHome"));
const VendorPage = lazy(() => import("./page/vender/VendorPage"));
const Testimonials = lazy(() => import("./page/testimonials/Testimonials"));
const EyewearTips = lazy(() => import("./page/eyewearTips/EyewearTips"));
const Inquiry = lazy(() => import("./page/inquiries/Inquiry"));
const UpdateVendorProfile = lazy(() =>
  import("./page/vender/UpdateVendorProfile")
);
const Disclaimer = lazy(() => import("./page/disclaimer/Disclaimer"));
const EyeService = lazy(() => import("./page/ourEyeServices/EyeServices"));
const CompanyHome = lazy(() => import("./page/company/CompanyHome"));
const UpdateCompanyProfile = lazy(() =>
  import("./page/company/UpdateCompanyProfile")
);
const AdminCompanyDetails = lazy(() =>
  import("./page/company/AdminCompanyDetails")
);
const UpdateAdminProfile = lazy(() =>
  import("./page/admin/UpdateAdminProfile")
);
const DoctorSchedule = lazy(() =>
  import("./page/doctorSchedule/DoctorSchedule")
);
const VendorProducts = lazy(() => import("./page/vender/VendorProduct"));
const VendorApprovalProduct = lazy(() =>
  import("./page/admin/VendorApprovalProduct")
);
const CouponCode = lazy(() => import("./page/coupons/CouponCode"));
const EyeExam = lazy(() => import("./page/eyeExamPage/EyeExam"));
const AdminOrderUpdate = lazy(() =>
  import("./page/ordderTracking/AdminOrderUpdate")
);

const AddPolicy = lazy(() =>
  import("./page/insurance/AddPolicy")
);

function App() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* ---------- public routes ---------- */}
        <Route path="/" element={<Navigate to="/loginNew" replace />} />
        <Route path="/loginNew" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* ---------- protected routes ---------- */}
        <Route element={<Layout />}>
          {/* ------------ admin ------------ */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="home" replace />} />
            <Route path="home" element={<AdminHome />} />
            <Route path="profile" element={<UpdateAdminProfile />} />
            <Route path="faq" element={<FAQ />} />
            <Route path="category" element={<Category />} />
            <Route path="subCategory" element={<Subcategory />} />
            <Route path="product" element={<Products />} />
            <Route path="coupons" element={<CouponCode />} />
            <Route path="review" element={<Review />} />
            <Route path="eyeCheck" element={<EyeCheck />} />
            <Route path="vendor" element={<VendorPage />} />
            <Route path="vendor/:id" element={<VendorDetails />} />
            <Route path="company" element={<AdminCompanyDetails />} />
            <Route path="company/:id" element={<AdminCompanyDetailsPage />} />
            <Route path="testimonials" element={<Testimonials />} />
            <Route path="eyewearTips" element={<EyewearTips />} />
            <Route path="inquiries" element={<Inquiry />} />
            <Route path="disclaimer" element={<Disclaimer />} />
            <Route path="eye-services" element={<EyeService />} />
            <Route path="eye-exam" element={<EyeExam />} />
            <Route path="doctor-schedule" element={<DoctorSchedule />} />
            <Route path="vendor-product" element={<VendorApprovalProduct />} />
            <Route path="admin-order" element={<AdminOrderUpdate />} />
            <Route path="chat" element={<Chat />} />
            <Route path="privacy-policy" element={<AdminPrivacyPolicy />} />
            <Route path="appointments" element={<Appointment />} />
            <Route path="order-details/:id" element={<AdminOrderDetails />} />
          </Route>

          {/* ------------ vendor ------------ */}
          <Route
            path="/vendor"
            element={
              <ProtectedRoute allowedRoles={["vendor"]}>
                <VenderDashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="home" replace />} />
            <Route path="home" element={<VendorHome />} />
            <Route path="product" element={<VendorProducts />} />
            <Route path="order" element={<VendorProductOrder />} />
            <Route path="profile" element={<UpdateVendorProfile />} />
            <Route path="faq" element={<VendorHome />} />
            <Route path="chat" element={<VendorChat />} />
            <Route path="discount-product" element={<VendorProductDiscount />} />
            <Route path="privacy-policy" element={<VendorPrivacyPolicy />} />
            <Route path="order-details" element={<VendorOrderDetails />} />
          </Route>

          {/* ------------ company ------------ */}
          <Route
            path="/company"
            element={
              <ProtectedRoute allowedRoles={["company"]}>
                <CompanyDashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="home" replace />} />
            <Route path="home" element={<CompanyHome />} />
            <Route path="services" element={<CompanyHome />} />
            <Route path="project" element={<CompanyHome />} />
            <Route path="profile" element={<UpdateCompanyProfile />} />
            <Route path="team" element={<CompanyHome />} />
            <Route path="faq" element={<CompanyHome />} />
            <Route path="add-policy" element={<AddPolicy />} />
            <Route path="chat" element={<InsuranceChat />} />
            <Route path="customer-policy" element={<CustomerPolicies />} />
            <Route path="customer-claims" element={<CustomerClaims />} />
            <Route path="claims/:claimId" element={<ClaimDetails />} />
            <Route path="privacy-policy" element={<CompanyPrivacyPolicy />} />
          </Route>

          {/* ---------- fallback ---------- */}
          <Route path="*" element={<ErrorPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
