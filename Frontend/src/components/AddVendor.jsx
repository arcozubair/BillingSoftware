import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, MenuItem, Typography } from '@mui/material';
import { API_BASE_URL } from '../constants';
import apiClient from '../services/apiClient';
import { toast } from 'react-toastify';

const AddVendor = ({ onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [ledgerBalance, setLedgerBalance] = useState('');
  const [type, setType] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(''); // Clear previous errors

    if (!name.trim() || isNaN(parseFloat(ledgerBalance)) || ledgerBalance < 0 || !type) {
      setError('Please fill out all fields correctly.');
      setLoading(false);
      return;
    }

    const newVendor = {
      name,
      ledgerBalance: parseFloat(ledgerBalance),
      type,
    };

    try {
      const response = await apiClient.post(`${API_BASE_URL}/vendors`, newVendor);
      console.log("sending to parent" ,response)
      onAdd(response.data); // Pass the new vendor to the parent component
      toast.success('Vendor added successfully');
      onClose(); // Close the modal
    } catch (error) {
      console.error("Error adding vendor:", error);
      setError('Error adding vendor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onClose={onClose}>
      <DialogTitle>Add Vendor</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <TextField
            autoFocus
            margin="dense"
            label="Vendor Name"
            type="text"
            fullWidth
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <TextField
            margin="dense"
            label="Ledger Balance"
            type="number"
            fullWidth
            variant="outlined"
            value={ledgerBalance}
            onChange={(e) => setLedgerBalance(e.target.value)}
            required
          />
          <TextField
            select
            margin="dense"
            label="Type"
            fullWidth
            variant="outlined"
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
          >
            <MenuItem value="Local">Local</MenuItem>
            <MenuItem value="Outsider">Outsider</MenuItem>
          </TextField>
          {error && <Typography color="error">{error}</Typography>}
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          disabled={loading} // Disable button while loading
        >
          {loading ? "Adding..." : 'Add Vendor'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddVendor;
