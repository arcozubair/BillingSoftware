import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Button, CircularProgress, IconButton, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EditInvoiceModal from '../components/EditInvoiceModal';

import { API_BASE_URL } from '../constants';
import jsPDF from 'jspdf';
import BillTemplate from '../components/billTemplate';
import PrintIcon from '@mui/icons-material/Print';
import EditIcon from '@mui/icons-material/Edit';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import RefreshIcon from '@mui/icons-material/Refresh';
import apiClient from "../services/apiClient";
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import 'jspdf-autotable';
import { Commet, FourSquare } from 'react-loading-indicators';

const ViewYesterdaysInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBillPreview, setShowBillPreview] = useState(false);
  const [billPreviewData, setBillPreviewData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredInvoices, setFilteredInvoices] = useState([]);


  useEffect(() => {
    fetchYesterdayInvoices();
  }, []);

  const fetchYesterdayInvoices = async () => {
    setLoading(true);

    try {
        const response = await apiClient.get(`${API_BASE_URL}/getYesterdayInvoices`);
        const fetchedInvoices = response?.data?.data?.invoices || [];
        const invoicesWithIds = fetchedInvoices.map((invoice) => ({
          ...invoice,
          id: invoice._id
        }));
        setInvoices(invoicesWithIds);
      } catch (error) {
        console.error('Error fetching Yesterday\'s invoices:', error);
        toast.error('Failed to fetch Yesterday\'s invoices');
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      if (searchQuery === '') {
        setFilteredInvoices(invoices);
      } else {
        const filtered = invoices.filter(invoice =>
          invoice.customerName.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredInvoices(filtered);
      }
    }, [searchQuery, invoices]);
  const handleEditInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setEditModalOpen(true);
  };

  const handleUpdateInvoice = (updatedInvoice) => {
    setInvoices((prevInvoices) =>
      prevInvoices.map((invoice) =>
        invoice.id === updatedInvoice.id ? updatedInvoice : invoice
      )
    );
    setEditModalOpen(false);
  };

  const handleOpenBillPreview = (invoice) => {
    console.log("invoice",invoice)

    setBillPreviewData(invoice); // Set the invoice data for preview
    setShowBillPreview(true); // Open the bill preview modal
  };

  const handleCloseBillPreview = () => {
    setShowBillPreview(false);
  };

  const handleSaveAsPdf = (invoice) => {
    const { invoiceNumber, customerName, date, items, balance, lastBalance } = invoice;
  
    const doc = new jsPDF();
  

    doc.setFontSize(12);
    doc.text('Invoice', 14, 22);
  doc.setFontSize(20);
  doc.text('Kichlooo and Co.', 14, 14); 

    doc.setFontSize(10);
    doc.text(`Invoice Number: ${invoiceNumber}`, 14, 32);
    doc.text(`Customer Name: ${customerName}`, 14, 38);
    doc.text(`Date: ${new Date(date).toLocaleDateString('en-GB')}`, 14, 44);
    doc.text(`Ledger Balance: Rs.${lastBalance.toFixed(2)}`, 14, 50);
  
    const tableData = items.map((item, index) => [
      index + 1,
      item.itemName,
      item.quantity,
      item.weight !== null ? item.weight : '-',
      `${item.rate}`,
      `${item.total}`
    ]);
  
    doc.autoTable({
      startY: 60,
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
        font: "courier",
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
  
    doc.text(`Total Amount: Rs. ${items.reduce((acc, item) => acc + (item.total || 0), 0)}`, 14, doc.autoTable.previous.finalY + 10);
    
    doc.save(`invoice_${invoiceNumber}.pdf`);
  };

  const handlePrintInvoice = (invoice) => {
  const { invoiceNumber, customerName, date, items, balance, lastBalance } = invoice;

  const printWindow = window.open('', '_blank');

  printWindow.document.write(`
    <html>
      <head>
        <title>Trade Mark (KAC)</title>
        <style>
          body {
            margin: 0;
            padding: 1rem;
            font-size: 15px;
          }
          .bill-template {
            margin: auto;
            padding: 2rem;
            border: 1px solid #ccc;
            max-width: 800px;
          }
          .bill-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
          }
          .company-name {
            text-align: center;
            font-size: 2rem;
            font-weight: bold;
            margin-bottom: 1rem;
            width: 100%;
          }
          .company-info, .contact-info {
            flex: 1;
            font-size: 0.6rem;
            line-height: 1.2rem;
          }
          .company-info {
            text-align: left;
            max-width: 50%;
          }
          .contact-info {
            text-align: right;
            margin-top: -1rem;
            max-width: 50%;
          }
          .bill-info {
            display: flex;
            justify-content: space-between;
            margin-top: 1rem;
            font-size: 1rem;
            font-weight: bold;
          }
          .bill-to {
            margin-top: 1rem;
            font-weight: bold;
          }
          .bill-to span {
            font-size: 1.1rem;
            text-decoration: underline;
          }
          .bill-items {
            margin-top: 2rem;
          }
          .bill-items table {
            width: 100%;
            border-collapse: collapse;
          }
          .bill-items th, .bill-items td {
            border: 1px solid #ccc;
            padding: 0.4rem;
            text-align: center;
          }
          .bill-items th {
            background-color: #f0f0f0;
            font-size: 14px;
          }
          .bill-items td {
            font-size: 12px;
          }
          .total-row td {
            font-weight: bold;
          }
          .total-row td:nth-child(5) {
            text-align: right;
          }
          .total-row td:nth-child(6) {
            font-size: 16px;
            background-color: #f0f0f0;
          }
          .bill-total {
            margin-top: 10px;
          }
          @media print {
            .bill-template {
              margin: auto;
              padding: 0;
              border: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="bill-template">
          <div class="company-name">KICHLOO AND CO.</div>
          <div class="company-address">Wholesale Dealers of Vegetables</div>

          <div class="bill-header">
            <div class="company-info">
              <div>75,313 Iqbal Sabzi Mandi, Bagh Nand Singh</div>
              <div>Tatoo Ground, Batamaloo, Sgr.</div>
            </div>
            <div class="contact-info">
              <div>Ali Mohd: 9419067657</div>
              <div>Sajad Ali: 7889718295</div>
              <div>Umer Ali: 7006342374</div>
            </div>
          </div>
          <div class="bill-info">
            <div>Invoice No: ${invoiceNumber}</div>
            <div>Date: ${new Date(date).toLocaleDateString('en-GB')}</div>
          </div>
          <div class="bill-to">
            Bill to: <span>${customerName}</span>
          </div>
          <div class="bill-items">
            <table>
              <thead>
                <tr>
                  <th>SNO</th>
                  <th>ITEM NAME</th>
                  <th>QTY</th>
                  <th>WEIGHT</th>
                  <th>RATE</th>
                  <th>TOTAL</th>
                </tr>
              </thead>
              <tbody>
                ${items.map((item, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${item.itemName}</td>
                    <td>${item.quantity}</td>
                    <td>${item.weight !== null ? item.weight : '-'}</td>
                    <td>₹${item.rate}</td>
                    <td>₹${item.total}</td>
                  </tr>
                `).join('')}
                <tr class="total-row">
                  <td colspan="4"></td>
                  <td>Total:</td>
                  <td>₹${items.reduce((acc, item) => acc + (item.total || 0), 0)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="bill-total">
            <div>Ledger Balance: ₹${lastBalance.toFixed(2)}</div>
          </div>
        </div>
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


const handlePrintAllInvoices = () => {
  const printWindow = window.open('', '_blank');
  const sortedInvoices = [...invoices].sort((a, b) => parseInt(a.invoiceNumber) - parseInt(b.invoiceNumber));
  
  const allInvoicesHtml = sortedInvoices.map(invoice => {
    const { invoiceNumber, customerName, date, items, lastBalance } = invoice;
    return `
    <div class="bill-template">
      <div class="company-name">KICHLOO AND CO.</div>
      <div class="company-address">Wholesale Dealers of Vegetables</div>

      <div class="bill-header">
        <div class="company-info">
          <div>75,313 Iqbal Sabzi Mandi, Bagh Nand Singh</div>
          <div>Tatoo Ground, Batamaloo, Sgr.</div>
        </div>
        <div class="contact-info">
          <div>Trade Mark (KAC)</div>
      
          <div>Ali Mohd: 9419067657</div>
          <div>Sajad Ali: 7889718295</div>
          <div>Umer Ali: 7006342374</div>
        </div>
      </div>
      <div class="bill-info">
        <div class ="inv-no">Invoice No: ${invoiceNumber}</div>
        <div>Date: ${new Date(date).toLocaleDateString('en-GB')}</div>
      </div>
      <div class="bill-to">
        Bill to: <span>${customerName}</span>
      </div>
      <div class="bill-items">
        <table>
          <thead>
            <tr>
              <th>SNO</th>
              <th>ITEM NAME</th>
              <th>QTY</th>
              <th>WEIGHT</th>
              <th>RATE</th>
              <th>TOTAL</th>
            </tr>
          </thead>
          <tbody>
            ${items.map((item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${item.itemName}</td>
                <td>${item.quantity}</td>
                <td>${item.weight !== null ? item.weight : '-'}</td>
                <td>₹${item.rate}</td>
                <td>₹${item.total}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="4"></td>
              <td>Total:</td>
              <td>₹${items.reduce((acc, item) => acc + (item.total || 0), 0)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="bill-total">
        <div>Ledger Balance: ₹${lastBalance.toFixed(2)}</div>
      </div>
      <footer class="invoice-footer">
        <div class="bank-details">
          Bank Details:  0 6 3 4 0 2 0 1 0 0 0 0 0 1 0 0 -- IFSC: JAKA0MEHJUR -- Branch: Mehjoornagar
        </div>
      </footer>
    </div>
    <div class="page-break"></div>
  `;
  }).join('');

  printWindow.document.write(`
    <html>
      <head>
        <title></title>
        <style>
          body {
            font-family: 'Consolas', 'Courier New', monospace;
            margin: 0;
            padding: 1rem;
            font-size: 18px;
          }
          .bill-template {
            margin: auto;
            padding: 2rem;
            border: 1px solid #ccc;
            position:relative;
            max-width: 800px;
            page-break-inside: avoid;
          }
          .bill-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
          }
          .company-name {
            text-align: center;
            font-size: 2rem;
            font-weight: bold;
            margin-bottom: 1rem;
            width: 100%;
          }
          .company-info, .contact-info {
            flex: 1;
            font-size: 0.6rem;
            line-height: 1.2rem;
          }
          .company-info {
            text-align: left;
            max-width: 50%;
          }
          .contact-info {
            text-align: right;
            margin-top: -1rem;
            max-width: 50%;
          }
          .bill-info {
            display: flex;
            justify-content: space-between;
            margin-top: 1rem;
            font-size: 1rem;
            font-weight: bold;
          }
          .bill-to {
            margin-top: 1rem;
            font-weight: bold;
          }
          .bill-to span {
            font-size: 1.1rem;
            text-decoration: underline;
          }
          .bill-items {
            margin-top: 2rem;
          }
          .bill-items table {
            width: 100%;
            border-collapse: collapse;
          }
          .bill-items th, .bill-items td {
            border: 1px solid #ccc;
            padding: 0.4rem;
            text-align: center;
          }
          .bill-items th {
            background-color: #bdc3c7;
            font-size: 14px;
          }
          .bill-items td {
            font-size: 12px;
          }
          .total-row td {
            font-weight: bold;
          }
          .total-row td:nth-child(5) {
            text-align: right;
          }
          .total-row td:nth-child(6) {
            font-size: 16px;
            background-color: #f0f0f0;
          }
          .bill-total {
            margin-top: 12px;
          }
          .invoice-footer {
          font-family: 'Arial', sans-serif;
           text-align: center;
            font-size: 9px;
            font-weight: normal;
            font-style: italic;
            letter-spacing: 1px;
            position: fixed; 
           
            bottom: 0; 
             
          }
          @media print {
            .bill-template {
              margin: auto;
              padding: 0;
              border: none;
            }
            .bill-items th {
              background-color: #bdc3c7;
            }
          }
          .page-break {
            display: block;
            page-break-before: always;
          }
        </style>
      </head>
      <body>
        ${allInvoicesHtml}
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



  const columns = [
    { 
      field: 'invoiceNumber', 
      headerName: 'Invoice Number',
      flex: 1, 
      minWidth: 150 
    },
    { 
      field: 'customerName', 
      headerName: 'Customer Name', 
      flex: 1.5, 
      minWidth: 200 
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
      field: 'date', 
      headerName: 'Date', 
      flex: 1, 
      minWidth: 150,
      renderCell: (params) => (
        <Typography>{new Date(params.row.date).toLocaleDateString('en-GB')}</Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 3,
      minWidth: 200,
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

              <IconButton
                color="primary"
                aria-label="make-payment"
                onClick={() => handleSaveAsPdf(params.row)}
                style={{ marginRight: '8px' }}
              >
                <PictureAsPdfIcon />
              </IconButton>
              
              </>
          ) : (
            <>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handlePrintInvoice(params.row)}
            style={{ marginRight: '8px', backgroundColor: 'Green',fontSize:"12px"}}
            startIcon={<PrintIcon/>}

          >
            Print Invoice
          </Button>
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
    <Container>
      <Box mb={2} display="flex" justifyContent="space-between" alignItems="center" marginTop={"20px"}>
        <TextField
           
           variant="outlined"
            placeholder="Search invoices"
           value={searchQuery}
           onChange={(e) => setSearchQuery(e.target.value)}
         />
        {window.innerWidth <= 600 ? (<>
          <Typography variant="h4" sx={{fontSize:"14px",marginLeft:"15px"}}>Yesterday's Invoices</Typography>
              <IconButton
                color="primary"
                aria-label="add-invoice"
                onClick={fetchYesterdayInvoices}
                style={{ marginRight: '8px' }}
              >
                <RefreshIcon />
              </IconButton>
        
        </>):(<>
        <div>
        <Typography variant="h4">Yesterday's Invoices</Typography>

          <Button 
            variant="contained" 
            color="primary" 
            onClick={handlePrintAllInvoices}
            startIcon={<PrintIcon/>}
            style={{marginRight:"10px"}}

          >
            Print All Invoices
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={fetchYesterdayInvoices}
            startIcon={<RefreshIcon/>}

          >
            Refresh
          </Button>
          </div>
        </>
        )}
       
        
        
      </Box>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="400px">
                   <FourSquare color={["#33CCCC", "#33CC36", "#B8CC33", "#FCCA00"]} size="small" text="loading...." textColor={["#33CCCC", "#33CC36", "#B8CC33", "#FCCA00"]} />

        </Box>
      ) : (
        <Box 
          sx={{ 
            height: '600px', 
            width: '100%' 
          }}
        >
          <DataGrid
            rows={filteredInvoices}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 20, 50]}
            autoHeight
            disableSelectionOnClick
          />
        </Box>
      )}
      {selectedInvoice && (
        <EditInvoiceModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          invoice={selectedInvoice}
          onSubmit={fetchYesterdayInvoices}
          updateInvoice={handleUpdateInvoice}
        />
      )}
      {/* Bill preview modal */}
      <BillTemplate open={showBillPreview} handleClose={handleCloseBillPreview} invoice={billPreviewData} />
    </Container>
  );
};

export default ViewYesterdaysInvoices;
