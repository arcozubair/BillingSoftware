import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Grid,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
} from '@mui/material';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../constants';
import apiClient from '../services/apiClient';
import { GridCloseIcon } from '@mui/x-data-grid';

const EditInvoiceModal = ({ open, onClose, watak, onSubmit }) => {
  const [editedWatak, setEditedWatak] = useState({
    watakNumber: '',
    vehicleNumber: '',
    date: new Date().toISOString().slice(0, 10),
    items: [],
    netAmount: 0,
    previousNetAmount: 0,
    vendorType: '',
    vendorName: '',
    vendorId: '',
    ledgerBalance: 0,
    expenses: {
      commission: 0,
      commissionPercent: 0,
      labor: 0,
      laborCharges: 0,
      vehicleCharges: 0,
      otherCharges: 0,
      bardan: 0,
      total: 0,
    },
  });

  const [commissionPercent, setCommissionPercent] = useState(0);
  const [updatedExpenes, setUpdatedExpenses] = useState(0);
  const [labor, setLabor] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [commissionAmount, setCommissionAmount] = useState(0);
  const [laborCharges, setLaborCharges] = useState(0);
  const [loading,setLoading] = useState(false);

  useEffect(() => {
    if (watak) {
      const initialExpenses = watak.expenses || {
        commission: 0,
        commissionPercent: 0,
        labor: 0,
        laborCharges: 0,
        vehicleCharges: 0,
        otherCharges: 0,
        bardan: 0,
        total: 0,
      };

      setEditedWatak({
        ...watak,
        date: new Date(watak.date).toISOString().slice(0, 10),
        expenses: initialExpenses,
        previousNetAmount: watak.netAmount || 0,
      });

      setCommissionPercent(initialExpenses.commissionPercent);
      setLabor(initialExpenses.labor);
    }
  }, [watak]);

  useEffect(() => {
    const calculateGrandTotal = () => {
      const totalSum = editedWatak.items.reduce(
        (acc, item) => acc + parseFloat(item.total),
        0
      );
      setGrandTotal(totalSum);
    };
    calculateGrandTotal();
  }, [editedWatak.items]);

  const calculateExpenses = () => {
    const excludedItemNames = ['krade', 'k', 'krade', 'KRADE']; // Add all variations here
  
    // Normalize the excluded item names to lowercase
    const normalizedExcludedItems = excludedItemNames.map(name => name.toLowerCase());
  
    // Function to check if an item should be excluded
    const shouldExclude = (itemName) => {
      return normalizedExcludedItems.includes(itemName.toLowerCase());
    };
  
    // Filter out items based on the exclusion list
    const filteredItems = editedWatak.items.filter(item => !shouldExclude(item.itemName));
  
    // Calculate total quantity of filtered items
    const totalQuantity = filteredItems.reduce(
      (total, item) => total + parseFloat(item.quantity),
      0
    );
  
    const commissionAmount = (grandTotal * (commissionPercent / 100)).toFixed(2);
    const laborCost = totalQuantity * labor;
    const expenses = (
      parseFloat(editedWatak.expenses.vehicleCharges || 0) +
      parseFloat(editedWatak.expenses.otherCharges || 0) +
      parseFloat(editedWatak.expenses.bardan || 0) +
      parseFloat(laborCost)
    ).toFixed(2);
    
    setUpdatedExpenses(expenses);
    setCommissionAmount(commissionAmount);
    setLaborCharges(laborCost.toFixed(2));
  
    setEditedWatak(prev => ({
      ...prev,
      expenses: {
        ...prev.expenses,
        laborCharges: laborCost.toFixed(2),
        total: (parseFloat(expenses) + parseFloat(commissionAmount)).toFixed(2),
      },
      netAmount: Math.round(grandTotal - (parseFloat(expenses) + parseFloat(commissionAmount))),
    }));
  };
  

  useEffect(() => {
    calculateExpenses();
  }, [
    grandTotal,
    commissionPercent,
    editedWatak.expenses.vehicleCharges,
    editedWatak.expenses.bardan,
    editedWatak.expenses.otherCharges,
    labor,
    editedWatak.items,
  ]);

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...editedWatak.items];
    updatedItems[index][field] = field === 'weight' && value === '' ? null : value;
    const item = updatedItems[index];
    item.total = (item.weight ? item.weight * item.rate : item.quantity * item.rate).toFixed(2);
    
    setEditedWatak(prev => ({
      ...prev,
      items: updatedItems
    }));
  };
  

  const handleAddItem = () => {
    const newItem = {
      itemName: '',
      quantity: 0,
      weight: null,
      rate: 0,
      total: 0,
    };
    setEditedWatak(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };
  

  const handleRemoveItem = (index) => {
    const updatedItems = editedWatak.items.filter((_, i) => i !== index);
    setEditedWatak(prev => ({
      ...prev,
      items: updatedItems
    }));
  };
  

  const handleUpdateWatak = async () => {
    setLoading(true)
    try {
      // Prepare the updatedWatak object to send to the server
      const updatedWatak = {
        ...editedWatak,
        ledgerBalance: updatedLegBalance + editedWatak.netAmount,
        expenses: {
          ...editedWatak.expenses,
          commission: commissionAmount,
          commissionPercent: commissionPercent,
          labor,
          laborCharges: laborCharges,
          total: editedWatak.expenses.total
        },
        grandTotal: grandTotal
      };
  
      // Log the object being sent for debugging
      console.log('Updating watak with:', updatedWatak);
  
      // Send the API request to update the watak
      const response = await apiClient.put(
        `${API_BASE_URL}/vendor/updateWatak/${editedWatak._id}`, // Ensure this is the correct endpoint
        { updatedWatak }
      );
      onSubmit();
      // Log the response for debugging
      console.log('Updated watak response:', response.data);
  
      // Show success message
      toast.success('Watak updated successfully');
      
      // Close the modal
      onClose();
    } catch (error) {
      // Log the error for debugging
      console.error('Error updating watak:', error);
  
      // Show error message
      toast.error('Failed to update watak. Please try again.');
    }
    finally{
      setLoading(false)
    }
  };
  
  const updatedLegBalance = editedWatak.ledgerBalance-editedWatak.previousNetAmount;
  
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="edit-watak-modal-title"
      aria-describedby="edit-watak-modal-description"
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
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
            onClick={onClose}
            style={{ float: "right", color: "red" }}
          >
            <GridCloseIcon></GridCloseIcon>
          </IconButton>
        ) : (
          <Button
            variant="contained"
            onClick={onClose}
            style={{ float: "right", backgroundColor: "red" }}
            startIcon={ <GridCloseIcon></GridCloseIcon>}
          >
            Close
          </Button>
        )}
        <Typography variant="h6" id="edit-watak-modal-title" gutterBottom>
          Edit Watak : {editedWatak.vendorName.toLocaleUpperCase()}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Watak Number"
              value={editedWatak.watakNumber}
              disabled
              onChange={(e) => setEditedWatak({ ...editedWatak, watakNumber: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="number"
              label="Ledger Balance"
              disabled
              value={updatedLegBalance}
            />
          </Grid>
        
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="number"
              label="Previous Net Amount"
              value={editedWatak.previousNetAmount}
              disabled
            />
          </Grid>
        
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Vehicle Number"
              value={editedWatak.vehicleNumber}
              onChange={(e) => setEditedWatak({ ...editedWatak, vehicleNumber: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="date"
              label="Date"
              value={editedWatak.date}
              onChange={(e) => setEditedWatak({ ...editedWatak, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
         
         
        </Grid>
       
            {editedWatak.items.map((item, index) => (
              <Grid container key={index} spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12} md={2}>
                  <TextField
                    fullWidth
                    value={item.itemName}
                    onChange={(e) => handleItemChange(index, 'itemName', e.target.value)}
                    label="Item Name"
                  />
                </Grid>
                <Grid item xs={4} md={2}>
                  <TextField
                    type="number"
                    fullWidth
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    label="Quantity"
                  />
                </Grid>
                <Grid item xs={4} md={2}>
                  <TextField
                    fullWidth
                    type="number"
                    value={item.weight || ''}
                    onChange={(e) => handleItemChange(index, 'weight', e.target.value)}
                    label="Weight"
                  />
                </Grid>
                <Grid item xs={4} md={2}>
                  <TextField
                    fullWidth
                    type="number"
                    value={item.rate}
                    onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                    label="Rate"
                  />
                </Grid>
                <Grid item xs={6} md={2}>
                  <TextField
                    fullWidth
                    type="number"
                    value={item.total}
                    label="Total"
                    disabled
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={6} md={2}>
                  <Button variant="outlined" onClick={() => handleRemoveItem(index)}>
                    Remove
                  </Button>
                </Grid>
              </Grid>
            ))}
           
          

      
        <Button onClick={handleAddItem} sx={{ mt: 2 }}>Add Item</Button>
        <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={6} md={4}>
            <TextField
              fullWidth
              type="number"
              label="Vehicle Charges"
              value={editedWatak.expenses.vehicleCharges}
              onChange={(e) => setEditedWatak(prev => ({
                ...prev,
                expenses: { ...prev.expenses, vehicleCharges: parseFloat(e.target.value) }
              }))}
            />
          </Grid>
         
          <Grid item xs={6} md={4}>
            <TextField
              fullWidth
              type="number"
              label="Bardan"
              value={editedWatak.expenses.bardan}
              onChange={(e) => setEditedWatak(prev => ({
                ...prev,
                expenses: { ...prev.expenses, bardan: parseFloat(e.target.value) }
              }))}
            />
          </Grid>
          <Grid item xs={6} md={4}>
            <TextField
              fullWidth
              type="number"
              label="Other Charges"
              value={editedWatak.expenses.otherCharges}
              onChange={(e) => setEditedWatak(prev => ({
                ...prev,
                expenses: { ...prev.expenses, otherCharges: parseFloat(e.target.value) }
              }))}
            />
          </Grid>

        <Grid item xs={12} md={6}>
            <InputLabel>Commission Percentage</InputLabel>
            <Select
              fullWidth
              value={commissionPercent}
              onChange={(e) => setCommissionPercent(parseFloat(e.target.value))}
            >
              <MenuItem value={0}>0%</MenuItem>
              <MenuItem value={6}>6%</MenuItem>
              <MenuItem value={8}>8%</MenuItem>
              <MenuItem value={10}>10%</MenuItem>
            </Select>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <InputLabel>Labor</InputLabel>
            <Select
              fullWidth
              value={labor}
              onChange={(e) => setLabor(parseFloat(e.target.value))}
            >
              <MenuItem value={0}>0 RS</MenuItem>
              <MenuItem value={1}>1 RS</MenuItem>
              <MenuItem value={2}>2 RS</MenuItem>
            </Select>
          </Grid>
          <Grid item xs={6} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Commission Amount"
              value={commissionAmount}
              disabled

            />
          </Grid>
              
          <Grid item xs={6} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Labor Charges"
              value={laborCharges}
              disabled

            />
          </Grid>
      
        
     
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Grand Total"
              value={grandTotal}
              disabled

            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Expenses Total"
              value={editedWatak.expenses.total}
              disabled

            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              type="number"
              label="New Net Amount"
              value={editedWatak.netAmount}
              disabled
            />
          </Grid>
        </Grid>
        <Box sx={{ mt: 2, textAlign: 'right' }}>
          <Button onClick={onClose} variant="outlined" sx={{ mr: 1 }}>
            Cancel
          </Button>
          <Button onClick={handleUpdateWatak} disabled={loading} variant="contained">
            {!loading ? "Save Changes" : "Saving..."}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default EditInvoiceModal;
