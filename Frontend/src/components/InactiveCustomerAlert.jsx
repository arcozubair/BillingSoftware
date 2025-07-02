import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  IconButton,
  Collapse,
  Badge,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tooltip,
  CircularProgress,
  Chip
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CloseIcon from '@mui/icons-material/Close';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { API_BASE_URL } from '../constants';
import apiClient from '../services/apiClient';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import html2pdf from 'html2pdf.js';

const InactiveCustomerAlert = () => {
  const [open, setOpen] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInactiveCustomers();
  }, []);

  const fetchInactiveCustomers = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`${API_BASE_URL}/customers/inactive-high-balance`);
      setCustomers(response.data.data.customers);
    } catch (error) {
      console.error('Error fetching inactive customers:', error);
    } finally {
      setLoading(false);
    }
  };
  const capitalizeText = (text) => {
    if (!text) return '';
    return text
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
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

  const getPaymentStatusText = (daysSinceLastPayment) => {
    if (daysSinceLastPayment === 'No payment history') {
      return 'No payment record found';
    }
    
    const days = parseInt(daysSinceLastPayment);

      return `Payment overdue (${days} days)`;
   
  };

  const handleClose = () => {
    setOpen(false);
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
            .icon {
              width: 40px;
              height: 40px;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 50%;
              margin-right: 15px;
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

          <div style="
            margin-bottom: 30px;
            padding: 20px;
            background-color: ${customer.daysSinceLastPayment >= 30 ? '#fee2e2' : '#ffedd5'};
            border-radius: 8px;
            text-align: center;
          ">
            <p style="
              margin: 0;
              color: ${customer.daysSinceLastPayment >= 30 ? '#991b1b' : '#9a3412'};
              font-size: 15px;
              font-weight: 500;
              line-height: 1.5;
            ">
              Dear Valued Customer,<br/>
              We kindly remind you that you have not made any payment for the last ${customer.daysSinceLastPayment}. 
              Your outstanding balance is ₹${customer.ledgerBalance.toLocaleString()}. 
              Your continued business is important to us. Please arrange the payment at your earliest convenience.
              <br/>
              Thank you for your cooperation.
            </p>
          </div>

          <div class="detail-row">
            <div class="icon" style="background-color: #e0f2fe;">
              <span style="color: #0284c7; font-size: 20px;">👤</span>
            </div>
            <span class="label">Customer Name:</span>
            <span class="value">${capitalizeText(customer.customerName)}</span>
          </div>

          <div class="detail-row">
            <div class="icon" style="background-color: #fee2e2;">
              <span style="color: #dc2626; font-size: 20px;">💰</span>
            </div>
            <span class="label">Outstanding Balance:</span>
            <span class="value amount">₹${customer.ledgerBalance.toLocaleString()}</span>
          </div>

          <div class="detail-row">
            <div class="icon" style="background-color: ${
              customer.daysSinceLastPayment >= 30 ? '#fee2e2' : '#ffedd5'
            };">
              <span style="font-size: 20px;">⚠️</span>
            </div>
            <span class="label">Payment Status:</span>
            <span class="value">
              <span class="status ${
                customer.daysSinceLastPayment >= 30 ? 'status-critical' : 'status-warning'
              }">
                ${getPaymentStatusText(customer.daysSinceLastPayment)}
              </span>
            </span>
          </div>

          <div class="detail-row">
            <div class="icon" style="background-color: #f1f5f9;">
              <span style="color: #475569; font-size: 20px;">📅</span>
            </div>
            <span class="label">Last Invoice:</span>
            <span class="value date-info">
              ${customer.lastInvoiceDate}
            </span>
          </div>

          <div class="detail-row">
            <div class="icon" style="background-color: #f1f5f9;">
              <span style="color: #475569; font-size: 20px;">💳</span>
            </div>
            <span class="label">Last Payment:</span>
            <span class="value date-info">
              ${customer.lastTransactionDate}
            </span>
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
      const pdf = await html2pdf().set(opt).from(element).save();
      // PDF will be downloaded automatically
    } catch (error) {
      console.error('Error generating PDF:', error);
      // You might want to show an error message to the user
    }
  };

  return (
    <ClickAwayListener onClickAway={handleClose}>
      <Box sx={{ position: 'relative' }}>
        <Tooltip title="Payment Due Alerts">
          <IconButton 
            onClick={() => setOpen(!open)}
            sx={{ 
              bgcolor: 'white',
              boxShadow: 2,
              '&:hover': { bgcolor: '#f5f5f5' }
            }}
          >
            <Badge badgeContent={customers.length} color="error">
              <NotificationsIcon color="action" />
            </Badge>
          </IconButton>
        </Tooltip>

        <Box
          sx={{
            position: 'fixed',
            top: '64px',
            right: '24px',
            mt: 2,
            zIndex: 1100,
            opacity: open ? 1 : 0,
            visibility: open ? 'visible' : 'hidden',
            transform: open ? 'translateY(0)' : 'translateY(-20px)',
            transition: 'opacity 0.2s ease, transform 0.2s ease, visibility 0.2s',
            pointerEvents: open ? 'auto' : 'none'
          }}
        >
          <Card 
            sx={{ 
              width: 350,
              maxHeight: '80vh',
              overflow: 'auto',
              boxShadow: 3,
            }}
          >
            <Box sx={{ p: 2, bgcolor: '#f8fafc' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" fontWeight={600}>
                  Payment Due Alerts
                </Typography>
                <IconButton size="small" onClick={() => setOpen(false)}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </Box>

            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" p={3}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {customers.map((customer) => (
                  <ListItem 
                    key={customer.customerId}
                    sx={{ 
                      borderBottom: '1px solid #e2e8f0',
                      '&:hover': { bgcolor: '#f8fafc' }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ 
                        bgcolor: getPaymentStatusColor(customer.daysSinceLastPayment)
                      }}>
                        <AccountBalanceWalletIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle2" fontWeight={600}>
                          {capitalizeText(customer.customerName)}
                          </Typography>
                          <Chip 
                            label={`₹${customer.ledgerBalance.toLocaleString()}`}
                            size="small"
                            sx={{ 
                              bgcolor: '#fee2e2',
                              color: getPaymentStatusColor(customer.daysSinceLastPayment),
                              fontWeight: 600
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: getPaymentStatusColor(customer.daysSinceLastPayment),
                              fontWeight: 500
                            }}
                          >
                            {getPaymentStatusText(customer.daysSinceLastPayment)}
                          </Typography>
                          <Box mt={0.5}>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Last Invoice: {customer.lastInvoiceDate}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Last Payment: {customer.lastTransactionDate}
                            </Typography>
                          </Box>
                        </>
                      }
                    />
                    <IconButton 
                      size="small" 
                      onClick={() => handlePrintCustomer(customer)}
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
                  </ListItem>
                ))}
              </List>
            )}
          </Card>
        </Box>
      </Box>
    </ClickAwayListener>
  );
};

export default InactiveCustomerAlert; 