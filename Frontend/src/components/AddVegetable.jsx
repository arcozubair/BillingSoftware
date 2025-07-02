import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import { toast } from 'react-toastify';
import apiClient from "../services/apiClient";

const AddVegetable = ({ open, onClose, onVegetableAdded }) => {
  const [vegName, setVegName] = useState('');
  const [isAdding, setIsAdding] = useState(false); // State to manage adding state

  const handleAddVegetable = async () => {
    // Validate if vegetable name is not empty
    if (!vegName.trim()) {
      toast.error('Please enter a vegetable name.');
      return;
    }

    setIsAdding(true); // Set adding state to true when starting the operation

    try {
      // Capitalize the first letter of vegName
      const capitalizedVegName =
        vegName.trim().charAt(0).toUpperCase() + vegName.trim().slice(1);

      // Call parent function to add vegetable
      await onVegetableAdded({ name: capitalizedVegName });
      setVegName('');
    } catch (error) {
      console.error('Error adding vegetable:', error);
      toast.error('An error occurred while adding the vegetable.');
    } finally {
      setIsAdding(false); // Always set adding state to false after operation completes
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add New Vegetable</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          id="vegetableName"
          label="Vegetable Name"
          type="text"
          fullWidth
          value={vegName}
          onChange={(e) => setVegName(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isAdding}>
          Cancel
        </Button>
        <Button onClick={handleAddVegetable} variant="contained" color="primary" disabled={isAdding}>
          {isAdding ? 'Adding...' : 'Add Vegetable'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddVegetable;
