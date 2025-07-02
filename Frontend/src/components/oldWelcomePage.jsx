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

const OldAdminDashboardPage = () => {
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
      maxWidth="xl"
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f6f9fc 0%, #eef2f7 100%)',
        py: 4,
        px: { xs: 2, md: 4 },
      }}
    >
    

      <Grid container spacing={3}>
        {/* Total Customers Card */}
        <Grid item xs={12} md={4}>
          <Link to="/customers" style={{ textDecoration: 'none' }}>
            <Card
              sx={{
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 40px rgba(0, 0, 0, 0.15)',
                },
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar
                    sx={{
                      bgcolor: '#3498db',
                      mr: 2,
                      transform: 'scale(1.2)',
                    }}
                  >
                    <PeopleIcon />
                  </Avatar>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: '#3498db',
                     
                    }}
                  >
                    Total Customers
                  </Typography>
                </Box>
                {isCustomersLoading ? (
                  <Box>
                    <Skeleton variant="text" height={40} width="60%" />
                    <Skeleton variant="text" height={30} width="50%" />
                  </Box>
                ) : (
                  <Typography 
                    variant="body1"
                    sx={{
                      fontSize: '1.1rem',
                      fontWeight: 500,
                    }}
                  >
                    Total: {" "}
                    <CountUp
                      start={1875}
                      end={totalCustomers}
                      duration={1.75}
                    /> {" "}
                    Customers
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Link>
        </Grid>

        {/* Total Vendors Card */}
        <Grid item xs={12} md={4}>
          <Link to="/vendors" style={{ textDecoration: 'none' }}>
            <Card
              sx={{
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 40px rgba(0, 0, 0, 0.15)',
                },
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar
                    sx={{
                      bgcolor: '#e74c3c',
                      mr: 2,
                      transform: 'scale(1.2)',
                    }}
                  >
                    <StoreIcon />
                  </Avatar>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: '#e74c3c',
                     
                    }}
                  >
                    Total Vendors
                  </Typography>
                </Box>
                {isVendorsLoading ? (
                  <Box>
                    <Skeleton variant="text" height={40} width="60%" />
                    <Skeleton variant="text" height={30} width="50%" />
                  </Box>
                ) : (
                  <Typography 
                    variant="body1"
                    sx={{
                      fontSize: '1.1rem',
                      fontWeight: 500,
                    }}
                  >
                    Total: {" "}
                    <CountUp
                      start={100}
                      end={totalVendors}
                      duration={2}
                    /> {" "}
                    Customers
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Link>
        </Grid>
        {/* Total Items in Inventory Card */}
        <Grid item xs={12} md={4}>
          <Link to="/inventory" style={{ textDecoration: 'none' }}>
            <Card
              sx={{
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 40px rgba(0, 0, 0, 0.15)',
                },
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar
                    sx={{
                      bgcolor: '#f39c12',
                      mr: 2,
                      transform: 'scale(1.2)',
                    }}
                  >
                    <InventoryIcon />
                  </Avatar>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: '#f39c12',
                     
                    }}
                  >
                    Total Items in Inventory
                  </Typography>
                </Box>
                {isInventoryLoading ? (
                  <Box>
                    <Skeleton variant="text" height={40} width="60%" />
                    <Skeleton variant="text" height={30} width="50%" />
                  </Box>
                ) : (
                  <Typography 
                    variant="body1"
                    sx={{
                      fontSize: '1.1rem',
                      fontWeight: 500,
                    }}
                  >
                    Remaining Stock : {" "}
                    <CountUp
                      start={700}
                      end={totalItemsInInventory}
                      duration={1.75}
                    /> {" "}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Link>
        </Grid>
        {/* Total Ledger Balance Card */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar
                  sx={{
                    bgcolor: '#2ecc71',
                    mr: 2,
                    transform: 'scale(1.2)',
                  }}
                >
                  <MonetizationOnIcon />
                </Avatar>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: '#2ecc71',
                   
                  }}
                >
                  Total Accounts Receivable
                </Typography>
              </Box>
              {isLedgerLoading ? (
                <Box>
                  <Skeleton variant="text" height={40} width="60%" />
                  <Skeleton variant="text" height={30} width="50%" />
                </Box>
              ) : (
                <>
                  <Typography 
                    variant="body1"
                    sx={{
                      fontSize: '1.1rem',
                      fontWeight: 500,
                    }}
                  >
                    Amount: ₹ {" "}
                    <CountUp
                      start={1875000000000}
                      end={totalLedger}
                      duration={2.75}
                    /> {" "}
                  </Typography>
                  <Typography 
                    variant="body1"
                    sx={{
                      fontSize: '1.1rem',
                      fontWeight: 500,
                    }}
                  >
                    In Words: {totalLedgerInWords}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card
            sx={{
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar
                  sx={{
                    bgcolor: 'red',
                    mr: 2,
                    transform: 'scale(1.2)',
                  }}
                >
                  <MonetizationOnIcon />
                </Avatar>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: 'red',
                   
                  }}
                >
                  Total Accounts Payable
                </Typography>
              </Box>
              {isVendorLedgerLoading ? (
                <Box>
                  <Skeleton variant="text" height={40} width="60%" />
                  <Skeleton variant="text" height={30} width="50%" />
                </Box>
              ) : (
                <>
                  <Typography 
                    variant="body1"
                    sx={{
                      fontSize: '1.1rem',
                      fontWeight: 500,
                    }}
                  >
                    Amount: ₹ {" "}
                    <CountUp
                      start={1875000000000}
                      end={totalVendorLedger}
                      duration={2.75}
                    /> {" "}
                  </Typography>
                  <Typography 
                    variant="body1"
                    sx={{
                      fontSize: '1.1rem',
                      fontWeight: 500,
                    }}
                  >
                    In Words: {totalVendorLedgerInWords}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>


        {/* Today's Invoice Card */}
        <Grid item xs={12} md={6}>
          <Link to="/today-invoices" style={{ textDecoration: 'none' }}>
            <Card
              sx={{
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 40px rgba(0, 0, 0, 0.15)',
                },
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar
                    sx={{
                      bgcolor: '#9b59b6',
                      mr: 2,
                      transform: 'scale(1.2)',
                    }}
                  >
                    <ReceiptIcon />
                  </Avatar>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: '#9b59b6',
                     
                    }}
                  >
                    Today's Invoice Amount
                  </Typography>
                </Box>
                {isInvoiceLoading ? (
                  <Box>
                    <Skeleton variant="text" height={40} width="60%" />
                    <Skeleton variant="text" height={30} width="50%" />
                  </Box>
                ) : (
                  <>
                    <Typography 
                      variant="body1"
                      sx={{
                        fontSize: '1.1rem',
                        fontWeight: 500,
                      }}
                    >
                      Total Amount: ₹ {" "}
                      <CountUp
                        start={1875000000}
                        end={todaysInvoiceAmount.totalAmount}
                        duration={1.75}
                      /> {" "}
                    </Typography>
                    <Typography 
                      variant="body1"
                      sx={{
                        fontSize: '1.1rem',
                        fontWeight: 500,
                      }}
                    >
                      In Words: {todaysInvoiceAmount.totalAmountInWords}
                    </Typography>
                  </>
                )}
              </CardContent>
            </Card>
          </Link>
        </Grid>
        {/* Goods Purchased Today Card */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar
                  sx={{
                    bgcolor: '#f39c12',
                    mr: 2,
                    transform: 'scale(1.2)',
                  }}
                >
                  <ShoppingCartIcon />
                </Avatar>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: '#f39c12',
                   
                  }}
                >
                  Goods Purchased On Cash
                </Typography>
              </Box>
              {isGoodsPurchasedLoading ? (
                <Box>
                  <Skeleton variant="text" height={40} width="60%" />
                  <Skeleton variant="text" height={30} width="50%" />
                </Box>
              ) : (
                <>
                  <Typography 
                    variant="body1"
                    sx={{
                      fontSize: '1.1rem',
                      fontWeight: 500,
                    }}
                  >
                    Total Amount: ₹ {" "}
                    <CountUp
                      start={1875000000}
                      end={todaysInvoiceAmount.todaysCashInvoices}
                      duration={1.75}
                    /> {" "}
                  </Typography>
                  <Typography 
                    variant="body1"
                    sx={{
                      fontSize: '1.1rem',
                      fontWeight: 500,
                    }}
                  >
                    In Words: {todaysInvoiceAmount.totalCashInWords}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Today's Transactions Card */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar
                  sx={{
                    bgcolor: '#008000',
                    mr: 2,
                    transform: 'scale(1.2)',
                  }}
                >
                  <ReceiptIcon />
                </Avatar>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: '#008000',
                   
                  }}
                >
                  Today's Accounts Receivable
                </Typography>
                <IconButton
                  sx={{ ml: 'auto' }}
                  onClick={toggleTransactionsCard}
                >
                  <ExpandMoreIcon
                    sx={{
                      transform: openTransactions
                        ? 'rotate(180deg)'
                        : 'rotate(0deg)',
                      transition: 'transform 0.6s ease',
                    }}
                  />
                </IconButton>
              </Box>
              <Collapse
                in={openTransactions}
                timeout={{ enter: 300, exit: 300 }}
                style={{ transition: 'height 0.6s ease' }}
              >
                <Box p={2}>
                  {isTransactionsLoading ? (
                    <Box>
                      <Skeleton variant="text" height={40} width="60%" />
                      <Skeleton variant="text" height={30} width="50%" />
                    </Box>
                  ) : (
                    <>
                      <Typography 
                        variant="body1"
                        sx={{
                          fontSize: '1.1rem',
                          fontWeight: 500,
                        }}
                      >
                        Total: ₹ {todaysTransactionsAmount.totalSum}
                      </Typography>
                      <Typography 
                        variant="body1"
                        sx={{
                          fontSize: '1.1rem',
                          fontWeight: 500,
                        }}
                      >
                        In Words: {todaysTransactionsAmount.totalInWords}
                      </Typography>
                      <Typography 
                        variant="body1"
                        sx={{
                          fontSize: '1.1rem',
                          fontWeight: 500,
                        }}
                      >
                        Cash: ₹ {todaysTransactionsAmount.cash}
                      </Typography>
                      <Typography 
                        variant="body1"
                        sx={{
                          fontSize: '1.1rem',
                          fontWeight: 500,
                        }}
                      >
                        Account Payment: ₹ {todaysTransactionsAmount.accountPayment}
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
                                    {transaction.transactionMode ===
                                    "Account Transfer"
                                      ? "A/C"
                                      : transaction.transactionMode}
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
                </Box>
              </Collapse>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card
            sx={{
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar
                  sx={{
                    bgcolor: '#e62222',
                    mr: 2,
                    transform: 'scale(1.2)',
                  }}
                >
                  <ReceiptIcon />
                </Avatar>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: '#e62222',
                   
                  }}
                >
                  Today's Accounts Payable
                </Typography>
                <IconButton
                  sx={{ ml: 'auto' }}
                  onClick={toggleTransactionsCard3}
                >
                  <ExpandMoreIcon
                    sx={{
                      transform: openTransactions3
                        ? 'rotate(180deg)'
                        : 'rotate(0deg)',
                      transition: 'transform 0.6s ease',
                    }}
                  />
                </IconButton>
              </Box>
              <Collapse
                in={openTransactions3}
                timeout={{ enter: 300, exit: 300 }}
                style={{ transition: 'height 0.6s ease' }}
              >
                <Box p={2}>
                  {isTransactionsLoading3 ? (
                    <Box>
                      <Skeleton variant="text" height={40} width="60%" />
                      <Skeleton variant="text" height={30} width="50%" />
                    </Box>
                  ) : (
                    <>
                      <Typography 
                        variant="body1"
                        sx={{
                          fontSize: '1.1rem',
                          fontWeight: 500,
                        }}
                      >
                        Total: ₹ {todaysWatakTransactionsAmount.totalSum}
                      </Typography>
                      <Typography 
                        variant="body1"
                        sx={{
                          fontSize: '1.1rem',
                          fontWeight: 500,
                        }}
                      >
                        In Words: {todaysWatakTransactionsAmount.totalInWords}
                      </Typography>
                      <Typography 
                        variant="body1"
                        sx={{
                          fontSize: '1.1rem',
                          fontWeight: 500,
                        }}
                      >
                        Cash: ₹ {todaysWatakTransactionsAmount.cash}
                      </Typography>
                      <Typography 
                        variant="body1"
                        sx={{
                          fontSize: '1.1rem',
                          fontWeight: 500,
                        }}
                      >
                        Account Payment: ₹ {todaysWatakTransactionsAmount.accountPayment}
                      </Typography>
                      <Box mt={2}>
                        <Typography variant="h6" gutterBottom>
                          Transaction Details:
                        </Typography>
                        {todaysWatakTransactions?.length > 0 ? (
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
                                  Vendor Name
                                </th>

                                <th
                                  style={{
                                    borderBottom: '1px solid #ccc',
                                    padding: '8px',
                                    textAlign: 'right',
                                  }}
                                >
                                  Amount
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
                              {todaysWatakTransactions.map((transaction) => (
                                <tr key={transaction._id}>
                                  <td
                                    style={{
                                      borderBottom: '1px solid #eee',
                                      padding: '8px',
                                    }}
                                  >
                                    {transaction.vendorId.name}
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
                                    {transaction.transactionMode ===
                                    "Account Transfer"
                                      ? "A/C"
                                      : transaction.transactionMode}
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
                </Box>
              </Collapse>
            </CardContent>
          </Card>
        </Grid>

        {/* Todays */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar
                  sx={{
                    bgcolor: '#008000',
                    mr: 2,
                    transform: 'scale(1.2)',
                  }}
                >
                  <ReceiptIcon />
                </Avatar>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: '#008000',
                   
                  }}
                >
                  Yesterday's Accounts Receivable
                </Typography>
                <IconButton
                  sx={{ ml: 'auto' }}
                  onClick={toggleTransactionsCard2}
                >
                  <ExpandMoreIcon
                    sx={{
                      transform: openTransactions2
                        ? 'rotate(180deg)'
                        : 'rotate(0deg)',
                      transition: 'transform 0.3s ease',
                    }}
                  />
                </IconButton>
              </Box>
              <Collapse
                in={openTransactions2}
                timeout={{ enter: 300, exit: 300 }}
                style={{ transition: 'height 0.3s ease' }}
              >
                <Box p={2}>
                  {isTransactionsLoading2 ? (
                    <Box>
                      <Skeleton variant="text" height={40} width="60%" />
                      <Skeleton variant="text" height={30} width="50%" />
                    </Box>
                  ) : (
                    <>
                      <Typography 
                        variant="body1"
                        sx={{
                          fontSize: '1.1rem',
                          fontWeight: 500,
                        }}
                      >
                        Total: ₹ {yesterdayTransactionsAmount.totalSum}
                      </Typography>
                      <Typography 
                        variant="body1"
                        sx={{
                          fontSize: '1.1rem',
                          fontWeight: 500,
                        }}
                      >
                        In Words: {yesterdayTransactionsAmount.totalInWords}
                      </Typography>
                      <Typography 
                        variant="body1"
                        sx={{
                          fontSize: '1.1rem',
                          fontWeight: 500,
                        }}
                      >
                        Cash: ₹ {yesterdayTransactionsAmount.cash}
                      </Typography>
                      <Typography 
                        variant="body1"
                        sx={{
                          fontSize: '1.1rem',
                          fontWeight: 500,
                        }}
                      >
                        Account Payment: ₹ {yesterdayTransactionsAmount.accountPayment}
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
                                    {transaction.transactionMode ===
                                    "Account Transfer"
                                      ? "A/C"
                                      : transaction.transactionMode}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <Typography variant="body2">
                            No transactions found for yesterday.
                          </Typography>
                        )}
                      </Box>
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
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar
                  sx={{
                    bgcolor: '#e62222',
                    mr: 2,
                    transform: 'scale(1.2)',
                  }}
                >
                  <ReceiptIcon />
                </Avatar>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: '#e62222',
                   
                  }}
                >
                  Yesterday's Accounts Payable
                </Typography>
                <IconButton
                  sx={{ ml: 'auto' }}
                  onClick={toggleTransactionsCard4}
                >
                  <ExpandMoreIcon
                    sx={{
                      transform: openTransactions4
                        ? 'rotate(180deg)'
                        : 'rotate(0deg)',
                      transition: 'transform 0.6s ease',
                    }}
                  />
                </IconButton>
              </Box>
              <Collapse
                in={openTransactions4}
                timeout={{ enter: 300, exit: 300 }}
                style={{ transition: 'height 0.6s ease' }}
              >
                <Box p={2}>
                  {isTransactionsLoading4 ? (
                    <Box>
                      <Skeleton variant="text" height={40} width="60%" />
                      <Skeleton variant="text" height={30} width="50%" />
                    </Box>
                  ) : (
                    <>
                      <Typography 
                        variant="body1"
                        sx={{
                          fontSize: '1.1rem',
                          fontWeight: 500,
                        }}
                      >
                        Total: ₹ {yesterdayWatakTransactionsAmount.totalSum}
                      </Typography>
                      <Typography 
                        variant="body1"
                        sx={{
                          fontSize: '1.1rem',
                          fontWeight: 500,
                        }}
                      >
                        In Words: {yesterdayWatakTransactionsAmount.totalInWords}
                      </Typography>
                      <Typography 
                        variant="body1"
                        sx={{
                          fontSize: '1.1rem',
                          fontWeight: 500,
                        }}
                      >
                        Cash: ₹ {yesterdayWatakTransactionsAmount.cash}
                      </Typography>
                      <Typography 
                        variant="body1"
                        sx={{
                          fontSize: '1.1rem',
                          fontWeight: 500,
                        }}
                      >
                        Account Payment: ₹ {yesterdayWatakTransactionsAmount.accountPayment}
                      </Typography>
                      <Box mt={2}>
                        <Typography variant="h6" gutterBottom>
                          Transaction Details:
                        </Typography>
                        {yesterdayWatakTransactions?.length > 0 ? (
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
                                  Vendor Name
                                </th>

                                <th
                                  style={{
                                    borderBottom: '1px solid #ccc',
                                    padding: '8px',
                                    textAlign: 'right',
                                  }}
                                >
                                  Amount
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
                              {yesterdayWatakTransactions.map((transaction) => (
                                <tr key={transaction._id}>
                                  <td
                                    style={{
                                      borderBottom: '1px solid #eee',
                                      padding: '8px',
                                    }}
                                  >
                                    {transaction.vendorId.name}
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
                                    {transaction.transactionMode ===
                                    "Account Transfer"
                                      ? "A/C"
                                      : transaction.transactionMode}
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
                </Box>
              </Collapse>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default OldAdminDashboardPage;
