// src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import { ToastContainer, toast } from 'react-toastify';
import Homepage from './pages/Homepage';
import ViewTodaysInvoices from './pages/ViewTodaysInvoices';
import AdminLogin from './pages/AdminLogin';
import PrivateRoute from './components/PrivateRoute';
import ViewYesterdaysInvoices from './pages/ViewYesterdaysInvoice';
import InventoryPage from './pages/InventoryPage';
import VendorPage from './pages/VendorPage';
import ViewWataks from './pages/ViewWataks';
import DashboardPage from './pages/Dashboard';
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify CSS
import SearchInvoice from './pages/SearchInvoice';
import SearchWatak from './pages/SearchWatak';


const App = () => {
  
  return (
    <AuthProvider>
       <ToastContainer
    position="bottom-center"
    autoClose={3000}
    hideProgressBar
    newestOnTop={false}
    closeOnClick
    rtl={false}
    pauseOnFocusLoss
    draggable
    pauseOnHover
    
  />
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<AdminLogin />} />
          <Route path="/home" element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          } />
          <Route path="/today-invoices" element={
            <PrivateRoute>
              <ViewTodaysInvoices />
            </PrivateRoute>
          } />
          <Route path="/vendors" element={
            <PrivateRoute>
              <VendorPage />
            </PrivateRoute>
          } />
          <Route path="/inventory" element={
            <PrivateRoute>
              <InventoryPage />
            </PrivateRoute>
          } />
          <Route path="/yesterday-invoices" element={
            <PrivateRoute>
              <ViewYesterdaysInvoices />
            </PrivateRoute>
          } />
          <Route path="/customers" element={
            <PrivateRoute>
              <Homepage />
            </PrivateRoute>
          } />
          <Route path="/viewTodaysWataks" element={
            <PrivateRoute>
              <ViewWataks />
            </PrivateRoute>
          } />
          <Route path="/searchInvoice" element={
            <PrivateRoute>
              <SearchInvoice />
            </PrivateRoute>
          } />
           <Route path="/searchWatak" element={
            <PrivateRoute>
              <SearchWatak />
            </PrivateRoute>
          } />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
       
      </Router>
     
    </AuthProvider>
  );
};

export default App;
