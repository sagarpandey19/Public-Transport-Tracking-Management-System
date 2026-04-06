import React, { useEffect, useState } from "react";
import {
  Container, Typography, Card, CardContent, Box, Button, TextField, 
  Select, MenuItem, FormControl, InputLabel, Switch, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import API from "../api/api";
import "../styles/AdminCoupons.css";

const emptyForm = {
  code: "", discountType: "flat", discountValue: "", expiryDate: "",
  minBookingAmount: "", tag: "", minSeats: "", maxDiscount: "", usageLimit: ""
};

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const fetchCoupons = async () => {
    try {
      const res = await API.get("/coupons");
      setCoupons(res.data);
    } catch (err) {
      showToast("Failed to load coupons", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const showToast = (message, severity = "success") => {
    setToast({ open: true, message, severity });
  };

  const handleCreate = async () => {
    if (!form.code || !form.discountValue || !form.expiryDate) {
      showToast("Code, value, and expiry are required", "error");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        code: form.code.toUpperCase().trim(),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        expiryDate: form.expiryDate,
        minBookingAmount: form.minBookingAmount ? Number(form.minBookingAmount) : 0,
        tag: form.tag || null,
        minSeats: form.minSeats ? Number(form.minSeats) : null,
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
      };
      await API.post("/coupons", payload);
      showToast(`Coupon ${payload.code} created`);
      setForm(emptyForm);
      setFormOpen(false);
      fetchCoupons();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to create coupon", "error");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (coupon) => {
    try {
      await API.put(`/coupons/${coupon._id}`, { isActive: !coupon.isActive });
      showToast(`${coupon.code} ${coupon.isActive ? "deactivated" : "activated"}`);
      fetchCoupons();
    } catch {
      showToast("Failed to update", "error");
    }
  };

  const deleteCoupon = async (coupon) => {
    if (!window.confirm(`Delete ${coupon.code}?`)) return;
    try {
      await API.delete(`/coupons/${coupon._id}`);
      showToast(`${coupon.code} deleted`);
      fetchCoupons();
    } catch {
      showToast("Failed to delete", "error");
    }
  };

  const updateField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }} className="admin-coupons-wrapper">
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: "var(--admin-text)" }}>
            Coupon Management
          </Typography>
          <Typography variant="body2" sx={{ color: "var(--admin-text-muted)", mt: 0.5 }}>
            {coupons.length} coupon{coupons.length !== 1 ? "s" : ""} configured
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setFormOpen(true)}
          sx={{ borderRadius: "12px", textTransform: "none", fontWeight: 700, px: 3 }}
        >
          Create Coupon
        </Button>
      </Box>

      {/* Coupons Table */}
      <Card sx={{ borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Code</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Value</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Tag</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Expiry</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Usage</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Active</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {coupons.map((c) => (
                <TableRow key={c._id} sx={{ "&:hover": { background: "var(--admin-surface-2)" } }}>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <LocalOfferIcon sx={{ fontSize: 18, color: "var(--color-primary-500)" }} />
                      <Typography sx={{ fontWeight: 700, fontFamily: "monospace", fontSize: "0.95rem" }}>
                        {c.code}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={c.discountType} size="small" variant="outlined"
                      color={c.discountType === "percentage" ? "primary" : "default"}
                      sx={{ borderRadius: "6px", fontWeight: 600, fontSize: "0.75rem" }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {c.discountType === "percentage" ? `${c.discountValue}%` : `₹${c.discountValue}`}
                    {c.maxDiscount ? ` (max ₹${c.maxDiscount})` : ""}
                  </TableCell>
                  <TableCell>
                    {c.tag ? <Chip label={c.tag} size="small" sx={{ borderRadius: "6px", fontWeight: 600, fontSize: "0.7rem" }} /> : "—"}
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.85rem" }}>
                    {new Date(c.expiryDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.85rem" }}>
                    {c.usedCount}{c.usageLimit ? `/${c.usageLimit}` : ""}
                  </TableCell>
                  <TableCell>
                    <Switch checked={c.isActive} onChange={() => toggleActive(c)} size="small" />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" color="error" onClick={() => deleteCoupon(c)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {coupons.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} sx={{ textAlign: "center", py: 6, color: "var(--admin-text-muted)" }}>
                    No coupons yet. Create your first one!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Create Coupon Dialog */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth
        className="admin-coupons-dialog"
        PaperProps={{ sx: { borderRadius: "16px" } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Create New Coupon</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField label="Coupon Code" value={form.code} onChange={(e) => updateField("code", e.target.value.toUpperCase())}
              size="small" placeholder="e.g. SUMMER25" required />
            
            <Box sx={{ display: "flex", gap: 2 }}>
              <FormControl size="small" sx={{ flex: 1 }}>
                <InputLabel>Type</InputLabel>
                <Select value={form.discountType} label="Type" onChange={(e) => updateField("discountType", e.target.value)}>
                  <MenuItem value="flat">Flat (₹)</MenuItem>
                  <MenuItem value="percentage">Percentage (%)</MenuItem>
                </Select>
              </FormControl>
              <TextField label="Value" type="number" value={form.discountValue} onChange={(e) => updateField("discountValue", e.target.value)}
                size="small" sx={{ flex: 1 }} required />
            </Box>

            <TextField label="Expiry Date" type="date" value={form.expiryDate} onChange={(e) => updateField("expiryDate", e.target.value)}
              size="small" InputLabelProps={{ shrink: true }} required />

            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField label="Min Booking (₹)" type="number" value={form.minBookingAmount} onChange={(e) => updateField("minBookingAmount", e.target.value)}
                size="small" sx={{ flex: 1 }} />
              <TextField label="Usage Limit" type="number" value={form.usageLimit} onChange={(e) => updateField("usageLimit", e.target.value)}
                size="small" sx={{ flex: 1 }} placeholder="Unlimited" />
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
              <FormControl size="small" sx={{ flex: 1 }}>
                <InputLabel>Tag</InputLabel>
                <Select value={form.tag} label="Tag" onChange={(e) => updateField("tag", e.target.value)}>
                  <MenuItem value="">None</MenuItem>
                  <MenuItem value="SUMMER">SUMMER</MenuItem>
                  <MenuItem value="FESTIVE">FESTIVE</MenuItem>
                  <MenuItem value="COMBO">COMBO</MenuItem>
                  <MenuItem value="SOLO">SOLO</MenuItem>
                  <MenuItem value="WELCOME">WELCOME</MenuItem>
                </Select>
              </FormControl>
              <TextField label="Min Seats" type="number" value={form.minSeats} onChange={(e) => updateField("minSeats", e.target.value)}
                size="small" sx={{ flex: 1 }} placeholder="Any" />
            </Box>

            {form.discountType === "percentage" && (
              <TextField label="Max Discount Cap (₹)" type="number" value={form.maxDiscount} onChange={(e) => updateField("maxDiscount", e.target.value)}
                size="small" />
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => { setFormOpen(false); setForm(emptyForm); }} sx={{ textTransform: "none" }}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={saving}
            sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 700 }}>
            {saving ? <CircularProgress size={20} /> : "Create Coupon"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast */}
      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast(t => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={toast.severity} onClose={() => setToast(t => ({ ...t, open: false }))}
          sx={{ borderRadius: "12px", fontWeight: 600 }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
