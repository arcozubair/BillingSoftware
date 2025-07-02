import React from 'react';
import { Box, Typography, Button, Divider, Grid } from '@mui/material';
import apiClient from '../services/apiClient';
import { API_BASE_URL } from '../constants';
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; // Green checkmark icon
import WarningIcon from '@mui/icons-material/Warning'; // Warning icon for incomplete inventory
const VendorReport = ({ date, vendors, onClose, onDeleteVendor }) => {
  const handlePrint = () => {
    window.print();
  };
console.log(date,vendors)
  // Flatten and group items by vendor
  const itemsArray = Object.entries(vendors).flatMap(([vendorId, vendor]) =>
    vendor.items.map(item => ({
      vendorName: vendor.vendorName,
      vendorId,
      item,
    }))
  );
  
  // Group items dynamically based on available space
  const groupedItems = [];
  let currentGroup = [];
  let currentVendor = null;
  let currentVendorId = null;

  itemsArray.forEach(({ vendorName, item, vendorId }) => {
    if (currentVendor && currentVendor !== vendorName) {
      groupedItems.push({ vendor: currentVendor, items: currentGroup, vendorId: currentVendorId, itemCount: currentGroup.length });
      currentGroup = [];
    }
    currentVendor = vendorName;
    currentVendorId = vendorId;
    currentGroup.push(item);
    
    // Push if the group is full (4 items)
    if (currentGroup.length === 4) {
      groupedItems.push({ vendor: currentVendor, items: currentGroup, vendorId: currentVendorId, itemCount: currentGroup.length });
      currentGroup = [];
    }
  });

  // Push any remaining items
  if (currentGroup.length) {
    groupedItems.push({ vendor: currentVendor, items: currentGroup, vendorId: currentVendorId, itemCount: currentGroup.length });
  }

  // Function to group purchase history by date
  const groupedHistory = (purchaseHistory) => {
    return purchaseHistory.reduce((acc, entry) => {
      const dateKey = new Date(entry.date).toLocaleDateString("en-GB");
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(entry);
      return acc;
    }, {});
  };

  return (
    <Box sx={{ p: 1, bgcolor: '#f9f9f9', borderRadius: 2, boxShadow: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Button variant="contained" color="primary" onClick={handlePrint} sx={{ fontSize: '10px' }}>
          Print Report
        </Button>
        <Button variant="outlined" color="secondary" onClick={onClose} sx={{ fontSize: '10px' }}>
          Close
        </Button>
      </Box>
      <Typography variant="h4" gutterBottom align="center" sx={{ fontSize: '16px' }}>
        Report for {date}
      </Typography>
      <Divider sx={{ mb: 1 }} />

      <Grid container spacing={1} sx={{ flexWrap: 'wrap' }}>
        {groupedItems.map(({ vendor, items, vendorId, itemCount }, index) => (
          <Grid item xs={12} key={index} sx={{ mb: 1 }}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="h5" align="center" sx={{ fontSize: '20px', mt: 1 }}>
              <strong>{vendor.toUpperCase()}</strong>
            </Typography>
            
            <Divider sx={{ my: 1 }} />

            <Grid container spacing={1}>
              {items
                .filter(item => item.itemName !== "Krade") 
                .map(item => {
                  const itemHistory = item.purchaseHistory || [];
                  const totalQuantity = itemHistory.reduce((acc, entry) => acc + entry.quantity, 0);
                  const totalWeight = itemHistory.reduce((acc, entry) => acc + entry.weight, 0);
                  const totalAmount = itemHistory.reduce((acc, entry) => acc + (entry.weight > 0 ? entry.weight * entry.rate : entry.quantity * entry.rate), 0);
                  const averageRate = totalWeight > 0 ? (totalAmount / totalWeight).toFixed(2) : totalAmount / totalQuantity
console.log("item",item)
                  return (
                    <Grid
                      item
                      xs={3}
                      key={item._id}
                      sx={{ mb: 1, p: 1, bgcolor: "#f1f1f1", borderRadius: 1 }}
                    >
                      <Typography
                        variant="h5"
                        sx={{
                          fontSize: "20px",
                          textDecoration: "underline",

                          color: item.remainingStock > 0 ? "red" : "green",
                        }}
                      >
                        {item.itemName}
                        {item.remainingStock < 1 ? (
                          <CheckCircleIcon sx={{ color: "green", ml: 1 }} />
                        ) : (
                          <WarningIcon sx={{ color: "red", ml: 1 }} />
                        )}
                      </Typography>

                      <Typography sx={{ fontSize: "12px", fontStyle: "bold" }}>
                        <strong>
                          {" "}
                          Received Date:{" "}
                          {new Date(item.dateReceived).toLocaleDateString(
                            "en-GB"
                          )}
                        </strong>
                      </Typography>

                      <Typography sx={{ fontSize: "10px" }}>
                        Received Qty: {item.quantityReceived}
                      </Typography>
                      <Typography sx={{ fontSize: "10px" }}>
                        Remaining Qty: {item.remainingStock}
                      </Typography>
                      <Divider sx={{ my: 0.5 }} />
                      <Typography variant="body2" sx={{ fontSize: "11px" }}>
                        <strong>Purchase History:</strong>
                      </Typography>
                      {itemHistory.length > 0 ? (
                        Object.entries(groupedHistory(itemHistory)).map(
                          ([dateKey, historyEntries]) => (
                            <div
                              key={dateKey}
                              style={{ marginBottom: "0.3rem" }}
                            >
                              <Typography
                                variant="body2"
                                style={{
                                  fontSize: "10px",
                                  marginBottom: "0.3rem",
                                  fontStyle: "underline",
                                }}
                              >
                                <strong>Purchase Date: {dateKey}</strong>
                              </Typography>

                              {historyEntries.map((entry, index) => (
                                <Typography
                                  key={index}
                                  variant="body2"
                                  sx={{ fontSize: "15px" }}
                                >
                                  {entry.quantity} - {entry.weight} - ₹
                                  {entry.rate}
                                </Typography>
                              ))}
                            </div>
                          )
                        )
                      ) : (
                        <Typography sx={{ fontSize: "10px" }}>
                          No purchase history available.
                        </Typography>
                      )}
                      <Divider sx={{ my: 0.5 }} />
                      <div style={{ fontSize: "10px" }}>
                        <div>
                          <strong>Total Qty: {totalQuantity}</strong>
                        </div>
                        <div>
                          <strong>Total Weight: {totalWeight} kg</strong>
                        </div>
                        <div>
                          <strong>
                            Total Amount: ₹{totalAmount.toFixed(2)}
                          </strong>
                        </div>
                        <div>
                          <strong>Average Rate: ₹{averageRate}</strong>
                        </div>
                      </div>
                    </Grid>
                  );
                })}
            </Grid>
          </Grid>
        ))}
      </Grid>

      <style>
        {`
          @media print {
            .MuiGrid-item {
              page-break-inside: avoid; /* Prevent breaking inside grid items */
            }
          }
        `}
      </style>
    </Box>
  );
};

export default VendorReport;
