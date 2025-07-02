import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Button, CircularProgress, IconButton, Dialog, DialogContent, DialogTitle, DialogActions, Paper, TextField } from '@mui/material';
import { DataGrid, GridSearchIcon } from '@mui/x-data-grid';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { API_BASE_URL } from '../constants';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import PrintIcon from '@mui/icons-material/Print';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import apiClient from "../services/apiClient";
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { Atom, FourSquare } from "react-loading-indicators";
import EditWatakModal from '../components/EditWatakModa';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';

const SearchWatak = () => {
  const [wataks, setWataks] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedWatak, setSelectedWatak] = useState(null);
  const [loading, setLoading] = useState(null);
  const [showWatakPreview, setShowWatakPreview] = useState(false);
  const [watakPreviewData, setWatakPreviewData] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [loadingOndelete , setLoadingOndelete] = useState(false)
  const [searchDate, setSearchDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredWataks, setFilteredWataks] = useState([]);
  const [error, setError] = useState(null);
  



  const handleSearch = () => {
    if (searchDate) {
      fetchWataks();
    } else {
      setError('Please enter a valid date');
    }
  };

  const fetchWataks = async () => {
    setError(null);
    setLoading(true);

    try {
      const response = await apiClient.get(`${API_BASE_URL}/getWataksByDate/?date=${searchDate}`);
      const fetchedWataks = response?.data?.data?.watak || [];
      console.log("FETCHED WAATK",fetchedWataks)
      const wataksWithIds = fetchedWataks.map((watak) => ({
        ...watak,
        id: watak._id
      }));
      setWataks(wataksWithIds);
    } catch (error) {
      console.error('Error fetching Wataks:', error);
      toast.error('Failed to fetch Wataks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery === '') {
      setFilteredWataks(wataks);
    } else {
      const filtered = wataks.filter(watak =>
        watak.vendorName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredWataks(filtered);
    }
  }, [searchQuery, wataks]);

  const handleEditWatak = (watak) => {
    console.log("watak is ",watak)
    setSelectedWatak(watak);
    setEditModalOpen(true);
  };

  const handleUpdateWatak = (updatedWatak) => {
    fetchWataks();
  };

  const handleOpenWatakPreview = (watak) => {
    setWatakPreviewData(watak);
    setShowWatakPreview(true);
  };

  const handleCloseWatakPreview = () => {
    setShowWatakPreview(false);
  };
  console.log("wa",wataks)

const onlyLocal= wataks.filter(watak =>watak.vendorType === "Local")
console.log("lodal",onlyLocal)
  
  const handlePrintWatak = (watak) => {
    
    const {
      watakNumber,
      date,
      vehicleNumber,
      items,
      netAmount,
      vendorName,
      expenses: { commission, labor,laborCharges, vehicleCharges, otherCharges, bardan, total: totalExpenses }
    } = watak;
  
    const grandTotal = items.reduce((acc, item) => acc + (item.total || 0), 0);
  
    const printWindow = window.open('', '_blank');
  
    printWindow.document.write(`
      <html>
        <head>
          <title>Watak Invoice</title>
           <style>
            body {
                  font-family: courier, monospace;
f
              margin: 0;
              padding: 1rem;
              font-size: 0.7rem;
            }
            .bill-template {
              margin: auto;
              padding: 2rem;
              border: 1px solid #ccc;
              max-width: 800px;
              color: black;
              position: relative;
            }
              .bill-bar{
               background-color: #e0ebeb;
               padding: 1rem;
               padding-top:0.2rem;
               }
            .company-name {
              text-align: center;
              font-size: 3.5rem;
              font-weight: bold;
              margin-bottom: 0.5rem;
              color: #1abc9c;
            }
            .company-address {
              text-align: center;
              font-size: 1rem;
              margin-bottom: 1rem;
              color: #9b59b6;
            }
            .bill-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .company-info, .contact-info {
              flex: 1;
              font-size: 0.6rem;
              line-height: 1.2rem;
            }
            .company-info {
              text-align: left;
              max-width: 60%;
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
             
            }
            .bill-to {
              margin-top: 1rem;
              font-weight: bold;
              font-size: 1.1rem;
            }
            .bill-to span {
              font-size: 1.1rem;
              
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
              font-size: 0.875rem;
              color: #e74c3c;
            }
            .bill-items td {
              font-size: 0.75rem;
            }
            .total-row td {
              font-weight: bold;
            }
            .total-row td:nth-child(6) {
              font-size: 1rem;
              background-color: #f0f0f0;
            }
            .expenses-section, .profit-section {
              display: flex;
              justify-content: space-between;
              margin-top: 50px;
            }
            .expenses {
              flex: 1;
              font-size: 0.7rem;
              background-color: #f9f9f9;
              padding: 10px;
              border-radius: 5px;
            }
            .profit {
              flex: 1;
             
              font-size: 0.8rem;
              background-color: #eaf8f0;
              padding: 10px;
              
              border-radius: 5px;
            }
            .profit div, .expenses div {
              margin-bottom: 5px;
            }
            .net-amount {
              font-size: 1rem;
              font-weight: bold;
              background-color: #42b883;
              padding:10px;
              margin-top: 1rem;
            }
            @media (max-width: 600px) {
              body {
                font-size: 0.75rem;
              }
              .company-name {
                font-size: 1.5rem;
              }
              .company-address {
                font-size: 1rem;
              }
              .bill-info {
                font-size: 0.875rem;
              }
              .bill-items th {
                font-size: 0.75rem;
              }
              .bill-items td {
                font-size: 0.625rem;
              }
              .total-row td:nth-child(6) {
                font-size: 0.875rem;
              }
              .expenses, .profit {
                font-size: 0.75rem;
              }
            }
            @media (min-width: 1200px) {
              body {
                font-size: 1.5rem;
              }
              .profit div {
                padding: 10px;
              }
              .company-name {
                font-size: 2.5rem;
              }
              .company-address {
                font-size: 1.5rem;
              }
              .bill-info {
                font-size: 1.25rem;
              }
              .bill-items th {
                font-size: 1rem;
              }
              .bill-items td {
                font-size: 0.875rem;
              }
              .total-row td:nth-child(6) {
                font-size: 1.25rem;
              }
              .expenses, .profit {
                font-size: 1rem;
              }
            }
            @media print {
              .bill-template {
                margin: auto;
                padding: 0;
                border: none;
              }
               
            }
            .invoice-footer {
              text-align: center;
              font-size: 0.75rem;
              position: absolute;
              bottom: 0;
              width: 100%;
              padding: 0.5rem;
              border-top: 1px solid #ccc;
              background-color: #f9f9f9;
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
              <div>Watak No: ${watakNumber}</div>
              <div>Date: ${new Date(date).toLocaleDateString('en-GB')}</div>
            </div>
            <div class="bill-to">
              <div>Bill to: <span>${vendorName}</span></div>
            </div>
  
            <div class="other-details bill-info">
              <span>Vehicle Number: ${vehicleNumber.toUpperCase()}</span>
              <span>Nugs: _______</span>
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
                      <td>${item.weight || '-'}</td>
                      <td>₹${item.rate}</td>
                      <td>₹${item.total}</td>
                    </tr>
                  `).join('')}
                  <tr class="total-row">
                    <td colspan="5">Total:</td>
                    <td>₹${grandTotal}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="expenses-section">
              <div class="expenses">
                <div>Expenses Breakdown:</div>
                <div>Commission: ₹${commission}</div>
                <div>Labor Charges: ₹${laborCharges}</div>
                <div>Vehicle Charges: ₹${vehicleCharges}</div>
                <div>Other Charges: ₹${otherCharges}</div>
                <div>Bardan: ₹${bardan}</div>
                <div><strong>Total Expenses: ₹${totalExpenses}</strong></div>
              </div>
              <div class="profit">
                <div><strong>Goods Sale Proceeds: ₹${grandTotal}</strong></div>
                <div><strong>Expenses: ₹${totalExpenses}</strong></div>
                <div class="net-amount"><strong>Net Amount: ₹${netAmount}</strong></div>
              </div>
            </div>
  
            <div class="invoice-footer">
              Thank you for your business!
            </div>
          </div>
        </body>
      </html>
    `);
  
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };
  
  const handlePrintAllInvoices = () => {
    const printWindow = window.open('', '_blank');
    const sortedWataks = [...wataks].sort((a, b) => parseInt(a.watakNumber) - parseInt(b.watakNumber));
    console.log("sortedWaaks",sortedWataks)
    const sortedInvoices = sortedWataks.filter(watak =>watak.vendorType !== "Outsider")
    
    const allInvoicesHtml = sortedInvoices.map(watak => {
      const {
        watakNumber,
        date,
        vehicleNumber,
        items,
        netAmount,
        vendorName,
        expenses: { commission, labor,laborCharges, vehicleCharges, otherCharges, bardan, total: totalExpenses }
      } = watak;
      
      const grandTotal = items.reduce((acc, item) => acc + (item.total || 0), 0);
  
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
              <div>Ali Mohd: 9419067657</div>
              <div>Sajad Ali: 7889718295</div>
              <div>Umer Ali: 7006342374</div>
            </div>
          </div>
          <div class= "bill-bar">
          <div class="bill-info">
            <div>Watak No: ${watakNumber}</div>
            <div>Date: ${new Date(date).toLocaleDateString('en-GB')}</div>
          </div>
          <div class="bill-to">
            <div>Bill to: <span>${vendorName}</span></div>
          </div>
  
          <div class="other-details bill-info">
          
            <span>Challan No: _________</span>
            <span>Nugs: _______</span>
          </div>
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
                    <td>${item.weight || '-'}</td>
                    <td>₹${item.rate}</td>
                    <td>₹${item.total}</td>
                  </tr>
                `).join('')}
                <tr class="total-row">
                  <td colspan="5">Total:</td>
                  <td>₹${grandTotal}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="expenses-section">
            <div class="expenses">
              <div>Expenses Breakdown:</div>
              <div>Commission: ₹${commission}</div>
              <div>Labor Charges: ₹${laborCharges}</div>
              <div>Vehicle Charges: ₹${vehicleCharges}</div>
              <div>Other Charges: ₹${otherCharges}</div>
              <div>Bardan: ₹${bardan}</div>
              <div><strong>Total Expenses: ₹${totalExpenses.toFixed(2)}</strong></div>
            </div>
            <div class="profit">
              <div><strong>Goods Sale Proceeds: ₹${grandTotal.toFixed(2)}</strong></div>
              <div><strong>Expenses: ₹${totalExpenses.toFixed(2)}</strong></div>
              <div class="net-amount"><strong>Net Amount: ₹${netAmount.toFixed(2)}</strong></div>
            </div>
          </div>
  
          <div class="invoice-footer">
            Thank you for your business!
          </div>
        </div>
      <div class="page-break"></div>
    `;
    }).join(''); // Add a separator between invoices
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Watak Invoice</title>
          <style>
            body {
                  font-family: courier, monospace;
f
              margin: 0;
              padding: 1rem;
              font-size: 0.7rem;
            }
            .bill-template {
              margin: auto;
              padding: 2rem;
              border: 1px solid #ccc;
              max-width: 800px;
              color: black;
              position: relative;
            }
              .bill-bar{
               background-color: #e0ebeb;
               padding: 1rem;
               padding-top:0.2rem;
               }
            .company-name {
              text-align: center;
              font-size: 3.5rem;
              font-weight: bold;
              margin-bottom: 0.5rem;
              color: #1abc9c;
            }
            .company-address {
              text-align: center;
              font-size: 1rem;
              margin-bottom: 1rem;
              color: #9b59b6;
            }
            .bill-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .company-info, .contact-info {
              flex: 1;
              font-size: 0.6rem;
              line-height: 1.2rem;
            }
            .company-info {
              text-align: left;
              max-width: 60%;
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
             
            }
            .bill-to {
              margin-top: 1rem;
              font-weight: bold;
              font-size: 1.1rem;
            }
            .bill-to span {
              font-size: 1.1rem;
              
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
              font-size: 0.875rem;
              color: #e74c3c;
            }
            .bill-items td {
              font-size: 0.75rem;
            }
            .total-row td {
              font-weight: bold;
            }
            .total-row td:nth-child(6) {
              font-size: 1rem;
              background-color: #f0f0f0;
            }
            .expenses-section, .profit-section {
              display: flex;
              justify-content: space-between;
              margin-top: 50px;
            }
            .expenses {
              flex: 1;
              font-size: 0.7rem;
              background-color: #f9f9f9;
              padding: 10px;
              border-radius: 5px;
            }
            .profit {
              flex: 1;
             
              font-size: 0.8rem;
              background-color: #eaf8f0;
              padding: 10px;
              
              border-radius: 5px;
            }
            .profit div, .expenses div {
              margin-bottom: 5px;
            }
            .net-amount {
              font-size: 1rem;
              font-weight: bold;
              background-color: #42b883;
              padding:10px;
              margin-top: 1rem;
            }
            @media (max-width: 600px) {
              body {
                font-size: 0.75rem;
              }
              .company-name {
                font-size: 1.5rem;
              }
              .company-address {
                font-size: 1rem;
              }
              .bill-info {
                font-size: 0.875rem;
              }
              .bill-items th {
                font-size: 0.75rem;
              }
              .bill-items td {
                font-size: 0.625rem;
              }
              .total-row td:nth-child(6) {
                font-size: 0.875rem;
              }
              .expenses, .profit {
                font-size: 0.75rem;
              }
            }
            @media (min-width: 1200px) {
              body {
                font-size: 1.5rem;
              }
              .profit div {
                padding: 10px;
              }
              .company-name {
                font-size: 2.5rem;
              }
              .company-address {
                font-size: 1.5rem;
              }
              .bill-info {
                font-size: 1.25rem;
              }
              .bill-items th {
                font-size: 1rem;
              }
              .bill-items td {
                font-size: 0.875rem;
              }
              .total-row td:nth-child(6) {
                font-size: 1.25rem;
              }
              .expenses, .profit {
                font-size: 1rem;
              }
            }
            @media print {
              .bill-template {
                margin: auto;
                padding: 0;
                border: none;
              }
                 @page {
      size: A5; /* Set the page size to A5 */
      margin: 1mm; /* Adjust margins as needed */
    }
                .page-break {
                margin-top :10px;
            display: block;
            page-break-before: always;
          }
               
            }
            .invoice-footer {
              text-align: center;
              font-size: 0.75rem;
              position: absolute;
              bottom: 0;
              width: 100%;
              padding: 0.5rem;
              border-top: 1px solid #ccc;
              background-color: #f9f9f9;
            }
          </style>
        </head>
        <body>
          ${allInvoicesHtml}
        </body>
      </html>
    `);
  
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };
  
  
  const handleSaveAsPdf = (watak) => {
    const {
      watakNumber,
      date,
      vehicleNumber,
      items,
      netAmount,
      vendorName,
      expenses: { commission, labor, vehicleCharges,laborCharges, otherCharges, bardan, total: totalExpenses }
    } = watak;
  
    const grandTotal = items.reduce((acc, item) => acc + (item.total || 0), 0);
  
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  
    // Define colors and fonts
    const headerColor = '#1abc9c'; // Example color
    const tableHeaderColor = '#9b59b6'; // Example color
    const textColor = '#333'; // Dark grey
    const fontSize = 12;
    const boldFont = 'courier';// or use another font if specified
  
    // Center the heading
    doc.setFontSize(25);
    doc.setFont(boldFont, 'bold');
    doc.setTextColor(headerColor);
    const heading = 'KICHLOO AND CO.';
    const pageWidth = doc.internal.pageSize.getWidth(); // Page width
    const headingWidth = doc.getStringUnitWidth(heading) * fontSize * 0.75; // Adjust factor if necessary
    const xPosition = (pageWidth - headingWidth) / 2; // Center X position
    doc.text(heading, xPosition, 20); // Centered heading
  
    // Company info and phone numbers
    doc.setFontSize(10);
    doc.setFont(boldFont, 'normal');
    doc.setTextColor(textColor);
  
    // Company Info on the left
    doc.text('Wholesale Dealers of Vegetables', 14, 30);
    doc.text('75,313 Iqbal Sabzi Mandi, Bagh Nand Singh', 14, 35);
    doc.text('Tatoo Ground, Batamaloo, Sgr.', 14, 40);
  
    // Phone numbers on the right

    doc.text('Watak Invoice', 190, 20, { align: 'right' });
    doc.text('Ali Mohd: 9419067657', 190, 30, { align: 'right' });
    doc.text('Sajad Ali: 7889718295', 190, 35, { align: 'right' });
    doc.text('Umer Ali: 7006342374', 190, 40, { align: 'right' });
  

    // Bill to, date, and vehicle number on the same line
    doc.setFontSize(13);
    doc.setFont(boldFont, 'bold');
    doc.setTextColor(textColor);

    doc.text(`Watak No: ${watakNumber}`, 14, 50);
    
    doc.text(`Bill To: ${vendorName}`, 14, 60);
    
    doc.text(`Date: ${new Date(date).toLocaleDateString('en-GB')}`, 14, 70);
    
    doc.text(`Vehicle Number: ${vehicleNumber.toUpperCase()}`, 190, 70, { align: 'right' });

  
    // Add items table
    doc.autoTable({
      startY: 85,
      head: [["SNO", "ITEM NAME", "QTY", "WEIGHT", "RATE (Rs)", "TOTAL (Rs)"]],
      body: items.map((item, index) => [
        index + 1,
        item.itemName,
        item.quantity,
        item.weight || '-',
        item.rate,
        item.total
      ]),
      theme: 'striped',
      headStyles: { fillColor: tableHeaderColor, textColor: '#fff', fontSize: 8, fontStyle: 'bold' },
      styles: {
        cellPadding: 3,
        fontSize: 10,
        textColor: textColor,
        halign: 'center',
        valign: 'middle',
        lineColor: '#ddd',
        font: 'courier' ,
        lineWidth: 0.75
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 60 },
        2: { cellWidth: 20 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25 },
        5: { cellWidth: 30 },
      },
      margin: { top: 10 },
    });
    const formatAmount = amount => amount.toFixed(2);
  // Add expenses breakdown
doc.setFontSize(11);
doc.setFont(boldFont, 'normal');
doc.setTextColor(textColor);

// Y position for both sections
const yStart = doc.autoTable.previous.finalY + 20;

// Left side for expenses
const leftXPosition = 14; // X position for expenses section
const lineHeight = 8; // Spacing between lines

doc.text('Expenses Breakdown:', leftXPosition, yStart);
doc.text(`Commission: Rs. ${commission}`, leftXPosition, yStart + lineHeight);
doc.text(`Labor Charges: Rs. ${laborCharges}`, leftXPosition, yStart + lineHeight * 2);
doc.text(`Vehicle Charges: Rs. ${vehicleCharges}`, leftXPosition, yStart + lineHeight * 3);
doc.text(`Other Charges: Rs. ${otherCharges}`, leftXPosition, yStart + lineHeight * 4);
doc.text(`Bardan: Rs. ${bardan}`, leftXPosition, yStart + lineHeight * 5);
doc.text(`Total Expenses: Rs. ${totalExpenses}`, leftXPosition, yStart + lineHeight * 6);

// Right side for financial details
const rightXPosition = 200; // Adjust this to fit your layout
const rightMargin = 5; // Margin from the right edge

doc.setFontSize(13);
doc.setFont(boldFont, 'bold');
doc.setTextColor(textColor);

doc.text(`Goods Sale Proceeds: Rs.${formatAmount(grandTotal)}`, rightXPosition, yStart, { align: 'right' });
doc.text(`Expenses: Rs.${formatAmount(totalExpenses)}`, rightXPosition, yStart + 10, { align: 'right' });
doc.text(`Net Amount: Rs.${formatAmount(netAmount)}`, rightXPosition, yStart + 20, { align: 'right' });

// Add a line above the divider
const lineAboveDividerYPosition = yStart + 85; // Adjust this position as needed
doc.setDrawColor(0, 0, 0); // Set the line color to black
doc.setLineWidth(0.5); // Set the line width
doc.line(leftXPosition, lineAboveDividerYPosition, pageWidth - rightMargin, lineAboveDividerYPosition); // Draw the line

// Add footer
doc.setFontSize(10);
doc.setFont(boldFont, 'normal');
const footerText = 'Thank you for your business!';
const footerTextWidth = doc.getStringUnitWidth(footerText) * doc.internal.scaleFactor;
const footerXPosition = (pageWidth - footerTextWidth) / 2; // Center X position for footer
doc.text(footerText, footerXPosition, yStart + 100);
 
    // Save PDF
    doc.save(`${vendorName}_${date}_watak.pdf`);
  };
  
  

  const handleDeleteWatak = async () => {
    setLoadingOndelete(true)
    try {
      await apiClient.delete(`${API_BASE_URL}/vendor/${selectedRow.vendorId}/watak/${selectedRow.id}`);

      setWataks(wataks.filter(watak => watak.id !== selectedRow.id));
      setOpenDeleteDialog(false);
      toast.success('Watak deleted successfully');
    } catch (error) {
      console.error('Error deleting Watak:', error);
      toast.error('Failed to delete Watak');
    }
    finally{
      setLoadingOndelete(false)
    }
  };

  const columns = [
    {
      field: 'actions',
      headerName: 'Actions',
      minWidth: window.innerWidth <= 600 ? 100 : 300,
      renderCell: (params) => (
        
        <>
            {window.innerWidth <= 600 ? (
                  <>
                {/* <IconButton sx={{color:'pink'}} onClick={() => handleEditWatak(params.row)} aria-label="edit">
            <EditIcon />
          </IconButton> */}
          <IconButton sx={{color:'green'}} onClick={() => handleSaveAsPdf(params.row)} aria-label="save as pdf">
            <PictureAsPdfIcon />
          </IconButton>

          <IconButton color='secondary' onClick={() => handlePrintWatak(params.row)} aria-label="print">
            <PrintIcon />
          </IconButton>
          {/* <IconButton sx={{color:'red'}} onClick={() => { setSelectedRow(params.row); setOpenDeleteDialog(true); }} aria-label="delete">
            <DeleteIcon />
          </IconButton> */}
                </>
            ):( 
            <>
            
            <Button
                variant="contained"
                color="primary"
                onClick={() => handlePrintWatak(params.row)}
                sx={{
                  borderRadius: 2, // Rounded corners
                  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)', // Subtle shadow
                  marginRight: "8px",
                  backgroundColor: "green", minWidth: "100px", 
                  fontSize:"10px"

                }}
                startIcon={  <PrintIcon />}
                aria-label="print watak"
              >
                Print Watak
              </Button>
              {/* <Button
                variant="contained"
                color="primary"
                onClick={() => handleEditWatak(params.row)}
                startIcon={  <EditIcon />}
                sx={{
                  borderRadius: 2, // Rounded corners
                  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)', // Subtle shadow
                  backgroundColor: "skyblue", minWidth: "100px", 
                  marginRight: "8px",
                  fontSize:"10px"

                }}
                aria-label="edit watak"
              >
                Edit Watak
              </Button> */}
             
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleSaveAsPdf(params.row)}
                
                startIcon={   <PictureAsPdfIcon />}
                aria-label="delete watak"
                sx={{
                  borderRadius: 2, // Rounded corners
                  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)', // Subtle shadow
                  backgroundColor: "orange", minWidth: "100px", 
                  marginRight: "8px",
                  fontSize:"10px"

                }}
              >
              Save Pdf
              </Button>
              {/* <Button
                variant="contained"
                color="primary"
                onClick={() => { setSelectedRow(params.row); setOpenDeleteDialog(true); }}
                sx={{
                  borderRadius: 2, // Rounded corners
                  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)', // Subtle shadow
                  backgroundColor: "red", minWidth: "100px", 
                  fontSize:"10px"
                }}
                startIcon={ <DeleteIcon />}
                aria-label="delete watak"
              >
              
                Delete Watak
              </Button> */}

            
              </>
              )}
           </>
         
       
      )
    },
   
    { field: 'vendorName', headerName: 'Vendor Name', minWidth: 150 },
    { field: 'netAmount', headerName: 'Net Amount (₹)', minWidth: 180 },
    { field: 'date', headerName: 'Date', minWidth: 100, renderCell: (params) => (
       <>{new Date(params.row.date).toLocaleDateString('en-GB')}</>
      ), },
      { field: 'watakNumber', headerName: 'Watak No', minWidth: 100 },
   
  
  ];
  return (
    <Container>
      <Box
        mb={2}
        display="flex"
        justifyContent="center"
        alignItems="center"
        sx={{
          mt: 2,
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 2, sm: 1 },
        }}
      >
        <TextField
          label="Search by Date"
          variant="outlined"
          type="date"
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
          sx={{
            mb: { xs: 2 },
            width: { xs: '100%', sm: '600px' },
          }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSearch}
          disabled={loading}
          startIcon={<GridSearchIcon />}
          sx={{ mb: { xs: 2, sm: 0 }, mt: { sm: '-22px' } }}
        >
          {!loading ? 'Search' : 'Searching '}
        </Button>
      </Box>
  
      {/* Conditional rendering based on the search results */}
      {loading === false && wataks.length === 0 ? (
        <Paper
          elevation={5}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '200px',
            backgroundColor: '#f7f7f7',
            padding: '20px',
            flexDirection: 'column',
          }}
        >
          <Typography variant="h5" color="textSecondary" gutterBottom>
            No Wataks Found
          </Typography>
          <SentimentVeryDissatisfiedIcon />
          <Typography variant="body1" color="textSecondary">
            It seems there are no Wataks available for the selected date. Please try searching with a different date.
          </Typography>
        </Paper>
      ) : (
        wataks.length > 0 && (
          <>
            <Box
              mb={2}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mt: 2, flexDirection: { xs: 'column', sm: 'row' } }}
            >
              <TextField
                variant="outlined"
                placeholder="Search invoices"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ mb: { xs: 2, sm: 0 }, width: { xs: '100%', sm: 'auto' } }}
              />
              <Box>
                {window.innerWidth >= 600 && (
                   <Button
                   variant="contained"
                   color="secondary"
                   onClick={handlePrintAllInvoices}
                   startIcon={<PrintIcon />}
                   style={{ marginRight: '10px' }}
                 >
                   Print Local Wataks
                 </Button>
                )}
              </Box>
            </Box>
  
            {/* <Typography variant="h4">Wataks of  {searchDate}</Typography>
   */}
            {onlyLocal.length > 0 && (
              window.innerWidth <= 600 ? (
                <IconButton onClick={handlePrintAllInvoices} color="secondary">
                  <PrintIcon />
                </IconButton>
              ) : (
               ""
              )
            )}
  
            {/* <IconButton onClick={fetchWataks} color="primary">
              <RefreshIcon />
            </IconButton> */}
  
            {loading ? (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="400px"
              >
                <FourSquare
                  color={['#33CCCC', '#33CC36', '#B8CC33', '#FCCA00']}
                  size="small"
                  text="loading...."
                  textColor={['#33CCCC', '#33CC36', '#B8CC33', '#FCCA00']}
                />
              </Box>
            ) : (
              <DataGrid
                rows={filteredWataks}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10]}
                autoHeight
                disableSelectionOnClick
                sx={{pb:4}}
              />
            )}
  
            <Dialog
              open={openDeleteDialog}
              onClose={() => setOpenDeleteDialog(false)}
            >
              <DialogTitle>Confirm Delete</DialogTitle>
              <DialogContent>
                <Typography>
                  Are you sure you want to delete this Watak?
                </Typography>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={() => setOpenDeleteDialog(false)}
                  color="primary"
                  disabled={loadingOndelete}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteWatak}
                  color="secondary"
                  disabled={loadingOndelete}
                >
                  {loadingOndelete ? 'Deleting...' : 'Delete'}
                </Button>
              </DialogActions>
            </Dialog>
  
            <Dialog
              open={showWatakPreview}
              onClose={handleCloseWatakPreview}
              fullWidth
              maxWidth="md"
            >
              <DialogTitle>Watak Preview</DialogTitle>
              <DialogContent>
                {watakPreviewData && (
                  <div>
                    <Typography variant="h6">
                      Watak No: {watakPreviewData.watakNumber}
                    </Typography>
                    <Typography variant="body1">
                      Customer Name: {watakPreviewData.vendorName}
                    </Typography>
                  </div>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseWatakPreview} color="primary">
                  Close
                </Button>
              </DialogActions>
            </Dialog>
  
            <EditWatakModal
              open={editModalOpen}
              onClose={() => setEditModalOpen(false)}
              watak={selectedWatak}
              onSubmit={handleUpdateWatak}
            />
          </>
        )
      )}
    </Container>
  );
}

export default SearchWatak;
