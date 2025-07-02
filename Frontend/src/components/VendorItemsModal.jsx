import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Button,
  Typography,
  Box,
} from '@mui/material';

const VendorItemsModal = ({ open, onClose, vendor }) => {
  // Assuming the date received is the same for all items from the vendor
  const dateReceived = vendor.items[0]?.dateReceived 
    ? new Date(vendor.items[0].dateReceived).toLocaleDateString("en-GB") 
    : 'N/A';

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        <Typography variant="h6" style={{ fontWeight: 'bold' }}>
          {vendor.vendorName.toUpperCase()} - Items ({vendor.items.map(item => item.itemName).join(', ')})
        </Typography>
        <Typography variant="body2" style={{ marginTop: 4, fontWeight: 'bold' }}>
          Date Received: {dateReceived}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <List>
          {vendor.items.map(item => {
            // Filter purchase history for the current item
            const itemHistory = item.purchaseHistory || []; // Assuming purchaseHistory is part of item
            // Calculate total quantity and weight for this item
            const totalQuantity = itemHistory.reduce((acc, entry) => acc + entry.quantity, 0);
            const totalWeight = itemHistory.reduce((acc, entry) => acc + entry.weight, 0);
            // Calculate total amount in INR based on weight or quantity
            const totalAmountINR = itemHistory.reduce((acc, entry) => {
              return acc + (entry.weight > 0 ? entry.weight * entry.rate : entry.quantity * entry.rate);
            }, 0);
            // Calculate average rate (total amount divided by total weight)
            const averageRate = totalWeight > 0 ? (totalAmountINR / totalWeight).toFixed(2) : 0;

            // Determine color based on remaining stock
            const remainingStockColor = item.remainingStock === 0 ? 'green' : 'red';

            return (
              <ListItem key={item._id} sx={{ borderBottom: '1px solid #ddd', paddingBottom: 2, display:"flex",flexWrap:"wrap" }}>
                <ListItemText
                  primary={
                    <Box>
                      <Typography variant="h6" style={{ fontWeight: 'bold' }}>
                        {item.itemName}
                        <span style={{ color: remainingStockColor, marginLeft: '8px' }}>
                          Remaining Stock: {item.remainingStock}
                        </span>
                      </Typography>
                      <Typography variant="body2">Total Qty: {totalQuantity}</Typography>
                      <Typography variant="body2">Total Weight: {totalWeight} kg</Typography>
                      <Typography variant="body2">Total Amount: ₹{totalAmountINR.toFixed(2)}</Typography>
                      <Typography variant="body2">Average Rate: ₹{averageRate} per unit</Typography>
                    </Box>
                  }
                />
                <List>
                  {itemHistory.map(entry => (
                    <ListItem key={entry._id}>
                      <ListItemText
                        primary={`Qty: ${entry.quantity}, Weight: ${entry.weight}, Rate: ₹${entry.rate}, Date: ${new Date(entry.date).toLocaleDateString()}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </ListItem>
            );
          })}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VendorItemsModal;
