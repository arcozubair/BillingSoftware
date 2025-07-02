import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  CircularProgress,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  TextField,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import EditInvoiceModal from "../components/EditInvoiceModal";
import { API_BASE_URL } from "../constants";
import jsPDF from "jspdf";
import BillTemplate from "../components/billTemplate";
import PrintIcon from "@mui/icons-material/Print";
import EditIcon from "@mui/icons-material/Edit";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import RefreshIcon from "@mui/icons-material/Refresh";
import apiClient from "../services/apiClient";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import "jspdf-autotable";
import DeleteIcon from "@mui/icons-material/Delete";
import { Commet, FourSquare } from "react-loading-indicators";
import { fontSize } from "@mui/system";
const ViewTodaysInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBillPreview, setShowBillPreview] = useState(false);
  const [billPreviewData, setBillPreviewData] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [loadingOndelete, setLoadingOndelete] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  // Function to convert an image URL to a base64 string
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
  
  useEffect(() => {
    fetchTodaysInvoices();
  }, []);

  useEffect(() => {
    if (searchQuery === "") {
      setFilteredInvoices(invoices);
    } else {
      const filtered = invoices.filter((invoice) =>
        invoice.customerName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredInvoices(filtered);
    }
  }, [searchQuery, invoices]);

  const fetchTodaysInvoices = async () => {
    setLoading(true);

    try {
      const response = await apiClient.get(`${API_BASE_URL}/getTodaysInvoices`);
      const fetchedInvoices = response?.data?.data?.invoices || [];
      const invoicesWithIds = fetchedInvoices.map((invoice) => ({
        ...invoice,
        id: invoice._id,
      }));
      setInvoices(invoicesWithIds);
    } catch (error) {
      console.error("Error fetching today's invoices:", error);
      toast.error("Failed to fetch today's invoices");
    } finally {
      setLoading(false);
    }
  };

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
    console.log("invoice", invoice);

    setBillPreviewData(invoice); // Set the invoice data for preview
    setShowBillPreview(true); // Open the bill preview modal
  };

  const handleCloseBillPreview = () => {
    setShowBillPreview(false);
  };

  const handlePrintInvoice = (invoice) => {
    const { invoiceNumber, customerName, date, items, balance, lastBalance } =
      invoice;

    const printWindow = window.open("", "_blank");

    printWindow.document.write(`
      <html>
        <head>
           <title>Trade Mark (KAC)</title>
          <style>
            body {
              font-family: 'Consolas', 'Courier New', monospace;
              margin: 0;
              padding: 1rem;
              font-size: 17px;
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
                        <div>Date: ${new Date(date).toLocaleDateString(
                          "en-GB"
                        )}</div>
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
                  ${items
                    .map(
                      (item, index) => `
                    <tr>
                      <td>${index + 1}</td>
                      <td>${item.itemName}</td>
                      <td>${item.quantity}</td>
                      <td>${item.weight !== null ? item.weight : "-"}</td>
                      <td>₹${item.rate}</td>
                      <td>₹${item.total}</td>
                    </tr>
                  `
                    )
                    .join("")}
                  <tr class="total-row">
                    <td colspan="4"></td>
                    <td>Total:</td>
                    <td>₹${items.reduce(
                      (acc, item) => acc + (item.total || 0),
                      0
                    )}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="bill-total">
              <div>Ledger Balance: ₹${lastBalance.toFixed(2)}</div>
            </div>
          </div>
          
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handlePrintAllInvoices = (invoice) => {
    const printWindow = window.open("", "_blank");

    if (invoice && invoice.preventDefault) {
      console.warn("Received an event object. Printing all invoices.");
      invoice = null; // Treat as if no specific invoice was provided
    }

    const qrImageSrc = "/qr.png";
    const qrImage = new Image();
    qrImage.src = qrImageSrc;
    console.log("invoice", invoice);
    qrImage.onload = () => {
      let invoicesToPrint = [];

      if (invoice && typeof invoice === "object" && !Array.isArray(invoice)) {
        invoicesToPrint = [invoice];
      } else {
        // If no specific invoice is provided, sort and print all invoices
        invoicesToPrint = [...invoices].sort(
          (a, b) => parseInt(a.invoiceNumber) - parseInt(b.invoiceNumber)
        );
        console.log("hey", invoicesToPrint);
      }

      // Generate HTML for each invoice
      const allInvoicesHtml = invoicesToPrint
        .map((invoice) => {
          const { invoiceNumber, customerName, date, items, lastBalance } =
            invoice;
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
             <div>
  Sajad Ali: 7889718295 <span>
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 48 48">
    <path fill="#fff" d="M4.868,43.303l2.694-9.835C5.9,30.59,5.026,27.324,5.027,23.979C5.032,13.514,13.548,5,24.014,5c5.079,0.002,9.845,1.979,13.43,5.566c3.584,3.588,5.558,8.356,5.556,13.428c-0.004,10.465-8.522,18.98-18.986,18.98c-0.001,0,0,0,0,0h-0.008c-3.177-0.001-6.3-0.798-9.073-2.311L4.868,43.303z"></path>
    <path fill="#fff" d="M4.868,43.803c-0.132,0-0.26-0.052-0.355-0.148c-0.125-0.127-0.174-0.312-0.127-0.483l2.639-9.636c-1.636-2.906-2.499-6.206-2.497-9.556C4.532,13.238,13.273,4.5,24.014,4.5c5.21,0.002,10.105,2.031,13.784,5.713c3.679,3.683,5.704,8.577,5.702,13.781c-0.004,10.741-8.746,19.48-19.486,19.48c-3.189-0.001-6.344-0.788-9.144-2.277l-9.875,2.589C4.953,43.798,4.911,43.803,4.868,43.803z"></path>
    <path fill="#cfd8dc" d="M24.014,5c5.079,0.002,9.845,1.979,13.43,5.566c3.584,3.588,5.558,8.356,5.556,13.428c-0.004,10.465-8.522,18.98-18.986,18.98h-0.008c-3.177-0.001-6.3-0.798-9.073-2.311L4.868,43.303l2.694-9.835C5.9,30.59,5.026,27.324,5.027,23.979C5.032,13.514,13.548,5,24.014,5 M24.014,42.974C24.014,42.974,24.014,42.974,24.014,42.974C24.014,42.974,24.014,42.974,24.014,42.974 M24.014,42.974C24.014,42.974,24.014,42.974,24.014,42.974C24.014,42.974,24.014,42.974,24.014,42.974 M24.014,4C24.014,4,24.014,4,24.014,4C12.998,4,4.032,12.962,4.027,23.979c-0.001,3.367,0.849,6.685,2.461,9.622l-2.585,9.439c-0.094,0.345,0.002,0.713,0.254,0.967c0.19,0.192,0.447,0.297,0.711,0.297c0.085,0,0.17-0.011,0.254-0.033l9.687-2.54c2.828,1.468,5.998,2.243,9.197,2.244c11.024,0,19.99-8.963,19.995-19.98c0.002-5.339-2.075-10.359-5.848-14.135C34.378,6.083,29.357,4.002,24.014,4L24.014,4z"></path>
    <path fill="#40c351" d="M35.176,12.832c-2.98-2.982-6.941-4.625-11.157-4.626c-8.704,0-15.783,7.076-15.787,15.774c-0.001,2.981,0.833,5.883,2.413,8.396l0.376,0.597l-1.595,5.821l5.973-1.566l0.577,0.342c2.422,1.438,5.2,2.198,8.032,2.199h0.006c8.698,0,15.777-7.077,15.78-15.776C39.795,19.778,38.156,15.814,35.176,12.832z"></path>
    <path fill="#fff" fill-rule="evenodd" d="M19.268,16.045c-0.355-0.79-0.729-0.806-1.068-0.82c-0.277-0.012-0.593-0.011-0.909-0.011c-0.316,0-0.83,0.119-1.265,0.594c-0.435,0.475-1.661,1.622-1.661,3.956c0,2.334,1.7,4.59,1.937,4.906c0.237,0.316,3.282,5.259,8.104,7.161c4.007,1.58,4.823,1.266,5.693,1.187c0.87-0.079,2.807-1.147,3.202-2.255c0.395-1.108,0.395-2.057,0.277-2.255c-0.119-0.198-0.435-0.316-0.909-0.554s-2.807-1.385-3.242-1.543c-0.435-0.158-0.751-0.237-1.068,0.238c-0.316,0.474-1.225,1.543-1.502,1.859c-0.277,0.317-0.554,0.357-1.028,0.119c-0.474-0.238-2.002-0.738-3.815-2.354c-1.41-1.257-2.362-2.81-2.639-3.285c-0.277-0.474-0.03-0.731,0.208-0.968c0.213-0.213,0.474-0.554,0.712-0.831c0.237-0.277,0.316-0.475,0.474-0.791c0.158-0.317,0.079-0.594-0.04-0.831C20.612,19.329,19.69,16.983,19.268,16.045z" clip-rule="evenodd"></path>
  </svg>
  </span>
</div>

              <div>Umer Ali: 7006342374 <span> <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 48 48">
    <path fill="#fff" d="M4.868,43.303l2.694-9.835C5.9,30.59,5.026,27.324,5.027,23.979C5.032,13.514,13.548,5,24.014,5c5.079,0.002,9.845,1.979,13.43,5.566c3.584,3.588,5.558,8.356,5.556,13.428c-0.004,10.465-8.522,18.98-18.986,18.98c-0.001,0,0,0,0,0h-0.008c-3.177-0.001-6.3-0.798-9.073-2.311L4.868,43.303z"></path>
    <path fill="#fff" d="M4.868,43.803c-0.132,0-0.26-0.052-0.355-0.148c-0.125-0.127-0.174-0.312-0.127-0.483l2.639-9.636c-1.636-2.906-2.499-6.206-2.497-9.556C4.532,13.238,13.273,4.5,24.014,4.5c5.21,0.002,10.105,2.031,13.784,5.713c3.679,3.683,5.704,8.577,5.702,13.781c-0.004,10.741-8.746,19.48-19.486,19.48c-3.189-0.001-6.344-0.788-9.144-2.277l-9.875,2.589C4.953,43.798,4.911,43.803,4.868,43.803z"></path>
    <path fill="#cfd8dc" d="M24.014,5c5.079,0.002,9.845,1.979,13.43,5.566c3.584,3.588,5.558,8.356,5.556,13.428c-0.004,10.465-8.522,18.98-18.986,18.98h-0.008c-3.177-0.001-6.3-0.798-9.073-2.311L4.868,43.303l2.694-9.835C5.9,30.59,5.026,27.324,5.027,23.979C5.032,13.514,13.548,5,24.014,5 M24.014,42.974C24.014,42.974,24.014,42.974,24.014,42.974C24.014,42.974,24.014,42.974,24.014,42.974 M24.014,42.974C24.014,42.974,24.014,42.974,24.014,42.974C24.014,42.974,24.014,42.974,24.014,42.974 M24.014,4C24.014,4,24.014,4,24.014,4C12.998,4,4.032,12.962,4.027,23.979c-0.001,3.367,0.849,6.685,2.461,9.622l-2.585,9.439c-0.094,0.345,0.002,0.713,0.254,0.967c0.19,0.192,0.447,0.297,0.711,0.297c0.085,0,0.17-0.011,0.254-0.033l9.687-2.54c2.828,1.468,5.998,2.243,9.197,2.244c11.024,0,19.99-8.963,19.995-19.98c0.002-5.339-2.075-10.359-5.848-14.135C34.378,6.083,29.357,4.002,24.014,4L24.014,4z"></path>
    <path fill="#40c351" d="M35.176,12.832c-2.98-2.982-6.941-4.625-11.157-4.626c-8.704,0-15.783,7.076-15.787,15.774c-0.001,2.981,0.833,5.883,2.413,8.396l0.376,0.597l-1.595,5.821l5.973-1.566l0.577,0.342c2.422,1.438,5.2,2.198,8.032,2.199h0.006c8.698,0,15.777-7.077,15.78-15.776C39.795,19.778,38.156,15.814,35.176,12.832z"></path>
    <path fill="#fff" fill-rule="evenodd" d="M19.268,16.045c-0.355-0.79-0.729-0.806-1.068-0.82c-0.277-0.012-0.593-0.011-0.909-0.011c-0.316,0-0.83,0.119-1.265,0.594c-0.435,0.475-1.661,1.622-1.661,3.956c0,2.334,1.7,4.59,1.937,4.906c0.237,0.316,3.282,5.259,8.104,7.161c4.007,1.58,4.823,1.266,5.693,1.187c0.87-0.079,2.807-1.147,3.202-2.255c0.395-1.108,0.395-2.057,0.277-2.255c-0.119-0.198-0.435-0.316-0.909-0.554s-2.807-1.385-3.242-1.543c-0.435-0.158-0.751-0.237-1.068,0.238c-0.316,0.474-1.225,1.543-1.502,1.859c-0.277,0.317-0.554,0.357-1.028,0.119c-0.474-0.238-2.002-0.738-3.815-2.354c-1.41-1.257-2.362-2.81-2.639-3.285c-0.277-0.474-0.03-0.731,0.208-0.968c0.213-0.213,0.474-0.554,0.712-0.831c0.237-0.277,0.316-0.475,0.474-0.791c0.158-0.317,0.079-0.594-0.04-0.831C20.612,19.329,19.69,16.983,19.268,16.045z" clip-rule="evenodd"></path>
  </svg></span></div>
              </div>
            </div>
            <div class="bill-info">
              <div class="inv-no">Invoice No: ${invoiceNumber}</div>
              <div>Date: ${new Date(date).toLocaleDateString("en-GB")}</div>
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
                  ${items
                    .map(
                      (item, index) => `
                    <tr>
                      <td>${index + 1}</td>
                      <td>${item.itemName}</td>
                      <td>${item.quantity}</td>
                      <td>${item.weight !== null ? item.weight : "-"}</td>
                      <td>₹${item.rate}</td>
                      <td>₹${item.total}</td>
                    </tr>
                  `
                    )
                    .join("")}
                  <tr class="total-row">
                    <td colspan="4"></td>
                    <td>Total:</td>
                    <td>₹${items.reduce(
                      (acc, item) => acc + (item.total || 0),
                      0
                    )}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="bill-total">
              <div>Ledger Balance: ₹${lastBalance.toFixed(2)}</div>
            </div>
           <footer class="invoice-footer">
  <div class="footer-left">
    <div class="bank-details">
      A/c No  : 0634020100000100  IFSC: JAKA0MEHJUR <br> <br>
      GPay/MPay: 7889718295
    </div>
    <div class="software-info">
      Software by Mir Zubair
    </div>
  </div>
  
  <div class="footer-right">
    <div class="qr-code">
      <img src="${qrImageSrc}" alt="QR Code" width="100" />
    </div>
  </div>
</footer>

          </div>
          <div class="page-break"></div>
        `;
        })
        .join("");

      printWindow.document.write(`
        <html>
          <head>
            <title>Invoices</title>
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
                position: relative;
                max-width: 800px;
                page-break-inside: avoid;
              }
              .bill-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                
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
                margin-top: 1rem;
                font-family: 'poppins';
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
                font-family: 'poppins';
              }
            .invoice-container {
  position: relative;
  padding-bottom: 100px; /* Adjust based on your footer's height */
  /* This makes space for the footer, so it won't overlap the content */
}

.invoice-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: 'Poppins' !important;
  font-size: 11px;
  letter-spacing: 1.5px;
  position: fixed;
  bottom: 0;
  width: 100%;
  padding: 0 1rem;
  box-sizing: border-box;
  background-color: white; /* Ensure background color if content scrolls behind */
  height: 80px; /* Adjust based on your design */
  z-index: 10; /* Ensure it's above content */
}

.footer-left {
  flex: 7;
  text-align: left;
}

.footer-right {
  flex: 3;
  text-align: right;
}

.software-info {
  margin-top: 0.8rem;
  font-family: 'Poppins';
}

.qr-code {
  margin-top: 1rem;
  display: inline-block;
}

@media print {
  @page {
    margin: 0.1in 0.3in;
  }

  .invoice-footer {
 position:static;
 width:100%
 margin-top:100px;
  }

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

              
}

            </style>
          </head>
          <body>
            ${allInvoicesHtml}
            <script>
              window.onload = function() {
                window.focus();
                window.print();
                // Comment out this line to prevent immediate window closure
                // window.close();
              }
            </script>
          </body>
        </html>
      `);

      printWindow.document.close();
    };

    qrImage.src = qrImageSrc;
  };

  const handleOpenDeleteDialog = (row) => {
    setSelectedRow(row);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedRow(null);
  };

  const handleConfirmDelete = async () => {
    setLoadingOndelete(true);
    if (selectedRow) {
      try {
        // Call the API to restore inventory first
        await apiClient.post(`${API_BASE_URL}/restore-inventory`, {
          invoiceId: selectedRow.id,
          customerId: selectedRow.customerId,
        });

        // Update local state to remove the deleted invoice
        setInvoices((prevInvoices) =>
          prevInvoices.filter((invoice) => invoice.id !== selectedRow.id)
        );

        toast.success("Inventory restored and invoice deleted successfully");
      } catch (error) {
        console.error("Error processing request:", error);
        toast.error("Failed to delete invoice or restore inventory");
      } finally {
        setLoadingOndelete(false);
      }
    }
    handleCloseDeleteDialog();
  };

  const handleSaveAsPdf = (invoice, qrImageSrc) => {
    const { invoiceNumber, customerName, date, items, lastBalance } = invoice;
    const doc = new jsPDF();
  
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
    doc.text(`Ledger Balance: Rs. ${lastBalance.toFixed(2)}`, doc.internal.pageSize.width - 14, 54, { align: "right" });
  
    // Items Table
    const tableData = items.map((item, index) => [
      index + 1,
      item.itemName,
      item.quantity,
      item.weight !== null ? item.weight : "-",
      `Rs. ${item.rate.toFixed(2)}`,
      `Rs. ${item.total.toFixed(2)}`
    ]);
  
    // AutoTable for items
    doc.autoTable({
      startY: 65, // Adjusted start Y to give more space between details and table
      head: [
        ["SNO", "ITEM NAME", "QTY", "WEIGHT", "RATE (Rs.)", "TOTAL (Rs.)"],
      ],
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
   // Right footer section - QR code
  if (qrImageSrc) {
    const qrWidth = 40; // Set desired width for QR code
    const qrHeight = 40; // Set desired height for QR code
    const img = new Image();
    img.src = qrImageSrc;
    img.onload = function() {
      // Maintain aspect ratio
      const aspectRatio = img.width / img.height;
      const qrX = doc.internal.pageSize.width - qrWidth - 14;  // Align QR code to the right with margin
      const qrY = footerY;  // Align QR code vertically
      doc.addImage(qrImageSrc, "PNG", qrX, qrY, qrWidth, qrHeight / aspectRatio);  // Adjust height based on aspect ratio
      doc.save(`invoice_${invoiceNumber}.pdf`);
    };
  } else {
    doc.save(`invoice_${invoiceNumber}.pdf`);
  }
};
  
  

  const columns = [
    {
      field: "invoiceNumber",
      headerName: "Invoice Number",
      flex: 1,
      minWidth: 100,
    },
    {
      field: "customerName",
      headerName: "Customer Name",
      flex: 1.5,
      minWidth: 150,
    },
    {
      field: "balance",
      headerName: "Total Amount",
      flex: 1,
      minWidth: 100,
      renderCell: (params) => (
        <Typography>{`₹ ${params.value.toLocaleString()}`}</Typography>
      ),
    },
    {
      field: "date",
      headerName: "Date",
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Typography>
          {new Date(params.row.date).toLocaleDateString("en-GB")}
        </Typography>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 4,
      minWidth: 300,
      renderCell: (params) => (
        <>
          {window.innerWidth <= 600 ? (
            <>
              <IconButton
                color="primary"
                aria-label="Edit-invoice"
                onClick={() => handleEditInvoice(params.row)}
                style={{ marginRight: '8px' }}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                color="primary"
                aria-label="view-invoice"
                onClick={() => handleOpenBillPreview(params.row)}
                style={{ marginRight: "8px" }}
              >
                <ViewModuleIcon />
              </IconButton>

              <IconButton
                color="primary"
                aria-label="make-payment"
                onClick={() => {
                  const qrCodeUrl = "/qr.png"; // Replace with your QR code URL

                  // Convert QR code to base64 and then generate PDF
                  toBase64(qrCodeUrl)
                    .then((base64) => {
                      handleSaveAsPdf(params.row, base64);
                    })
                    .catch((error) =>
                      console.error("Error fetching the QR code image:", error)
                    );
                }}
                style={{ marginRight: "8px" }}
              >
                <PictureAsPdfIcon />
              </IconButton>

              <IconButton
                color="error"
                aria-label="delete-invoice"
                onClick={() => handleOpenDeleteDialog(params.row)} // Pass both IDs // Pass the invoice ID
              >
                <DeleteIcon />
              </IconButton>
            </>
          ) : (
            <>
              <Button
                variant="contained"
                color="primary"
                  size="small"
                onClick={() => handlePrintAllInvoices(params.row)}
                style={{ marginRight: "8px", backgroundColor: "Green" }}
              >
                Print Invoice
              </Button>
              <Button
            variant="contained"
            color="secondary"
              size="small"
            onClick={() => handleEditInvoice(params.row)}
            style={{ backgroundColor: 'Orange' }}
          >
            Edit Invoice
          </Button> 
              <Button
                variant="outlined"
                color="primary"
                size="small"
                style={{ marginLeft: "8px", backgroundColor: "skyblue" }}
                onClick={() => handleOpenBillPreview(params.row)} // Call handleOpenBillPreview with row data
              >
                View Invoice
              </Button>

              <Button
                variant="outlined"
                color="primary"
                size="small"
                style={{ marginLeft: "8px", backgroundColor: "red" }}
                onClick={() => handleOpenDeleteDialog(params.row)} // Pass both IDs // Call handleOpenBillPreview with row data
              >
                Delete
              </Button>
            </>
          )}
        </>
      ),
    },
  ];

  return (
    <Container>
      <Box
        mb={2}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        marginTop={"20px"}
      >
        <TextField
          variant="outlined"
          placeholder="Search invoices"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {window.innerWidth <= 600 ? (
          <>
            <Typography variant="h4" sx={{ fontSize: "12px" }}>
              Today's Invoices
            </Typography>

            <IconButton
              color="primary"
              aria-label="add-invoice"
              onClick={fetchTodaysInvoices}
              style={{ marginRight: "8px" }}
            >
              <RefreshIcon />
            </IconButton>
          </>
        ) : (
          <>
            <div>
              <Typography variant="h4">Today's Invoices</Typography>

              <Button
                variant="contained"
                color="primary"
                onClick={handlePrintAllInvoices}
                startIcon={<PrintIcon />}
                style={{ marginRight: "10px" }}
              >
                Print All Invoices
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<RefreshIcon />}
                onClick={fetchTodaysInvoices}
              >
                Refresh
              </Button>
            </div>
          </>
        )}
      </Box>
      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="400px"
        >
          <FourSquare
            color={["#33CCCC", "#33CC36", "#B8CC33", "#FCCA00"]}
            size="small"
            text="loading...."
            textColor={["#33CCCC", "#33CC36", "#B8CC33", "#FCCA00"]}
          />
        </Box>
      ) : (
        <Box
          sx={{
            height: "600px",
            width: "100%",
           
          }}
        >
          <DataGrid
            rows={filteredInvoices}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 20, 50]}
            autoHeight
            disableSelectionOnClick
            localeText={{
              noRowsLabel: "It's lonely here.....", // Custom message for "No rows"
            }}
            initialState={{
              sorting: {
                sortModel: [{ field: "invoiceNumber", sort: "asc" }], // Set the default sorting field and order
              },
            }}
            sx={{pb:4}}
          />
        </Box>
      )}
      {selectedInvoice && (
        <EditInvoiceModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          invoice={selectedInvoice}
          onSubmit={fetchTodaysInvoices}
          updateInvoice={handleUpdateInvoice}
        />
      )}
      {/* Bill preview modal */}
      <BillTemplate
        open={showBillPreview}
        handleClose={handleCloseBillPreview}
        invoice={billPreviewData}
      />

      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete this invoice? This action cannot be
            undone, and the invoice details will be permanently removed.
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Please make sure you have reviewed the invoice before confirming
            this action.
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error">
            {!loadingOndelete ? " Delete " : "Deleting..."}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ViewTodaysInvoices;
