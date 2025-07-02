import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Typography
} from '@mui/material';
import apiClient from "../services/apiClient";

const BillTemplate = ({ open, handleClose, invoice }) => {
  // Check if invoice is null or undefined
  if (!invoice) {
    return null; // Return null or handle the case where invoice is not available
  }

  const { customerName, date, items, lastBalance, balance } = invoice;
console.log("inmmmmmmm",invoice)
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Bill Details</DialogTitle>
      <DialogContent dividers>
        <TableContainer component={Paper}>
          <Typography variant="h6" align="center" gutterBottom>
           
          </Typography>
          <Typography variant="subtitle1" align="center">
            {`Bill to: ${customerName}`}
          </Typography>
          <Typography variant="subtitle1" align="center">
            {`Date: ${date}`}
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center">SNO</TableCell>
                <TableCell align="center">ITEM NAME</TableCell>
                <TableCell align="center">QTY</TableCell>
                <TableCell align="center">WEIGHT</TableCell>
                <TableCell align="center">Rate</TableCell>
                <TableCell align="center">TOTAL</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items?.map((item, index) => (
                <TableRow key={index}>
                  <TableCell align="center">{index + 1}</TableCell>
                  <TableCell align="center">{item.itemName}</TableCell>
                  <TableCell align="center">{item.quantity}</TableCell>
                  <TableCell align="center">{item.weight}</TableCell>
                  <TableCell align="center">{item.rate}</TableCell>
                  <TableCell align="center">{item.total}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '2rem' }}>
           
            <div>
              <Typography variant="subtitle1">{`Grand Total: ₹${balance}`}</Typography>
            </div>
          </div>
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

export default BillTemplate;
