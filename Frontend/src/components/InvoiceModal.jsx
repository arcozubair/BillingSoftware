import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Autocomplete,
  IconButton,
} from "@mui/material";
import axios from "axios";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../constants";
import apiClient from "../services/apiClient";
import { DeleteForeverOutlined } from "@mui/icons-material";
import { v4 as uuidv4 } from 'uuid'; 
const InvoiceModal = ({ open, handleClose, handleAddInvoice, customer }) => {
  const [invoiceNumber, setInvoiceNumber] = useState();
  const [items, setItems] = useState([]);
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [weight, setWeight] = useState("");
  const [rate, setRate] = useState("");
  const [date, setDate] = useState("");
  const [grandTotal, setGrandTotal] = useState(0);
  const [vegetableOptions, setVegetableOptions] = useState([]);
  const [vendor, setVendor] = useState(null);
  const [vendorOptions, setVendorOptions] = useState([]);
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  // Reference for the Item Name input field
  const itemNameInputRef = useRef(null);
  const itemsRef = useRef(items);
  const customerRef = useRef(customer);
  const invoiceNumberRef = useRef(invoiceNumber);
  const grandTotalRef = useRef(grandTotal);
  const dateRef = useRef(date);

  // Keep refs in sync with the latest state
  useEffect(() => {
    itemsRef.current = items;
    customerRef.current = customer;
    invoiceNumberRef.current = invoiceNumber;
    grandTotalRef.current = grandTotal;
    dateRef.current = date;
  }, [items, customer, invoiceNumber, grandTotal, date]);


  useEffect(() => {
    const calculateGrandTotal = () => {
      const totalSum = items.reduce(
        (acc, item) => acc + parseFloat(item.total),
        0
      );
      setGrandTotal(totalSum);
    };
    calculateGrandTotal();
  }, [items]);


  const getInvoiceNumber = async () => {
    try {
      const response = await apiClient.get(
        `${API_BASE_URL}/getInvoiceNumber`
      );
      setInvoiceNumber(response.data.invoiceNumber);
    } catch (error) {
      console.error("Error fetching invoice number:", error);
    }
  };
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key.toLowerCase() === 's') {
        event.preventDefault();
        handleCreateInvoice(); // Always uses the latest state
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const getVegetables = async () => {
    try {
      const response = await apiClient.get(
        `${API_BASE_URL}/vegetables/getVeg`
      );
      const vegetables = response.data.map((vegetable) => vegetable.name);
      setVegetableOptions(vegetables);
    } catch (error) {
      console.error("Error fetching vegetables:", error);
    }
  };
  const getVendors = async () => {
    try {
      const response = await apiClient.get(`${API_BASE_URL}/get-inventory`);
      const vendors = response.data
        .map((inventory) => {
          // Filter items to keep only those with remaining stock > 0
          const filteredItems = inventory.items.filter(item => item.remainingStock > 0);
  
          // Return the vendor only if they have at least one item with remaining stock
          if (filteredItems.length > 0) {
            return {
              id: inventory.vendorId._id,
              name: inventory.vendorId.name,
              items: filteredItems.map(item => ({
                itemName: item.itemName,
                dateReceived: item.dateReceived,
                id: item._id,
                remainingStock: item.remainingStock // Include remaining stock if needed
              }))
            };
          }
  
          // Return null if no items with remaining stock
          return null;
        })
        .filter(vendor => vendor !== null); // Remove vendors that were filtered out
  
      // Format the vendors to include items in brackets
      const formattedVendors = vendors.map(vendor => ({
        ...vendor,
        label: `${vendor.name} (${vendor.items.map(item => item.itemName).join(', ')})`
      }));
  
      setVendorOptions(formattedVendors); // Set the vendor options state
      console.log("Formatted vendors:", formattedVendors);
    } catch (error) {
      console.error("Error fetching vendors:", error);
    }
  };
  
  
  
  const getVegetablesByVendor = async (vendorId) => {
    try {
      const response = await apiClient.get(`${API_BASE_URL}/inventory/${vendorId}`);
      console.log(response)
      const vendorName = response?.data?.vendorId?.name
      const vegetables = response.data.items.map((vegetable) => ({
        name: vegetable.itemName,
        dateReceived: new Intl.DateTimeFormat('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }).format(new Date(vegetable.dateReceived)),
        remainingStock: vegetable.remainingStock,
        id: vegetable._id,
        vendorName:vendorName,
        
      }));
      console.log("vegetables",vegetables)
      const filteredVegetables=vegetables.filter(vegetable => vegetable.remainingStock > 0)
      setVegetableOptions(filteredVegetables);
    } catch (error) {
      console.error("Error fetching vegetables by vendor:", error);
    }
  };
  

  useEffect(() => {
    const initializeComponent = async () => {
      try {
        await getInvoiceNumber();
        await getVendors();

        if (itemNameInputRef.currendort) {
          itemNameInputRef?.current?.focus();
        } else {
          console.warn("itemNameInputRef.current is not available.");
        }
      } catch (error) {
        console.error("Error initializing component:", error);
      }
    };

    initializeComponent();
  }, []);

  useEffect(() => {
    if (vendor) {
      getVegetablesByVendor(vendor.id);
    }
  }, [vendor]);

  


 
  const quantityInputRef = useRef(null);

  const handleAddItem = () => {
    const newTotal = (
      parseFloat(weight || quantity) * parseFloat(rate)
    ).toFixed(2);

    const newItem = {
      itemName,
      quantity,
      weight,
      rate,
      total: newTotal,
      id: selectedItem.id, // Ensure the item ID is included
      uniqueEntryId: uuidv4(),
    };
 

    console.log("item sette",newItem)
    setItems([...items, newItem]);
    // Reset fields
    setItemName("");
    setQuantity("");
    setWeight("");
    setRate("");
    setSelectedItem(null);
 

    // Set focus back to the Item Name input field
    if (itemNameInputRef.current) {
      itemNameInputRef?.current?.focus();
    }
  };

  const handleDeleteItem = (uniqueEntryId) => {
    setItems((prevItems) => prevItems.filter((item) => item.uniqueEntryId !== uniqueEntryId));
  };


  
  
  const handleCreateInvoice = async () => {
    console.log("Customer:", customerRef.current);
    console.log("Items:", itemsRef.current);
    console.log("Invoice Number:", invoiceNumberRef.current);
    console.log("Grand Total:", grandTotalRef.current);
    console.log("Date:", dateRef.current);

    // Check if items list is empty
    if (itemsRef.current.length === 0) {
      toast.error("Cannot create invoice with empty items list.");
      return;
    }

    // Proceed with invoice creation logic
    setIsCreatingInvoice(true);
    try {
      const response = await apiClient.post(
        `${API_BASE_URL}/customers/addInvoice/${customerRef.current.id}`, {
          invoiceNumber: invoiceNumberRef.current,
          items: itemsRef.current,
          grandTotal: grandTotalRef.current,
          date: dateRef.current || new Date().toISOString(),
        }
      );

      const { invoiceId } = response?.data;
      if (!invoiceId) throw new Error("Invoice ID not received");

      // Update invoice number and reset state
      const newInvoiceNumber = invoiceNumberRef.current + 1;
      await saveInvoiceNumber(newInvoiceNumber);

      setItems([]); // Reset the items list
      setGrandTotal(0);
      toast.success("Invoice created and inventory updated successfully.");
      handleClose();
    } catch (error) {
      const message = error.response?.data?.message || "Error creating invoice";
      console.log("Error creating invoice:", message);
      toast.error(message);
    } finally {
      setIsCreatingInvoice(false);
      getVendors(); // Refresh vendors
      setVendor(null); // Reset vendor
    }
  };

  
  const saveInvoiceNumber = async (newInvoiceNumber) => {
    try {
      const response = await apiClient.put(
        `${API_BASE_URL}/updateInvoiceNumber`,
        { invoiceNumber: newInvoiceNumber }
      );
      if (response.data && response.data.invoiceNumber) {
        setInvoiceNumber(response.data.invoiceNumber);
      } else {
        console.error("Failed to update invoice number:", response);
      }
    } catch (error) {
      console.error("Error updating invoice number:", error);
    }
  };

  const handlePrintBill = () => {
    const printWindow = window.open("", "_blank");

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
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
              font-size: 0.7rem;
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
               <div>Date: ${isNaN(new Date(date)) ? new Date().toLocaleDateString('en-GB') : new Date(date).toLocaleDateString('en-GB')}</div>
                 </div>
            <div class="bill-to">
              <div>Bill to: <span> Mr. ${customer ? customer.name : ""}</span></div>
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
                    <td>₹${grandTotal.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="bill-total">
          
                <div>Ledger Balance: ₹${customer ? (customer.lastBalance + grandTotal).toFixed(2) : "N/A"}</div>
          
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
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          width: "90%",
          maxWidth: "90%",
          maxHeight: "90%",
          overflowY: "auto",
        }}
      >
        <Button
          variant="contained"
          onClick={handleClose}
          style={{ float: "right", backgroundColor: "red" }}
        >
          Close
        </Button>
        <Typography variant="h5" mb={2}>
          Invoice for {customer ? customer.name : ""}
        </Typography>
        <Typography variant="subtitle2" mb={2}>
          Last Balance: {customer ? customer.lastBalance : 0}
        </Typography>
        <Typography variant="subtitle1" mb={2}>
          Invoice No: {invoiceNumber}
        </Typography>
        <Grid container spacing={2} alignItems="center"></Grid>
        {items.map((item,index) => (
  <Grid container spacing={2} key={item.uniqueEntryId} alignItems="center">
    <Grid item xs={1}>
              <Typography>{index + 1}</Typography>
            </Grid>
    <Grid item xs={2}>
      <Typography>{item.itemName}</Typography>
    </Grid>
    <Grid item xs={1}>
      <Typography>{item.quantity}</Typography>
    </Grid>
    <Grid item xs={2}>
      <Typography>{item.weight}</Typography>
    </Grid>
    <Grid item xs={2}>
      <Typography>{item.rate}</Typography>
    </Grid>
    <Grid item xs={2}>
      <Typography>{item.total}</Typography>
    </Grid>
    {window.innerWidth <= 600 ? (
      <Grid item xs={2}>
        <IconButton
          style={{ color: "red" }}
          onClick={() => handleDeleteItem(item.uniqueEntryId)}
        >
          <DeleteForeverOutlined />
        </IconButton>
      </Grid>
    ) : (
      <Grid item xs={2}>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => handleDeleteItem(item.uniqueEntryId)}
        >
          Delete
        </Button>
      </Grid>
    )}
  </Grid>
))}


        <Grid container spacing={2} alignItems="center" mt={2}>
          <Grid item xs={12}>
          <Autocomplete
  options={vendorOptions}
  getOptionLabel={(option) => option.label} // Use the formatted label
  value={vendor}
  onChange={(event, newValue) => setVendor(newValue)}
  renderInput={(params) => (
    <TextField
      {...params}
      label="Select Vendor"
      variant="outlined"
      fullWidth
      inputRef={itemNameInputRef}
    />
  )}
/>

          </Grid>

          <Grid item xs={12} sm={6}>
          <Autocomplete
      options={vegetableOptions}
      getOptionLabel={(option) => `${option.vendorName} ${option.name} (${option.dateReceived}) (${option.remainingStock})`}
      value={selectedItem} // Use selectedItem for value
      onChange={(event, newValue) => {
        setItemName(newValue ? newValue.name : ""); // Store the item name
        setSelectedItem(newValue || null); // Store the selected item object
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Item Name"
          variant="outlined"
          fullWidth
          onBlur={(event) => {
            // Prevent clearing on blur
            if (!event.target.value) {
          setItemName(itemName); // Restore previous value if needed
         
            }
          }}
        />
      )}
      renderOption={(props, option) => (
        <Box {...props}>
          <Typography>{option.name}</Typography>
          <Typography variant="body2" color="textSecondary">
            Date Received: {option.dateReceived} | Remaining Stock: {option.remainingStock}
          </Typography>
        </Box>
      )}
    />


          </Grid>

          <Grid item  md={2} xs={4}>
            <TextField
              label="Qty"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item  md={2} xs={4}>

            <TextField
              label="Weight"
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item  md={2} xs={4}>

            <TextField
              label="Rate"
              type="number"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item  md={2} xs={4}>

            <Button variant="contained" onClick={handleAddItem}>
              Add Item
            </Button>
          </Grid>
        </Grid>

        <Typography variant="h6" mt={2}>
          Grand Total: ₹{grandTotal.toFixed(2)}
        </Typography>

        <Grid container spacing={2} mt={2}>
        <Grid item  md={6} xs={4}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleCreateInvoice}
              disabled={isCreatingInvoice} // Disable button while creating invoice
            >
              {isCreatingInvoice ? "Creating..." : "Create Invoice"}
            </Button>
          </Grid>
          {window.innerWidth <=600 ? (""):( <Grid item xs={4}>
            <Button
              variant="contained"
              color="secondary"
              onClick={handlePrintBill}
              disabled={isCreatingInvoice} // Disable button while creating invoice
            >
              Print Invoice
            </Button>
          </Grid>)}
         
          <Grid item  md={2} xs={8}>

  <TextField
    label="Date"
    type="date"
    value={date}
    onChange={(event) => setDate(event.target.value)}
    fullWidth
    helperText="If you want to create for a specific date, enter it here. Otherwise, leave it empty."
    InputLabelProps={{ shrink: true }} // Ensure label shrinks when there's value
  />
</Grid>

        </Grid>
      </Box>
    </Modal>
  );
};

export default InvoiceModal;