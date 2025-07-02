import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { API_BASE_URL } from '../constants';
import apiClient from "../services/apiClient";

const AddCustomer = ({ open, onClose, onCustomerAdded }) => {
  const [name, setName] = useState('');
  const [lastBalance, setLastBalance] = useState('');
  const [isAdding, setIsAdding] = useState(false); // State to manage adding state

  const handleAddCustomer = async () => {
    setIsAdding(true); // Set adding state to true when starting the operation

    try {
      const response = await apiClient.post(`${API_BASE_URL}/customers`, {
        name,
        lastBalance,
      });
      onCustomerAdded(response.data.customer); // Update parent with new customer
      onClose(); // Close the modal
      toast.success('Customer added successfully');
    } catch (error) {
      console.error('Error adding customer:', error);
      toast.error('Customer with the same name already exists or an error occurred.');
    } finally {
      setIsAdding(false); // Always set adding state to false after operation completes
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add New Customer</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Name"
          type="text"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Last Balance"
          type="number"
          fullWidth
          value={lastBalance}
          onChange={(e) => setLastBalance(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" disabled={isAdding}>
          Cancel
        </Button>
        <Button onClick={handleAddCustomer} color="primary" disabled={isAdding}>
          {isAdding ? 'Adding...' : 'Add Customer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddCustomer;
