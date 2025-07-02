import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  TextField,
  List,
  ListItem,
  ListItemText,
  Collapse,
  Divider,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
  Skeleton,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import apiClient from "../services/apiClient";
import { API_BASE_URL } from '../constants';
import AddInventory from './AddInventory';
import VendorItemsModal from './VendorItemsModal';
import VendorReport from './VendorReport';
import { toast, ToastContainer } from 'react-toastify';
import AddIcon from "@mui/icons-material/Add";
import ReportIcon from '@mui/icons-material/Report';
import HistoryIcon from '@mui/icons-material/History';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { GridDeleteForeverIcon, GridDeleteIcon, GridViewHeadlineIcon, GridViewStreamIcon } from '@mui/x-data-grid';
import WatakModal from './WatakModal';
import { CreateTwoTone, ViewArrayTwoTone } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';

const InventoryList = () => {
  const [inventory, setInventory] = useState([]);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isVendorModalOpen, setVendorModalOpen] = useState(false);
  const [isReportModalOpen, setReportModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [expandedDate, setExpandedDate] = useState(null);
  const [expandedVendor, setExpandedVendor] = useState({});
  const [reportData, setReportData] = useState({});
  const [loadingItemId, setLoadingItemId] = useState(null);
  const [isWatakModalOpen, setWatakModalOpen] = useState(false);
  const [watakData, setWatakData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get(`${API_BASE_URL}/get-inventory`);
      setInventory(response.data);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      toast.error('Error fetching inventory.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenWatakModal = (vendor) => {
    console.log("veeeeee", vendor);
    const itemsData = vendor.items.map(item => {
      const itemHistory = item.purchaseHistory || [];
      const totalQuantity = itemHistory.reduce((acc, entry) => acc + entry.quantity, 0);
      const totalWeight = itemHistory.reduce((acc, entry) => acc + entry.weight, 0);
     const totalAmountINR = itemHistory.reduce((acc, entry) => {
  if (entry.weight && entry.weight > 0) {
    return acc + (entry.weight * entry.rate);
  } else if (entry.quantity && entry.quantity > 0) {
    return acc + (entry.quantity * entry.rate);
  } else {
    return acc; 
  }
}, 0);
      const averageRate = totalWeight > 0 ? (totalAmountINR / totalWeight).toFixed(2) : totalAmountINR / totalQuantity;
      const receivedQuantity = item.quantityReceived;
      const dateReceived = item.dateReceived;
      const vehicleCharges = item.vehicleCharges;
      const bardan = item.bardan;
      const vehicleNumber = item.vehicleNumber;

      return {
        itemName: item.itemName,
        quantity: totalQuantity,
        weight: totalWeight,
        rate: averageRate,
        receivedQuantity,
        dateReceived,
        vehicleCharges,
        bardan,
        vehicleNumber,
      };
    });

    setWatakData({
      name: vendor.vendorName,
      id: vendor?.vendorExtra._id,
      type: vendor?.vendorExtra.type,
      ledgerBalance: vendor?.vendorExtra?.ledgerBalance,
      items: itemsData,
    });

    setWatakModalOpen(true);
  };

  const handleCloseWatakModal = () => {
    setWatakModalOpen(false);
  };

  const onDeleteVendor = async (vendorId) => {
    try {
      await apiClient.delete(`${API_BASE_URL}/delete-inventory/${vendorId}`);
      toast.success('Vendor deleted successfully!');
      fetchInventory();
      handleReportModalClose();
    } catch (error) {
      toast.error('Failed to delete vendor. Please try again.');
      console.error('Error deleting vendor:', error);
    }
  };

  const handleAddItem = () => {
    fetchInventory();
    setAddModalOpen(false);
  };

  const handleDeleteItem = async (itemId) => {
    setLoadingItemId(itemId);
    try {
      await apiClient.delete(`${API_BASE_URL}/inventory/delete`, { data: { itemId } });
      fetchInventory();
      toast.success('Item deleted successfully!');
    } catch (error) {
      console.error("Error deleting inventory item:", error);
      toast.error('Error deleting inventory item.');
    } finally {
      setLoadingItemId(null);
    }
  };

  const handleDateToggle = (date) => {
    setExpandedDate(expandedDate === date ? null : date);
  };

  const handleVendorToggle = (vendorId) => {
    setExpandedVendor((prev) => ({
      ...prev,
      [vendorId]: !prev[vendorId],
    }));
  };

  const handleVendorModalOpen = (vendor) => {
    setSelectedVendor(vendor);
    setVendorModalOpen(true);
  };

  const handleVendorModalClose = () => {
    setVendorModalOpen(false);
    setSelectedVendor(null);
  };

  const handleReportModalOpen = (date, vendors) => {
    setReportData({ date, vendors });
    setReportModalOpen(true);
  };

  

  const handleReportModalClose = () => {
    setReportModalOpen(false);
    setReportData({});
  };

  const groupedInventory = inventory.reduce((acc, vendorEntry) => {
    vendorEntry.items.forEach(item => {
      const date = new Date(item.dateReceived).toLocaleDateString("en-GB");
      if (!acc[date]) {
        acc[date] = {};
      }
      if (!acc[date][vendorEntry?.vendorId?._id]) {
        acc[date][vendorEntry?.vendorId?._id] = {
          vendorName: vendorEntry.vendorId?.name,
          items: [],
          vendorExtra:vendorEntry.vendorId,

          purchaseHistory: vendorEntry.purchaseHistory,
        };
      }
      acc[date][vendorEntry.vendorId._id].items.push(item);
    });
    return acc;
  }, {});

  const sortedGroupedInventory = Object.entries(groupedInventory)
    .sort(([dateA], [dateB]) => {
      const isoDateA = new Date(dateA.split('/').reverse().join('-'));
      const isoDateB = new Date(dateB.split('/').reverse().join('-'));
      return isoDateB - isoDateA;
    })
    .reduce((acc, [date, vendors]) => {
      acc[date] = vendors;
      return acc;
    }, {});

  const groupByCurrentDate = (inventory) => {
    const currentDate = new Date().toLocaleDateString("en-GB");
    const groupedInventory = { [currentDate]: {} };

    inventory.forEach(vendorEntry => {
      const vendorId = vendorEntry.vendorId._id;
      if (!groupedInventory[currentDate][vendorId]) {
        groupedInventory[currentDate][vendorId] = {
          vendorName: vendorEntry.vendorId.name,
          vendorExtra: vendorEntry.vendorId,
          items: [],
          purchaseHistory: vendorEntry.purchaseHistory,
        };
      }
      vendorEntry.items.forEach(item => {
        groupedInventory[currentDate][vendorId].items.push(item);
      });
    });
    return groupedInventory;
  };

  const handleAddWatak = async (invoice) => {
    const vendorId = invoice.customer.id;
    try {
      await apiClient.post(`${API_BASE_URL}/vendor/${vendorId}`, { invoice });
      toast.success("Invoice Created successfully");
    } catch (error) {
      console.error("Error adding invoice:", error);
      toast.error("Error adding invoice.");
    }
  };

  const handleReportAllModalOpen = () => {
    const groupedInventoryByCurrentDate = groupByCurrentDate(inventory);
    const currentDate = new Date().toLocaleDateString("en-GB");

    setReportData({
      date: currentDate,
      vendors: groupedInventoryByCurrentDate[currentDate] || {},
    });
    setReportModalOpen(true);
  };

  const handlePendingItemsPDF = () => {
    const doc = new jsPDF();
    let yPos = 20;

    doc.setFontSize(16);
    doc.text("Pending Items Report", 20, yPos);
    yPos += 15;

    const pendingItems = {};

    Object.entries(sortedGroupedInventory).forEach(([date, vendors]) => {
      Object.entries(vendors).forEach(([vendorId, vendor]) => {
        const pendingItemsForVendor = vendor.items.filter(item => item.remainingStock > 0);
        if (pendingItemsForVendor.length > 0) {
          if (!pendingItems[date]) {
            pendingItems[date] = {};
          }
          pendingItems[date][vendor.vendorName] = pendingItemsForVendor;
        }
      });
    });

    Object.entries(pendingItems).forEach(([date, vendors]) => {
      doc.setFontSize(14);
      doc.text(`Date: ${date}`, 20, yPos);
      yPos += 10;

      Object.entries(vendors).forEach(([vendorName, items]) => {
        doc.setFontSize(12);
        doc.text(`Vendor: ${vendorName}`, 30, yPos);
        yPos += 8;

        items.forEach(item => {
          doc.setFontSize(10);
          doc.text(`• ${item.itemName} - ${item.remainingStock}`, 40, yPos);
          yPos += 6;
        });
        yPos += 5;
      });
      yPos += 10;

      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
    });

    doc.save('pending-items-report.pdf');
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        {window.innerWidth <= 600 ? (
          <>
            <Typography variant="h5" gutterBottom>Inventory List</Typography>
            <IconButton
              color="primary"
              aria-label="add-Item"
              onClick={() => setAddModalOpen(true)}
            >
              <AddIcon />
            </IconButton>
            <IconButton
              color="primary"
              aria-label="viewWatak"
              onClick={() => navigate("/viewTodaysWataks")}
            >
              <ViewArrayTwoTone />
            </IconButton>
            <IconButton
              color="primary"
              aria-label="View-All"
              onClick={() => handleReportAllModalOpen()}
            >
              <GridViewStreamIcon />
            </IconButton>
            <IconButton
              color="secondary"
              aria-label="pending-items"
              onClick={handlePendingItemsPDF}
            >
              <WarningIcon />
            </IconButton>
          </>
        ) : (
          <>
            <Typography variant="h5" gutterBottom>Inventory List</Typography>
            <Button
              variant="contained"
              color="primary"
              style={{ marginRight: "8px" }}
              startIcon={<GridViewHeadlineIcon />}
              onClick={() => navigate("/viewTodaysWataks")}
            >
              View Wataks
            </Button>
            <Button variant="contained" color="secondary" onClick={() => handleReportAllModalOpen()}>
              Generate Today's Reports
            </Button>
            <Button variant="contained" color="primary" onClick={() => setAddModalOpen(true)}>
              Add Item
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={handlePendingItemsPDF}
            >
              Pending items
            </Button>
          </>
        )}
      </Box>

      <Paper elevation={3} sx={{ padding: 2 }}>
        {isLoading ? (
          <Box>
            {[...Array(5)].map((_, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Skeleton variant="rectangular" height={50} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" />
              </Box>
            ))}
          </Box>
        ) : inventory.length === 0 ? (
          <Typography variant="h6" color="textSecondary" align="center">
            No inventory items available.
          </Typography>
        ) : (
          <List>
            {Object.entries(sortedGroupedInventory).map(([date, vendors]) => {
              const allZeroStock = Object.values(vendors).every(vendor =>
                vendor.items.every(item => item.remainingStock === 0)
              );

              return (
                <div key={date}>
                  <ListItem
                    button
                    onClick={() => handleDateToggle(date)}
                    sx={{ bgcolor: allZeroStock ? "green.100" : "red.100" }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          {allZeroStock ? (
                            <CheckCircleIcon sx={{ color: "green", mr: 1 }} />
                          ) : (
                            <WarningIcon sx={{ color: "red", mr: 1 }} />
                          )}
                          {date}
                        </Box>
                      }
                      secondary={
                        allZeroStock
                          ? "Ready to be invoiced"
                          : "Items available"
                      }
                    />
                    {window.innerWidth <= 600 ? (
                      <IconButton
                        color="primary"
                        aria-label="Report"
                        onClick={() => handleReportModalOpen(date, vendors)}
                      >
                        <ReportIcon />
                      </IconButton>
                    ) : (
                      <Button
                        variant="outlined"
                        onClick={() => handleReportModalOpen(date, vendors)}
                        sx={{ ml: 2 }}
                      >
                        Generate Report
                      </Button>
                    )}
                  </ListItem>
                  <Collapse
                    in={expandedDate === date}
                    timeout="auto"
                    unmountOnExit
                  >
                    <List component="div" disablePadding>
                      {Object.entries(vendors).map(([vendorId, vendor]) => {
                        const vendorAllZeroStock = vendor.items.every(
                          (item) => item.remainingStock === 0
                        );

                        return (
                          <div key={vendorId}>
                            <ListItem
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <ListItemText
                                primary={
                                  <Box
                                    sx={{
                                      fontSize: "20px",
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    {vendorAllZeroStock && (
                                      <CheckCircleIcon
                                        sx={{ color: "green", mr: 1 }}
                                      />
                                    )}
                                    {vendor.vendorName}
                                  </Box>
                                }
                                sx={{
                                  color: vendorAllZeroStock
                                    ? "green"
                                    : "inherit",
                                }}
                              />

                              {window.innerWidth <= 600 ? (
                                <>
                                  <IconButton
                                    color="primary"
                                    aria-label="history"
                                    onClick={() => handleVendorModalOpen(vendor)}
                                  >
                                    <HistoryIcon />
                                  </IconButton>
                                  <IconButton
                                    color="secondary"
                                    aria-label="history"
                                    onClick={() => handleOpenWatakModal(vendor)}
                                  >
                                    <AddIcon />
                                  </IconButton>
                                </>
                              ) : (
                                <>
                                  <Button
                                    variant="outlined"
                                    onClick={() => handleVendorModalOpen(vendor)}
                                  >
                                    Purchase History
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    style={{ background: "green", color: "white", marginLeft: "5px" }}
                                    onClick={() => handleOpenWatakModal(vendor)}
                                  >
                                    Create Watak
                                  </Button>
                                </>
                              )}
                            </ListItem>

                            {window.innerWidth <= 600 ? (
                              <IconButton
                                color="primary"
                                aria-label={
                                  expandedVendor[vendorId]
                                    ? "Hide Items"
                                    : "Show Items"
                                }
                                onClick={() => handleVendorToggle(vendorId)}
                              >
                                {expandedVendor[vendorId] ? (
                                  <VisibilityOff />
                                ) : (
                                  <Visibility />
                                )}
                              </IconButton>
                            ) : (
                              <Button
                                onClick={() => handleVendorToggle(vendorId)}
                                variant="outlined"
                                startIcon={
                                  expandedVendor[vendorId] ? (
                                    <VisibilityOff />
                                  ) : (
                                    <Visibility />
                                  )
                                }
                              >
                                {expandedVendor[vendorId]
                                  ? "Hide Items"
                                  : "Show Items"}
                              </Button>
                            )}

                            <Collapse
                              in={expandedVendor[vendorId]}
                              timeout="auto"
                              unmountOnExit
                            >
                              <List component="div" disablePadding>
                                {vendor.items.map((item) => (
                                  <ListItem
                                    key={item._id}
                                    style={{
                                      color: item.remainingStock > 0 ? 'red' : 'green',
                                    }}
                                  >
                                    <ListItemText
                                      primary={`${item.itemName} (Received Qty: ${item.quantityReceived}, Remaining Qty: ${item.remainingStock})`}
                                    />
                                    {window.innerWidth <= 600 ? (
                                      <IconButton
                                        color="primary"
                                        aria-label="delete"
                                        onClick={() => handleDeleteItem(item._id)}
                                        disabled={loadingItemId === item._id}
                                        sx={{ marginLeft: "auto", color: "red" }}
                                      >
                                        {loadingItemId === item._id ? <CircularProgress size={24} /> : <GridDeleteForeverIcon />}
                                      </IconButton>
                                    ) : (
                                      <Button
                                        variant="outlined"
                                        color="secondary"
                                        onClick={() => handleDeleteItem(item._id)}
                                        disabled={loadingItemId === item._id}
                                        startIcon={<GridDeleteForeverIcon />}
                                        sx={{ marginLeft: "auto", color: "red" }}
                                      >
                                        {loadingItemId === item._id ? <CircularProgress size={24} /> : "Delete"}
                                      </Button>
                                    )}
                                  </ListItem>
                                ))}
                                <Divider />
                              </List>
                            </Collapse>
                            <Divider />
                          </div>
                        );
                      })}
                    </List>
                  </Collapse>
                  <Divider />
                </div>
              );
            })}
          </List>
        )}
      </Paper>
      {isAddModalOpen && <AddInventory onClose={() => setAddModalOpen(false)} onAdd={handleAddItem} />}
      {isVendorModalOpen && selectedVendor && (
        <VendorItemsModal open={isVendorModalOpen} onClose={handleVendorModalClose} vendor={selectedVendor} />
      )}
      {isWatakModalOpen && (
        <WatakModal
          open={isWatakModalOpen}
          handleClose={handleCloseWatakModal}
          handleAddWatak={handleAddWatak}
          customer={watakData}
        />
      )}
      <Dialog
        open={isReportModalOpen}
        onClose={handleReportModalClose}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>Vendor Report for {reportData.date}</DialogTitle>
        <DialogContent>
          {reportData.vendors && (
            <VendorReport
              fullWidth
              maxWidth="xl"
              date={reportData.date}
              vendors={reportData.vendors}
              onDeleteVendor={onDeleteVendor}
              onClose={handleReportModalClose}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleReportModalClose} color="secondary">Close</Button>
        </DialogActions>
      </Dialog>
      <ToastContainer />
    </Box>
  );
};

export default InventoryList;