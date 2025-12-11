// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   Paper,
//   Box,
//   Typography,
//   Grid,
//   TextField,
//   Button,
//   IconButton,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   CircularProgress,
//   MenuItem,
//   Checkbox,
// } from '@mui/material';
// import { ArrowBack as ArrowBackIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import axios from 'axios';

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// // --- Mock Data for Dropdowns ---
// // In a real app, you would fetch this data from your backend API endpoints
// const mockSuppliers = [
//   { id: 1, name: 'Global Tech Supplies' },
//   { id: 2, name: 'Innovate Hardware Inc.' },
// ];
// const mockItems = [
//   { id: 101, name: 'Raw Material A' },
//   { id: 102, name: 'Semi-Finished Good B' },
// ];
// const mockUnits = [
//   { id: 1, name: 'PCS' },
//   { id: 2, name: 'KG' },
//   { id: 3, name: 'LTR' },
// ];
// // --- End Mock Data ---

// const emptyItem = {
//   lineNumber: 1,
//   itemId: '',
//   description: '',
//   quantity: 0,
//   unitId: '',
//   rate: 0,
//   amount: 0,
//   taxExempt: false,
//   lineDiscount: 0,
// };

// const PurchaseOrderForm = ({ id, onBack }) => {
//   const [formData, setFormData] = useState({
//     orderCategory: 'Domestic',
//     supplierId: '',
//     poNumber: '',
//     reference: '',
//     date: new Date(),
//     discountMode: 'Without Discount',
//     currency: 'AED',
//     remark: '',
//     status: 'Draft',
//     items: [{ ...emptyItem }],
//     attachments: [],
//   });
//   const [loading, setLoading] = useState(false);
//   const isEditing = id != null;

//   const fetchPurchaseOrder = useCallback(async () => {
//     if (!isEditing) return;
//     setLoading(true);
//     try {
//       const response = await axios.get(`${API_BASE_URL}/purchase/orders/${id}`);
//       const { date, ...rest } = response.data;
//       setFormData({
//         ...rest,
//         date: new Date(date), // Ensure date is a Date object
//       });
//     } catch (error) {
//       console.error('Failed to fetch purchase order:', error);
//     } finally {
//       setLoading(false);
//     }
//   }, [id, isEditing]);

//   useEffect(() => {
//     fetchPurchaseOrder();
//   }, [fetchPurchaseOrder]);

//   const handleHeaderChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleDateChange = (newDate) => {
//     setFormData((prev) => ({ ...prev, date: newDate }));
//   };

//   const handleItemChange = (index, e) => {
//     const { name, value, type, checked } = e.target;
//     const newItems = [...formData.items];
//     const item = newItems[index];
//     item[name] = type === 'checkbox' ? checked : value;

//     // Recalculate amount based on backend logic (quantity * rate - discount)
//     const quantity = parseFloat(item.quantity) || 0;
//     const rate = parseFloat(item.rate) || 0;
//     const discount = parseFloat(item.lineDiscount) || 0;
//     item.amount = Math.max(0, quantity * rate - discount);

//     setFormData((prev) => ({ ...prev, items: newItems }));
//   };

//   const addItem = () => {
//     setFormData((prev) => ({
//       ...prev,
//       items: [...prev.items, { ...emptyItem, lineNumber: prev.items.length + 1 }],
//     }));
//   };

//   const removeItem = (index) => {
//     setFormData((prev) => ({
//       ...prev,
//       items: prev.items.filter((_, i) => i !== index),
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     // The backend expects a specific request DTO.
//     // We can build it from our form state.
//     const requestData = {
//       ...formData,
//       date: formData.date.toISOString().split('T')[0], // Format date to YYYY-MM-DD
//     };

//     try {
//       if (isEditing) {
//         await axios.put(`${API_BASE_URL}/purchase/orders/${id}`, requestData);
//       } else {
//         await axios.post(`${API_BASE_URL}/purchase/orders`, requestData);
//       }
//       onBack(); // Go back to the list view on success
//     } catch (error) {
//       console.error('Failed to save purchase order:', error);
//       // TODO: Show error to user via a snackbar or alert
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading && isEditing) {
//     return <CircularProgress />;
//   }

//   return (
//     <LocalizationProvider dateAdapter={AdapterDateFns}>
//       <Paper sx={{ p: 3, m: 2 }}>
//         <Box component="form" onSubmit={handleSubmit}>
//           <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
//             <IconButton onClick={onBack}>
//               <ArrowBackIcon />
//             </IconButton>
//             <Typography variant="h5" sx={{ ml: 1 }}>
//               {isEditing ? 'Edit Purchase Order' : 'Add New Purchase Order'}
//             </Typography>
//           </Box>

//           <Grid container spacing={2}>
//             <Grid item xs={12} sm={4}>
//               <TextField select label="Order Category" name="orderCategory" value={formData.orderCategory} onChange={handleHeaderChange} fullWidth>
//                 <MenuItem value="Domestic">Domestic</MenuItem>
//                 <MenuItem value="Imported">Imported</MenuItem>
//               </TextField>
//             </Grid>
//             <Grid item xs={12} sm={4}>
//               <TextField select label="Supplier" name="supplierId" value={formData.supplierId} onChange={handleHeaderChange} fullWidth>
//                 {mockSuppliers.map((s) => (
//                   <MenuItem key={s.id} value={s.id}>
//                     {s.name}
//                   </MenuItem>
//                 ))}
//               </TextField>
//             </Grid>
//             <Grid item xs={12} sm={4}>
//               <DatePicker label="PO Date" value={formData.date} onChange={handleDateChange} renderInput={(params) => <TextField {...params} fullWidth />} />
//             </Grid>
//             <Grid item xs={12} sm={4}>
//               <TextField label="PO Number" name="poNumber" value={formData.poNumber} onChange={handleHeaderChange} fullWidth />
//             </Grid>
//             <Grid item xs={12} sm={4}>
//               <TextField label="Reference" name="reference" value={formData.reference} onChange={handleHeaderChange} fullWidth />
//             </Grid>
//             <Grid item xs={12} sm={4}>
//               <TextField select label="Status" name="status" value={formData.status} onChange={handleHeaderChange} fullWidth>
//                 <MenuItem value="Draft">Draft</MenuItem>
//                 <MenuItem value="Confirmed">Confirmed</MenuItem>
//                 <MenuItem value="Cancelled">Cancelled</MenuItem>
//               </TextField>
//             </Grid>
//           </Grid>

// //           <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
// //             Items
// //           </Typography>
// //           <TableContainer>
// //             <Table size="small">
// //               <TableHead>
// //                 <TableRow>
// //                   <TableCell>Item</TableCell>
// //                   <TableCell>Description</TableCell>
// //                   <TableCell align="right">Qty</TableCell>
// //                   <TableCell>Unit</TableCell>
// //                   <TableCell align="right">Rate</TableCell>
// //                   <TableCell align="right">Discount</TableCell>
// //                   <TableCell align="right">Amount</TableCell>
// //                   <TableCell>Tax Exempt</TableCell>
// //                   <TableCell>Action</TableCell>
// //                 </TableRow>
// //               </TableHead>
// //               <TableBody>
// //                 {formData.items.map((item, index) => (
//                   <TableRow key={index}>
//                     <TableCell sx={{ minWidth: 150 }}>
//                       <TextField select size="small" name="itemId" value={item.itemId} onChange={(e) => handleItemChange(index, e)} fullWidth>
//                         {mockItems.map((i) => (
//                           <MenuItem key={i.id} value={i.id}>
//                             {i.name}
//                           </MenuItem>
//                         ))}
//                       </TextField>
//                     </TableCell>
//                     <TableCell><TextField size="small" name="description" value={item.description} onChange={(e) => handleItemChange(index, e)} fullWidth /></TableCell>
//                     <TableCell><TextField size="small" type="number" name="quantity" value={item.quantity} onChange={(e) => handleItemChange(index, e)} fullWidth /></TableCell>
//                     <TableCell sx={{ minWidth: 100 }}>
//                       <TextField select size="small" name="unitId" value={item.unitId} onChange={(e) => handleItemChange(index, e)} fullWidth>
//                         {mockUnits.map((u) => (
//                           <MenuItem key={u.id} value={u.id}>
//                             {u.name}
//                           </MenuItem>
//                         ))}
//                       </TextField>
//                     </TableCell>
//                     <TableCell><TextField size="small" type="number" name="rate" value={item.rate} onChange={(e) => handleItemChange(index, e)} fullWidth /></TableCell>
//                     <TableCell><TextField size="small" type="number" name="lineDiscount" value={item.lineDiscount} onChange={(e) => handleItemChange(index, e)} fullWidth /></TableCell>
//                     <TableCell align="right">{item.amount.toFixed(2)}</TableCell>
//                     <TableCell><Checkbox name="taxExempt" checked={item.taxExempt} onChange={(e) => handleItemChange(index, e)} /></TableCell>
//                     <TableCell>
//                       <IconButton size="small" onClick={() => removeItem(index)} color="error">
//                         <DeleteIcon />
//                       </IconButton>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </TableContainer>
//           <Button startIcon={<AddIcon />} onClick={addItem} sx={{ mt: 1 }}>
//             Add Item
//           </Button>

//           <Grid container spacing={2} sx={{ mt: 2 }}>
//             <Grid item xs={12}>
//               <TextField label="Remarks" name="remark" value={formData.remark} onChange={handleHeaderChange} multiline rows={3} fullWidth />
//             </Grid>
//           </Grid>

//           {/* Add attachment section here if needed */}

//           <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
//             <Button onClick={onBack} sx={{ mr: 1 }}>
//               Cancel
//             </Button>
//             <Button type="submit" variant="contained" disabled={loading}>
//               {loading ? <CircularProgress size={24} /> : 'Save Purchase Order'}
//             </Button>
//           </Box>
//         </Box>
//       </Paper>
//     </LocalizationProvider>
//   );
// };

// export default PurchaseOrderForm;




// src/purchase/pages/PurchaseOrderForm.jsx
// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   Paper,
//   Box,
//   Typography,
//   Grid,
//   TextField,
//   Button,
//   IconButton,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   CircularProgress,
//   MenuItem,
//   Checkbox,
//   RadioGroup,
//   FormControlLabel,
//   Radio,
// } from '@mui/material';
// import {
//   ArrowBack as ArrowBackIcon,
//   Delete as DeleteIcon,
//   Add as AddIcon,
// } from '@mui/icons-material';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import axios from 'axios';

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// // --- Mock Data – replace with real API calls if you have them ---
// const mockSuppliers = [
//   { id: 1, name: 'Global Tech Supplies' },
//   { id: 2, name: 'Innovate Hardware Inc.' },
// ];
// const mockCategories = [
//   { id: 1, name: 'HDPE Bags' },
//   { id: 2, name: 'LDPE Virgin Material' },
// ];
// const mockSubCategories = [
//   { id: 1, categoryId: 2, name: 'LD Bags/Film' },
//   { id: 2, categoryId: 2, name: 'Recycle' },
//   { id: 3, categoryId: 2, name: 'Virgin' },
// ];
// const mockItems = [
//   { id: 101, name: 'Raw Material A', code: 'RM-A' },
//   { id: 102, name: 'Semi-Finished Good B', code: 'SFG-B' },
// ];
// const mockUnits = [
//   { id: 1, name: 'PCS' },
//   { id: 2, name: 'KG' },
//   { id: 3, name: 'LTR' },
// ];
// // -------------------------------------------------------------

// const emptyItem = {
//   lineNumber: 1,
//   itemId: '',
//   description: '',
//   quantity: '',
//   unitId: '',
//   rate: '',
//   amount: 0,
//   taxExempt: false,
//   taxPercent: '',
//   lineDiscount: '',
// };

// const PurchaseOrderForm = ({ id, onBack }) => {
//   const [formData, setFormData] = useState({
//     orderCategory: 'Domestic', // Domestic / Imported
//     supplierId: '',
//     poNumber: '',
//     reference: '',
//     date: new Date(),
//     discountMode: 'Without Discount',
//     currency: 'AED',
//     remark: '',
//     status: 'Draft',
//     items: [{ ...emptyItem }],
//     otherCharges: '',
//     deliverTo: 'Organization',
//     terms: '',
//     notes: '',
//     emailTo: '',
//   });

//   const [loading, setLoading] = useState(false);
//   const isEditing = id != null;

//   const fetchPurchaseOrder = useCallback(async () => {
//     if (!isEditing) return;
//     setLoading(true);
//     try {
//       const response = await axios.get(`${API_BASE_URL}/purchase/orders/${id}`);
//       const { date, ...rest } = response.data;
//       setFormData({
//         ...formData,
//         ...rest,
//         date: date ? new Date(date) : new Date(),
//       });
//     } catch (error) {
//       console.error('Failed to fetch purchase order:', error);
//     } finally {
//       setLoading(false);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [id, isEditing]);

//   useEffect(() => {
//     fetchPurchaseOrder();
//   }, [fetchPurchaseOrder]);

//   const handleHeaderChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleDateChange = (newDate) => {
//     setFormData((prev) => ({ ...prev, date: newDate }));
//   };

//   const handleItemChange = (index, e) => {
//     const { name, value, type, checked } = e.target;
//     const newItems = [...formData.items];
//     const item = newItems[index];

//     item[name] = type === 'checkbox' ? checked : value;

//     const quantity = parseFloat(item.quantity) || 0;
//     const rate = parseFloat(item.rate) || 0;
//     const discount = parseFloat(item.lineDiscount) || 0;

//     item.amount = Math.max(0, quantity * rate - discount);

//     setFormData((prev) => ({ ...prev, items: newItems }));
//   };

//   const addItem = () => {
//     setFormData((prev) => ({
//       ...prev,
//       items: [
//         ...prev.items,
//         { ...emptyItem, lineNumber: prev.items.length + 1 },
//       ],
//     }));
//   };

//   const removeItem = (index) => {
//     setFormData((prev) => ({
//       ...prev,
//       items: prev.items.filter((_, i) => i !== index),
//     }));
//   };

//   const subtotal = formData.items.reduce(
//     (sum, item) => sum + (parseFloat(item.amount) || 0),
//     0
//   );
//   const totalDiscount = formData.items.reduce(
//     (sum, item) => sum + (parseFloat(item.lineDiscount) || 0),
//     0
//   );
//   const totalTax = formData.items.reduce((sum, item) => {
//     if (item.taxExempt) return sum;
//     const amt = parseFloat(item.amount) || 0;
//     const pct = parseFloat(item.taxPercent) || 0;
//     return sum + (amt * pct) / 100;
//   }, 0);
//   const otherCharges = parseFloat(formData.otherCharges) || 0;
//   const grossTotal = subtotal;
//   const grandTotal = grossTotal + totalTax + otherCharges;

//   const handleSubmit = async (e, statusOverride) => {
//     e.preventDefault();
//     setLoading(true);

//     const requestData = {
//       ...formData,
//       status: statusOverride || formData.status,
//       date: formData.date
//         ? formData.date.toISOString().split('T')[0]
//         : null,
//     };

//     try {
//       if (isEditing) {
//         await axios.put(`${API_BASE_URL}/purchase/orders/${id}`, requestData);
//       } else {
//         await axios.post(`${API_BASE_URL}/purchase/orders`, requestData);
//       }
//       onBack();
//     } catch (error) {
//       console.error('Failed to save purchase order:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading && isEditing) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
//         <CircularProgress />
//       </Box>
//     );
//   }

//   const selectedSupplier =
//     mockSuppliers.find((s) => String(s.id) === String(formData.supplierId)) ||
//     null;

//   return (
//     <LocalizationProvider dateAdapter={AdapterDateFns}>
//       <Paper sx={{ m: 2, overflow: 'hidden' }}>
//         {/* Top blue bar – title + back button */}
//         <Box
//           sx={{
//             bgcolor: '#34a5e4',
//             color: '#fff',
//             px: 3,
//             py: 1.7,
//             display: 'flex',
//             alignItems: 'center',
//           }}
//         >
//           <IconButton onClick={onBack} sx={{ color: '#fff', mr: 1 }}>
//             <ArrowBackIcon />
//           </IconButton>
//           <Typography variant="h6" sx={{ fontWeight: 600 }}>
//             {isEditing ? 'Edit Purchase Order' : 'Add New Purchase Order'}
//           </Typography>
//         </Box>

//         <Box
//           component="form"
//           onSubmit={(e) => handleSubmit(e, 'Confirmed')}
//           sx={{ p: 3, bgcolor: '#f8f8f8' }}
//         >
//           {/* Header section */}
//           <Box sx={{ bgcolor: '#fff', p: 2.5, mb: 2, border: '1px solid #e0e0e0' }}>
//             <Grid container spacing={2}>
//               <Grid item xs={12} md={3}>
//                 <TextField
//                   select
//                   label="Purchase Order Type"
//                   name="orderCategory"
//                   size="small"
//                   fullWidth
//                   value={formData.orderCategory}
//                   onChange={handleHeaderChange}
//                 >
//                   <MenuItem value="Domestic">Domestic</MenuItem>
//                   <MenuItem value="Imported">Imported</MenuItem>
//                 </TextField>
//               </Grid>

//               <Grid item xs={12} md={4}>
//                 <TextField
//                   select
//                   label="Supplier Name"
//                   name="supplierId"
//                   size="small"
//                   fullWidth
//                   value={formData.supplierId}
//                   onChange={handleHeaderChange}
//                   InputProps={{
//                     endAdornment: (
//                       <Button
//                         size="small"
//                         sx={{
//                           ml: 1,
//                           bgcolor: '#007bff',
//                           color: '#fff',
//                           '&:hover': { bgcolor: '#0062cc' },
//                           minWidth: 60,
//                           textTransform: 'none',
//                         }}
//                       >
//                         {formData.currency}
//                       </Button>
//                     ),
//                   }}
//                 >
//                   {mockSuppliers.map((s) => (
//                     <MenuItem key={s.id} value={s.id}>
//                       {s.name}
//                     </MenuItem>
//                   ))}
//                 </TextField>
//               </Grid>

//               <Grid item xs={12} md={2}>
//                 <TextField
//                   label="Purchase Order"
//                   size="small"
//                   fullWidth
//                   value={formData.poNumber || 'Auto Generate'}
//                   name="poNumber"
//                   onChange={handleHeaderChange}
//                   InputProps={{ readOnly: true }}
//                 />
//               </Grid>

//               <Grid item xs={12} md={3}>
//                 <DatePicker
//                   label="Date"
//                   value={formData.date}
//                   onChange={handleDateChange}
//                   renderInput={(params) => (
//                     <TextField size="small" fullWidth {...params} />
//                   )}
//                 />
//               </Grid>

//               <Grid item xs={12} md={3}>
//                 <TextField
//                   label="Reference"
//                   name="reference"
//                   size="small"
//                   fullWidth
//                   value={formData.reference}
//                   onChange={handleHeaderChange}
//                 />
//               </Grid>

//               <Grid item xs={12} md={9}>
//                 <TextField
//                   label="Remark"
//                   name="remark"
//                   size="small"
//                   fullWidth
//                   value={formData.remark}
//                   onChange={handleHeaderChange}
//                 />
//               </Grid>

//               <Grid item xs={12} md={4}>
//                 <TextField
//                   select
//                   label="Purchase Order Type"
//                   name="discountMode"
//                   size="small"
//                   fullWidth
//                   value={formData.discountMode}
//                   onChange={handleHeaderChange}
//                 >
//                   <MenuItem value="Without Discount">Without Discount</MenuItem>
//                   <MenuItem value="Item Discount">Item Discount</MenuItem>
//                   <MenuItem value="Bill Discount">Bill Discount</MenuItem>
//                 </TextField>
//               </Grid>

//               <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'flex-end' }}>
//                 <Button
//                   variant="contained"
//                   size="small"
//                   sx={{
//                     bgcolor: '#007bff',
//                     '&:hover': { bgcolor: '#0062cc' },
//                     textTransform: 'none',
//                   }}
//                 >
//                   Select Items From Indent Items
//                 </Button>
//               </Grid>
//             </Grid>
//           </Box>

//           {/* Item & Description section */}
//           <Box
//             sx={{
//               bgcolor: '#fff',
//               p: 2.5,
//               mb: 2,
//               border: '1px solid #e0e0e0',
//             }}
//           >
//             <Typography
//               variant="subtitle1"
//               sx={{ mb: 1.5, fontWeight: 600, borderBottom: '1px solid #eee', pb: 1 }}
//             >
//               Item &amp; Description
//             </Typography>

//             {/* Category / Subcategory / Item selection */}
//             <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
//               <Grid item xs={12} md={3}>
//                 <TextField
//                   select
//                   size="small"
//                   label="Category ..."
//                   fullWidth
//                 >
//                   {mockCategories.map((c) => (
//                     <MenuItem key={c.id} value={c.id}>
//                       {c.name}
//                     </MenuItem>
//                   ))}
//                 </TextField>
//               </Grid>
//               <Grid item xs={12} md={3}>
//                 <TextField
//                   select
//                   size="small"
//                   label="Subcategory ..."
//                   fullWidth
//                 >
//                   {mockSubCategories.map((sc) => (
//                     <MenuItem key={sc.id} value={sc.id}>
//                       {sc.name}
//                     </MenuItem>
//                   ))}
//                 </TextField>
//               </Grid>
//               <Grid item xs={12} md={2}>
//                 <TextField
//                   size="small"
//                   label="Items Code"
//                   fullWidth
//                   disabled
//                   value={
//                     mockItems.find(
//                       (i) => String(i.id) === String(formData.items[0].itemId)
//                     )?.code || ''
//                   }
//                 />
//               </Grid>
//               <Grid item xs={12} md={4}>
//                 <TextField
//                   select
//                   size="small"
//                   label="Items"
//                   fullWidth
//                   value={formData.items[0].itemId}
//                   onChange={(e) => handleItemChange(0, e)}
//                   name="itemId"
//                 >
//                   {mockItems.map((i) => (
//                     <MenuItem key={i.id} value={i.id}>
//                       {i.name}
//                     </MenuItem>
//                   ))}
//                 </TextField>
//               </Grid>
//               <Grid item xs={12}>
//                 <TextField
//                   size="small"
//                   label="Description"
//                   fullWidth
//                   multiline
//                   rows={2}
//                   value={formData.items[0].description}
//                   onChange={(e) => handleItemChange(0, e)}
//                   name="description"
//                 />
//               </Grid>
//             </Grid>

//             {/* Items table (similar to screenshot row layout) */}
//             <TableContainer sx={{ borderTop: '1px solid #eee', mt: 1 }}>
//               <Table size="small">
//                 <TableHead>
//                   <TableRow>
//                     <TableCell>Item</TableCell>
//                     <TableCell>Quantity</TableCell>
//                     <TableCell>Rate</TableCell>
//                     <TableCell>Amount</TableCell>
//                     <TableCell>Tax Value</TableCell>
//                     <TableCell>Tax Exempt</TableCell>
//                     <TableCell align="center">Action</TableCell>
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {formData.items.map((item, index) => (
//                     <TableRow key={index}>
//                       <TableCell sx={{ minWidth: 180 }}>
//                         <TextField
//                           select
//                           size="small"
//                           name="itemId"
//                           fullWidth
//                           value={item.itemId}
//                           onChange={(e) => handleItemChange(index, e)}
//                         >
//                           {mockItems.map((i) => (
//                             <MenuItem key={i.id} value={i.id}>
//                               {i.name}
//                             </MenuItem>
//                           ))}
//                         </TextField>
//                       </TableCell>
//                       <TableCell sx={{ width: 120 }}>
//                         <TextField
//                           size="small"
//                           type="number"
//                           name="quantity"
//                           fullWidth
//                           value={item.quantity}
//                           onChange={(e) => handleItemChange(index, e)}
//                         />
//                       </TableCell>
//                       <TableCell sx={{ width: 120 }}>
//                         <TextField
//                           size="small"
//                           type="number"
//                           name="rate"
//                           fullWidth
//                           value={item.rate}
//                           onChange={(e) => handleItemChange(index, e)}
//                         />
//                       </TableCell>
//                       <TableCell sx={{ width: 120 }}>
//                         <TextField
//                           size="small"
//                           type="number"
//                           name="lineDiscount"
//                           label="Discount"
//                           fullWidth
//                           value={item.lineDiscount}
//                           onChange={(e) => handleItemChange(index, e)}
//                         />
//                         <Typography variant="body2" sx={{ mt: 0.5, textAlign: 'right' }}>
//                           {item.amount.toFixed(2)}
//                         </Typography>
//                       </TableCell>
//                       <TableCell sx={{ width: 140 }}>
//                         <TextField
//                           size="small"
//                           type="number"
//                           name="taxPercent"
//                           fullWidth
//                           placeholder="%"
//                           value={item.taxPercent}
//                           onChange={(e) => handleItemChange(index, e)}
//                         />
//                       </TableCell>
//                       <TableCell sx={{ width: 110 }}>
//                         <Checkbox
//                           name="taxExempt"
//                           checked={item.taxExempt}
//                           onChange={(e) => handleItemChange(index, e)}
//                         />
//                       </TableCell>
//                       <TableCell align="center" sx={{ width: 80 }}>
//                         <IconButton
//                           size="small"
//                           color="error"
//                           onClick={() => removeItem(index)}
//                         >
//                           <DeleteIcon fontSize="small" />
//                         </IconButton>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                   <TableRow>
//                     <TableCell colSpan={7}>
//                       <Button
//                         startIcon={<AddIcon />}
//                         onClick={addItem}
//                         size="small"
//                         sx={{ textTransform: 'none' }}
//                       >
//                         Add
//                       </Button>
//                     </TableCell>
//                   </TableRow>
//                 </TableBody>
//               </Table>
//             </TableContainer>

//             {/* Totals area on the right like screenshot */}
//             <Grid container justifyContent="flex-end" sx={{ mt: 2 }}>
//               <Grid item xs={12} md={4}>
//                 <Table size="small">
//                   <TableBody>
//                     <TableRow>
//                       <TableCell>Sub Total</TableCell>
//                       <TableCell align="right">
//                         {subtotal.toFixed(2)}
//                       </TableCell>
//                     </TableRow>
//                     <TableRow>
//                       <TableCell>Total Discount</TableCell>
//                       <TableCell align="right">
//                         {totalDiscount.toFixed(2)}
//                       </TableCell>
//                     </TableRow>
//                     <TableRow>
//                       <TableCell>Gross Total</TableCell>
//                       <TableCell align="right">
//                         {grossTotal.toFixed(2)}
//                       </TableCell>
//                     </TableRow>
//                     <TableRow>
//                       <TableCell>Total Tax</TableCell>
//                       <TableCell align="right">
//                         {totalTax.toFixed(2)}
//                       </TableCell>
//                     </TableRow>
//                     <TableRow>
//                       <TableCell>
//                         <TextField
//                           size="small"
//                           label="Other Charges"
//                           name="otherCharges"
//                           value={formData.otherCharges}
//                           onChange={handleHeaderChange}
//                           fullWidth
//                         />
//                       </TableCell>
//                       <TableCell align="right">
//                         {otherCharges.toFixed(2)}
//                       </TableCell>
//                     </TableRow>
//                     <TableRow>
//                       <TableCell>
//                         <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
//                           Total
//                         </Typography>
//                       </TableCell>
//                       <TableCell align="right">
//                         <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
//                           {grandTotal.toFixed(2)}
//                         </Typography>
//                       </TableCell>
//                     </TableRow>
//                   </TableBody>
//                 </Table>
//               </Grid>
//             </Grid>
//           </Box>

//           {/* Attachments / deliver to / terms / notes / email */}
//           <Box
//             sx={{
//               bgcolor: '#fff',
//               p: 2.5,
//               border: '1px solid #e0e0e0',
//             }}
//           >
//             <Grid container spacing={2}>
//               {/* Attach file(s) */}
//               <Grid item xs={12} md={4}>
//                 <Typography variant="subtitle2" sx={{ mb: 1 }}>
//                   Attach File(s)
//                 </Typography>
//                 <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
//                   <Button variant="outlined" component="label" size="small">
//                     Choose File
//                     <input type="file" hidden multiple />
//                   </Button>
//                   <Button variant="contained" size="small">
//                     Upload
//                   </Button>
//                 </Box>
//                 <Typography variant="caption" sx={{ mt: 0.5, display: 'block' }}>
//                   You can upload a maximum of 5 files, 5MB each
//                 </Typography>
//               </Grid>

//               {/* Deliver To */}
//               <Grid item xs={12} md={4}>
//                 <Typography variant="subtitle2" sx={{ mb: 1 }}>
//                   Deliver To
//                 </Typography>
//                 <RadioGroup
//                   row
//                   name="deliverTo"
//                   value={formData.deliverTo}
//                   onChange={handleHeaderChange}
//                 >
//                   <FormControlLabel
//                     value="Organization"
//                     control={<Radio size="small" />}
//                     label="Organization"
//                   />
//                   <FormControlLabel
//                     value="Customer"
//                     control={<Radio size="small" />}
//                     label="Customer"
//                   />
//                 </RadioGroup>
//                 <TextField
//                   size="small"
//                   fullWidth
//                   value={
//                     formData.deliverTo === 'Organization'
//                       ? 'Tact Plastic Industries LLC'
//                       : selectedSupplier?.name || ''
//                   }
//                   sx={{ mt: 1 }}
//                 />
//                 <Button
//                   size="small"
//                   sx={{ mt: 0.5, textTransform: 'none' }}
//                 >
//                   Change destination to deliver
//                 </Button>
//               </Grid>

//               {/* Terms & Conditions */}
//               <Grid item xs={12} md={4}>
//                 <Typography variant="subtitle2" sx={{ mb: 1 }}>
//                   Terms &amp; Conditions
//                 </Typography>
//                 <TextField
//                   multiline
//                   rows={4}
//                   size="small"
//                   fullWidth
//                   name="terms"
//                   value={formData.terms}
//                   onChange={handleHeaderChange}
//                   placeholder="Mention your company's Terms and Conditions."
//                 />
//               </Grid>

//               {/* Notes */}
//               <Grid item xs={12} md={8}>
//                 <Typography variant="subtitle2" sx={{ mb: 1 }}>
//                   Notes
//                 </Typography>
//                 <TextField
//                   multiline
//                   rows={3}
//                   size="small"
//                   fullWidth
//                   name="notes"
//                   value={formData.notes}
//                   onChange={handleHeaderChange}
//                   placeholder="Will be displayed on purchase order"
//                 />
//               </Grid>

//               {/* Email To */}
//               <Grid item xs={12} md={4}>
//                 <Typography variant="subtitle2" sx={{ mb: 1 }}>
//                   Email To
//                 </Typography>
//                 <TextField
//                   size="small"
//                   fullWidth
//                   name="emailTo"
//                   value={formData.emailTo}
//                   onChange={handleHeaderChange}
//                   placeholder="saleem@tactplast.com"
//                 />
//               </Grid>
//             </Grid>
//           </Box>

//           {/* Footer buttons */}
//           <Box
//             sx={{
//               mt: 2,
//               display: 'flex',
//               justifyContent: 'flex-end',
//               gap: 1,
//             }}
//           >
//             <Button onClick={onBack}>Cancel</Button>
//             <Button
//               variant="contained"
//               type="button"
//               disabled={loading}
//               sx={{ textTransform: 'none' }}
//               onClick={(e) => handleSubmit(e, 'Draft')}
//             >
//               {loading ? <CircularProgress size={20} /> : 'Save as Draft'}
//             </Button>
//             <Button
//               variant="contained"
//               color="success"
//               type="submit"
//               disabled={loading}
//               sx={{ textTransform: 'none' }}
//             >
//               {loading ? <CircularProgress size={20} /> : 'Save'}
//             </Button>
//           </Box>
//         </Box>
//       </Paper>
//     </LocalizationProvider>
//   );
// };

// export default PurchaseOrderForm;



import React, { useState, useEffect, useCallback } from 'react';
import {
  Paper,
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  MenuItem,
  Checkbox,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// --- Mock Data – replace with real API calls if you have them ---
const mockSuppliers = [
  { id: 1, name: 'Global Tech Supplies' },
  { id: 2, name: 'Innovate Hardware Inc.' },
];
const mockCategories = [
  { id: 1, name: 'HDPE Bags' },
  { id: 2, name: 'LDPE Virgin Material' },
];
const mockSubCategories = [
  { id: 1, categoryId: 2, name: 'LD Bags/Film' },
  { id: 2, categoryId: 2, name: 'Recycle' },
  { id: 3, categoryId: 2, name: 'Virgin' },
];
const mockItems = [
  { id: 101, name: 'Raw Material A', code: 'RM-A' },
  { id: 102, name: 'Semi-Finished Good B', code: 'SFG-B' },
];

const emptyItem = {
  lineNumber: 1,
  itemId: '',
  description: '',
  quantity: '',
  unitId: '',
  rate: '',
  amount: 0,
  taxExempt: false,
  taxPercent: '',
  lineDiscount: '',
};

const PurchaseOrderForm = ({ id, onBack }) => {
  const [formData, setFormData] = useState({
    orderCategory: 'Domestic', // Domestic / Imported
    supplierId: '',
    poNumber: '',
    reference: '',
    date: new Date(),
    discountMode: 'Without Discount',
    currency: 'AED',
    remark: '',
    status: 'Draft',
    items: [{ ...emptyItem }],
    otherCharges: '',
    deliverTo: 'Organization',
    terms: '',
    notes: '',
    emailTo: '',
  });

  const [loading, setLoading] = useState(false);
  const isEditing = id != null;

  const fetchPurchaseOrder = useCallback(async () => {
    if (!isEditing) return;
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/purchase/orders/${id}`);
      const { date, items, ...rest } = response.data;

      const mappedItems =
        (items || []).map((it, index) => ({
          lineNumber: it.lineNumber ?? index + 1,
          itemId: it.itemId ?? '',
          description: it.description ?? '',
          quantity:
            it.quantity !== null && it.quantity !== undefined
              ? String(it.quantity)
              : '',
          unitId: it.unitId ?? '',
          rate:
            it.rate !== null && it.rate !== undefined
              ? String(it.rate)
              : '',
          amount: Number(it.amount ?? 0),
          taxExempt: it.taxExempt ?? false,
          taxPercent:
            it.taxPercent !== null && it.taxPercent !== undefined
              ? String(it.taxPercent)
              : '',
          lineDiscount:
            it.lineDiscount !== null && it.lineDiscount !== undefined
              ? String(it.lineDiscount)
              : '',
        })) || [];

      setFormData((prev) => ({
        ...prev,
        ...rest,
        supplierId: rest.supplierId ?? '',
        date: date ? new Date(date) : new Date(),
        items: mappedItems.length ? mappedItems : [{ ...emptyItem }],
      }));
    } catch (error) {
      console.error('Failed to fetch purchase order:', error);
    } finally {
      setLoading(false);
    }
  }, [id, isEditing]);

  useEffect(() => {
    fetchPurchaseOrder();
  }, [fetchPurchaseOrder]);

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (newDate) => {
    setFormData((prev) => ({ ...prev, date: newDate }));
  };

  const handleItemChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    const newItems = [...formData.items];
    const item = newItems[index];

    item[name] = type === 'checkbox' ? checked : value;

    const quantity = parseFloat(item.quantity) || 0;
    const rate = parseFloat(item.rate) || 0;
    const discount = parseFloat(item.lineDiscount) || 0;

    item.amount = Math.max(0, quantity * rate - discount);

    setFormData((prev) => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { ...emptyItem, lineNumber: prev.items.length + 1 },
      ],
    }));
  };

  const removeItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const subtotal = formData.items.reduce(
    (sum, item) => sum + (parseFloat(item.amount) || 0),
    0
  );
  const totalDiscount = formData.items.reduce(
    (sum, item) => sum + (parseFloat(item.lineDiscount) || 0),
    0
  );
  const totalTax = formData.items.reduce((sum, item) => {
    if (item.taxExempt) return sum;
    const amt = parseFloat(item.amount) || 0;
    const pct = parseFloat(item.taxPercent) || 0;
    return sum + (amt * pct) / 100;
  }, 0);
  const otherCharges = parseFloat(formData.otherCharges) || 0;
  const grossTotal = subtotal;
  const grandTotal = grossTotal + totalTax + otherCharges;

  const handleSubmit = async (e, statusOverride) => {
    e.preventDefault();
    setLoading(true);

    // Build DTO matching PurPurchaseOrderRequest
    const requestData = {
      orderCategory: formData.orderCategory || 'Domestic',
      supplierId: formData.supplierId || null,
      poNumber: formData.poNumber || null,
      reference: formData.reference || null,
      date: formData.date
        ? formData.date.toISOString().split('T')[0]
        : null,
      discountMode: formData.discountMode || 'Without Discount',
      currency: formData.currency || 'AED',
      remark: formData.remark || '',
      status: statusOverride || formData.status || 'Draft',
      createdBy: formData.createdBy || 'system',
      items: formData.items.map((item, index) => ({
        lineNumber: item.lineNumber ?? index + 1,
        categoryId: item.categoryId || null,
        subCategoryId: item.subCategoryId || null,
        itemId: item.itemId || null,
        description: item.description || '',
        quantity:
          item.quantity === '' || item.quantity === null
            ? null
            : Number(item.quantity),
        unitId: item.unitId || null,
        rate:
          item.rate === '' || item.rate === null
            ? null
            : Number(item.rate),
        taxId: item.taxId || null,
        taxExempt: item.taxExempt ?? false,
        taxPercent:
          item.taxPercent === '' || item.taxPercent === null
            ? null
            : Number(item.taxPercent),
        lineDiscount:
          item.lineDiscount === '' || item.lineDiscount === null
            ? null
            : Number(item.lineDiscount),
      })),
      attachments: [],
    };

    try {
      if (isEditing) {
        await axios.put(
          `${API_BASE_URL}/purchase/orders/${id}`,
          requestData
        );
      } else {
        await axios.post(
          `${API_BASE_URL}/purchase/orders`,
          requestData
        );
      }
      onBack();
    } catch (error) {
      console.error('Failed to save purchase order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const selectedSupplier =
    mockSuppliers.find(
      (s) => String(s.id) === String(formData.supplierId)
    ) || null;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper sx={{ m: 2, overflow: 'hidden' }}>
        {/* Top blue bar – title + back button */}
        <Box
          sx={{
            bgcolor: '#34a5e4',
            color: '#fff',
            px: 3,
            py: 1.7,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <IconButton onClick={onBack} sx={{ color: '#fff', mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {isEditing ? 'Edit Purchase Order' : 'Add New Purchase Order'}
          </Typography>
        </Box>

        <Box
          component="form"
          onSubmit={(e) => handleSubmit(e, 'Confirmed')}
          sx={{ p: 3, bgcolor: '#f8f8f8' }}
        >
          {/* Header section */}
          <Box
            sx={{
              bgcolor: '#fff',
              p: 2.5,
              mb: 2,
              border: '1px solid #e0e0e0',
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <TextField
                  select
                  label="Purchase Order Type"
                  name="orderCategory"
                  size="small"
                  fullWidth
                  value={formData.orderCategory ?? ''}
                  onChange={handleHeaderChange}
                >
                  <MenuItem value="Domestic">Domestic</MenuItem>
                  <MenuItem value="Imported">Imported</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  select
                  label="Supplier Name"
                  name="supplierId"
                  size="small"
                  fullWidth
                  value={formData.supplierId ?? ''}
                  onChange={handleHeaderChange}
                  InputProps={{
                    endAdornment: (
                      <Button
                        size="small"
                        sx={{
                          ml: 1,
                          bgcolor: '#007bff',
                          color: '#fff',
                          '&:hover': { bgcolor: '#0062cc' },
                          minWidth: 60,
                          textTransform: 'none',
                        }}
                      >
                        {formData.currency}
                      </Button>
                    ),
                  }}
                >
                  {mockSuppliers.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={2}>
                <TextField
                  label="Purchase Order"
                  size="small"
                  fullWidth
                  value={formData.poNumber || 'Auto Generate'}
                  name="poNumber"
                  onChange={handleHeaderChange}
                  InputProps={{ readOnly: true }}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <DatePicker
                  label="Date"
                  value={formData.date}
                  onChange={handleDateChange}
                  slotProps={{
                    textField: { size: 'small', fullWidth: true },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  label="Reference"
                  name="reference"
                  size="small"
                  fullWidth
                  value={formData.reference}
                  onChange={handleHeaderChange}
                />
              </Grid>

              <Grid item xs={12} md={9}>
                <TextField
                  label="Remark"
                  name="remark"
                  size="small"
                  fullWidth
                  value={formData.remark}
                  onChange={handleHeaderChange}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  select
                  label="Purchase Order Type"
                  name="discountMode"
                  size="small"
                  fullWidth
                  value={formData.discountMode ?? ''}
                  onChange={handleHeaderChange}
                >
                  <MenuItem value="Without Discount">Without Discount</MenuItem>
                  <MenuItem value="Item Discount">Item Discount</MenuItem>
                  <MenuItem value="Bill Discount">Bill Discount</MenuItem>
                </TextField>
              </Grid>

              <Grid
                item xs={12} md={4}
                sx={{ display: 'flex', alignItems: 'flex-end' }}
              >
                <Button
                  variant="contained"
                  size="small"
                  sx={{
                    bgcolor: '#007bff',
                    '&:hover': { bgcolor: '#0062cc' },
                    textTransform: 'none',
                  }}
                >
                  Select Items From Indent Items
                </Button>
              </Grid>
            </Grid>
          </Box>

          {/* Item & Description section */}
          <Box
            sx={{
              bgcolor: '#fff',
              p: 2.5,
              mb: 2,
              border: '1px solid #e0e0e0',
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                mb: 1.5,
                fontWeight: 600,
                borderBottom: '1px solid #eee',
                pb: 1,
              }}
            >
              Item &amp; Description
            </Typography>

            {/* Category / Subcategory / Item selection */}
            <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Grid item xs={12} md={3}>
                <TextField select size="small" label="Category ..." fullWidth>
                  {mockCategories.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  select
                  size="small"
                  label="Subcategory ..."
                  fullWidth
                >
                  {mockSubCategories.map((sc) => (
                    <MenuItem key={sc.id} value={sc.id}>
                      {sc.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  size="small"
                  label="Items Code"
                  fullWidth
                  disabled
                  value={
                    mockItems.find(
                      (i) => String(i.id) === String(formData.items[0].itemId)
                    )?.code || ''
                  }
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  select
                  size="small"
                  label="Items"
                  fullWidth
                  value={formData.items[0].itemId ?? ''}
                  onChange={(e) => handleItemChange(0, e)}
                  name="itemId"
                >
                  {mockItems.map((i) => (
                    <MenuItem key={i.id} value={i.id}>
                      {i.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  size="small"
                  label="Description"
                  fullWidth
                  multiline
                  rows={2}
                  value={formData.items[0].description}
                  onChange={(e) => handleItemChange(0, e)}
                  name="description"
                />
              </Grid>
            </Grid>

            {/* Items table */}
            <TableContainer sx={{ borderTop: '1px solid #eee', mt: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Rate</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Tax Value</TableCell>
                    <TableCell>Tax Exempt</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formData.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell sx={{ minWidth: 180 }}>
                        <TextField
                          select
                          size="small"
                          name="itemId"
                          fullWidth
                          value={item.itemId ?? ''}
                          onChange={(e) => handleItemChange(index, e)}
                        >
                          {mockItems.map((i) => (
                            <MenuItem key={i.id} value={i.id}>
                              {i.name}
                            </MenuItem>
                          ))}
                        </TextField>
                      </TableCell>
                      <TableCell sx={{ width: 120 }}>
                        <TextField
                          size="small"
                          type="number"
                          name="quantity"
                          fullWidth
                          value={item.quantity ?? ''}
                          onChange={(e) => handleItemChange(index, e)}
                        />
                      </TableCell>
                      <TableCell sx={{ width: 120 }}>
                        <TextField
                          size="small"
                          type="number"
                          name="rate"
                          fullWidth
                          value={item.rate ?? ''}
                          onChange={(e) => handleItemChange(index, e)}
                        />
                      </TableCell>
                      <TableCell sx={{ width: 120 }}>
                        <TextField
                          size="small"
                          type="number"
                          name="lineDiscount"
                          label="Discount"
                          fullWidth
                          value={item.lineDiscount ?? ''}
                          onChange={(e) => handleItemChange(index, e)}
                        />
                        <Typography
                          variant="body2"
                          sx={{ mt: 0.5, textAlign: 'right' }}
                        >
                          {Number(item.amount || 0).toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ width: 140 }}>
                        <TextField
                          size="small"
                          type="number"
                          name="taxPercent"
                          fullWidth
                          placeholder="%"
                          value={item.taxPercent ?? ''}
                          onChange={(e) => handleItemChange(index, e)}
                        />
                      </TableCell>
                      <TableCell sx={{ width: 110 }}>
                        <Checkbox
                          name="taxExempt"
                          checked={Boolean(item.taxExempt)}
                          onChange={(e) => handleItemChange(index, e)}
                        />
                      </TableCell>
                      <TableCell align="center" sx={{ width: 80 }}>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeItem(index)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={7}>
                      <Button
                        startIcon={<AddIcon />}
                        onClick={addItem}
                        size="small"
                        sx={{ textTransform: 'none' }}
                      >
                        Add
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            {/* Totals area on the right */}
            <Grid container justifyContent="flex-end" sx={{ mt: 2 }}>
              <Grid item xs={12} md={4}>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>Sub Total</TableCell>
                      <TableCell align="right">
                        {subtotal.toFixed(2)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Total Discount</TableCell>
                      <TableCell align="right">
                        {totalDiscount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Gross Total</TableCell>
                      <TableCell align="right">
                        {grossTotal.toFixed(2)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Total Tax</TableCell>
                      <TableCell align="right">
                        {totalTax.toFixed(2)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <TextField
                          size="small"
                          label="Other Charges"
                          name="otherCharges"
                          value={formData.otherCharges}
                          onChange={handleHeaderChange}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell align="right">
                        {otherCharges.toFixed(2)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 700 }}
                        >
                          Total
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 700 }}
                        >
                          {grandTotal.toFixed(2)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Grid>
            </Grid>
          </Box>

          {/* Attachments / deliver to / terms / notes / email */}
          <Box
            sx={{
              bgcolor: '#fff',
              p: 2.5,
              border: '1px solid #e0e0e0',
            }}
          >
            <Grid container spacing={2}>
              {/* Attach file(s) */}
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Attach File(s)
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Button variant="outlined" component="label" size="small">
                    Choose File
                    <input type="file" hidden multiple />
                  </Button>
                  <Button variant="contained" size="small">
                    Upload
                  </Button>
                </Box>
                <Typography
                  variant="caption"
                  sx={{ mt: 0.5, display: 'block' }}
                >
                  You can upload a maximum of 5 files, 5MB each
                </Typography>
              </Grid>

              {/* Deliver To */}
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Deliver To
                </Typography>
                <RadioGroup
                  row
                  name="deliverTo"
                  value={formData.deliverTo}
                  onChange={handleHeaderChange}
                >
                  <FormControlLabel
                    value="Organization"
                    control={<Radio size="small" />}
                    label="Organization"
                  />
                  <FormControlLabel
                    value="Customer"
                    control={<Radio size="small" />}
                    label="Customer"
                  />
                </RadioGroup>
                <TextField
                  size="small"
                  fullWidth
                  value={
                    formData.deliverTo === 'Organization'
                      ? 'Tact Plastic Industries LLC'
                      : selectedSupplier?.name || ''
                  }
                  sx={{ mt: 1 }}
                />
                <Button
                  size="small"
                  sx={{ mt: 0.5, textTransform: 'none' }}
                >
                  Change destination to deliver
                </Button>
              </Grid>

              {/* Terms & Conditions */}
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Terms &amp; Conditions
                </Typography>
                <TextField
                  multiline
                  rows={4}
                  size="small"
                  fullWidth
                  name="terms"
                  value={formData.terms}
                  onChange={handleHeaderChange}
                  placeholder="Mention your company's Terms and Conditions."
                />
              </Grid>

              {/* Notes */}
              <Grid item xs={12} md={8}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Notes
                </Typography>
                <TextField
                  multiline
                  rows={3}
                  size="small"
                  fullWidth
                  name="notes"
                  value={formData.notes}
                  onChange={handleHeaderChange}
                  placeholder="Will be displayed on purchase order"
                />
              </Grid>

              {/* Email To */}
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Email To
                </Typography>
                <TextField
                  size="small"
                  fullWidth
                  name="emailTo"
                  value={formData.emailTo}
                  onChange={handleHeaderChange}
                  placeholder="saleem@tactplast.com"
                />
              </Grid>
            </Grid>
          </Box>

          {/* Footer buttons */}
          <Box
            sx={{
              mt: 2,
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 1,
            }}
          >
            <Button onClick={onBack}>Cancel</Button>
            <Button
              variant="contained"
              type="button"
              disabled={loading}
              sx={{ textTransform: 'none' }}
              onClick={(e) => handleSubmit(e, 'Draft')}
            >
              {loading ? <CircularProgress size={20} /> : 'Save as Draft'}
            </Button>
            <Button
              variant="contained"
              color="success"
              type="submit"
              disabled={loading}
              sx={{ textTransform: 'none' }}
            >
              {loading ? <CircularProgress size={20} /> : 'Save'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </LocalizationProvider>
  );
};

export default PurchaseOrderForm;
