import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Button,
  Box,
  Typography,
  TextField,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Collapse,
  CircularProgress,
  Skeleton,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import AddCustomer from "../components/AddCustomer";
import InvoiceModal from "../components/InvoiceModal";
import PaymentModal from "../components/PaymentModal";
import ViewTransaction from "../components/ViewTrasModal";
import AddVegetable from "../components/AddVegetable";
import LedgerModal from "../components/LedgerModal";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_BASE_URL } from "../constants";
import AddIcon from "@mui/icons-material/Add";
import ReceiptIcon from "@mui/icons-material/Receipt";
import PaymentIcon from "@mui/icons-material/Payment";
import HistoryIcon from "@mui/icons-material/History";
import VegetableIcon from "@mui/icons-material/Grass";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CircularIndeterminate from "../components/Loader";
import apiClient from "../services/apiClient";
import 'jspdf-autotable';
import { FourSquare } from "react-loading-indicators";
import CustomerInvoiceModal from "../components/CustomerInvoiceModal";
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import html2pdf from 'html2pdf.js';


const Homepage = () => {
  const [customers, setCustomers] = useState([]);
  const [vegetables, setVegetables] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [openCustomerModal, setOpenCustomerModal] = useState(false);
  const [openInvoiceModal, setOpenInvoiceModal] = useState(false);
  const [openTransactionModal, setOpenTransactionModal] = useState(false);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [openVegetableModal, setOpenVegetableModal] = useState(false);
  const [openLedgerModal, setOpenLedgerModal] = useState(false); // Add state for ledger modal
  const [openCustomerInvoiceModel, setOpenCustomerInvoiceModel] = useState(false); // Add state for ledger modal
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [ledgerData, setLedgerData] = useState(null); // Add state for ledger data
  const [loading, setLoading] = useState(true); // Add loading state
  const [totalLedger, setTotalLedger] = useState(0);
  const [totalLedgerInWords, setTotalLedgerInWords] = useState("");
  const [todaysTransactions, setTodaysTransactions] = useState([]);
  const [todaysTransactionsAmount, setTodaysTransactionsAmount] = useState();
  const [yesterdayTransactions, setYesterdayTransactions] = useState([]);
  const [yesterdayTransactionsAmount, setYesterdayTransactionsAmount] = useState();

  const [todaysInvoiceAmount, setTodaysInvoiceAmount] = useState(0);

  // States for managing card collapses and loading states
  const [isLedgerCardOpen, setIsLedgerCardOpen] = useState(false);
  const [isTransactionsCardOpen, setIsTransactionsCardOpen] = useState(false);
  const [isTransactionsCardOpen2, setIsTransactionsCardOpen2] = useState(false);
  const [isTransactionsLoading2, setIsTransactionsLoading2] = useState(false);
  const [customerDetails,  setCustomerDetails]=useState();

  const [isInvoiceCardOpen, setIsInvoiceCardOpen] = useState(false);
  const [isLedgerLoading, setIsLedgerLoading] = useState(false);
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(false);
  const [isInvoiceLoading, setIsInvoiceLoading] = useState(false);

  const searchInputRef = useRef(null);

  const fetchCustomers = async () => {
    setLoading(true); // Set loading to true before fetching data
    try {
   
      const response = await apiClient.get(`${API_BASE_URL}/customers`);
      setCustomers(response.data.data.customers);
      // Fetch total ledger balance after fetching customers
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false); // Set loading to false after fetching data
    }
  };

  const fetchTotalLedger = async () => {
    setIsLedgerLoading(true);
    try {
      const response = await apiClient.get(`${API_BASE_URL}/getTotalledger`);
      setTotalLedger(response.data.totalLedger);
      setTotalLedgerInWords(response.data.totalLedgerInIndianWords);
    } catch (error) {
      console.error("Error fetching total ledger balance:", error);
    } finally {
      setIsLedgerLoading(false);
    }
  };
  const getPaymentStatusColor = (daysSinceLastPayment) => {
    if (daysSinceLastPayment === 'No payment history') {
      return '#991b1b';  // darker red
    }

    const days = parseInt(daysSinceLastPayment);
    
    if (days >= 30) {
      return '#dc2626';  // red - critical delay
    } else if (days >= 20) {
      return '#ea580c';  // orange - high delay
    } else if (days >= 12) {
      return '#d97706';  // amber - moderate delay
    }
    return '#d97706';    // default amber
  };
  const capitalizeText = (text) => {
    if (!text) return '';
    return text
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };
  const getPaymentStatusText = (daysSinceLastPayment) => {
    if (daysSinceLastPayment === 'No payment history') {
      return 'No payment record found';
    }
    
    const days = parseInt(daysSinceLastPayment);

      return `Payment overdue (${days} days)`;
   
  };
  const fetchCustomerDetails = async (customerId) => {
    setLoading(true);
    try {
      const response = await apiClient.get(`${API_BASE_URL}/customers/${customerId}`);
      console.log('Raw API Response:', response.data);
  
      // Access the customer data from response.data.data.customers[0]
      const customerData = response.data.data.customers[0];
  
      if (customerData) {
        console.log('Customer object:', customerData);
        setCustomerDetails(customerData);
        handlePrintCustomer(customerData);
      } else {
        console.error('No customer data in response');
      }
    } catch (error) {
      console.error('Error fetching customer details:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handlePrintCustomer = async (customer) => {
    const printContent = `
    <html>
      <head>
        <title>Customer Details</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          body { 
            font-family: 'Inter', sans-serif; 
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
            color: #1e293b;
          }
          .header { 
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e2e8f0;
          }
          .header h2 {
            color: #0f172a;
            margin: 0;
            font-size: 24px;
          }
          .detail-row { 
            display: flex;
            align-items: center;
            margin: 20px 0;
            padding: 15px;
            border-radius: 8px;
            background-color: #f8fafc;
          }
          .label { 
            font-weight: 600;
            color: #64748b;
            width: 180px;
          }
          .value { 
            font-weight: 500;
            flex: 1;
          }
          .amount { 
            color: #dc2626;
            font-size: 20px;
            font-weight: 700;
          }
          .status {
            padding: 8px 16px;
            border-radius: 6px;
            font-weight: 600;
            display: inline-block;
          }
          .status-critical {
            background-color: #fee2e2;
            color: #991b1b;
          }
          .status-warning {
            background-color: #ffedd5;
            color: #9a3412;
          }
          .date-info {
            color: #475569;
            font-size: 14px;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 14px;
            color: #64748b;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>Customer Payment Details</h2>
        </div>
  
        <!-- Customer Name -->
        <div class="detail-row">
          <div class="label">Customer Name:</div>
          <div class="value">${customer.customerName}</div>
        </div>
  
        <!-- Ledger Balance -->
        <div class="detail-row">
          <div class="label">Ledger Balance:</div>
          <div class="value amount">₹${customer.ledgerBalance.toLocaleString()}</div>
        </div>
  
        <!-- Last Payment Date -->
        <div class="detail-row">
          <div class="label">Last Payment Date:</div>
          <div class="value">${customer.lastPaymentDate || 'N/A'}</div>
        </div>
  
        <!-- Days Since Last Payment -->
        <div class="detail-row">
          <div class="label">Days Since Last Payment:</div>
          <div class="value">${customer.daysSinceLastPayment || 'N/A'}</div>
        </div>
  
        <!-- Last Invoice Date -->
        <div class="detail-row">
          <div class="label">Last Invoice Date:</div>
          <div class="value">${customer.lastInvoiceDate || 'N/A'}</div>
        </div>
  
        <!-- Payment Reminder Message -->
        <div style="
          margin-top: 30px;
          padding: 20px;
          background-color: ${customer?.daysSinceLastPayment >= 30 ? '#fee2e2' : '#ffedd5'};
          border-radius: 8px;
          text-align: center;
        ">
          <p style="
            margin: 0;
            color: ${customer?.daysSinceLastPayment >= 30 ? '#991b1b' : '#9a3412'};
            font-size: 15px;
            font-weight: 500;
            line-height: 1.5;
          ">
            Dear ${customer.customerName},<br/>
            This is a reminder that your payment of ₹${customer.ledgerBalance.toLocaleString()} is due. Your last payment was made on ${customer.lastPaymentDate}, which was ${customer.daysSinceLastPayment} ago.<br/>
            Please make the payment at your earliest convenience.<br/>
            Thank you for your prompt attention to this matter.
          </p>
        </div>
  
        <div class="footer">
          Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
          <div style="
            margin-top: 10px;
            font-size: 11px;
            color: #94a3b8;
            font-weight: 500;
          ">
            Software by Mir Zubair
          </div>
        </div>
      </body>
    </html>
  `;
  
  
  
    const element = document.createElement('div');
    element.innerHTML = printContent;
  
    const opt = {
      margin: 10,
      filename: `${customer.customerName.replace(/\s+/g, '_')}_details.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        letterRendering: true
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait' 
      }
    };
  
    try {
      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const fetchTodaysTransactions = async () => {
    setIsTransactionsLoading(true);
    try {
      const response = await apiClient.get(`${API_BASE_URL}/getTodaysTrans`);


      // Directly destructure the data from response
      const { transactions, totalSum, totalInWords,cash,accountPayment } = response.data.data;

      // Set the fetched transactions and total summary in the state
      setTodaysTransactions(transactions);
      setTodaysTransactionsAmount({ totalSum, totalInWords ,cash,accountPayment});

      console.log("Fetched today's transactions:", transactions);
    } catch (error) {
      console.error("Error fetching today's transactions:", error);
    } finally {
      setIsTransactionsLoading(false);
    }
  };
  const fetchYesterdayTransactions = async () => {
    setIsTransactionsLoading2(true);
    try {
      const response = await apiClient.get(`${API_BASE_URL}/getYesterdayTrans`);


      // Directly destructure the data from response
      const { transactions, totalSum, totalInWords,cash,accountPayment } = response.data.data;

      // Set the fetched transactions and total summary in the state
      setYesterdayTransactions(transactions);
      setYesterdayTransactionsAmount({ totalSum, totalInWords,cash,accountPayment });

      console.log("Fetched today's transactions:", transactions);
    } catch (error) {
      console.error("Error fetching today's transactions:", error);
    } finally {
      setIsTransactionsLoading2(false);
    }
  };
  const fetchTodaysInvoiceAmount = async () => {
    setIsInvoiceLoading(true);
    try {
      const response = await apiClient.get(`${API_BASE_URL}/getInvoices`);
      const { totalAmount, totalAmountInWords } = response.data.data;
      console.log("todays invoice", response.data);
      setTodaysInvoiceAmount({ totalAmount, totalAmountInWords });
    } catch (error) {
      console.error("Error fetching today's invoice amount:", error);
    } finally {
      setIsInvoiceLoading(false);
    }
  };


  useEffect(() => {
    
    if (searchInputRef.current) {
      searchInputRef?.current?.focus();
    }
  }, [customers]);

 

  const fetchVegetables = async () => {
    setLoading(true); // Set loading to true before fetching data
    try {
      const response = await apiClient.get(`${API_BASE_URL}/vegetables/getVeg`);
      setVegetables(response.data);
    } catch (error) {
      console.error("Error fetching vegetables:", error);
    } finally {
      setLoading(false); // Set loading to false after fetching data
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchVegetables();
  }, []);

  const handleOpenCustomerModal = () => {
    setOpenCustomerModal(true);
  };

  const handleCloseCustomerModal = () => {
    setOpenCustomerModal(false);
  };

  const handleOpenCustomerInvoiceModal = (customerId,name) => {
    setSelectedCustomer({ id: customerId ,customerName:name });
    setOpenCustomerInvoiceModel(true);
  };

  const handleCloseCustomerInvoiceModal = () => {
    setOpenCustomerInvoiceModel(false);
  };

  const handleAddCustomer = (customer) => {
    setCustomers([...customers, customer]);
    handleCloseCustomerModal();
  };

  const handleOpenInvoiceModal = (customerId, lastBalance, customerName) => {
    setSelectedCustomer({ id: customerId, name: customerName, lastBalance });
    setOpenInvoiceModal(true);
  };

  const handleOpenTransactionModal = (customerId) => {
    setSelectedCustomer({ id: customerId });
    setOpenTransactionModal(true);
  };

  const handleCloseInvoiceModal = () => {
    setOpenInvoiceModal(false);
    setSelectedCustomer(null);
    setTimeout(() => {
      searchInputRef?.current?.focus();
    }, 0);
  };

  const handleCloseTransactionModal = () => {
    setOpenTransactionModal(false);
    setSelectedCustomer(null);
  };

  const handleOpenPaymentModal = (customerId, lastBalance, customerName) => {
    setSelectedCustomer({ id: customerId, name: customerName, lastBalance });
    setOpenPaymentModal(true);
  };

  const handleClosePaymentModal = () => {
    setOpenPaymentModal(false);
    setSelectedCustomer(null);
  };

  const handleOpenLedgerModal = async (customerId, customerName) => {
    setLoading(true);
    try {
    
      setSelectedCustomer({ id: customerId, name: customerName });
      setOpenLedgerModal(true);
    } catch (error) {
      console.error("Error fetching ledger data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseLedgerModal = () => {
    setOpenLedgerModal(false);
    setSelectedCustomer(null);
  };
  const handleAddInvoice = async (invoice) => {
    if (!selectedCustomer) return Promise.reject(new Error("No customer selected"));
  
    try {
      const { id: customerId } = selectedCustomer;
      const { date, items, grandTotal, invoiceNumber } = invoice;
  
      // Make a POST request to add the invoice
      const response = await apiClient.post(
        `${API_BASE_URL}/customers/${customerId}`,
        {
          date,
          items,
          balance: grandTotal,
          invoiceNumber,
        }
      );
  
      // Update the local state with the updated customer data
      const updatedCustomer = response.data.customer;
  
      setCustomers((prevCustomers) =>
        prevCustomers.map((customer) =>
          customer._id === updatedCustomer._id ? updatedCustomer : customer
        )
      );
  
      // Close the modal and reset selected customer
      handleCloseInvoiceModal();
      toast.success("Invoice Created successfully");
      setTimeout(() => {
        searchInputRef?.current?.focus();
      }, 0);
  
      return response; // Return the response as a promise
    } catch (error) {
      console.error("Error adding invoice:", error);
      return Promise.reject(error); // Reject the promise on error
    }
  };
  
  const handleMakePayment = async (payment) => {
    if (!selectedCustomer) return;

    try {
      const { id: customerId } = selectedCustomer;
      const { date, amount } = payment;

      // Make a POST request to add the payment
      const response = await apiClient.post(
        `${API_BASE_URL}/customers/${customerId}/payments`,
        {
          date,
          amount,
        }
      );

      // Update the local state with the updated customer data
      const updatedCustomer = response.data.customer;

      setCustomers((prevCustomers) =>
        prevCustomers.map((customer) =>
          customer._id === updatedCustomer._id ? updatedCustomer : customer
        )
      );

      // Close the modal and reset selected customer
      handleClosePaymentModal();
    } catch (error) {
      console.error("Error making payment:", error);
    }
  };

  const handleAddVegetable = async (vegetable) => {
    try {
      const response = await apiClient.post(`${API_BASE_URL}/vegetables/addveg`, {
        vegName: vegetable.name,
      });

      setVegetables([...vegetables, response.data]);
      setOpenVegetableModal(false);
      toast.success("Vegetable added successfully");
    } catch (error) {
      console.error("Error adding vegetable:", error);
    }
  };

  const toggleLedgerCard = () => {
    setIsLedgerCardOpen(!isLedgerCardOpen);
    if (!isLedgerCardOpen && !totalLedger) {
      fetchTotalLedger();
    }
  };

  const toggleTransactionsCard = () => {
    setIsTransactionsCardOpen(!isTransactionsCardOpen);
    if (!isTransactionsCardOpen) {
      fetchTodaysTransactions();
    }
  };

  const toggleTransactionsCard2 = () => {
    setIsTransactionsCardOpen2(!isTransactionsCardOpen2);
    if (!isTransactionsCardOpen2) {
      fetchYesterdayTransactions();
    }
  };

  const toggleInvoiceCard = () => {
    setIsInvoiceCardOpen(!isInvoiceCardOpen);
    if (!isInvoiceCardOpen && !todaysInvoiceAmount) {
      fetchTodaysInvoiceAmount();
    }
  };

  const columns = [
    {
      field: "sno",
      headerName: "S.No",
      flex: 0.5,
      minWidth: 80,
      renderCell: (params) => <Typography>{params.row.sno}</Typography>,
    },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      minWidth: 150,
    },
   {
      field: "lastBalance",
      headerName: "Ledger Balance",
      flex: 1,
      minWidth: 150,
      renderCell: (params) => {
        const balance = params.value; // Get the balance
        return (
          <Typography>
            {balance != null ? `₹ ${balance.toLocaleString()}` : '₹ 0'} {/* Handle null/undefined */}
          </Typography>
        );
      },
    },

    {
      field: "actions",
      headerName: "Actions",
      flex: 7,
      minWidth: 1400,
      renderCell: (params) => (
        <>
          {/* Conditionally render IconButton or Button based on screen size */}
          {window.innerWidth <= 600 ? (
            <>
              <IconButton
                color="primary"
                aria-label="add-invoice"
                onClick={() =>
                  handleOpenInvoiceModal(
                    params.row._id,
                    params.row.lastBalance,
                    params.row.name
                  )
                }
                style={{ marginRight: "8px" }}
              >
                <ReceiptIcon />
              </IconButton>
              <IconButton
                color="primary"
                aria-label="make-payment"
                onClick={() =>
                  handleOpenPaymentModal(
                    params.row._id,
                    params.row.lastBalance,
                    params.row.name
                  )
                }
                style={{ marginRight: "8px" }}
              >
                <PaymentIcon />
              </IconButton>
              <IconButton
                color="primary"
                aria-label="view-transactions"
                onClick={() => handleOpenTransactionModal(params.row._id)}
                style={{ marginRight: "8px" }}
              >
                <HistoryIcon />
              </IconButton>
              <IconButton
                color="primary"
                aria-label="view-ledger"
                onClick={() =>
                  handleOpenLedgerModal(params.row._id, params.row.name)
                }
              >
                <AccountBalanceIcon />
              </IconButton>

              <IconButton
                color="primary"
                aria-label="view-Invoices"
                onClick={() =>
                  handleOpenCustomerInvoiceModal(params.row._id,params.row.name)
                }
              >
                <ViewModuleIcon />
              </IconButton>
              <IconButton 
                      size="small" 
                      onClick={() => fetchCustomerDetails(params.row._id)}
                      sx={{ 
                        ml: 1,
                        color: 'primary.main',
                        '&:hover': { 
                          color: 'text.secondary',
                          bgcolor: 'action.hover'
                        },
                        transform: 'translateZ(0)'
                      }}
                    >
                      <Tooltip title="Download PDF">
                        <FileDownloadIcon fontSize="small" />
                      </Tooltip>
                    </IconButton>
            </>
          ) : (
            <>
           
              <Button
                variant="contained"
                onClick={() =>
                  handleOpenInvoiceModal(
                    params.row._id,
                    params.row.lastBalance,
                    params.row.name
                  )
                }
                sx={{
                  borderRadius: 2, // Rounded corners
                  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)', // Subtle shadow
                  marginRight: "8px",
                  backgroundColor: "Green",
                  minWidth: "100px",fontSize:"12px"
                }}
                startIcon={<ReceiptIcon />} // Use startIcon for proper alignment
                
              >
                Add Invoice
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() =>
                  handleOpenPaymentModal(
                    params.row._id,
                    params.row.lastBalance,
                    params.row.name
                  )
                }
                sx={{
                  borderRadius: 2, // Rounded corners
                  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)', // Subtle shadow
                   marginRight: "8px", minWidth: "100px",fontSize:"12px"
                }}
                startIcon={<PaymentIcon />} // Use startIcon for proper alignment
               
              >
                Make Payment
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleOpenTransactionModal(params.row._id)}
                sx={{
                  borderRadius: 2, // Rounded corners
                  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)', // Subtle shadow
                  backgroundColor: "orange", minWidth: "140px", 
                  fontSize:"12px"
                }}
                startIcon={<HistoryIcon />} // Use startIcon for proper alignment
                
              >
                View Transactions
              </Button>
              <Button
      variant="contained"
      color="primary"
      size="small" // Adjust the button to a smaller size
      onClick={() =>
        handleOpenLedgerModal(params.row._id, params.row.name)
      }
      sx={{
        borderRadius: 2, // Rounded corners
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)', // Subtle shadow
        marginLeft: '8px', backgroundColor: 'blue', minWidth: '120px',
        fontSize:"12px"
      }}
      startIcon={<AccountBalanceIcon/>} // Use startIcon for proper alignment
    >
      View Ledger
    </Button>
    <Button
      variant="contained"
      color="primary"
      size="small" // Adjust the button to a smaller size
      onClick={() =>
        handleOpenCustomerInvoiceModal(params.row._id,params.row.name)
      }
      sx={{
        borderRadius: 2, // Rounded corners
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)', // Subtle shadow
        marginLeft: '8px', backgroundColor: 'pink', minWidth: '120px',
        fontSize:"12px"
      }}
      startIcon={<AccountBalanceIcon/>} // Use startIcon for proper alignment
    >
      View Invoices
    </Button>
    <IconButton 
                      size="small" 
                      onClick={() => fetchCustomerDetails(params.row._id)}
                      sx={{ 
                        ml: 1,
                        color: 'primary.main',
                        '&:hover': { 
                          color: 'text.secondary',
                          bgcolor: 'action.hover'
                        },
                        transform: 'translateZ(0)'
                      }}
                    >
                      <Tooltip title="Download PDF">
                        <FileDownloadIcon fontSize="small" />
                      </Tooltip>
                    </IconButton>
    
            </>
          )}
        </>
      ),
    },
  ];

  const customersWithSNo = customers.map((customer, index) => ({
    ...customer,
    sno: index + 1,
  }));
  const filteredCustomers = customersWithSNo.filter((customer) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Container >
      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100vh"
        >
                    <FourSquare color={["#33CCCC", "#33CC36", "#B8CC33", "#FCCA00"]} size="small" text="loading...." textColor={["#33CCCC", "#33CC36", "#B8CC33", "#FCCA00"]} />

        </Box>
      ) : (
        <>
          <Box
            mt={5}
            mb={3}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            {window.innerWidth <= 600 ? (
              ""
            ) : (
              <Typography variant="h4">Customer List</Typography>
            )}
            <Box display="flex" alignItems="center">
              {window.innerWidth <= 600 ? (
                <>
                  <IconButton
                    color="primary"
                    aria-label="add-customer"
                    onClick={handleOpenCustomerModal}
                  >
                    <AddIcon />
                  </IconButton>
                  <IconButton
                    color="primary"
                    aria-label="add-vegetable"
                    onClick={() => setOpenVegetableModal(true)}
                    style={{ margin: "0 8px" }}
                  >
                    <VegetableIcon />
                  </IconButton>
                </>
              ) : (
                <>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleOpenCustomerModal}
                    style={{ marginRight: "8px" }}
                    startIcon={<AddIcon/>}
                  >
                    Add Customer
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setOpenVegetableModal(true)}
                    style={{ margin: "0 8px" }}
                    startIcon={<VegetableIcon/>}
                  >
                    Add Vegetable
                  </Button>
                </>
              )}
              <TextField
                variant="outlined"
                placeholder="Search Customers"
                inputRef={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ marginRight: "20px" }}
              />
            </Box>
          </Box>
          
          <Box >
            <DataGrid
              rows={filteredCustomers}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[5, 10, 20]}
              autoHeight={false}
              disableSelectionOnClick
              getRowId={(row) => row._id}
              sx={{pb:4}}
              localeText={{
                noRowsLabel: "It's lonely here.", 
                
              }}
            />
          </Box>
          <AddCustomer
            open={openCustomerModal}
            onClose={handleCloseCustomerModal}
            onCustomerAdded={handleAddCustomer}
          />
          <InvoiceModal
            open={openInvoiceModal}
            handleClose={handleCloseInvoiceModal}
            handleAddInvoice={handleAddInvoice}
            customer={selectedCustomer}
          />
          <PaymentModal
            open={openPaymentModal}
            handleClose={handleClosePaymentModal}
            handleMakePayment={handleMakePayment}
            customer={selectedCustomer}
            fetchCustomers={fetchCustomers}
          />
          <ViewTransaction
            open={openTransactionModal}
            handleClose={handleCloseTransactionModal}
            customer={selectedCustomer}
          />
          <AddVegetable
            open={openVegetableModal}
            onClose={() => setOpenVegetableModal(false)}
            onVegetableAdded={handleAddVegetable}
          />
          <LedgerModal
            open={openLedgerModal}
            onClose={handleCloseLedgerModal}
            ledgerData={ledgerData}
            customerName={selectedCustomer?.name}
            customerId={selectedCustomer?.id}
          />
            <CustomerInvoiceModal
        open={openCustomerInvoiceModel}
        handleClose={handleCloseCustomerInvoiceModal}
        customerId={selectedCustomer?.id}
        customerName={selectedCustomer?.customerName}
     // Pass the customer ID as prop
      />
          {/* <Box mt={3} mb={3} display="flex" justifyContent="space-between">
            <Card style={{ width: '30%', minWidth: '200px' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Total Ledger Balance</Typography>
                <Typography variant="h4" color="primary">{`₹ ${totalLedger.toLocaleString()}`}</Typography>
                <Typography variant="body1" color="textSecondary">{totalLedgerInWords} rupees</Typography>
              </CardContent>
            </Card>
            <Card style={{ width: '30%', minWidth: '200px' }}>
              
              <CardContent>
                <Typography variant="h6" gutterBottom>Today's Transactions Amount</Typography>
                <Typography variant="h4" color="primary">{`₹ ${todaysTransactionsAmount?.totalSum.toLocaleString()}`}</Typography>
                <Typography variant="body1" color="textSecondary">{todaysTransactionsAmount?.totalInWords} rupees</Typography>
              </CardContent>
            </Card>
            <Card style={{ width: '30%', minWidth: '200px' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Today's Invoice Amount</Typography>
                <Typography variant="h4" color="primary">{`₹ ${todaysInvoiceAmount?.totalAmount?.toLocaleString()}`}</Typography>
                <Typography variant="body1" color="textSecondary">{todaysInvoiceAmount?.totalAmountInWords} rupees</Typography>

              </CardContent>
            </Card>
          </Box> */}
          {/* Collapsible Cards */}
          {/* <Box mb={2}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="h6">Total Ledger Balance</Typography>
              <IconButton onClick={toggleLedgerCard}>
                <ExpandMoreIcon />
              </IconButton>
            </Box>
            <Collapse in={isLedgerCardOpen} timeout="auto" unmountOnExit>
              {isLedgerLoading ? (
                <Box>
                  <Skeleton variant="text" height={40} width="60%" />
                  <Skeleton variant="text" height={30} width="50%" />
                </Box>
              ) : (
                <>
                  <Typography variant="body1">
                    Balance: ₹ {totalLedger}
                  </Typography>
                  <Typography variant="body1">
                    In Words: {totalLedgerInWords}
                  </Typography>
                </>
              )}
            </Collapse>
          </CardContent>
        </Card>
      </Box>

      <Box mb={2}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="h6">Today's Transactions Amount</Typography>
              <IconButton onClick={toggleTransactionsCard}>
                <ExpandMoreIcon />
              </IconButton>
            </Box>
            <Collapse in={isTransactionsCardOpen} timeout="auto" unmountOnExit>
              {isTransactionsLoading ? (
                <Box>
                  <Skeleton variant="text" height={40} width="60%" />
                  <Skeleton variant="text" height={30} width="50%" />
                  <Skeleton variant="text" height={30} width="50%" />
                  <Skeleton variant="text" height={30} width="50%" />
                  <Skeleton variant="rectangular" height={300} />
                </Box>
              ) : (
                <>
                  <Typography variant="body1">
                    Total Amount: ₹ {todaysTransactionsAmount?.totalSum}
                  </Typography>
                  <Typography variant="body1">
                    In Words: {todaysTransactionsAmount?.totalInWords}
                  </Typography>
                  <Typography variant="body1">
                    Cash: ₹ {todaysTransactionsAmount?.cash}
                  </Typography>
                  <Typography variant="body1">
                    Account Transfer: ₹ {todaysTransactionsAmount?.accountPayment}
                  </Typography>

                  <Box mt={2}>
                    <Typography variant="h6" gutterBottom>
                      Transaction Details:
                    </Typography>
                    {todaysTransactions?.length > 0 ? (
                      <table
                        style={{
                          width: '100%',
                          borderCollapse: 'collapse',
                        }}
                      >
                        <thead>
                          <tr>
                            <th
                              style={{
                                borderBottom: '1px solid #ccc',
                                padding: '8px',
                                textAlign: 'left',
                              }}
                            >
                              Customer Name
                            </th>
                            <th
                              style={{
                                borderBottom: '1px solid #ccc',
                                padding: '8px',
                                textAlign: 'left',
                              }}
                            >
                              Receipt Number
                            </th>
                            <th
                              style={{
                                borderBottom: '1px solid #ccc',
                                padding: '8px',
                                textAlign: 'right',
                              }}
                            >
                              Amount (₹)
                            </th>
                            <th
                              style={{
                                borderBottom: '1px solid #ccc',
                                padding: '8px',
                                textAlign: 'center',
                              }}
                            >
                              Mode
                            </th>
                           
                          </tr>
                        </thead>
                        <tbody>
                          {todaysTransactions.map((transaction) => (
                            <tr key={transaction._id}>
                              <td
                                style={{
                                  borderBottom: '1px solid #eee',
                                  padding: '8px',
                                }}
                              >
                                {transaction.customerId.name}
                              </td>
                              <td
                                style={{
                                  borderBottom: '1px solid #eee',
                                  padding: '8px',
                                }}
                              >
                                {transaction.receiptNumber}
                              </td>
                              <td
                                style={{
                                  borderBottom: '1px solid #eee',
                                  padding: '8px',
                                  textAlign: 'right',
                                }}
                              >
                                {transaction.amount.toLocaleString()}
                              </td>
                              <td
                                style={{
                                  borderBottom: '1px solid #eee',
                                  padding: '8px',
                                  textAlign: 'center',
                                }}
                              >
                                {transaction.transactionMode}
                              </td>
                             
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <Typography variant="body2">
                        No transactions found for today.
                      </Typography>
                    )}
                  </Box>
                </>
              )}
            </Collapse>
          </CardContent>
        </Card>
      </Box>

      <Box mb={2}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="h6">Yesterday Transactions Amount</Typography>
              <IconButton onClick={toggleTransactionsCard2}>
                <ExpandMoreIcon />
              </IconButton>
            </Box>
            <Collapse in={isTransactionsCardOpen2} timeout="auto" unmountOnExit>
              {isTransactionsLoading2 ? (
                <Box>
                  <Skeleton variant="text" height={40} width="60%" />
                  <Skeleton variant="text" height={30} width="50%" />
                  <Skeleton variant="text" height={30} width="50%" />
                  <Skeleton variant="rectangular" height={300} />
                </Box>
              ) : (
                <>
                  <Typography variant="body1">
                    Total Amount: ₹ {yesterdayTransactionsAmount?.totalSum}
                  </Typography>
                  <Typography variant="body1">
                    In Words: {yesterdayTransactionsAmount?.totalInWords}
                  </Typography>
                  <Typography variant="body1">
                    Cash: ₹ {yesterdayTransactionsAmount?.cash}
                  </Typography>
                  <Typography variant="body1">
                    Account Transfer: ₹ {yesterdayTransactionsAmount?.accountPayment}
                  </Typography>
                  <Box mt={2}>
                    <Typography variant="h6" gutterBottom>
                      Transaction Details:
                    </Typography>
                    {yesterdayTransactions?.length > 0 ? (
                      <table
                        style={{
                          width: '100%',
                          borderCollapse: 'collapse',
                        }}
                      >
                        <thead>
                          <tr>
                            <th
                              style={{
                                borderBottom: '1px solid #ccc',
                                padding: '8px',
                                textAlign: 'left',
                              }}
                            >
                              Customer Name
                            </th>
                            <th
                              style={{
                                borderBottom: '1px solid #ccc',
                                padding: '8px',
                                textAlign: 'left',
                              }}
                            >
                              Receipt Number
                            </th>
                            <th
                              style={{
                                borderBottom: '1px solid #ccc',
                                padding: '8px',
                                textAlign: 'right',
                              }}
                            >
                              Amount (₹)
                            </th>
                            <th
                              style={{
                                borderBottom: '1px solid #ccc',
                                padding: '8px',
                                textAlign: 'center',
                              }}
                            >
                              Mode
                            </th>
                           
                          </tr>
                        </thead>
                        <tbody>
                          {yesterdayTransactions.map((transaction) => (
                            <tr key={transaction._id}>
                              <td
                                style={{
                                  borderBottom: '1px solid #eee',
                                  padding: '8px',
                                }}
                              >
                                {transaction.customerId.name}
                              </td>
                              <td
                                style={{
                                  borderBottom: '1px solid #eee',
                                  padding: '8px',
                                }}
                              >
                                {transaction.receiptNumber}
                              </td>
                              <td
                                style={{
                                  borderBottom: '1px solid #eee',
                                  padding: '8px',
                                  textAlign: 'right',
                                }}
                              >
                                {transaction.amount.toLocaleString()}
                              </td>
                              <td
                                style={{
                                  borderBottom: '1px solid #eee',
                                  padding: '8px',
                                  textAlign: 'center',
                                }}
                              >
                                {transaction.transactionMode}
                              </td>
                              
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <Typography variant="body2">
                        No transactions found for Yesterday.
                      </Typography>
                    )}
                  </Box>
                </>
              )}
            </Collapse>
          </CardContent>
        </Card>
      </Box>

      <Box mb={2}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="h6">Today's Invoice Amount</Typography>
              <IconButton onClick={toggleInvoiceCard}>
                <ExpandMoreIcon />
              </IconButton>
            </Box>
            <Collapse in={isInvoiceCardOpen} timeout="auto" unmountOnExit>
              {isInvoiceLoading ? (
                <Box>
                  <Skeleton variant="text" height={40} width="60%" />
                  <Skeleton variant="text" height={30} width="50%" />
                </Box>
              ) : (
                <>
                  <Typography variant="body1">
                    Amount: ₹ {todaysInvoiceAmount?.totalAmount}
                  </Typography>
                  <Typography variant="body1">
                    In Words: {todaysInvoiceAmount?.totalAmountInWords}
                  </Typography>
                </>
              )}
            </Collapse>
          </CardContent>
        </Card>
      </Box> */}
        </>
      )}
    </Container>
  );
};

export default Homepage;
