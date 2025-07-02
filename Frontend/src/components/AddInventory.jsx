import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import AddIcon from "@mui/icons-material/Add";
import apiClient from "../services/apiClient";
import { API_BASE_URL } from "../constants";
import { toast } from "react-toastify";
import { GridDeleteIcon } from "@mui/x-data-grid";
import AddVendor from "./AddVendor";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";

const AddInventory = ({ onClose, onAdd }) => {
  const [vendorId, setVendorId] = useState("");
  const [items, setItems] = useState([
    { itemName: "", quantityReceived: "", remainingStock: "" },
  ]);
  const [dateReceived, setDateReceived] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleCharges, setVehicleCharges] = useState("");
  const [bardan, setBardan] = useState("");
  const [vendors, setVendors] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch vendors and items
  useEffect(() => {
    fetchVendors();
    fetchItems();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await apiClient.get(`${API_BASE_URL}/vendors`);
      setVendors(response.data);
    } catch (error) {
      toast.error("Error fetching vendors.");
    }
  };

  const fetchItems = async () => {
    try {
      const response = await apiClient.get(`${API_BASE_URL}/vegetables/getVeg`);
      setItemOptions(response.data.map((vegetable) => vegetable.name));
    } catch (error) {
      toast.error("Error fetching items.");
    }
  };

  // Handle vendor selection
  const handleVendorChange = (event, newValue) => {
    setVendorId(newValue ? newValue._id : "");
  };

  const handleVendorBlur = (event) => {
    const inputValue = event.target.value;
    const matchedVendor = vendors.find((vendor) =>
      vendor.name.toLowerCase().startsWith(inputValue.toLowerCase())
    );
    setVendorId(matchedVendor ? matchedVendor._id : "");
  };

  // Handle item changes
  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;

    if (field === "quantityReceived") {
      newItems[index].remainingStock = value;
    }

    setItems(newItems);
  };

  // Handle item name blur to match from options
  const handleItemNameBlur = (index) => {
    const itemName = items[index]?.itemName || "";
    const matchedOption = itemOptions.find((option) =>
      option.toLowerCase().startsWith(itemName.toLowerCase())
    );

    const newItems = [...items];
    newItems[index].itemName = matchedOption || itemName;
    setItems(newItems);
  };

  const handleAddItem = () => {
    setItems([...items, { itemName: "", quantityReceived: "", remainingStock: "" }]);
  };

  const handleDeleteItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleAddVendor = (vendor) => {
    setVendors((prevVendors) => [...prevVendors, vendor]);
    setAddModalOpen(false);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const inventoryPayload = {
        vendorId,
        vehicleNumber,
        vehicleCharges,
        bardan,
        dateReceived: dateReceived || new Date().toISOString(),
        items: items.map(({ itemName, quantityReceived, remainingStock }) => ({
          itemName,
          quantityReceived,
          remainingStock,
        })),
      };

      const response = await apiClient.post(`${API_BASE_URL}/inventory/add`, inventoryPayload);
      onAdd(response.data);
      toast.success("Items added successfully!");
      onClose();
    } catch (error) {
      toast.error("Error adding inventory items.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
      <DialogContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", height: "50px", mb: 2 }}>
          <DialogTitle>Add Inventory Items</DialogTitle>
          <Button variant="contained" color="primary" onClick={() => setAddModalOpen(true)}>
            {window.innerWidth <= 600 ? <PersonAddAltIcon /> : "Add New Vendor"}
          </Button>
        </Box>

        {/* Vendor Autocomplete */}
        <Autocomplete
          freeSolo
          options={vendors}
          getOptionLabel={(option) => option.name}
          value={vendors.find((vendor) => vendor._id === vendorId) || null}
          onChange={handleVendorChange}
          onBlur={handleVendorBlur}
          renderInput={(params) => <TextField {...params} label="Vendor" fullWidth />}
        />

        {/* Other Fields */}
        <TextField
          label="Date Received"
          type="date"
          margin="dense"
          value={dateReceived}
          InputLabelProps={{ shrink: true }}
          onChange={(e) => setDateReceived(e.target.value)}
          fullWidth
        />
        <TextField
          label="Vehicle Number"
          margin="dense"
          value={vehicleNumber}
          onChange={(e) => setVehicleNumber(e.target.value)}
          fullWidth
        />
        <TextField
          label="Vehicle Charges"
          margin="dense"
          type="number"
          value={vehicleCharges}
          onChange={(e) => setVehicleCharges(e.target.value)}
          fullWidth
        />

<TextField
          label="Bardan"
          margin="dense"
          type="number"
          value={bardan}
          onChange={(e) => setBardan(e.target.value)}
          fullWidth
        />

        {/* Items */}
        <Grid container spacing={2} mt={2}>
          {items.map((item, index) => (
            <Grid item xs={12} key={index}>
              <Grid container spacing={2}>
                {/* Item Name */}
                <Grid item md={4} xs={12}>
                  <Autocomplete
                    freeSolo
                    options={itemOptions}
                    value={item.itemName || ""}
                    onInputChange={(event, newValue) =>
                      handleItemChange(index, "itemName", newValue)
                    }
                    onBlur={() => handleItemNameBlur(index)}
                    renderInput={(params) => (
                      <TextField {...params} label="Item Name" fullWidth />
                    )}
                  />


                </Grid>
                {/* Quantity Received (4 Grid Units) */}
                <Grid item md={4} xs={5}>
                  <TextField
                    label="Quantity Received"
                    margin="dense"
                    value={item.quantityReceived}
                    variant="outlined"
                    fullWidth
                    onChange={(e) => handleItemChange(index, 'quantityReceived', e.target.value)}
                  />
                </Grid>
                {/* Remaining Stock (4 Grid Units) */}
                <Grid item md={4} xs={5}>
                  <TextField
                    label="Remaining Stock"
                    margin="dense"
                    value={item.remainingStock}
                    variant="outlined"
                    fullWidth
                    disabled
                  />
                </Grid>
                {/* Delete Button (2 Grid Units) */}
                <Grid item md={2} xs={2}>
                  {window.innerWidth <= 600 ? (
                    <IconButton
                      sx={{ marginTop: "10px", color: "red" }}
                      color="primary"
                      aria-label="delete-item"
                      onClick={() => handleDeleteItem(index)}
                    >
                    <GridDeleteIcon />
                  </IconButton>
                  ) : (
                    <Button
                      onClick={() => handleDeleteItem(index)}
                      color="secondary"
                      variant="outlined"
                      fullWidth
                      startIcon={<GridDeleteIcon />}
                      sx={{ color: "red" }}
                    >
                      Delete
                    </Button>
                  )}
                </Grid>
              </Grid>
            </Grid>
          ))}
        </Grid>

        <Button
          onClick={handleAddItem}
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          fullWidth
          startIcon={<AddIcon />}
        >
          Add Another Item
        </Button>

        {isAddModalOpen && (
    <AddVendor
      onClose={() => setAddModalOpen(false)}
      onAdd={handleAddVendor}
    />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Cancel</Button>
      <Button 
        onClick={handleSubmit} 
        color="primary"
        disabled={loading} // Disable button while loading
      >
        {loading ? "Adding..." : 'Add Items'}
        </Button>
      </DialogActions>
    </Dialog>
    
  );
  
};

export default AddInventory;
