import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Skeleton,
  Collapse,
  IconButton,
  Avatar,
  Button,
  Chip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import ReceiptIcon from "@mui/icons-material/Receipt";
import PeopleIcon from "@mui/icons-material/People";
import StoreIcon from "@mui/icons-material/Store";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import InventoryIcon from "@mui/icons-material/Inventory";
import apiClient from "../services/apiClient";
import { API_BASE_URL } from "../constants";
import { Link, useNavigate } from "react-router-dom";
import CountUp from "react-countup";
import AnimatedText from "./AnimatedGreeting";

const AdminDashboardPage = () => {
  // States for loading data and expanded details
  const [isLedgerLoading, setLedgerLoading] = useState(true);
  const [isVendorLedgerLoading, setLedgerVendorLoading] = useState(true);
  const [isTransactionsLoading, setTransactionsLoading] = useState(true);
  const [isTransactionsLoading2, setTransactionsLoading2] = useState(true);
  const [isTransactionsLoading3, setTransactionsLoading3] = useState(true);
  const [isTransactionsLoading4, setTransactionsLoading4] = useState(true);
  const [isInvoiceLoading, setInvoiceLoading] = useState(true);
  const [isCustomersLoading, setCustomersLoading] = useState(true);
  const [isVendorsLoading, setVendorsLoading] = useState(true);
  const [isGoodsPurchasedLoading, setGoodsPurchasedLoading] = useState(true);
  const [isInventoryLoading, setInventoryLoading] = useState(true);
  const [openTransactions, setOpenTransactions] = useState(false);
  const [openTransactions2, setOpenTransactions2] = useState(false);
  const [openTransactions3, setOpenTransactions3] = useState(false);
  const [openTransactions4, setOpenTransactions4] = useState(false);
  const [ledgerData, setLedgerData] = useState(null);
  const [totalLedger, setTotalLedger] = useState(0);
  const [totalVendorLedger, setTotalVendorLedger] = useState(0);
  const [totalLedgerInWords, setTotalLedgerInWords] = useState("");
  const [totalVendorLedgerInWords, setTotalVendorLedgerInWords] = useState("");
  const [todaysTransactions, setTodaysTransactions] = useState([]);
  const [todaysTransactionsAmount, setTodaysTransactionsAmount] = useState({});
  const [yesterdayTransactions, setYesterdayTransactions] = useState([]);
  const [yesterdayTransactionsAmount, setYesterdayTransactionsAmount] =
    useState({});
  const [todaysInvoiceAmount, setTodaysInvoiceAmount] = useState({});
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalVendors, setTotalVendors] = useState(0);
  const [goodsPurchasedInCashToday, setGoodsPurchasedInCashToday] = useState(
    {}
  );
  const [totalItemsInInventory, setTotalItemsInInventory] = useState(0);

  const [todaysWatakTransactions, setTodaysWatakTransactions] = useState([]);
  const [todaysWatakTransactionsAmount, setTodaysWatakTransactionsAmount] =
    useState({});
  const [yesterdayWatakTransactions, setYesterdayWatakTransactions] = useState(
    []
  );
  const [
    yesterdayWatakTransactionsAmount,
    setYesterdayWatakTransactionsAmount,
  ] = useState({});

  // Common table styles that can be reused for all dropdowns
  const mobileTableStyles = {
    width: '100%',
    '& table': {
      width: '100%',
    },
    '& td, & th': {
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem'
      },
      px: {
        xs: 1,
        sm: 2
      },
      py: 1,
      maxWidth: {
        xs: '80px',
        sm: 'none'
      },
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },
    '& .MuiChip-root': {
      height: {
        xs: '24px',
        sm: '32px'
      },
      '& .MuiChip-label': {
        fontSize: {
          xs: '0.7rem',
          sm: '0.875rem'
        },
        px: {
          xs: 1,
          sm: 2
        }
      }
    }
  };

  // Fetch data functions
  const fetchTotalLedger = async () => {
    setLedgerLoading(true);
    try {
      const response = await apiClient.get(`${API_BASE_URL}/getTotalledger`);
      setTotalLedger(response.data.totalLedger);
      setTotalLedgerInWords(response.data.totalLedgerInIndianWords);
    } catch (error) {
      console.error("Error fetching total ledger balance:", error);
    } finally {
      setLedgerLoading(false);
    }
  };

  const fetchTotalVendorLedger = async () => {
    setLedgerVendorLoading(true);
    try {
      const response = await apiClient.get(`${API_BASE_URL}/getTotalVendorledger`);
      setTotalVendorLedger(response.data.totalLedger);
      setTotalVendorLedgerInWords(response.data.totalLedgerInIndianWords);
    } catch (error) {
      console.error("Error fetching total ledger balance:", error);
    } finally {
      setLedgerVendorLoading(false);
    }
  };

  const toggleTransactionsCard = () => {
    setOpenTransactions(!openTransactions);
    if (!openTransactions) {
      fetchTodaysTransactions();
    }
  };

  const toggleTransactionsCard2 = () => {
    setOpenTransactions2(!openTransactions2);
    if (!openTransactions2) {
      fetchYesterdayTransactions();
    }
  };
  const toggleTransactionsCard3 = () => {
    setOpenTransactions3(!openTransactions3);
    if (!openTransactions3) {
      fetchTodaysWatakTransactions();
    }
  };
  const toggleTransactionsCard4 = () => {
    setOpenTransactions4(!openTransactions4);
    if (!openTransactions4) {
      fetchYesterdaysWatakTransactions();
    }
  };

  const fetchTodaysTransactions = async () => {
    setTransactionsLoading(true);
    try {
      const response = await apiClient.get(`${API_BASE_URL}/getTodaysTrans`);
      const { transactions, totalSum, totalInWords, cash, accountPayment } =
        response.data.data;
      setTodaysTransactions(transactions);
      setTodaysTransactionsAmount({
        totalSum,
        totalInWords,
        cash,
        accountPayment,
      });
    } catch (error) {
      console.error("Error fetching today's transactions:", error);
    } finally {
      setTransactionsLoading(false);
    }
  };

  const fetchYesterdayTransactions = async () => {
    setTransactionsLoading2(true);
    try {
      const response = await apiClient.get(`${API_BASE_URL}/getYesterdayTrans`);
      const { transactions, totalSum, totalInWords, cash, accountPayment } =
        response.data.data;
      setYesterdayTransactions(transactions);
      setYesterdayTransactionsAmount({
        totalSum,
        totalInWords,
        cash,
        accountPayment,
      });
    } catch (error) {
      console.error("Error fetching yesterday's transactions:", error);
    } finally {
      setTransactionsLoading2(false);
    }
  };

  const fetchTodaysWatakTransactions = async () => {
    setTransactionsLoading3(true);
    try {
      const response = await apiClient.get(
        `${API_BASE_URL}/getTodaysVendorTrans`
      );
      const { transactions, totalSum, totalInWords, cash, accountPayment } =
        response.data.data;
      setTodaysWatakTransactions(transactions);
      setTodaysWatakTransactionsAmount({
        totalSum,
        totalInWords,
        cash,
        accountPayment,
      });
    } catch (error) {
      console.error("Error fetching today's transactions:", error);
    } finally {
      setTransactionsLoading3(false);
    }
  };
  const fetchYesterdaysWatakTransactions = async () => {
    setTransactionsLoading4(true);
    try {
      const response = await apiClient.get(
        `${API_BASE_URL}/getYesterdayVendorTrans`
      );
      const { transactions, totalSum, totalInWords, cash, accountPayment } =
        response.data.data;
      setYesterdayWatakTransactions(transactions);
      setYesterdayWatakTransactionsAmount({
        totalSum,
        totalInWords,
        cash,
        accountPayment,
      });
    } catch (error) {
      console.error("Error fetching today's transactions:", error);
    } finally {
      setTransactionsLoading4(false);
    }
  };

  const fetchTodaysInvoiceAmount = async () => {
    setInvoiceLoading(true);
    try {
      const response = await apiClient.get(`${API_BASE_URL}/getInvoices`);
      const {
        totalAmount,
        totalAmountInWords,
        totalCashInWords,
        todaysCashInvoices,
      } = response.data.data;
      setTodaysInvoiceAmount({
        totalAmount,
        totalAmountInWords,
        totalCashInWords,
        todaysCashInvoices,
      });
    } catch (error) {
      console.error("Error fetching today's invoice amount:", error);
    } finally {
      setInvoiceLoading(false);
    }
  };

  const fetchCustomers = async () => {
    setCustomersLoading(true);
    try {
      const response = await apiClient.get(`${API_BASE_URL}/customers`);
      const customers = response.data.data.customers;
      setTotalCustomers(customers.length);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setCustomersLoading(false);
    }
  };

  const fetchVendors = async () => {
    setVendorsLoading(true);
    try {
      const response = await apiClient.get(`${API_BASE_URL}/vendors`);
      const vendor = response.data.vendors || response.data;
      setTotalVendors(vendor.length);
    } catch (error) {
      console.error("Error fetching vendors:", error);
    } finally {
      setVendorsLoading(false);
    }
  };

  const fetchInventory = async () => {
    setInventoryLoading(true);
    try {
      const response = await apiClient.get(`${API_BASE_URL}/total-items`);
      setTotalItemsInInventory(response.data.totalItems);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setInventoryLoading(false);
    }
  };

  // Simulate data loading
  useEffect(() => {
    fetchTotalLedger();
    fetchTotalVendorLedger();
    fetchTodaysInvoiceAmount();
    fetchCustomers();
    fetchVendors();
    fetchInventory();

    // Simulate loading states for other data
    setCustomersLoading(false);
    setVendorsLoading(false);
    setGoodsPurchasedLoading(false);
    setInventoryLoading(false);
  }, []);

  const getGreeting = () => {
    const now = new Date();
    const hours = now.getHours();

    if (hours >= 5 && hours < 12) {
      return "Good Morning";
    } else if (hours >= 12 && hours < 18) {
      return "Good Afternoon";
    } else if (hours >= 18 && hours < 22) {
      return "Good Evening";
    } else {
      return "Good Night";
    }
  };
  const greeting = getGreeting();
  return (
    <Container
      maxWidth="lg"
      sx={{
        pt: '10px', // Added top padding to account for fixed navbar
        pb: 4,
        minHeight: '100vh',
        backgroundColor: '#f8fafc'
      }}
    >
   

      <Grid container spacing={3}>
        {/* First Row - 3 main cards */}
        <Grid item xs={12}>
          <Typography variant="h5" sx={{ mb: 1, color: '#1e293b', fontWeight: 600 }}>
            Business Overview
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Link to="/customers" style={{ textDecoration: 'none' }}>
            <Card
              sx={{
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                color: 'white',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)'
                }
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      width: 48,
                      height: 48
                    }}
                  >
                    <PeopleIcon sx={{ fontSize: 28 }} />
                  </Avatar>
                  <Box ml={2}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Total Customers
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Active accounts in your business
                    </Typography>
                  </Box>
                </Box>
                {isCustomersLoading ? (
                  <Skeleton variant="text" height={40} sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
                ) : (
                  <Box display="flex" alignItems="baseline">
                    <Typography variant="h4" sx={{ fontWeight: 700, mr: 1 }}>
                      <CountUp
                        start={0}
                        end={totalCustomers}
                        duration={2}
                        separator=","
                      />
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Total registered customers
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Link>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Link to="/vendors" style={{ textDecoration: 'none' }}>
            <Card
              sx={{
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',
                color: 'white',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)'
                }
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      width: 48,
                      height: 48
                    }}
                  >
                    <StoreIcon sx={{ fontSize: 28 }} />
                  </Avatar>
                  <Box ml={2}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Total Vendors
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Active suppliers and partners
                    </Typography>
                  </Box>
                </Box>
                {isVendorsLoading ? (
                  <Skeleton variant="text" height={40} sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
                ) : (
                  <Box display="flex" alignItems="baseline">
                    <Typography variant="h4" sx={{ fontWeight: 700, mr: 1 }}>
                      <CountUp
                        start={0}
                        end={totalVendors}
                        duration={2}
                        separator=","
                      />
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Registered suppliers
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Link>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Link to="/inventory" style={{ textDecoration: 'none' }}>
            <Card
              sx={{
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                color: 'white',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)'
                }
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      width: 48,
                      height: 48
                    }}
                  >
                    <InventoryIcon sx={{ fontSize: 28 }} />
                  </Avatar>
                  <Box ml={2}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Total Items
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Products in your inventory
                    </Typography>
                  </Box>
                </Box>
                {isInventoryLoading ? (
                  <Skeleton variant="text" height={40} sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
                ) : (
                  <Box display="flex" alignItems="baseline">
                    <Typography variant="h4" sx={{ fontWeight: 700, mr: 1 }}>
                      <CountUp
                        start={0}
                        end={totalItemsInInventory}
                        duration={2}
                        separator=","
                      />
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Active products
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Link>
        </Grid>

        {/* Second Row - Financial Overview */}
        <Grid item xs={12}>
          <Typography variant="h5" sx={{ my: 3, color: '#1e293b', fontWeight: 600 }}>
            Financial Overview
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
              color: 'white',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)'
              }
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    width: 48,
                    height: 48
                  }}
                >
                  <MonetizationOnIcon sx={{ fontSize: 28 }} />
                </Avatar>
                <Box ml={2}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Total Accounts Receivable
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    opacity: 0.8,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}>
                    Total amount owed to your business
                  </Typography>
                </Box>
              </Box>
              {isLedgerLoading ? (
                <Skeleton variant="text" height={40} sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
              ) : (
                <>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    ₹ <CountUp
                      start={0}
                      end={totalLedger}
                      duration={2.75}
                      separator=","
                    />
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {totalLedgerInWords}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #fb7185 0%, #e11d48 100%)',
              color: 'white',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)'
              }
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    width: 48,
                    height: 48
                  }}
                >
                  <MonetizationOnIcon sx={{ fontSize: 28 }} />
                </Avatar>
                <Box ml={2}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Total Accounts Payable
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    opacity: 0.8,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}>
                    Total amount owed by your business
                  </Typography>
                </Box>
              </Box>
              {isVendorLedgerLoading ? (
                <Skeleton variant="text" height={40} sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
              ) : (
                <>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    ₹ <CountUp
                      start={0}
                      end={totalVendorLedger}
                      duration={2.75}
                      separator=","
                    />
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {totalVendorLedgerInWords}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
        <Link to="/today-invoices" style={{ textDecoration: 'none' }}>
          <Card
            sx={{
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
              color: 'white',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)'
              }
            }}
          >
            <CardContent sx={{ p: 2 }}>
       

              <Box display="flex" alignItems="center" mb={2}>
                <Avatar
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    
                    width: 48,
                    height: 48
                  }}
                >
                  <ReceiptIcon sx={{ fontSize: 28 }} />
                </Avatar>
                <Box ml={2}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Today's Invoice Amount
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    opacity: 0.8,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}>
                    Total amount from today's invoices
                  </Typography>
                </Box>
              </Box>
              {isInvoiceLoading ? (
                <Skeleton variant="text" height={40} sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
              ) : (
                <>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    ₹ <CountUp
                      start={0}
                      end={todaysInvoiceAmount.totalAmount}
                      duration={1.75}
                      separator=","
                    />
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {todaysInvoiceAmount.totalAmountInWords}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
            </Link>
        </Grid>

        {/* Third Row - Today's Activity */}
        <Grid item xs={12}>
          <Typography variant="h5" sx={{ my: 3, color: '#1e293b', fontWeight: 600 }}>
            Today's Activity
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Card
            sx={{
              borderRadius: '16px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              background: 'white'
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Box display="flex" alignItems="center">
                  <Avatar sx={{ bgcolor: '#6ee7b7', width: 40, height: 40 }}>
                    <ShoppingCartIcon />
                  </Avatar>
                  <Box ml={2}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#334155' }}>
                      Cash Purchases Today
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total goods purchased in cash
                    </Typography>
                  </Box>
                </Box>
              </Box>
              {isGoodsPurchasedLoading ? (
                <Skeleton variant="text" height={40} />
              ) : (
                <>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#334155' }}>
                    ₹ <CountUp
                      start={0}
                      end={todaysInvoiceAmount.todaysCashInvoices || 0}
                      duration={1.75}
                      separator=","
                    />
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {todaysInvoiceAmount.totalCashInWords || 'No cash purchases today'}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item md={6} xs={12}>
          <Card
            sx={{
              borderRadius: '16px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              background: 'white'
            }}
          >
            <CardContent>
              <Box 
                display="flex" 
                alignItems="center" 
                justifyContent="space-between"
                mb={2}
              >
                <Box display="flex" alignItems="center">
                  <Avatar
                    sx={{
                      bgcolor: '#22c55e',
                      width: 40,
                      height: 40
                    }}
                  >
                    <ReceiptIcon />
                  </Avatar>
                  <Typography variant="h6" sx={{ ml: 2, fontWeight: 600, color: '#334155' }}>
                    Today's Transactions
                  </Typography>
                </Box>
                <IconButton
                  onClick={toggleTransactionsCard}
                  sx={{
                    transform: openTransactions ? 'rotate(180deg)' : 'rotate(0)',
                    transition: 'transform 0.3s'
                  }}
                >
                  <ExpandMoreIcon />
                </IconButton>
              </Box>
              <Collapse in={openTransactions}>
                <Box 
                  sx={{ 
                    bgcolor: '#f8fafc',
                    borderRadius: '12px',
                    p: 2,
                    mt: 2 
                  }}
                >
                  <Grid container spacing={2} mb={2}>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Cash Transactions
                      </Typography>
                      <Typography variant="h5" fontWeight="600">
                        ₹ {todaysTransactionsAmount.cash?.toLocaleString() || '0'}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Account Payment
                      </Typography>
                      <Typography variant="h5" fontWeight="600">
                        ₹ {todaysTransactionsAmount.accountPayment?.toLocaleString() || '0'}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Total
                      </Typography>
                      <Typography variant="h5" fontWeight="600">
                        ₹ {(todaysTransactionsAmount.cash + todaysTransactionsAmount.accountPayment)?.toLocaleString() || '0'}
                      </Typography>
                    </Grid>
                  </Grid>
                  
                  {isTransactionsLoading ? (
                    <Box sx={{ width: '100%' }}>
                      <Skeleton variant="text" sx={{ fontSize: '1rem', mb: 2 }} />
                      <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1 }} />
                    </Box>
                  ) : (
                    <>
                      <Typography variant="body2" color="text.secondary" mb={2}>
                      In Words:  {todaysTransactionsAmount.totalInWords}
                      </Typography>
                      {todaysTransactions?.length > 0 ? (
                        <Box sx={mobileTableStyles}>
                          <table style={{ borderCollapse: 'collapse' }}>
                            <thead>
                              <tr>
                                <th style={{ textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                                  Name
                                </th>
                                <th style={{ textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                                  Receipt
                                </th>
                                <th style={{ textAlign: 'right', borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                                  Amount
                                </th>
                                <th style={{ textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                                  Mode
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {todaysTransactions.map((transaction) => (
                                <tr key={transaction._id}>
                                  <td style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    {transaction.customerId.name}
                                  </td>
                                  <td style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    {transaction.receiptNumber}
                                  </td>
                                  <td style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>
                                    ₹ {transaction.amount.toLocaleString()}
                                  </td>
                                  <td style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'center' }}>
                                    <Chip 
                                      label={transaction.transactionMode === "Account Transfer" ? "A/C" : transaction.transactionMode}
                                      size="small"
                                      sx={{
                                        bgcolor: transaction.transactionMode === "Cash" ? '#dcfce7' : '#eff6ff',
                                        color: transaction.transactionMode === "Cash" ? '#166534' : '#1e40af',
                                        fontWeight: 500
                                      }}
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary" textAlign="center">
                          No transactions found for today.
                        </Typography>
                      )}
                    </>
                  )}
                </Box>
              </Collapse>
            </CardContent>
          </Card>
        </Grid>

        

        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: '16px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              background: 'white'
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Box display="flex" alignItems="center">
                  <Avatar
                    sx={{
                      bgcolor: '#ef4444',
                      width: 40,
                      height: 40
                    }}
                  >
                    <ReceiptIcon />
                  </Avatar>
                  <Typography variant="h6" sx={{ ml: 2, fontWeight: 600, color: '#334155' }}>
                    Today's Accounts Payable
                  </Typography>
                </Box>
                <IconButton onClick={toggleTransactionsCard3}>
                  <ExpandMoreIcon 
                    sx={{
                      transform: openTransactions3 ? 'rotate(180deg)' : 'rotate(0)',
                      transition: 'transform 0.3s'
                    }}
                  />
                </IconButton>
              </Box>
              <Collapse in={openTransactions3}>
                <Box 
                  sx={{ 
                    bgcolor: '#f8fafc',
                    borderRadius: '12px',
                    p: 2,
                    mt: 2 
                  }}
                >
                  <Grid container spacing={2} mb={2}>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Total Amount
                      </Typography>
                      <Typography variant="h5" fontWeight="600">
                        ₹ {todaysWatakTransactionsAmount.totalSum?.toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Cash Transactions
                      </Typography>
                      <Typography variant="h5" fontWeight="600">
                        ₹ {todaysWatakTransactionsAmount.cash?.toLocaleString()}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {todaysWatakTransactionsAmount.totalInWords}
                  </Typography>
                  {todaysWatakTransactions?.length > 0 ? (
                    <Box sx={mobileTableStyles}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr>
                            <th style={{ textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                              Vendor Name
                            </th>
                            <th style={{ textAlign: 'right', borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                              Amount
                            </th>
                            <th style={{ textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                              Mode
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {todaysWatakTransactions.map((transaction) => (
                            <tr key={transaction._id}>
                              <td style={{ borderBottom: '1px solid #e2e8f0' }}>
                                {transaction.vendorId.name}
                              </td>
                              <td style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>
                                ₹ {transaction.amount.toLocaleString()}
                              </td>
                              <td style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'center' }}>
                                <Chip 
                                  label={transaction.transactionMode === "Account Transfer" ? "A/C" : transaction.transactionMode}
                                  size="small"
                                  sx={{
                                    bgcolor: transaction.transactionMode === "Cash" ? '#dcfce7' : '#eff6ff',
                                    color: transaction.transactionMode === "Cash" ? '#166534' : '#1e40af',
                                    fontWeight: 500
                                  }}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                      No transactions found for today.
                    </Typography>
                  )}
                </Box>
              </Collapse>
            </CardContent>
          </Card>
        </Grid>
     

        {/* Fourth Row - Yesterday's Activity */}
        <Grid item xs={12}>
          <Typography variant="h5" sx={{ my: 3, color: '#1e293b', fontWeight: 600 }}>
            Yesterday's Activity
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: '16px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              background: 'white'
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Box display="flex" alignItems="center">
                  <Avatar sx={{ bgcolor: '#22c55e', width: 40, height: 40 }}>
                    <ReceiptIcon />
                  </Avatar>
                  <Typography variant="h6" sx={{ ml: 2, fontWeight: 600, color: '#334155' }}>
                    Yesterday's Accounts Receivable
                  </Typography>
                </Box>
                <IconButton onClick={toggleTransactionsCard2}>
                  <ExpandMoreIcon 
                    sx={{
                      transform: openTransactions2 ? 'rotate(180deg)' : 'rotate(0)',
                      transition: 'transform 0.3s'
                    }}
                  />
                </IconButton>
              </Box>
              <Collapse in={openTransactions2}>
                <Box 
                  sx={{ 
                    bgcolor: '#f8fafc',
                    borderRadius: '12px',
                    p: 2,
                    mt: 2 
                  }}
                >
                  <Grid container spacing={2} mb={2}>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Cash Transactions
                      </Typography>
                      <Typography variant="h5" fontWeight="600">
                        ₹ {yesterdayTransactionsAmount.cash?.toLocaleString() || '0'}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Account Payment
                      </Typography>
                      <Typography variant="h5" fontWeight="600">
                        ₹ {yesterdayTransactionsAmount.accountPayment?.toLocaleString() || '0'}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Total
                      </Typography>
                      <Typography variant="h5" fontWeight="600">
                        ₹ {yesterdayTransactionsAmount.totalSum?.toLocaleString() || '0'}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {yesterdayTransactionsAmount.totalInWords}
                  </Typography>
                  {yesterdayTransactions?.length > 0 ? (
                    <Box sx={mobileTableStyles}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr>
                            <th style={{ textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                              Customer Name
                            </th>
                            <th style={{ textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                              Receipt Number
                            </th>
                            <th style={{ textAlign: 'right', borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                              Amount
                            </th>
                            <th style={{ textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                              Mode
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {yesterdayTransactions.map((transaction) => (
                            <tr key={transaction._id}>
                              <td style={{ borderBottom: '1px solid #e2e8f0' }}>
                                {transaction.customerId.name}
                              </td>
                              <td style={{ borderBottom: '1px solid #e2e8f0' }}>
                                {transaction.receiptNumber}
                              </td>
                              <td style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>
                                ₹ {transaction.amount.toLocaleString()}
                              </td>
                              <td style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'center' }}>
                                <Chip 
                                  label={transaction.transactionMode === "Account Transfer" ? "A/C" : transaction.transactionMode}
                                  size="small"
                                  sx={{
                                    bgcolor: transaction.transactionMode === "Cash" ? '#dcfce7' : '#eff6ff',
                                    color: transaction.transactionMode === "Cash" ? '#166534' : '#1e40af',
                                    fontWeight: 500
                                  }}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                      No transactions found for yesterday.
                    </Typography>
                  )}
                </Box>
              </Collapse>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: '16px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              background: 'white'
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Box display="flex" alignItems="center">
                  <Avatar sx={{ bgcolor: '#ef4444', width: 40, height: 40 }}>
                    <ReceiptIcon />
                  </Avatar>
                  <Typography variant="h6" sx={{ ml: 2, fontWeight: 600, color: '#334155' }}>
                    Yesterday's Accounts Payable
                  </Typography>
                </Box>
                <IconButton onClick={toggleTransactionsCard4}>
                  <ExpandMoreIcon 
                    sx={{
                      transform: openTransactions4 ? 'rotate(180deg)' : 'rotate(0)',
                      transition: 'transform 0.3s'
                    }}
                  />
                </IconButton>
              </Box>
              <Collapse in={openTransactions4}>
                <Box 
                  sx={{ 
                    bgcolor: '#f8fafc',
                    borderRadius: '12px',
                    p: 2,
                    mt: 2 
                  }}
                >
                  <Grid container spacing={2} mb={2}>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Cash Transactions
                      </Typography>
                      <Typography variant="h5" fontWeight="600">
                        ₹ {yesterdayWatakTransactionsAmount.cash?.toLocaleString() || '0'}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Account Payment
                      </Typography>
                      <Typography variant="h5" fontWeight="600">
                        ₹ {yesterdayWatakTransactionsAmount.accountPayment?.toLocaleString() || '0'}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Total
                      </Typography>
                      <Typography variant="h5" fontWeight="600">
                        ₹ {yesterdayWatakTransactionsAmount.totalSum?.toLocaleString() || '0'}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {yesterdayWatakTransactionsAmount.totalInWords}
                  </Typography>
                  {yesterdayWatakTransactions?.length > 0 ? (
                    <Box sx={mobileTableStyles}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr>
                            <th style={{ textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                              Vendor Name
                            </th>
                            <th style={{ textAlign: 'right', borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                              Amount
                            </th>
                            <th style={{ textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                              Mode
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {yesterdayWatakTransactions.map((transaction) => (
                            <tr key={transaction._id}>
                              <td style={{ borderBottom: '1px solid #e2e8f0' }}>
                                {transaction.vendorId.name}
                              </td>
                              <td style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>
                                ₹ {transaction.amount.toLocaleString()}
                              </td>
                              <td style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'center' }}>
                                <Chip 
                                  label={transaction.transactionMode === "Account Transfer" ? "A/C" : transaction.transactionMode}
                                  size="small"
                                  sx={{
                                    bgcolor: transaction.transactionMode === "Cash" ? '#dcfce7' : '#eff6ff',
                                    color: transaction.transactionMode === "Cash" ? '#166534' : '#1e40af',
                                    fontWeight: 500
                                  }}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                      No transactions found for yesterday.
                    </Typography>
                  )}
                </Box>
              </Collapse>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboardPage;
