import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AuthGate from "./components/AuthGate";

import { useAuth } from "./context/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Products from "./pages/Products";

import SkinAnalysis from "./pages/skin/SkinAnalysis";
import SkinResult from "./pages/skin/SkinResult";

import HairAnalysis from "./pages/hair/HairAnalysis";
import HairResult from "./pages/hair/HairResult";

import ColourAnalysis from "./pages/colour/ColourAnalysis";
import ColourResult from "./pages/colour/ColourResult";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";

import AdminUsers from "./pages/admin/AdminUsers";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminBrands from "./pages/admin/AdminBrands";
import AdminGame from "./pages/admin/AdminGame";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import Orders from "./pages/Orders";
import Game from "./pages/Game";
import ResetPassword from "./pages/ResetPassword";

function ProtectedPage({
  children,
  title,
  description,
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <AuthGate
        title="Checking your profile."
        description="Please wait while we check your STYLAURA account."
      />
    );
  }

  if (!user) {
    return (
      <AuthGate
        title={title}
        description={description}
      />
    );
  }

  return children;
}


function App() {
  const location = useLocation();

  const hideFooter = [
  "/login",
  "/register",

  "/admin/login",
  "/admin",

  "/skin-analysis",
  "/skin-analysis/result",

  "/hair-analysis",
  "/hair-analysis/result",

  "/colour-analysis",
  "/colour-analysis/result",
].includes(location.pathname);

  return (
    <>
      <Navbar />

      <Routes>

        {/* =========================
            PUBLIC PAGES
        ========================= */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/skin-analysis"
          element={<SkinAnalysis />}
        />

        <Route
          path="/hair-analysis"
          element={<HairAnalysis />}
        />

        <Route
          path="/colour-analysis"
          element={<ColourAnalysis />}
        />

        <Route
          path="/admin/login"
         element={<AdminLogin />}
        />

        <Route
          path="/admin"
          element={<AdminDashboard />}
        />

        <Route
          path="/admin/users"
          element={<AdminUsers />}
        />
        <Route
          path="/admin/products"
          element={<AdminProducts />}
        />

        <Route
          path="/admin/brands"
          element={<AdminBrands />}
        />

        <Route
          path="/admin/game"
          element={<AdminGame />}
        />

        <Route
          path="/admin/orders"
          element={<AdminOrders />}
        />

        <Route
          path="/admin/analytics"
          element={<AdminAnalytics />}
        />

        <Route
          path="/orders"
          element={
            <ProtectedPage>
              <Orders />
            </ProtectedPage>
          }
        />
                <Route
          path="/reset-password/:token"
          element={<ResetPassword />}
        />

        {/* =========================
            PROTECTED RESULT PAGES
        ========================= */}

        <Route
          path="/skin-analysis/result"
          element={
            <ProtectedPage
              title={
                <>
                  Your skin profile
                  <br />
                  <em>is ready.</em>
                </>
              }
              description="Sign in or create an account to view your personalized skin analysis and save your results."
            >
              <SkinResult />
            </ProtectedPage>
          }
        />

        <Route
          path="/hair-analysis/result"
          element={
            <ProtectedPage
              title={
                <>
                  Your hair profile
                  <br />
                  <em>is ready.</em>
                </>
              }
              description="Sign in or create an account to view your personalized hair analysis and save your results."
            >
              <HairResult />
            </ProtectedPage>
          }
        />

        <Route
          path="/colour-analysis/result"
          element={
            <ProtectedPage
              title={
                <>
                  Your colour profile
                  <br />
                  <em>is ready.</em>
                </>
              }
              description="Sign in or create an account to view your personalized colour profile and save your results."
            >
              <ColourResult />
            </ProtectedPage>
          }
        />

      <Route
        path="/game"
        element={
          <ProtectedPage>
            <Game />
          </ProtectedPage>
        }
/>


        {/* =========================
            PROTECTED ACCOUNT PAGES
        ========================= */}

        <Route
          path="/dashboard"
          element={
            <ProtectedPage
              title={
                <>
                  Your STYLAURA
                  <br />
                  <em>profile.</em>
                </>
              }
              description="Sign in or create an account to access your saved beauty profiles and personalized recommendations."
            >
              <Dashboard />
            </ProtectedPage>
          }
        />

        <Route
          path="/products"
          element={
            <ProtectedPage
              title={
                <>
                  Your beauty
                  <br />
                  <em>collection.</em>
                </>
              }
              description="Sign in or create an account to explore your personalized STYLAURA product collection."
            >
              <Products />
            </ProtectedPage>
          }
        />

        <Route
          path="/cart"
          element={
            <ProtectedPage
              title={
                <>
                  Your
                  <br />
                  <em>cart.</em>
                </>
              }
              description="Sign in or create an account to view and manage your selected products."
            >
              <Cart />
            </ProtectedPage>
          }
        />

        <Route
          path="/checkout"
          element={
            <ProtectedPage
              title={
                <>
                  Complete your
                  <br />
                  <em>order.</em>
                </>
              }
              description="Sign in or create an account before continuing to checkout."
            >
              <Checkout />
            </ProtectedPage>
          }
        />

        <Route
          path="/order-success"
          element={
            <ProtectedPage
              title={
                <>
                  Your order
                  <br />
                  <em>is ready.</em>
                </>
              }
              description="Sign in to view your STYLAURA order confirmation."
            >
              <OrderSuccess />
            </ProtectedPage>
          }
        />

      </Routes>

      {!hideFooter && <Footer />}
    </>
  );
}

  export default App;