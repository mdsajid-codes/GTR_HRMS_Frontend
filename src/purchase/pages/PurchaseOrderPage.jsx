// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   Paper,
//   Box,
//   Typography,
//   Button,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   IconButton,
//   CircularProgress,
//   TablePagination,
//   Alert,
// } from '@mui/material';
// import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
// import axios from 'axios';
// import PurchaseOrderForm from './PurchaseOrderForm';

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// const PurchaseOrderList = ({ onAdd, onEdit, onDelete, orders, loading, page, rowsPerPage, totalElements, handleChangePage, handleChangeRowsPerPage }) => {
//   return (
//     <Paper sx={{ p: 3, m: 2 }}>
//       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
//         <Typography variant="h5">Purchase Orders</Typography>
//         <Button variant="contained" startIcon={<AddIcon />} onClick={onAdd}>
//           Add New
//         </Button>
//       </Box>
//       {loading ? (
//         <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
//           <CircularProgress />
//         </Box>
//       ) : (
//         <>
//           <TableContainer>
//             <Table stickyHeader>
//               <TableHead>
//                 <TableRow>
//                   <TableCell>PO Number</TableCell>
//                   <TableCell>Date</TableCell>
//                   <TableCell>Supplier</TableCell>
//                   <TableCell>Status</TableCell>
//                   <TableCell align="right">Total Amount</TableCell>
//                   <TableCell align="center">Actions</TableCell>
//                 </TableRow>
//               </TableHead>
//               <TableBody>
//                 {orders.map((order) => (
//                   <TableRow key={order.id} hover>
//                     <TableCell>{order.poNumber}</TableCell>
//                     <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
//                     <TableCell>{order.supplierName || 'N/A'}</TableCell>
//                     <TableCell>{order.status}</TableCell>
//                     <TableCell align="right">{`${order.currency || ''} ${order.totalAmount.toFixed(2)}`}</TableCell>
//                     <TableCell align="center">
//                       <IconButton size="small" onClick={() => onEdit(order.id)} color="primary">
//                         <EditIcon />
//                       </IconButton>
//                       <IconButton size="small" onClick={() => onDelete(order.id)} color="error">
//                         <DeleteIcon />
//                       </IconButton>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </TableContainer>
//           <TablePagination
//             rowsPerPageOptions={[5, 10, 20]}
//             component="div"
//             count={totalElements}
//             rowsPerPage={rowsPerPage}
//             page={page}
//             onPageChange={handleChangePage}
//             onRowsPerPageChange={handleChangeRowsPerPage}
//           />
//         </>
//       )}
//     </Paper>
//   );
// };

// const PurchaseOrderPage = () => {
//   const [view, setView] = useState('list'); // 'list' or 'form'
//   const [selectedId, setSelectedId] = useState(null);
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(10);
//   const [totalElements, setTotalElements] = useState(0);

//   const fetchOrders = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const response = await axios.get(`${API_BASE_URL}/purchase/orders`, {
//         params: { page, size: rowsPerPage, sort: 'createdAt,desc' },
//       });
//       setOrders(response.data.content);
//       setTotalElements(response.data.totalElements);
//     } catch (err) {
//       setError('Failed to fetch purchase orders.');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   }, [page, rowsPerPage]);

//   useEffect(() => {
//     if (view === 'list') {
//       fetchOrders();
//     }
//   }, [view, fetchOrders]);

//   const handleAdd = () => {
//     setSelectedId(null);
//     setView('form');
//   };

//   const handleEdit = (id) => {
//     setSelectedId(id);
//     setView('form');
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm('Are you sure you want to delete this purchase order?')) {
//       try {
//         await axios.delete(`${API_BASE_URL}/purchase/orders/${id}`);
//         fetchOrders(); // Refresh list
//       } catch (err) {
//         setError('Failed to delete purchase order.');
//         console.error(err);
//       }
//     }
//   };

//   const handleBack = () => {
//     setView('list');
//     setSelectedId(null);
//   };

//   if (view === 'form') {
//     return <PurchaseOrderForm id={selectedId} onBack={handleBack} />;
//   }

//   return (
//     <>
//       {error && <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>}
//       <PurchaseOrderList onAdd={handleAdd} onEdit={handleEdit} onDelete={handleDelete} orders={orders} loading={loading} page={page} rowsPerPage={rowsPerPage} totalElements={totalElements} handleChangePage={(e, newPage) => setPage(newPage)} handleChangeRowsPerPage={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} />
//     </>
//   );
// };

// export default PurchaseOrderPage;





// src/purchase/pages/PurchaseOrderPage.jsx
// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   Paper,
//   Box,
//   Typography,
//   Button,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   IconButton,
//   CircularProgress,
//   TablePagination,
//   Alert,
//   TextField,
//   Grid,
//   MenuItem,
// } from '@mui/material';
// import {
//   Edit as EditIcon,
//   Delete as DeleteIcon,
//   Add as AddIcon,
//   Download as DownloadIcon,
// } from '@mui/icons-material';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import axios from 'axios';
// import PurchaseOrderForm from './PurchaseOrderForm';

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// const PurchaseOrderList = ({
//   onAdd,
//   onEdit,
//   onDelete,
//   orders,
//   loading,
//   page,
//   rowsPerPage,
//   totalElements,
//   handleChangePage,
//   handleChangeRowsPerPage,
//   filters,
//   setFilters,
//   onSearch,
// }) => {
//   return (
//     <LocalizationProvider dateAdapter={AdapterDateFns}>
//       <Paper sx={{ m: 2, overflow: 'hidden' }}>
//         {/* Top blue title bar – “Manage Purchase Order” */}
//         <Box
//           sx={{
//             bgcolor: '#34a5e4',
//             color: '#fff',
//             px: 3,
//             py: 1.7,
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'space-between',
//           }}
//         >
//           <Typography variant="h6" sx={{ fontWeight: 600 }}>
//             Manage Purchase Order
//           </Typography>
//           <Box sx={{ display: 'flex', gap: 1 }}>
//             <Button
//               variant="contained"
//               size="small"
//               startIcon={<DownloadIcon />}
//               sx={{
//                 bgcolor: '#0b84c5',
//                 '&:hover': { bgcolor: '#086fa5' },
//                 textTransform: 'none',
//               }}
//             >
//               Export
//             </Button>
//             <Button
//               variant="contained"
//               size="small"
//               startIcon={<AddIcon />}
//               onClick={onAdd}
//               sx={{
//                 bgcolor: '#007bff',
//                 '&:hover': { bgcolor: '#0062cc' },
//                 textTransform: 'none',
//               }}
//             >
//               New Purchase Order
//             </Button>
//           </Box>
//         </Box>

//         {/* Filter / search panel (Supplier, From, To, Search) */}
//         <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #e0e0e0', bgcolor: '#f8f8f8' }}>
//           <Grid container spacing={2} alignItems="center">
//             <Grid item xs={12} md={4}>
//               <TextField
//                 label="Supplier Name"
//                 variant="outlined"
//                 size="small"
//                 fullWidth
//                 value={filters.supplier || ''}
//                 onChange={(e) => setFilters((f) => ({ ...f, supplier: e.target.value }))}
//               />
//             </Grid>
//             <Grid item xs={12} md={3}>
//               <DatePicker
//                 label="From"
//                 value={filters.from}
//                 onChange={(newDate) => setFilters((f) => ({ ...f, from: newDate }))}
//                 renderInput={(params) => <TextField size="small" fullWidth {...params} />}
//               />
//             </Grid>
//             <Grid item xs={12} md={3}>
//               <DatePicker
//                 label="To"
//                 value={filters.to}
//                 onChange={(newDate) => setFilters((f) => ({ ...f, to: newDate }))}
//                 renderInput={(params) => <TextField size="small" fullWidth {...params} />}
//               />
//             </Grid>
//             <Grid item xs={12} md={2} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
//               <Button
//                 variant="contained"
//                 onClick={onSearch}
//                 sx={{ textTransform: 'none', px: 4, mt: { xs: 1, md: 0 } }}
//               >
//                 Search
//               </Button>
//             </Grid>
//           </Grid>
//         </Box>

//         {/* Page size + quick search */}
//         <Box
//           sx={{
//             px: 3,
//             py: 1.5,
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'space-between',
//             borderBottom: '1px solid #e0e0e0',
//           }}
//         >
//           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
//             <Typography variant="body2">Page Size</Typography>
//             <TextField
//               select
//               size="small"
//               value={rowsPerPage}
//               onChange={handleChangeRowsPerPage}
//               sx={{ width: 80 }}
//             >
//               {[10, 20, 50].map((size) => (
//                 <MenuItem key={size} value={size}>
//                   {size}
//                 </MenuItem>
//               ))}
//             </TextField>
//             <Typography variant="body2">
//               Total Records {totalElements}
//             </Typography>
//           </Box>

//           <Box sx={{ minWidth: 260 }}>
//             <TextField
//               size="small"
//               fullWidth
//               placeholder="Search"
//               // hook up to a client-side quick filter if you want
//             />
//           </Box>
//         </Box>

//         {loading ? (
//           <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
//             <CircularProgress />
//           </Box>
//         ) : (
//           <>
//             {/* Table – S.No., Date, Purchase Order#, etc. */}
//             <TableContainer sx={{ maxHeight: 420 }}>
//               <Table stickyHeader size="small">
//                 <TableHead>
//                   <TableRow>
//                     <TableCell>S.No.</TableCell>
//                     <TableCell>Date</TableCell>
//                     <TableCell>Purchase Order #</TableCell>
//                     <TableCell>Reference #</TableCell>
//                     <TableCell>Supplier Name</TableCell>
//                     <TableCell>Status</TableCell>
//                     <TableCell align="right">Amount</TableCell>
//                     <TableCell align="center">Operation</TableCell>
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {orders.length === 0 ? (
//                     <TableRow>
//                       <TableCell colSpan={8} align="center">
//                         No record available
//                       </TableCell>
//                     </TableRow>
//                   ) : (
//                     orders.map((order, index) => (
//                       <TableRow key={order.id} hover>
//                         <TableCell>{page * rowsPerPage + index + 1}</TableCell>
//                         <TableCell>
//                           {order.date
//                             ? new Date(order.date).toLocaleDateString()
//                             : ''}
//                         </TableCell>
//                         <TableCell>{order.poNumber}</TableCell>
//                         <TableCell>{order.reference || ''}</TableCell>
//                         <TableCell>{order.supplierName || 'N/A'}</TableCell>
//                         <TableCell>{order.status}</TableCell>
//                         <TableCell align="right">
//                           {(order.currency || '') +
//                             ' ' +
//                             (order.totalAmount || 0).toFixed(2)}
//                         </TableCell>
//                         <TableCell align="center">
//                           <IconButton
//                             size="small"
//                             onClick={() => onEdit(order.id)}
//                             color="primary"
//                           >
//                             <EditIcon fontSize="small" />
//                           </IconButton>
//                           <IconButton
//                             size="small"
//                             onClick={() => onDelete(order.id)}
//                             color="error"
//                           >
//                             <DeleteIcon fontSize="small" />
//                           </IconButton>
//                         </TableCell>
//                       </TableRow>
//                     ))
//                   )}
//                 </TableBody>
//               </Table>
//             </TableContainer>

//             {/* Pagination (bottom) */}
//             <TablePagination
//               rowsPerPageOptions={[10, 20, 50]}
//               component="div"
//               count={totalElements}
//               rowsPerPage={rowsPerPage}
//               page={page}
//               onPageChange={handleChangePage}
//               onRowsPerPageChange={handleChangeRowsPerPage}
//             />
//           </>
//         )}
//       </Paper>
//     </LocalizationProvider>
//   );
// };

// const PurchaseOrderPage = () => {
//   const [view, setView] = useState('list'); // 'list' or 'form'
//   const [selectedId, setSelectedId] = useState(null);
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(10);
//   const [totalElements, setTotalElements] = useState(0);

//   const [filters, setFilters] = useState({
//     supplier: '',
//     from: null,
//     to: null,
//   });

//   const fetchOrders = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//     //   const response = await axios.get(`${API_BASE_URL}/purchase/orders`, {
//     //     params: {
//     //       page,
//     //       size: rowsPerPage,
//     //       sort: 'createdAt,desc',
//     //       supplier: filters.supplier || undefined,
//     //       fromDate: filters.from
//     //         ? filters.from.toISOString().split('T')[0]
//     //         : undefined,
//     //       toDate: filters.to ? filters.to.toISOString().split('T')[0] : undefined,
//     //     },
//     //   });
//     const response = await axios.get(`${API_BASE_URL}/purchase/orders`, {
//   params: {
//     page,
//     size: rowsPerPage,
//     sort: 'createdAt,desc',
//   },
// });

//       setOrders(response.data.content || []);
//       setTotalElements(response.data.totalElements || 0);
//     } catch (err) {
//       setError('Failed to fetch purchase orders.');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   }, [page, rowsPerPage, filters]);

//   useEffect(() => {
//     if (view === 'list') {
//       fetchOrders();
//     }
//   }, [view, fetchOrders]);

//   const handleAdd = () => {
//     setSelectedId(null);
//     setView('form');
//   };

//   const handleEdit = (id) => {
//     setSelectedId(id);
//     setView('form');
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm('Are you sure you want to delete this purchase order?')) {
//       try {
//         await axios.delete(`${API_BASE_URL}/purchase/orders/${id}`);
//         fetchOrders();
//       } catch (err) {
//         setError('Failed to delete purchase order.');
//         console.error(err);
//       }
//     }
//   };

//   const handleBack = () => {
//     setView('list');
//     setSelectedId(null);
//   };

//   const handleChangePage = (e, newPage) => setPage(newPage);
//   const handleChangeRowsPerPage = (e) => {
//     setRowsPerPage(parseInt(e.target.value, 10));
//     setPage(0);
//   };

//   if (view === 'form') {
//     return <PurchaseOrderForm id={selectedId} onBack={handleBack} />;
//   }

//   return (
//     <>
//       {error && (
//         <Alert severity="error" sx={{ m: 2 }}>
//           {error}
//         </Alert>
//       )}
//       <PurchaseOrderList
//         onAdd={handleAdd}
//         onEdit={handleEdit}
//         onDelete={handleDelete}
//         orders={orders}
//         loading={loading}
//         page={page}
//         rowsPerPage={rowsPerPage}
//         totalElements={totalElements}
//         handleChangePage={handleChangePage}
//         handleChangeRowsPerPage={handleChangeRowsPerPage}
//         filters={filters}
//         setFilters={setFilters}
//         onSearch={() => {
//           setPage(0);
//           fetchOrders();
//         }}
//       />
//     </>
//   );
// };

// export default PurchaseOrderPage;



import React, { useState, useEffect, useCallback } from 'react';
import {
  Paper,
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  TablePagination,
  Alert,
  TextField,
  Grid,
  MenuItem,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import axios from 'axios';
import PurchaseOrderForm from './PurchaseOrderForm';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const PurchaseOrderList = ({
  onAdd,
  onEdit,
  onDelete,
  orders,
  loading,
  page,
  rowsPerPage,
  totalElements,
  handleChangePage,
  handleChangeRowsPerPage,
  filters,
  setFilters,
  onSearch,
}) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper sx={{ m: 2, overflow: 'hidden' }}>
        {/* Top blue title bar – “Manage Purchase Order” */}
        <Box
          sx={{
            bgcolor: '#34a5e4',
            color: '#fff',
            px: 3,
            py: 1.7,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Manage Purchase Order
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<DownloadIcon />}
              sx={{
                bgcolor: '#0b84c5',
                '&:hover': { bgcolor: '#086fa5' },
                textTransform: 'none',
              }}
            >
              Export
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={onAdd}
              sx={{
                bgcolor: '#007bff',
                '&:hover': { bgcolor: '#0062cc' },
                textTransform: 'none',
              }}
            >
              New Purchase Order
            </Button>
          </Box>
        </Box>

        {/* Filter / search panel (Supplier, From, To, Search) */}
        <Box
          sx={{
            px: 3,
            py: 2,
            borderBottom: '1px solid #e0e0e0',
            bgcolor: '#f8f8f8',
          }}
        >
          <Grid container spacing={2} alignItems="center" item>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Supplier Name"
                variant="outlined"
                size="small"
                fullWidth
                value={filters.supplier || ''}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, supplier: e.target.value }))
                }
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <DatePicker
                label="From"
                value={filters.from}
                onChange={(newDate) =>
                  setFilters((f) => ({ ...f, from: newDate }))
                }
                slotProps={{
                  textField: { size: 'small', fullWidth: true },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <DatePicker
                label="To"
                value={filters.to}
                onChange={(newDate) =>
                  setFilters((f) => ({ ...f, to: newDate }))
                }
                slotProps={{
                  textField: { size: 'small', fullWidth: true },
                }}
              />
            </Grid>
            <Grid
              size={{ xs: 12, md: 2 }}
              sx={{ textAlign: { xs: 'left', md: 'right' } }}
            >
              <Button
                variant="contained"
                onClick={onSearch}
                sx={{ textTransform: 'none', px: 4, mt: { xs: 1, md: 0 } }}
              >
                Search
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Page size + quick search */}
        <Box
          sx={{
            px: 3,
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #e0e0e0',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="body2">Page Size</Typography>
            <TextField
              select
              size="small"
              value={rowsPerPage}
              onChange={handleChangeRowsPerPage}
              sx={{ width: 80 }}
            >
              {[10, 20, 50].map((size) => (
                <MenuItem key={size} value={size}>
                  {size}
                </MenuItem>
              ))}
            </TextField>
            <Typography variant="body2">
              Total Records {totalElements}
            </Typography>
          </Box>

          <Box sx={{ minWidth: 260 }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Search"
              // hook up to a client-side quick filter if you want
            />
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Table */}
            <TableContainer sx={{ maxHeight: 420 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>S.No.</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Purchase Order #</TableCell>
                    <TableCell>Reference #</TableCell>
                    <TableCell>Supplier Name</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="center">Operation</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        No record available
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((order, index) => (
                      <TableRow key={order.id} hover>
                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                        <TableCell>
                          {order.date
                            ? new Date(order.date).toLocaleDateString()
                            : ''}
                        </TableCell>
                        <TableCell>{order.poNumber}</TableCell>
                        <TableCell>{order.reference || ''}</TableCell>
                        <TableCell>{order.supplierName || 'N/A'}</TableCell>
                        <TableCell>{order.status}</TableCell>
                        <TableCell align="right">
                          {(order.currency || '') +
                            ' ' +
                            (order.totalAmount || 0).toFixed(2)}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => onEdit(order.id)}
                            color="primary"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => onDelete(order.id)}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <TablePagination
              rowsPerPageOptions={[10, 20, 50]}
              component="div"
              count={totalElements}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>
    </LocalizationProvider>
  );
};

const PurchaseOrderPage = () => {
  const [view, setView] = useState('list'); // 'list' or 'form'
  const [selectedId, setSelectedId] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  const [filters, setFilters] = useState({
    supplier: '',
    from: null,
    to: null,
  });

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/purchase/orders`, { // Corrected URL
        params: {
          page,
          size: rowsPerPage,
          sort: 'createdAt,desc',
        },
      });

      setOrders(response.data.content || []);
      setTotalElements(response.data.totalElements || 0);
    } catch (err) {
      setError('Failed to fetch purchase orders.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, filters]); // Re-added filters to dependency array for future use

  useEffect(() => {
    if (view === 'list') {
      fetchOrders();
    }
  }, [view, fetchOrders]);

  const handleAdd = () => {
    setSelectedId(null);
    setView('form');
  };

  const handleEdit = (id) => {
    setSelectedId(id);
    setView('form');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this purchase order?')) {
      try {
        await axios.delete(`${API_BASE_URL}/purchase/orders/${id}`); // Corrected URL
        fetchOrders();
      } catch (err) {
        setError('Failed to delete purchase order.');
        console.error(err);
      }
    }
  };

  const handleBack = () => {
    setView('list');
    setSelectedId(null);
  };

  const handleChangePage = (e, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  if (view === 'form') {
    return <PurchaseOrderForm id={selectedId} onBack={handleBack} />;
  }

  return (
    <>
      {error && (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      )}
      <PurchaseOrderList
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        orders={orders}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalElements={totalElements}
        handleChangePage={handleChangePage}
        handleChangeRowsPerPage={handleChangeRowsPerPage}
        filters={filters}
        setFilters={setFilters}
        onSearch={() => {
          setPage(0);
          fetchOrders(); // This will now re-fetch without filter params
        }}
      />
    </>
  );
};

export default PurchaseOrderPage;
