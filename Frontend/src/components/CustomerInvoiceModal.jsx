import React, { useEffect, useState } from 'react';
import { DataGrid, GridSearchIcon } from '@mui/x-data-grid';
import apiClient from '../services/apiClient';
import { API_BASE_URL } from '../constants';
import BillTemplate from './billTemplate';
import { FourSquare } from 'react-loading-indicators';
import jsPDF from 'jspdf';
import PrintIcon from '@mui/icons-material/Print';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import 'jspdf-autotable';
import { Container, Box, Typography, Button, CircularProgress, IconButton, TextField, Paper, Dialog, DialogTitle, DialogContent, DialogActions, Grid } from '@mui/material';
import { toast } from 'react-toastify';



const CustomerInvoiceModal = ({ open, handleClose, customerId,customerName }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(null);
  const [showBillPreview, setShowBillPreview] = useState(false);
  const [billPreviewData, setBillPreviewData] = useState(null);
  const [hasSearched, setHasSearched] = useState(false); // New state variable

  const handleSearch = async () => {
    if (!startDate) {
      toast.error("Please select a start date.");  // Show error if start date is missing
      return;  // Exit early
    }
  
 
  
    setLoading(true);  // Start loading 
    setHasSearched(true); // Set this to true when the search is performed
    try {
      const response = await apiClient.post(`${API_BASE_URL}/customer/getInvoicesOfCustomer`, {
        customerId,
        startDate,
        endDate : endDate? endDate:new Date().toISOString().split("T")[0]
      });
      
      const fetchedInvoices = response?.data?.data?.invoices || [];
      const invoicesWithIds = fetchedInvoices.map((invoice) => ({
        ...invoice,
        id: invoice._id,
      }));
      
      setInvoices(invoicesWithIds);  // Set the fetched invoices
      
    } catch (error) {
      console.error("Error fetching invoices", error);
      toast.error("Error fetching invoices. Please try again.");  // Show error toast
    } finally {
      setLoading(false);  // Stop loading spinner
    }
  };
  
  useEffect(() => {
    if (!open) {
      // Clear state on modal close
      setStartDate(null);
      setEndDate(null);
      setInvoices([]);
      setHasSearched(false)
    }
  }, [open]);  
  const handleCloseModal = () => {
    setStartDate(null);  
    setEndDate(null);     
    setInvoices([]);     
    handleClose(); 
  };
  

  const toBase64 = (url) => {
    return fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        return response.blob();
      })
      .then(blob => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      }))
      .catch(error => {
        console.error('Error converting image to base64:', error);
        throw error;
      });
  };
  
  



  const handleOpenBillPreview = (invoice) => {
    console.log("invoice",invoice)

    setBillPreviewData(invoice); // Set the invoice data for preview
    setShowBillPreview(true); // Open the bill preview modal
  };

  const handleCloseBillPreview = () => {
    setShowBillPreview(false);
  };

  const handleSaveAllInvoicesAsPdf = () => {
    const doc = new jsPDF();
    // Use QR image from public folder
    const qrImageSrc = "/qr.png";  // This will look for qr.png in the public folder
  
    // Load the image asynchronously using a Promise
    const loadImage = (src) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(img);
        img.onerror = (e) => {
          console.warn("QR image loading failed, continuing without QR code", e);
          resolve(null);  // Resolve with null instead of rejecting
        };
      });
    };
  
    loadImage(qrImageSrc)
      .then((qrImage) => {
        invoices.forEach((invoice, index) => {
          const { invoiceNumber, customerName, date, items, lastBalance } = invoice;
  
          // Add a new page if it's not the first invoice
          if (index !== 0) {
            doc.addPage();
          }
  
          // Set global font size
          doc.setFontSize(12);
  
          // Header Section
          doc.setFontSize(24);
          doc.setFont("Helvetica", "bold");
          doc.text("Kichlooo and Co.", doc.internal.pageSize.width / 2, 20, { align: "center" });
  
          doc.setFontSize(14);
          doc.setFont("Helvetica", "normal");
          doc.text("INVOICE", doc.internal.pageSize.width / 2, 30, { align: "center" });
  
          doc.setFontSize(10);
          doc.line(14, 35, doc.internal.pageSize.width - 14, 35); // Horizontal line to separate header
  
          // Invoice Details
          doc.setFontSize(12);
  
          // Line 1: Invoice Number and Date
          doc.setFont("Helvetica", "normal");
          doc.text(`Invoice Number: ${invoiceNumber}`, 14, 42);
          doc.text(`Date: ${new Date(date).toLocaleDateString("en-GB")}`, doc.internal.pageSize.width - 14, 42, { align: "right" });
  
          // Line 2: Customer Name and Ledger Balance
          doc.setFont("Helvetica", "bold");
          doc.text(`Customer Name: ${customerName}`, 14, 54);
          doc.text(`Ledger Balance: Rs. ${lastBalance?.toFixed(2)}`, doc.internal.pageSize.width - 14, 54, { align: "right" });
  
          // Items Table
          const tableData = items?.map((item, index) => [
            index + 1,
            item.itemName,
            item.quantity,
            item.weight !== null ? item.weight : "-",
            `Rs. ${item.rate?.toFixed(2)}`,
            `Rs. ${item.total?.toFixed(2)}`
          ]);
  
          // AutoTable for items
          doc.autoTable({
            startY: 65, // Adjusted start Y to give more space between details and table
            head: [["SNO", "ITEM NAME", "QTY", "WEIGHT", "RATE (Rs.)", "TOTAL (Rs.)"]],
            body: tableData,
            theme: "striped",
            margin: { top: 10 },
            styles: {
              cellPadding: 3,
              font: "courier",
              fontSize: 10,
              overflow: "linebreak",
              valign: "middle",
              halign: "left",
            },
            columnStyles: {
              0: { cellWidth: 20 },
              1: { cellWidth: "auto" },
              2: { cellWidth: "auto" },
              3: { cellWidth: "auto" },
              4: { cellWidth: "auto" },
              5: { cellWidth: "auto" },
            },
          });
  
          // Total Amount
          const totalAmount = items.reduce((acc, item) => acc + (item.total || 0), 0);
          doc.setFontSize(12);
          doc.setFont("Helvetica", "bold");
          doc.text(`Total Amount: Rs. ${totalAmount.toFixed(2)}`, 14, doc.autoTable.previous.finalY + 10);
  
          // Footer Section
          const pageHeight = doc.internal.pageSize.height;
          const footerY = pageHeight - 50;
  
          doc.setFontSize(10);
          doc.line(14, footerY - 10, doc.internal.pageSize.width - 14, footerY - 10); // Horizontal line above footer
  
          // Left footer section - bank details and software info
          doc.setFont("Helvetica", "normal");
          doc.text("A/c No: 0634020100000100", 14, footerY);
          doc.text("IFSC: JAKA0MEHJUR", 14, footerY + 5);
          doc.text("GPay/MPay: 7889718295", 14, footerY + 10);
          doc.text("Software by Mir Zubair", 14, footerY + 20);
  
          // Right footer section - QR code
          if (qrImage) {  // Only add QR code if image loaded successfully
            const qrWidth = 40;
            const qrHeight = 40;
            const aspectRatio = qrImage.width / qrImage.height;
            const qrX = doc.internal.pageSize.width - qrWidth - 14;
            const qrY = footerY;
            doc.addImage(qrImageSrc, "PNG", qrX, qrY, qrWidth, qrHeight / aspectRatio);
          }
        });
  
        // Save the combined PDF
        doc.save(`${customerName}-invoices.pdf`);
      })
      .catch((error) => {
        console.error("Error generating PDF:", error);
        toast.error("Error generating PDF. Please try again.");
      });
  };
  


  // Columns for the DataGrid
 
  const columns = [
   
    { 
      field: 'invoiceNumber', 
      headerName: 'Invoice Number',
      flex: 1, 
      minWidth: 150 
    },
    { 
      field: 'date', 
      headerName: 'Date', 
      flex: 1, 
      minWidth: 150,
      renderCell: (params) => (
        <Typography>{new Date(params.row.date).toLocaleDateString('en-GB')}</Typography>
      ),
    },
    { 
      field: 'balance', 
      headerName: 'Total Amount', 
      flex: 1, 
      minWidth: 150 ,
      renderCell: (params) => (
        <Typography>{`₹ ${params.value.toLocaleString()}`}</Typography>
      ),
    },
   
   
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 3,
      minWidth: 150,
      renderCell: (params) => (
        <>

         {window.innerWidth <= 600 ? (
            <>
             
              {/* <IconButton
                color="primary"
                aria-label="make-payment"
                onClick={() => handleEditInvoice(params.row)}
                style={{ marginRight: '8px' }}
              >
                <EditIcon />
              </IconButton> */}
              <IconButton
                color="primary"
                aria-label="view-transactions"
                onClick={() => handleOpenBillPreview(params.row)} 
                style={{ marginRight: '8px' }}
              >
                <ViewModuleIcon />
              </IconButton>

             
              
              </>
          ) : (
            <>
        
          {/* <Button
            variant="contained"
            color="secondary"
            onClick={() => handleEditInvoice(params.row)}
            style={{ backgroundColor: 'Orange',fontSize:"12px"}}
            startIcon={<EditIcon/>}

          >
            Edit Invoice
          </Button> */}
          <Button
            variant="outlined"
            color="primary"
            size="small"
            style={{ marginLeft:"8px",backgroundColor: '#36BA98',color:"white",fontSize:"12px"}}
            startIcon={<ViewModuleIcon/>}
            onClick={() => handleOpenBillPreview(params.row)} // Call handleOpenBillPreview with row data
          >
            View Invoice
          </Button>
         
         </>
        )}
      </>
    ),
  },
    
];
return (
  <Dialog open={open} onClose={handleCloseModal} fullWidth maxWidth="xl">
    <DialogTitle>View All Invoices of {customerName}</DialogTitle>
    <DialogContent>
      {/* Grid layout for Date pickers and Search button */}
      <Grid container spacing={2} sx={{ marginBottom: 2, marginTop: 2 }}>
        {/* Start Date Field */}
        <Grid item xs={12} sm={5}>
          <TextField
            label="Start Date"
            variant="outlined"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Grid>

        {/* End Date Field */}
        <Grid item xs={12} sm={5}>
          <TextField
            label="End Date"
            variant="outlined"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Grid>

        {/* Search Button */}
        <Grid item xs={12} sm={1}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSearch}
            disabled={loading}
            startIcon={<GridSearchIcon />}
          >
            {!loading ? "Search" : "Searching..."}
          </Button>
        </Grid>
      </Grid>

      {/* Save PDF Button */}
      <Grid container justifyContent="flex-end" sx={{ marginBottom: 2 }}>
        {invoices.length === 0 ?(""):(
        <Button
          variant="contained"
          color="secondary"
          onClick={handleSaveAllInvoicesAsPdf}
          startIcon={<PrintIcon />}
          sx={{ mb: { xs: 2, sm: 0 } }}
        >
          Save PDF
        </Button>
        )
}
      </Grid>

      {/* Conditionally render "No invoices found" message */}
      {hasSearched && invoices.length === 0 ? (
        <div style={{ textAlign: "center", padding: "20px", color: "#888" }}>
          No invoices found
        </div>
      ) : (
        <div style={{ height: 400, width: "100%" }}>
          {/* DataGrid to display the results */}
          <DataGrid
            rows={invoices}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 20, 50]}
            autoHeight
            disableSelectionOnClick
            localeText={{ noRowsLabel: "It's lonely here." }}
          />
        </div>
      )}
    </DialogContent>

    <DialogActions>
      <Button onClick={handleClose} color="secondary">
        Close
      </Button>
    </DialogActions>

    {/* Bill Preview Modal */}
    <BillTemplate
      open={showBillPreview}
      handleClose={handleCloseBillPreview}
      invoice={billPreviewData}
    />
  </Dialog>
);

};

export default CustomerInvoiceModal;
