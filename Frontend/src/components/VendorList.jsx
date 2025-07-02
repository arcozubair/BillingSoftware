import React, { useEffect, useState } from "react";
import AddVendor from "./AddVendor"; // Import the AddVendor component
import { API_BASE_URL } from "../constants";
import apiClient from "../services/apiClient";
import {
  Box,
  Button,
  Typography,
  TextField,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
} from "@mui/material";
import { DataGrid, GridViewHeadlineIcon } from "@mui/x-data-grid";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import WatakModal from "./WatakModal";
import AddIcon from "@mui/icons-material/Add";
import ReceiptIcon from "@mui/icons-material/Receipt";
import { useNavigate } from "react-router-dom";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import { Commet, FourSquare } from "react-loading-indicators";
import { DeleteForeverOutlined } from "@mui/icons-material";
import WatakPaymentModal from "./watakPaymentModal";
import PaymentIcon from "@mui/icons-material/Payment";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import LedgerModal from "./LedgerModal";

const VendorList = () => {
  const [vendors, setVendors] = useState([]);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isWatakModalOpen, setWatakModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [loadingOndelete, setLoadingOndelete] = useState(false);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [ledgerData, setLedgerData] = useState(null); // Add state for ledger data
  const [openLedgerModal, setOpenLedgerModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    if (searchQuery === "") {
      setFilteredVendors(vendors);
    } else {
      const filtered = vendors.filter(
        (vendor) =>
          vendor &&
          vendor.name &&
          vendor.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredVendors(filtered);
    }
  }, [searchQuery, vendors]);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`${API_BASE_URL}/vendors`);
      const vendorsData = response.data.vendors || response.data;
      // Filter out any invalid vendors
      const validVendors = vendorsData.filter(
        (vendor) => vendor && vendor.name
      );
      setVendors(validVendors);
      setFilteredVendors(validVendors);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      toast.error("Error fetching vendors.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPaymentModal = (customerId, ledgerBalance, customerName) => {
    setSelectedCustomer({ id: customerId, name: customerName, ledgerBalance });
    setOpenPaymentModal(true);
  };

  const handleClosePaymentModal = () => {
    setOpenPaymentModal(false);
    setSelectedCustomer(null);
  };

  const handleOpenLedgerModal = async (customerId, customerName) => {
    setLoading(true);

    try {
    
      setSelectedCustomer({ id: customerId, name: customerName });
      setOpenLedgerModal(true);
    } catch (error) {
      console.error("Error fetching ledger data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseLedgerModal = () => {
    setOpenLedgerModal(false);
    setSelectedCustomer(null);
  };

  const handleAddVendor = (vendor) => {
    console.log("Received vendor:", vendor);
    if (vendor && vendor._id) {
      setVendors((prevVendors) => [...prevVendors, vendor]);
      fetchVendors();
      setAddModalOpen(false);
    } else {
      console.error("Invalid vendor object:", vendor);
      toast.error("Invalid vendor data.");
    }
  };

  const handleOpenDeleteDialog = (row) => {
    setSelectedRow(row);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedRow(null);
  };

  const handleConfirmDelete = async () => {
    setLoadingOndelete(true);
    const vendorId = selectedRow;
    try {
      await apiClient.delete(`${API_BASE_URL}/vendors/${vendorId}`);
      setVendors((prev) => prev.filter((vendor) => vendor._id !== vendorId));
      setFilteredVendors((prev) =>
        prev.filter((vendor) => vendor._id !== vendorId)
      );
      toast.success("Vendor deleted successfully!");
      setSearchQuery("");
    } catch (error) {
      console.error("Error deleting vendor:", error);
      toast.error("Error deleting vendor.");
    } finally {
      setLoadingOndelete(false);
      handleCloseDeleteDialog();
    }
  };

  const handleOpenWatakModal = (id, ledgerBalance, name, type) => {
    setSelectedCustomer({ id, ledgerBalance, name, type });
    setWatakModalOpen(true);
  };

  const handleCloseWatakModal = () => {
    setWatakModalOpen(false);
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

  const columns = [
    {
      field: "serialNumber",
      headerName: "S.No",
      width: 70,
      renderCell: (params) => (
        <Typography>{params.row.serialNumber}</Typography>
      ),
    },
    { field: "name", headerName: "Name", width: 150 },
    { field: "ledgerBalance", headerName: "Ledger Balance", width: 80 },
    { field: "type", headerName: "Type", width: 150 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 4,
      minWidth: 250,
      renderCell: (params) => (
        <div>
          {window.innerWidth <= 600 ? (
            <>
              <IconButton
                color="primary"
                aria-label="add-watak"
                onClick={() =>
                  handleOpenWatakModal(
                    params.row._id,
                    params.row.ledgerBalance,
                    params.row.name,
                    params.row.type
                  )
                }
                style={{ marginRight: "8px" }}
              >
                <ReceiptIcon />
              </IconButton>
              <IconButton
                color="primary"
                aria-label="make-payment"
                onClick={() =>
                  handleOpenPaymentModal(
                    params.row._id,
                    params.row.lastBalance,
                    params.row.name
                  )
                }
                style={{ marginRight: "8px" }}
              >
                <PaymentIcon />
              </IconButton>
              <IconButton
                color="primary"
                aria-label="view-ledger"
                onClick={() =>
                  handleOpenLedgerModal(params.row._id, params.row.name)
                }
              >
                <AccountBalanceIcon />
              </IconButton>
              <IconButton
                color="primary"
                aria-label="delete-vendor"
                onClick={() => handleOpenDeleteDialog(params.row._id)}
                style={{ marginRight: "8px", color: "red" }}
              >
                <DeleteForeverOutlined />
              </IconButton>
            </>
          ) : (
            <>
              <Button
                variant="outlined"
              
                sx={{
                  borderRadius: 2, // Rounded corners
                  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)', // Subtle shadow
                  marginRight: "8px",
                  backgroundColor: "Green",
                  color:"white",

                  minWidth: "100px",fontSize:"12px"
                }}
                startIcon={<AddIcon />}
                onClick={() =>
                  handleOpenWatakModal(
                    params.row._id,
                    params.row.ledgerBalance,
                    params.row.name,
                    params.row.type
                  )
                }
              >
                Add Watak
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() =>
                  handleOpenPaymentModal(
                    params.row._id,
                    params.row.ledgerBalance,
                    params.row.name
                  )
                }
                sx={{
                  borderRadius: 2, // Rounded corners
                  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)", // Subtle shadow
                  marginRight: "8px",
                  minWidth: "100px",
                  fontSize: "12px",
                }}
                startIcon={<PaymentIcon />} // Use startIcon for proper alignment
              >
                Make Payment
              </Button>
              <Button
                variant="contained"
                color="primary"
                size="small" // Adjust the button to a smaller size
                onClick={() =>
                  handleOpenLedgerModal(params.row._id, params.row.name)
                }
                sx={{
                  borderRadius: 2, // Rounded corners
                  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)", // Subtle shadow
                  backgroundColor: "blue",
                  minWidth: "120px",
                  fontSize: "12px",
                }}
                startIcon={<AccountBalanceIcon />} // Use startIcon for proper alignment
              >
                View Ledger
              </Button>
              <Button
                variant="outlined"
                sx={{
                  borderRadius: 2, // Rounded corners
                  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)', // Subtle shadow
                  marginLeft: "8px",
                  color:"white",
                  backgroundColor: "Red",
                  minWidth: "100px",fontSize:"12px"
                }}

                startIcon={<DeleteForeverOutlined />}
                onClick={() => handleOpenDeleteDialog(params.row._id)}
              >
                Delete
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  const rows = filteredVendors
    .map((vendor, index) => {
      if (!vendor || !vendor._id) {
        console.error("Invalid vendor object:", vendor);
        return null;
      }
      return {
        id: vendor._id,
        serialNumber: index + 1,
        ...vendor,
      };
    })
    .filter((row) => row !== null);

  return (
    <Box sx={{ p: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        {window.innerWidth <= 600 ? (
          <Typography variant="h2" sx={{ fontSize: "13px" }}>
            Vendor List
          </Typography>
        ) : (
          <Typography variant="h4">Vendor List</Typography>
        )}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {window.innerWidth <= 600 ? (
            <>
              <IconButton
                color="primary"
                aria-label="add-vendor"
                onClick={() => setAddModalOpen(true)}
              >
                <PersonAddAltIcon />
              </IconButton>
              <IconButton
                color="primary"
                aria-label="view-wataks"
                onClick={() => navigate("/viewTodaysWataks")}
              >
                <GridViewHeadlineIcon />
              </IconButton>
            </>
          ) : (
            <>
              <Button
                variant="contained"
                color="primary"
                style={{ marginRight: "8px" }}
                startIcon={<PersonAddAltIcon />}
                onClick={() => setAddModalOpen(true)}
              >
                Add Vendor
              </Button>
              <Button
                variant="contained"
                color="primary"
                style={{ marginRight: "8px" }}
                startIcon={<GridViewHeadlineIcon />}
                onClick={() => navigate("/viewTodaysWataks")}
              >
                View Wataks
              </Button>
            </>
          )}
          <TextField
            variant="outlined"
            placeholder="Search Vendors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Box>
      </Box>
      <Box height={500} width="100%">
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="400px"
          >
            <FourSquare
              color={["#33CCCC", "#33CC36", "#B8CC33", "#FCCA00"]}
              size="small"
              text="Loading..."
              textColor={["#33CCCC", "#33CC36", "#B8CC33", "#FCCA00"]}
            />
          </Box>
        ) : (
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[5, 10, 20]}
            autoHeight
            disableSelectionOnClick
            localeText={{ noRowsLabel: "It's lonely here." }}
            sx={{pb:4}}
          />
        )}
      </Box>
      {isAddModalOpen && (
        <AddVendor
          onClose={() => setAddModalOpen(false)}
          onAdd={handleAddVendor}
        />
      )}
      {isWatakModalOpen && (
        <WatakModal
          open={isWatakModalOpen}
          handleClose={handleCloseWatakModal}
          customer={selectedCustomer}
          handleAddWatak={handleAddWatak}
        />
      )}
      {openDeleteDialog && (
        <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
          <DialogTitle>Delete Vendor</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this vendor?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
            <Button
              onClick={handleConfirmDelete}
              color="error"
              disabled={loadingOndelete}
            >
              {loadingOndelete ? "Deleting..." : "Delete"}
            </Button>
          </DialogActions>
        </Dialog>
      )}
      <ToastContainer />
      <WatakPaymentModal
        open={openPaymentModal}
        handleClose={handleClosePaymentModal}
        customer={selectedCustomer}
        fetchCustomers={fetchVendors}
      />

      <LedgerModal
      type="vendor"
        open={openLedgerModal}
        onClose={handleCloseLedgerModal}
        ledgerData={ledgerData}
        customerName={selectedCustomer?.name}
        customerId={selectedCustomer?.id}
      />
    </Box>
  );
};

export default VendorList;
