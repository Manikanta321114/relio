import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { WishlistProvider } from "./context/WishlistContext";
import { ProtectedRoute, PublicRoute, AdminRoute } from "./routes/RouteGuards";
import { GlobalLoader } from "./components/ui/GlobalLoader";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";

// Lazy Loaded Layouts
const DashboardLayout = lazy(() => import("./layouts/DashboardLayout").then(m => ({ default: m.DashboardLayout })));
const AdminLayout = lazy(() => import("./layouts/AdminLayout").then(m => ({ default: m.AdminLayout })));

// Lazy Loaded Pages
const Login = lazy(() => import("./pages/auth/Login").then(m => ({ default: m.Login })));
const Register = lazy(() => import("./pages/auth/Register").then(m => ({ default: m.Register })));
const Dashboard = lazy(() => import("./pages/user/Dashboard").then(m => ({ default: m.Dashboard })));
const SellBook = lazy(() => import("./pages/user/SellBook").then(m => ({ default: m.SellBook })));
const MyUploads = lazy(() => import("./pages/user/MyUploads").then(m => ({ default: m.MyUploads })));
const MyOrders = lazy(() => import("./pages/user/MyOrders").then(m => ({ default: m.MyOrders })));
const Notifications = lazy(() => import("./pages/user/Notifications").then(m => ({ default: m.Notifications })));
const WishlistPage = lazy(() => import("./pages/public/WishlistPage").then(m => ({ default: m.WishlistPage })));
const MarketplacePage = lazy(() => import("./pages/public/MarketplacePage").then(m => ({ default: m.MarketplacePage })));
const BookDetailsPage = lazy(() => import("./pages/public/BookDetailsPage").then(m => ({ default: m.BookDetailsPage })));
const CheckoutPage = lazy(() => import("./pages/public/CheckoutPage").then(m => ({ default: m.CheckoutPage })));
const Settings = lazy(() => import("./pages/user/Settings").then(m => ({ default: m.Settings })));
const PrintDelivery = lazy(() => import("./pages/user/PrintDelivery").then(m => ({ default: m.PrintDelivery })));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard").then(m => ({ default: m.AdminDashboard })));
const AdminApprovals = lazy(() => import("./pages/admin/AdminApprovals").then(m => ({ default: m.AdminApprovals })));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders").then(m => ({ default: m.AdminOrders })));
const AdminPrintOrders = lazy(() => import("./pages/admin/AdminPrintOrders").then(m => ({ default: m.AdminPrintOrders })));
const AdminInventory = lazy(() => import("./pages/admin/AdminInventory").then(m => ({ default: m.AdminInventory })));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings").then(m => ({ default: m.AdminSettings })));
const NotFoundPage = lazy(() => import("./pages/public/NotFoundPage").then(m => ({ default: m.NotFoundPage })));

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
            <WishlistProvider>
              <Toaster position="top-center" toastOptions={{ duration: 4000, style: { background: '#111827', color: '#fff', borderRadius: '12px' } }} />
              <Suspense fallback={<GlobalLoader />}>
                <Routes>
                  {/* Public Routes */}
                  <Route element={<PublicRoute />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                  </Route>

                  {/* General Routes */}
                  <Route path="/" element={<DashboardLayout><MarketplacePage /></DashboardLayout>} />
                  <Route path="/marketplace" element={<Navigate to="/" replace />} />
                  <Route path="/books/:id" element={<DashboardLayout><BookDetailsPage /></DashboardLayout>} />

                  {/* Protected User Routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/checkout/:bookId" element={<DashboardLayout><CheckoutPage /></DashboardLayout>} />
                    <Route path="/dashboard" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
                    <Route path="/sell-book" element={<DashboardLayout><SellBook /></DashboardLayout>} />
                    <Route path="/my-uploads" element={<DashboardLayout><MyUploads /></DashboardLayout>} />
                    <Route path="/my-orders" element={<DashboardLayout><MyOrders /></DashboardLayout>} />
                    <Route path="/wishlist" element={<DashboardLayout><WishlistPage /></DashboardLayout>} />
                    <Route path="/notifications" element={<DashboardLayout><Notifications /></DashboardLayout>} />
                    <Route path="/settings" element={<DashboardLayout><Settings /></DashboardLayout>} />
                    <Route path="/print-delivery" element={<DashboardLayout><PrintDelivery /></DashboardLayout>} />
                  </Route>

                  {/* Protected Admin Routes */}
                  <Route element={<AdminRoute />}>
                    <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
                    <Route path="/admin/approvals" element={<AdminLayout><AdminApprovals /></AdminLayout>} />
                    <Route path="/admin/orders" element={<AdminLayout><AdminOrders /></AdminLayout>} />
                    <Route path="/admin/print-orders" element={<AdminLayout><AdminPrintOrders /></AdminLayout>} />
                    <Route path="/admin/inventory" element={<AdminLayout><AdminInventory /></AdminLayout>} />
                    <Route path="/admin/users" element={<AdminLayout><div className="p-10 text-center">Users (Coming Soon)</div></AdminLayout>} />
                    <Route path="/admin/reports" element={<AdminLayout><div className="p-10 text-center">Reports (Coming Soon)</div></AdminLayout>} />
                    <Route path="/admin/settings" element={<AdminLayout><AdminSettings /></AdminLayout>} />
                  </Route>

                  {/* 404 Catch All */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </WishlistProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
