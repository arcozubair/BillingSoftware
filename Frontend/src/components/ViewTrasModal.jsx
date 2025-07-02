
import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import axios from 'axios';
import { API_BASE_URL } from '../constants';
import apiClient from "../services/apiClient";

const ViewTransaction = ({ open, handleClose, customer }) => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (open && customer) {
      fetchTransactions(customer._id);
    }
  }, [open, customer]);
console.log("view",customer)
  const fetchTransactions = async () => {
    try {
      const response = await apiClient.get(`${API_BASE_URL}/view-transactions/${customer.id}`);
      setTransactions(response.data.transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>View Transactions</DialogTitle>
      <DialogContent>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Receipt Number</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Transaction Mode</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions?.map((transaction) => (
                <TableRow key={transaction._id}>
                  <TableCell>{transaction.receiptNumber}</TableCell>
                  <TableCell>{new Date(transaction.paymentDate).toLocaleDateString()}</TableCell>
                  <TableCell>{transaction.amount + (transaction.discountAmount ? transaction.discountAmount : 0)}</TableCell>
                  <TableCell>{transaction.transactionMode}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewTransaction;

