import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress,
  Button,
  Grid,
  TextField,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { GridSearchIcon } from '@mui/x-data-grid';
import apiClient from '../services/apiClient';
import { API_BASE_URL } from '../constants';

const LedgerModal = ({ open, onClose, customerName, customerId, type }) => {
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [ledgerData, setLedgerData] = useState(null);
  const [error, setError] = useState(null);

  // Set default fromDate to start of current year when modal opens
  useEffect(() => {
    if (open) {
      const defaultStartDate = new Date(new Date().getFullYear(), 0, 1)
        .toISOString()
        .split('T')[0]; // e.g., '2025-01-01'
      setStartDate(defaultStartDate);
      setLedgerData(null);
      setError(null);
    }
  }, [open]);

  // Fetch ledger data when customerId or startDate changes
  useEffect(() => {
    if (open && customerId && startDate) {
      fetchLedgerData();
    }
  }, [open, customerId, startDate]);

  const fetchLedgerData = async () => {
    if (!customerId) {
      console.log('Missing customerId:', customerId);
      setError('Customer ID is required');
      return;
    }

    if (!startDate) {
      console.log('Missing startDate:', startDate);
      setError('Please provide a start date');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const baseUrl = type === 'vendor' ? 'vendors' : 'customers';
      const params = { from: startDate };

      const response = await apiClient.get(
        `${API_BASE_URL}/${baseUrl}/${customerId}/ledger`,
        { params }
      );
      setLedgerData(response.data);
    } catch (error) {
      console.error('Error fetching ledger data:', error);
      setError('Failed to fetch ledger data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchLedgerData();
  };

  const handlePrint = () => {
    if (!ledgerData) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Kichloo & Co.</title>
          <style>
            body {
              font-family: 'Consolas', 'Courier New', monospace;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 1rem;
            }
            th, td {
              border: 1px solid #ccc;
              padding: 0.5rem;
              text-align: left;
            }
            th {
              background-color: #f0f0f0;
            }
          </style>
        </head>
        <body>
          <h2>Ledger Details: ${customerName?.toUpperCase()}</h2>
          <p><strong>Opening Balance:</strong> ₹${ledgerData.startingBalance.toFixed(2)}</p>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Amount (₹)</th>
                <th>Balance After Entry (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${ledgerData.ledgerDetails
                .map(
                  (entry) => `
                <tr>
                  <td>${new Date(entry.date).toLocaleDateString('en-GB')}</td>
                  <td>${entry.description}</td>
                  <td>₹${entry.amount.toFixed(2)}</td>
                  <td>₹${entry.balanceAfterEntry.toFixed(2)}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
          <p><strong>Ending Balance:</strong> ₹${ledgerData.endingBalance.toFixed(2)}</p>
          <script>
            window.focus();
            window.print();
            window.close();
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleSaveAsPDF = () => {
    if (!ledgerData) return;

    const doc = new jsPDF();

    // Header Section
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Kichloo and Co.', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });

    // Subtitle
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Ledger Details for ${customerName?.toUpperCase()}`,
      doc.internal.pageSize.getWidth() / 2,
      30,
      { align: 'center' }
    );

    // Opening Balance
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Opening Balance: ${ledgerData.startingBalance.toFixed(2)}`, 14, 40);
    doc.text('----------------------------------------', 14, 45);

    // Table Column Styles
    const tableColumnStyles = {
      0: { cellWidth: 30, halign: 'center' },
      1: { cellWidth: 70, halign: 'left' },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 50, halign: 'right' },
    };

    const tableData = ledgerData.ledgerDetails.map((entry) => [
      new Date(entry.date).toLocaleDateString('en-GB'),
      entry.description,
      `${entry.amount.toFixed(2)}`,
      `${entry.balanceAfterEntry.toFixed(2)}`,
    ]);

    // AutoTable
    doc.autoTable({
      startY: 50,
      head: [['Date', 'Description', 'Amount', 'Balance After Entry']],
      body: tableData,
      theme: 'grid',
      margin: { top: 10, left: 14, right: 14 },
      styles: {
        font: 'courier',
        cellPadding: 4,
        fontSize: 10,
        overflow: 'linebreak',
        valign: 'middle',
        halign: 'center',
      },
      headStyles: {
        fillColor: [22, 160, 133],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
      },
      columnStyles: tableColumnStyles,
      didDrawPage: (data) => {
        const pageHeight = doc.internal.pageSize.getHeight();
        doc.setFontSize(10);
        doc.text('Software by Mir Zubair', doc.internal.pageSize.getWidth() / 2, pageHeight - 10, {
          align: 'center',
        });
      },
    });

    // Ending Balance
    const finalY = doc.autoTable.previous.finalY;
    doc.text('----------------------------------------', 14, finalY + 10);
    doc.setFontSize(12);
    doc.text(`Ending Balance: ${ledgerData.endingBalance.toFixed(2)}`, 14, finalY + 15);

    // Footer
    doc.setFontSize(10);
    doc.text('Generated on: ' + new Date().toLocaleString(), 14, finalY + 25);

    doc.save(`${customerName}_ledger.pdf`);
  };

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          width: { xs: '100%', sm: '80%' },
          height: { xs: '100%', sm: '80vh' },
          margin: { xs: 0, sm: 'auto' },
          marginTop: { xs: 0, sm: '5%' },
          padding: { xs: 1, sm: 2 },
          backgroundColor: 'white',
          boxShadow: { xs: 0, sm: 24 },
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
        }}
      >
        {/* Header Section (Fixed) */}
        <Box sx={{ flex: '0 0 auto' }}>
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'red',
            }}
          >
            <CloseIcon />
          </IconButton>

          <Typography sx={{ marginBottom: 4, marginTop: 2, fontSize: '14px' }}>
            Ledger Details for {customerName?.toUpperCase()}
          </Typography>

          <Grid container spacing={2} sx={{ marginBottom: 2 }}>
            <Grid item xs={12} sm={4}>
              <TextField
                label="From Date"
                variant="outlined"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSearch}
                disabled={loading || !startDate}
                startIcon={<GridSearchIcon />}
                fullWidth
              >
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </Grid>
          </Grid>

          {error && (
            <Typography color="error" sx={{ marginBottom: 2 }}>
              {error}
            </Typography>
          )}
        </Box>

        {/* Scrollable Content Section (Table) */}
        <Box
          sx={{
            flex: '1 1 auto',
            overflowY: 'auto',
            marginBottom: 2,
          }}
        >
          {loading && <CircularProgress sx={{ display: 'block', margin: 'auto' }} />}

          {ledgerData && (
            <>
              <Typography variant="body1" sx={{ marginBottom: 2 }}>
                <strong>Opening Balance:</strong> ₹{ledgerData.startingBalance.toFixed(2)}
              </Typography>
              <TableContainer component={Paper} sx={{ maxHeight: '50vh' }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Amount (₹)</TableCell>
                      <TableCell align="right">Balance After Entry (₹)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ledgerData.ledgerDetails.map((entry, index) => (
                      <TableRow key={index}>
                        <TableCell>{new Date(entry.date).toLocaleDateString('en-GB')}</TableCell>
                        <TableCell>{entry.description}</TableCell>
                        <TableCell
                          align="right"
                          sx={{ color: entry.amount < 0 ? 'red' : 'green' }}
                        >
                          ₹{entry.amount.toFixed(2)}
                        </TableCell>
                        <TableCell align="right">
                          ₹{entry.balanceAfterEntry.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Typography variant="body1" sx={{ marginTop: 2 }}>
                <strong>Ending Balance:</strong> ₹{ledgerData.endingBalance.toFixed(2)}
              </Typography>
            </>
          )}
        </Box>

        {/* Footer Section (Fixed) */}
        <Box
          sx={{
            flex: '0 0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 2,
          }}
        >
          <Button variant="contained" color="primary" onClick={handlePrint}>
            Print
          </Button>
          <Button variant="contained" color="secondary" onClick={handleSaveAsPDF}>
            Save as PDF
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default LedgerModal;