import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Select,
  MenuItem,
  IconButton,
  Autocomplete,
} from "@mui/material";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../constants";
import apiClient from "../services/apiClient";
import { DeleteForever } from "@mui/icons-material";

const EditInvoiceModal = ({ open, onClose, invoice, onSubmit }) => {
  const [editedInvoice, setEditedInvoice] = useState({
    invoiceNumber: "",
    customerName: "",
    date: new Date().toISOString().slice(0, 10),
    balance: 0,
    lastBalance: 0,
    items: [],
  });

  const [vendorOptions, setVendorOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [vendorItemMap, setVendorItemMap] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getVendors = async () => {
      try {
        const response = await apiClient.get(`${API_BASE_URL}/get-inventory`);
        console.log("Fetched inventory data:", response.data);

        const vendors = response.data.map((inventory) => ({
          id: inventory.vendorId._id,
          name: inventory.vendorId.name,
          items: inventory.items.map((item) => ({
            itemName: item.itemName,
            dateReceived: new Intl.DateTimeFormat("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }).format(new Date(item.dateReceived)),
            remaningStock: item.remainingStock,
            id: item._id,
            rate: item.purchaseHistory[0]?.rate || 0,
          })),
        }));

        console.log("Processed vendors:", vendors);

        const vendorItemMap = {};
        vendors.forEach((vendor) => {
          vendor.items.forEach((item) => {
            vendorItemMap[item.id] = {
              vendorId: vendor.id,
              vendorName: vendor.name,
              itemName: item.itemName,
              dateReceived: item.date,
              remainingStock: item.remainingStock,
            };
          });
        });

        console.log("Vendor-Item Map:", vendors);

        setVendorItemMap(vendorItemMap);
        setVendorOptions(vendors);

        // Prefill invoice data
        if (invoice) {
          console.log("Invoice data:", invoice);

          const totalAmount = calculateTotalAmount(invoice.items);
          setEditedInvoice({
            ...invoice,
            date: invoice.date.slice(0, 10),
            balance: totalAmount,
            lastBalance: invoice.lastBalance - totalAmount,
            items: invoice.items.map((item) => ({
              ...item,
              itemName: vendorItemMap[item.id]?.itemName || item.itemName,
              vendorId: vendorItemMap[item.id]?.vendorId || "",
            })),
          });
        }
      } catch (error) {
        console.error("Error fetching vendors:", error);
        toast.error("Failed to load vendor options");
      }
    };

    getVendors();
  }, [invoice]);

  const calculateTotalAmount = (items) => {
    return items
      .reduce((total, item) => {
        const itemTotal =
          (item.weight ? item.weight * item.rate : item.quantity * item.rate) ||
          0;
        return total + itemTotal;
      }, 0)
      .toFixed(2);
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...editedInvoice.items];
    updatedItems[index][field] =
      field === "weight" && value === "" ? null : value;

    const item = updatedItems[index];
    item.total = (
      item.weight ? item.weight * item.rate : item.quantity * item.rate
    ).toFixed(2);

    const updatedBalance = calculateTotalAmount(updatedItems);

    setEditedInvoice((prevInvoice) => ({
      ...prevInvoice,
      items: updatedItems,
      balance: updatedBalance,
    }));
  };

  const handleVendorChange = (index, vendorId) => {
    console.log("Selected vendor ID:", vendorId);

    const vendor = vendorOptions.find((v) => v.id === vendorId);
    console.log("Selected vendor:", vendor);

    const newItemOptions = vendor ? vendor.items : [];
    console.log("New item options:", newItemOptions);

    const updatedItems = [...editedInvoice.items];
    updatedItems[index] = {
      ...updatedItems[index],
      vendorId: vendorId,
      id: "", // Clear previous item selection
      itemName: "",
      quantity: "", // Clear quantity
      weight: "", // Clear weight
      rate: "", // Clear rate
      total: 0, // Reset total
    };

    setItemOptions(newItemOptions);

    setEditedInvoice((prevInvoice) => ({
      ...prevInvoice,
      items: updatedItems,
    }));
  };

  const handleItemSelectionChange = (index, id) => {
    console.log("Selected item ID:", id);

    const item = vendorItemMap[id];
    console.log("Selected item:", item);

    const updatedItems = [...editedInvoice.items];
    updatedItems[index] = {
      ...updatedItems[index],
      id: id, // Use 'id' instead of 'itemId'
      itemName: item.itemName,
      rate: "",
      quantity: "", // Clear quantity
      weight: "", // Clear weight
      total: 0, // Reset total
    };

    // Update the total for this item based on its rate and quantity/weight
    updatedItems[index].total = (
      (updatedItems[index].weight
        ? updatedItems[index].weight * updatedItems[index].rate
        : updatedItems[index].quantity * updatedItems[index].rate) || 0
    ).toFixed(2);

    // Calculate the new balance based on updated items
    const updatedBalance = calculateTotalAmount(updatedItems);

    setEditedInvoice((prevInvoice) => ({
      ...prevInvoice,
      items: updatedItems,
      balance: updatedBalance,
    }));
  };

  const handleAddItem = () => {
    const newItem = {
      vendorId: "",
      itemId: "",
      itemName: "",
      quantity: 1,
      weight: null,
      rate: 0,
      total: 0,
    };
    const updatedItems = [...editedInvoice.items, newItem];
    setEditedInvoice((prev) => ({
      ...prev,
      items: updatedItems,
    }));
  };

  const handleRemoveItem = (index) => {
    const updatedItems = editedInvoice.items.filter((_, i) => i !== index);
    const newTotal = calculateTotalAmount(updatedItems);

    setEditedInvoice((prev) => ({
      ...prev,
      items: updatedItems,
      balance: newTotal,
    }));
  };

  const handleUpdateInvoice = async () => {
    setLoading(true);
    try {
      const totalAmount = calculateTotalAmount(editedInvoice.items);
      const updatedInvoice = {
        ...editedInvoice,
        lastBalance:
          parseFloat(editedInvoice.lastBalance) + parseFloat(totalAmount),
        balance: totalAmount,
        date: editedInvoice.date,
        customerId: invoice.customerId,
      };

      const response = await apiClient.put(
        `${API_BASE_URL}/customers/updateInvoice/${invoice.id}`,
        { updatedInvoice }
      );

      console.log("Updated invoice:", response.data);
      toast.success("Invoice updated successfully");
      onClose();
      onSubmit();
    } catch (error) {
      console.error("Error updating invoice:", error);
      toast.error("Failed to update invoice. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="edit-invoice-modal-title"
      aria-describedby="edit-invoice-modal-description"
      sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <Box
        sx={{
          width: "90%",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        <Typography variant="h6" id="edit-invoice-modal-title" gutterBottom>
          Edit Invoice
        </Typography>
        {/* Invoice and Customer Details */}
        <TextField
          fullWidth
          label="Invoice Number"
          value={editedInvoice.invoiceNumber}
          disabled
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Customer Name"
          value={editedInvoice.customerName}
          disabled
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          type="date"
          label="Date"
          value={editedInvoice.date}
          onChange={(e) =>
            setEditedInvoice({ ...editedInvoice, date: e.target.value })
          }
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          type="number"
          label="Invoice Amount"
          disabled
          value={editedInvoice.balance}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          type="number"
          label="Last Balance"
          disabled
          value={editedInvoice.lastBalance}
          sx={{ mb: 2 }}
        />
        {/* Items Grid */}
        <Typography variant="h6" gutterBottom>
          Items
        </Typography>
        {editedInvoice.items.map((item, index) => {
          const vendorOptionsForItem = vendorOptions.filter((vendor) =>
            vendor.items.some((i) => i.id === item.itemId)
          );
          const itemOptionsForVendor =
            vendorOptions.find((vendor) => vendor.id === item.vendorId)
              ?.items || [];
          return (
            <Box
              key={index}
              sx={{
                mb: 2,
                border: "1px solid #ddd",
                borderRadius: "4px",
                p: 2,
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Select
                    fullWidth
                    value={item.vendorId}
                    onChange={(e) => handleVendorChange(index, e.target.value)}
                    displayEmpty
                    sx={{ mb: 2 }}
                  >
                    <MenuItem value="" disabled>
                      Select Vendor
                    </MenuItem>
                    {vendorOptions.map((vendor) => (
                      <MenuItem key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </MenuItem>
                    ))}
                  </Select>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Autocomplete
                    value={
                      itemOptionsForVendor.find(
                        (option) => option.id === item.id
                      ) || null
                    }
                    onChange={(event, newValue) =>
                      handleItemSelectionChange(
                        index,
                        newValue ? newValue.id : ""
                      )
                    }
                    options={itemOptionsForVendor}
                    getOptionLabel={(option) =>
                      `${option.itemName} (Received: ${option.dateReceived}, Stock: ${option.remaningStock})`
                    }
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Item"
                        variant="outlined"
                        placeholder="Select Item"
                      />
                    )}
                    renderOption={(props, option) => (
                      <li {...props}>
                        <div
                          style={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: "400px", // Adjust as needed for your layout
                          }}
                        >
                          {option.itemName} (Received: {option.dateReceived},
                          Stock: {option.remaningStock})
                        </div>
                      </li>
                    )}
                    disabled={!item.vendorId}
                    disableClearable
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={1}>
                  <TextField
                    fullWidth
                    label="Quantity"
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(index, "quantity", e.target.value)
                    }
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={1}>
                  <TextField
                    fullWidth
                    label="Weight"
                    type="number"
                    value={item.weight || ""}
                    onChange={(e) =>
                      handleItemChange(index, "weight", e.target.value)
                    }
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={1}>
                  <TextField
                    fullWidth
                    label="Rate"
                    type="number"
                    value={item.rate}
                    onChange={(e) =>
                      handleItemChange(index, "rate", e.target.value)
                    }
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={1}>
                  <TextField
                    fullWidth
                    label="Total"
                    type="number"
                    value={item.total}
                    disabled
                  />
                </Grid>
                <Grid item xs={12} md={1}>
                  <IconButton
                    style={{ color: "red" }}
                    onClick={() => handleRemoveItem(index)}
                  >
                    <DeleteForever />
                  </IconButton>
                </Grid>
              </Grid>
            </Box>
          );
        })}
        <Button variant="contained" onClick={handleAddItem} sx={{ mt: 2 }}>
          Add Item
        </Button>
        {/* Actions */}
        <Box sx={{ mt: 2, textAlign: "right" }}>
          <Button
            variant="contained"
            disabled={loading}
            onClick={handleUpdateInvoice}
          >
            {loading ? "Updating..." : "Update"}
          </Button>
          <Button variant="outlined" onClick={onClose} sx={{ ml: 2 }}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default EditInvoiceModal;
