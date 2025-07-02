import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Autocomplete,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  IconButton,
} from "@mui/material";
import axios from "axios";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../constants";
import apiClient from "../services/apiClient";
import { CreateTwoTone, DeleteForeverOutlined, EditLocationAltSharp } from "@mui/icons-material";
import { GridAddIcon, GridCloseIcon, GridSaveAltIcon } from "@mui/x-data-grid";

const WatakModal = ({ open, handleClose, handleAddWatak, customer,}) => {
  const [watakNumber, setWatakNumber] = useState();
  const [items, setItems] = useState([]); // Items that will be added
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [weight, setWeight] = useState("");
  const [rate, setRate] = useState("");
  const [date, setDate] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [commissionPercent, setCommissionPercent] = useState(0);
  const [vehicleCharges, setVehicleCharges] = useState("");
  const [otherCharges, setOtherCharges] = useState("");
  const [labor, setLabor] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [expensesBreakDown, setExpensesBreakDown] = useState({});
  const [netAmount, setNetAmount] = useState(0);
  const [laborCharges, setLaborCharges] = useState(0);
  const [bardan, setBardan] = useState(0);
  const [itemOptions, setItemOptions] = useState([]);
  const [isCreatingWatak, setIsCreatingWatak] = useState(false);
  const itemNameInputRef = useRef(null);

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

  const filterdItems = items.filter(item => item.itemName !== "Krade" && item.itemName !== "krade");
  const totalQty = filterdItems.reduce(
    (total, item) => total + parseFloat(item.quantity),
    0
  );

  console.log("customer",customer)

  // Automatically calculate expenses based on current items
  useEffect(() => {
    const calculateExpenses = () => {
      const commissionAmount = (grandTotal * (commissionPercent / 100)).toFixed(2);
      const laborCost = totalQty * labor;
      const expenses = (
        parseFloat(vehicleCharges || 0) +
        parseFloat(otherCharges || 0) +
        parseFloat(bardan || 0) +
        parseFloat(laborCost)
      ).toFixed(2);

      setLaborCharges(laborCost.toFixed(2));
      const totalExpenses = parseFloat(expenses) + parseFloat(commissionAmount);
      setExpenses(Math.floor(totalExpenses));
      setNetAmount(Math.round(grandTotal - Math.floor(totalExpenses)));
      setExpensesBreakDown({
        vehicleCharges: parseFloat(vehicleCharges || 0),
        commissionAmount: parseFloat(commissionAmount || 0),
        laborCost: parseFloat(laborCost || 0),
        bardan: parseFloat(bardan || 0),
        otherCharges: parseFloat(otherCharges || 0),
        commissionPercent:commissionPercent,
        labor:labor,

      });
    };
    calculateExpenses();
  }, [grandTotal, commissionPercent, vehicleCharges, bardan, otherCharges, labor, items]);

  // Pre-fill items from watakData when modal is opened
  useEffect(() => {
    if (customer) {
      const formatDate = (isoString) => isoString.split('T')[0];
  
      if (customer.items && customer.items.length > 0) {
        const initialItems = customer.items.map(item => {
          const isNonLocal = customer.type !== "Local";
  
          const weight = isNonLocal ? Math.floor(parseFloat(item.weight || 0)) : parseFloat(item.weight || 0);
          const rate = isNonLocal
            ? Math.floor(parseFloat(item.rate || 0)).toFixed(2)
            : parseFloat(item.rate || 0).toFixed(2);
  
           const total = (weight > 0
  ? parseFloat(weight) * parseFloat(rate)
  : parseFloat(item.quantity) * parseFloat(rate)
).toFixed(2);

  
          return {
            ...item,
            weight,
            rate,
            total,
          };
        });
  
        setItems(initialItems);
        setBardan(customer.items[0]?.bardan);
        setVehicleCharges(customer.items[0]?.vehicleCharges);
        setVehicleNumber(customer.items[0]?.vehicleNumber);
  
        const dateToSet = formatDate(customer.items[0]?.dateReceived);
        setDate(dateToSet);
  
        const totalSum = initialItems.reduce((acc, item) => acc + parseFloat(item.total), 0);
        setGrandTotal(totalSum);
      } else if (customer.date) {
        setDate(formatDate(customer.date));
      } else {
        setDate(formatDate(new Date().toISOString()));
      }
    }
  }, [customer]);
  
  
  // Modify the items state to include editing state for each item
  const handleItemUpdate = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;
    
    // Recalculate total whenever rate, weight, or quantity changes
    if (['rate', 'weight', 'quantity'].includes(field)) {
      const weight = updatedItems[index].weight || updatedItems[index].quantity;
      updatedItems[index].total = (parseFloat(weight) * parseFloat(updatedItems[index].rate || 0)).toFixed(2);
    }
    
    setItems(updatedItems);
  };

  // Example logic for getting watak number and item options
  const getWatakNumber = async () => {
    try {
      const response = await apiClient.get(`${API_BASE_URL}/getWatakNumber`);
      setWatakNumber(response.data.watakNumber);
    } catch (error) {
      console.error("Error fetching invoice number:", error);
    }
  };

  const getVegetables = async () => {
    try {
      const response = await apiClient.get(`${API_BASE_URL}/vegetables/getVeg`);
      const vegetables = response.data.map((vegetable) => vegetable.name);
      setItemOptions(vegetables);
    } catch (error) {
      console.error("Error fetching vegetables:", error);
    }
  };

  // Initialize component on open (fetch watak number and items)
  useEffect(() => {
    const initializeComponent = async () => {
      try {
        await getWatakNumber();
        await getVegetables();
      } catch (error) {
        console.error("Error initializing component:", error);
      }
    };

    if (open) {
      initializeComponent();
    }
  }, [open]);

  // Add item handler
  const handleAddItem = () => {
    const newTotal = (parseFloat(weight || quantity) * parseFloat(rate)).toFixed(2);
    const newItem = { itemName, quantity, weight, rate, total: newTotal };

    setItems([...items, newItem]);
    setItemName("");
    setQuantity("");
    setWeight("");
    setRate("");

    if (itemNameInputRef.current) {
      itemNameInputRef.current.focus();
    }
  };

  const handleDeleteItem = (index) => {
    setItems((prevItems) => prevItems.filter((_, i) => i !== index));
  };
  

  const handleCreateWatak = async () => {
    if (items.length === 0) {
      toast.error("Cannot create watak with empty items list.");
      return;
    }

    setIsCreatingWatak(true);

    try {
      await handleAddWatak({
        watakNumber,
        items,
        grandTotal,
        expenses,
        expensesBreakDown,
        netAmount,
        customer,
        date: date || new Date().toISOString(),
        vehicleNumber,
      });

      const newWatakNumber = watakNumber + 1;
      await saveWatakNumber(newWatakNumber);

      setItems([]);
      setGrandTotal(0);
      handleClose();
    } catch (error) {
      console.error("Error creating watak:", error);
      toast.error("Failed to create watak. Please try again.");
    } finally {
      setIsCreatingWatak(false);
    }
  };

  const saveWatakNumber = async (newWatakNumber) => {
    try {
      const response = await apiClient.put(
        `${API_BASE_URL}/updateWatakNumber`,
        { watakNumber: newWatakNumber }
      );
      if (response.data && response.data.watakNumber) {
        setWatakNumber(response.data.watakNumber);
      } else {
        console.error("Failed to update watak number:", response);
      }
    } catch (error) {
      console.error("Error updating watak number:", error);
    }
  };
  console.log("VVVVVVVVVV",customer)

  useEffect(() => {
    if (customer) {
      console.log("vendor",customer)
      
      // Set commission percentage based on customer type
      if (customer.type === "Local") {
        setCommissionPercent(10);
      } else {
        setCommissionPercent(6);
      }
  
      // Set labor value based on customer name
      if (customer.name === "Darshan kumar varinder kumar" || customer.name === "Sunil satija") {
        setLabor(2);
      } else {
        setLabor(1);
      }
      
    }
  }, [customer]);

  const handlePrintBill = () => {
    const printWindow = window.open("", "_blank");

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice</title>
         <style>
  body {
    font-family: courier, monospace;
    margin: 0;
    padding: 1rem;
    font-size: 1rem; /* Base font size */
  }

  .bill-template {
    margin: auto;
    padding: 2rem;
    border: 1px solid #ccc;
    max-width: 800px;
    color: black;
  }

  .bill-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .company-name {
    text-align: center;
    font-size: 2.5rem;
    font-weight: bold;
    margin-bottom: 1rem;
    width: 100%;
    color: #1abc9c;
  }

  .company-address {
    text-align: center;
    font-size: 1.4rem;
    margin-bottom: 1rem;
    color: #9b59b6;
  }

  .company-info, .contact-info {
    flex: 1;
    font-size: 0.8rem;
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
    font-size: 0.875rem;
    color: #e74c3c;
  }

  .bill-items td {
    font-size: 0.75rem;
  }

  .total-row td {
    font-weight: bold;
  }

  .total-row td:nth-child(5) {
    text-align: right;
  }

  .total-row td:nth-child(6) {
    font-size: 1rem;
    background-color: #f0f0f0;
  }

  .bill-total {
    margin-top: 10px;
  }

  .expenses-section, .profit-section {
    display: flex;
    justify-content: space-between;
    margin-top: 50px;
  }

  .expenses {
    flex: 1;
    font-size: 0.875rem;
    background-color: #f9f9f9;
    padding: 10px;
    border-radius: 5px;
  }



  .profit {
    flex: 1;
    text-align: right;
    margin-top:20px;
    font-size: 0.875rem;
    background-color: #eaf8f0;
    padding: 15px;
   
    border-radius: 5px;
  }
      

  .profit div, .expenses div {
    margin-bottom: 5px;
  }

  @media (max-width: 600px) {
    body {
      font-size: 0.75rem; /* Smaller font size for small screens */
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
      font-size: 1.5rem; /* Larger font size for large screens */
    }

    .profit div{
      padding:10px
      
      }
  .other-details span {
    font-size:1rem;
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
              <div>Invoice No: ${watakNumber}</div>
              <div>Date: ${
                isNaN(new Date(date))
                  ? new Date().toLocaleDateString("en-GB")
                  : new Date(date).toLocaleDateString("en-GB")
              }</div>
          
              </div>
              
            <div class="bill-to">
              <div>Bill to: <span> Mr. ${
                customer ? customer.name : ""
              }</span></div>
            </div>
             <div class="other-details bill-info">
                <span>Vehicle No :  ${vehicleNumber.toLocaleUpperCase()}</span>
                 <span>Challan No : _________ </span>
                 <span>Nugs :  ${totalQty}</span>
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
                 
                </tbody>
              </table>
            </div>
            <div class="expenses-section">
              <div class="expenses">
                <div>Expenses Breakdown:</div>
                <div>Commission (${commissionPercent}%): ₹${(
      grandTotal *
      (commissionPercent / 100)
    ).toFixed(2)}</div>
                <div>Labor Charges: ₹${laborCharges}</div>
                <div>Other Charges: ₹${otherCharges}</div>
                <div>Vehicle Charges: ₹${vehicleCharges}</div>
                  <div>Bardan: ₹${bardan}</div>
                <div><strong>Total Expenses: ₹${expenses.toFixed(
                  2
                )}</strong></div>
              </div>
              <div class="profit">
              <div><strong>Goods Sale Proceeds ₹${grandTotal.toFixed(
                2
              )}</strong></div>
                <div><strong>Expenses ₹${expenses.toFixed(2)}</strong></div>
                <div><strong>Net Profit: ₹${netAmount.toFixed(2)}</strong></div>
              </div>
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
  const handleBlur = () => {
    const matchedOption = itemOptions.find((option) =>
      option.toLowerCase().startsWith(itemName.toLowerCase())
    );
    if (matchedOption) {
      setItemName(matchedOption);
    }
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
        {window.innerWidth <= 600 ? (
          <IconButton
            onClick={handleClose}
            style={{ float: "right", color: "red" }}
          >
            <GridCloseIcon></GridCloseIcon>
          </IconButton>
        ) : (
          <Button
            variant="contained"
            onClick={handleClose}
            style={{ float: "right", backgroundColor: "red" }}
            startIcon={ <GridCloseIcon></GridCloseIcon>}
          >
            Close
          </Button>
        )}

        <Typography variant="h5" mb={2}>
          Watak for {customer ? customer.name :""}
        </Typography>
        <Typography variant="subtitle2" mb={2}>
          Last Balance: {customer ? customer.ledgerBalance : 0}
        </Typography>
        <Typography variant="subtitle1" mb={2}>
          Invoice No: {watakNumber}
        </Typography>
        <Grid container spacing={2} alignItems="center"></Grid>
        {items.map((item, index) => (
          <Grid 
            container 
            spacing={1} 
            key={index} 
            alignItems="center" 
            mt={1}
            sx={{
              '& .MuiGrid-item': {
                '@media (max-width: 600px)': {
                  paddingTop: '8px',
                  paddingBottom: '8px',
                }
              },
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              padding: '12px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              '&:hover': {
                backgroundColor: '#f0f2f5',
                transform: 'translateY(-1px)',
                transition: 'all 0.2s ease-in-out'
              }
            }}
          >
            <Grid item xs={12} sm={1}>
              <Typography 
                variant="body2" 
                sx={{
                  backgroundColor: '#e3e6e9',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold'
                }}
              >
                {index + 1}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                label="Item Name"
                value={item.itemName}
                onChange={(e) => handleItemUpdate(index, 'itemName', e.target.value)}
                size="small"
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white',
                    '&:hover': {
                      '& > fieldset': {
                        borderColor: '#1976d2',
                      }
                    }
                  }
                }}
              />
            </Grid>
            <Grid item xs={6} sm={1}>
              <TextField
                label="Qty"
                value={item.quantity}
                onChange={(e) => handleItemUpdate(index, 'quantity', e.target.value)}
                type="number"
                size="small"
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white',
                    '&:hover': {
                      '& > fieldset': {
                        borderColor: '#1976d2',
                      }
                    }
                  }
                }}
              />
            </Grid>
            <Grid item xs={6} sm={2}>
              <TextField
                label="Weight"
                value={item.weight}
                onChange={(e) => handleItemUpdate(index, 'weight', e.target.value)}
                type="number"
                size="small"
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white',
                    '&:hover': {
                      '& > fieldset': {
                        borderColor: '#1976d2',
                      }
                    }
                  }
                }}
              />
            </Grid>
            <Grid item xs={6} sm={2}>
              <TextField
                label="Rate"
                value={item.rate}
                onChange={(e) => handleItemUpdate(index, 'rate', e.target.value)}
                type="number"
                size="small"
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white',
                    '&:hover': {
                      '& > fieldset': {
                        borderColor: '#1976d2',
                      }
                    }
                  }
                }}
              />
            </Grid>
            <Grid item xs={6} sm={2}>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 'bold',
                  color: '#1976d2',
                  backgroundColor: 'rgba(25, 118, 210, 0.08)',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  display: 'inline-block',
                  '@media (max-width: 600px)': {
                    textAlign: 'right',
                    width: '100%'
                  }
                }}
              >
                Total: ₹{item.total}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={2} 
              sx={{
                display: 'flex',
                justifyContent: {
                  xs: 'center',
                  sm: 'flex-start'
                },
                mt: { xs: 1, sm: 0 }
              }}
            >
              <IconButton
                sx={{
                  color: '#d32f2f',
                  '&:hover': {
                    backgroundColor: 'rgba(211, 47, 47, 0.04)',
                    transform: 'scale(1.1)',
                    transition: 'all 0.2s ease-in-out'
                  }
                }}
                onClick={() => handleDeleteItem(index)}
              >
                <DeleteForeverOutlined />
              </IconButton>
            </Grid>
          </Grid>
        ))}

        <Grid container spacing={2} mt={1}>
          <Grid item xs={6}>
            <TextField
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              variant="outlined"
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Vehicle Number"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
              fullWidth
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <Autocomplete
              freeSolo
              autoHighlight
              options={itemOptions}
              value={itemName}
              onChange={(event, newValue) => setItemName(newValue)}
              onBlur={handleBlur}
              isOptionEqualToValue={(option, value) =>
                option.toLowerCase() === value.toLowerCase()
              }
              filterOptions={(options, { inputValue }) => {
                return options.filter((option) =>
                  option.toLowerCase().includes(inputValue.toLowerCase())
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Item Name"
                  fullWidth
                  margin="normal"
                  inputRef={itemNameInputRef}
                  onChange={(event) => setItemName(event.target.value)}
                  sx={{marginTop: "2px"}}
                />
              )}
            />
          </Grid>

          <Grid item xs={6} md={2}>
            <TextField
              label="Quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              fullWidth
              variant="outlined"
            />
          </Grid>

          <Grid item xs={6} md={2}>
            <TextField
              label="Weight"
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              fullWidth
              variant="outlined"
            />
          </Grid>

          <Grid item xs={6} md={2}>
            <TextField
              label="Rate"
              type="number"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              fullWidth
              variant="outlined"
            />
          </Grid>
          

          <Grid item xs={6} md={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddItem}
              startIcon={<GridAddIcon></GridAddIcon>}
            >
              Add Item
            </Button>
          </Grid>

          <Grid item xs={6} md={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Commission Percentage</InputLabel>
              <Select
                value={commissionPercent}
                onChange={(e) => setCommissionPercent(e.target.value)}
                label="Commission Percentage"
              >
                <MenuItem value={0}>0%</MenuItem>
                <MenuItem value={6}>6%</MenuItem>
                <MenuItem value={8}>8%</MenuItem>
                <MenuItem value={10}>10%</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6} md={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Labor</InputLabel>
              <Select
                value={labor}
                onChange={(e) => setLabor(e.target.value)}
                label="Labor"
              >
                <MenuItem value={0}>0 RS</MenuItem>
                <MenuItem value={1}>1 RS</MenuItem>
                <MenuItem value={2}>2 RS</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6} md={4}>
            <TextField
              label="Vehicle Charges"
              type="number"
              value={vehicleCharges}
              onChange={(e) => setVehicleCharges(e.target.value)}
              fullWidth
              variant="outlined"
            />
          </Grid>
          <Grid item xs={6} md={4}>
            <TextField
              label="Bardan"
              type="number"
              value={bardan}
              onChange={(e) => setBardan(e.target.value)}
              fullWidth
              variant="outlined"
            />
          </Grid>

          <Grid item xs={6} md={4}>
            <TextField
              label="Other Charges"
              type="number"
              value={otherCharges}
              onChange={(e) => setOtherCharges(e.target.value)}
              fullWidth
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6">Summary</Typography>
            <Typography> <strong>Grand Total: {grandTotal}</strong></Typography>
            <Typography>Expenses Breakdown:</Typography>
            <Typography>
              Commission ({commissionPercent}%):{" "}
              {(grandTotal * (commissionPercent / 100)).toFixed(2)}
            </Typography>
            <Typography>Labor Charges: {laborCharges}</Typography>
            <Typography>Vehicle Charges: {vehicleCharges}</Typography>
            <Typography>Bardan {bardan}</Typography>
            <Typography>Other Charges: {otherCharges}</Typography>
           
          
            <Typography>
              <strong>Total Expenses: {expenses}</strong>
            </Typography>
            <Typography> <strong>Net Amount: {netAmount}</strong></Typography>
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleCreateWatak}
              disabled={isCreatingWatak}
              startIcon={<GridSaveAltIcon></GridSaveAltIcon>}
            >
              {isCreatingWatak ? "Creating..." : "Create Watak"}
            </Button>

            {window.innerWidth <= 600 ? (
              ""
            ) : (
              <Button
                variant="contained"
               
                onClick={handlePrintBill}
                sx={{ ml: 2,backgroundColor:"green" }}
              >
                Print Bill
              </Button>
            )}
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};

export default WatakModal;
