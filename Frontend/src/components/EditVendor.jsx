import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
import { API_BASE_URL } from '../constants';
import apiClient from '../services/apiClient';

const EditVendor = ({ vendor, onClose, onUpdate }) => {
  const [name, setName] = useState(vendor.name);
  const [address, setAddress] = useState(vendor.address);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedVendor = { name, address };

    try {
      const response = await apiClient.put(`${API_BASE_URL}/vendors/${vendor._id}`, updatedVendor);
      onUpdate(response.data.vendor); // Update the vendor in the list
      onClose(); // Close the modal
    } catch (error) {
      console.error("Error updating vendor:", error);
    }
  };

  return (
    <Dialog open={true} onClose={onClose}>
      <DialogTitle>Edit Vendor</DialogTitle>
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
            label="Vendor Address"
            type="text"
            fullWidth
            variant="outlined"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary">
          Update Vendor
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditVendor;
