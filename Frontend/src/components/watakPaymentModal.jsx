import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { API_BASE_URL } from '../constants';
import apiClient from "../services/apiClient";

const WatakPaymentModal = ({ open, handleClose, customer, fetchCustomers }) => {
  const [amount, setAmount] = useState('');
  const [transactionMode, setTransactionMode] = useState('');
  const [secretCode, setSecretCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const resetFormFields = () => {
    setAmount('');
    setTransactionMode('');
    setSecretCode('');
  };


  const handleMakePayment = async () => {
    try {
      setIsProcessing(true);

      const paymentData = {
        amount,
        transactionMode,
        secretCode,
      };

      const response = await apiClient.post(`${API_BASE_URL}/make-watak-payment/${customer.id}`, paymentData);

      if (response.status === 200) {
        handleClose();
        toast.success('Payment Successful');
        console.log('Payment successful:', response.data);
        fetchCustomers();

    

        resetFormFields(); // Clear form fields after successful payment
      } else {
        toast.error('Payment failed');
        console.error('Payment failed:', response.data.error);
      }
    } catch (error) {
      console.error('Error making payment:', error);
      toast.error(error.response.data.error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Make Payment to: <b>{customer?.name}</b></DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Ledger Balance"
          type="number"
          fullWidth
          value={customer?.ledgerBalance}
          disabled
        />
        <TextField
          autoFocus
          margin="dense"
          label="Amount"
          type="number"
          fullWidth
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
       
        <FormControl fullWidth margin="dense">
          <InputLabel>Transaction Mode</InputLabel>
          <Select
            value={transactionMode}
            onChange={(e) => setTransactionMode(e.target.value)}
            fullWidth
          required

          >
            <MenuItem value="Cash">Cash</MenuItem>
            <MenuItem value="Account Transfer">Account Transfer</MenuItem>
          </Select>
        </FormControl>
      
      
        <TextField
          margin="dense"
          label="Secret Code"
          type="password"
          fullWidth
          required
          value={secretCode}
          onChange={(e) => setSecretCode(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary" disabled={isProcessing}>
          Cancel
        </Button>
        <Button onClick={handleMakePayment} color="primary" disabled={isProcessing}>
          {isProcessing ? 'Processing...' : 'Make Payment'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WatakPaymentModal;
