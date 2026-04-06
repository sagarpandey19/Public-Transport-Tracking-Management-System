// src/pages/Book.jsx
import React, { useEffect, useState, useMemo } from "react";
import "../styles/Book.css"
import {
  Container,
  Typography,
  Select,
  MenuItem,
  Card,
  CardContent,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Box,
  Autocomplete,
  InputAdornment,
  CircularProgress,
  Divider,
} from "@mui/material";
// Icons
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import PaymentsIcon from '@mui/icons-material/Payments';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';

import API from "../api/api";
import SeatMap from "../components/SeatMap";
import { useNavigate } from "react-router-dom";

// Helper to generate realistic dummy schedules for UI parity
function generateMockTimes(vehicleId, distanceKm, avgSpeed) {
  const charCode = vehicleId ? vehicleId.charCodeAt(vehicleId.length - 1) : 0;
  const startHour = 6 + (charCode % 15); // 6 AM to 8 PM
  
  const dist = distanceKm || 300; // default 300km
  const speed = avgSpeed || 50;   // default 50kmph
  
  const durationHours = dist / speed;
  const durationH = Math.floor(durationHours);
  const durationM = Math.round((durationHours - durationH) * 60);

  const endHour = startHour + durationH + Math.floor(durationM / 60);
  const endMin = (Math.round(durationM / 5) * 5) % 60; // round minutes to 5

  const formatAmPm = (h, m) => {
    const period = h >= 12 && h < 24 ? "PM" : "AM";
    let hr = h % 12;
    if (hr === 0) hr = 12;
    return `${hr.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`;
  };

  return {
    departureTime: formatAmPm(startHour, 0),
    eta: formatAmPm(endHour, endMin),
    durationText: `${durationH}h ${durationM}m`
  };
}

export default function Book() {
  const [routes, setRoutes] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  
  // Search State
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [bDate, setBDate] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [isSearched, setIsSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Booked/Interaction State
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [openSeatDialog, setOpenSeatDialog] = useState(false);
  const [activeVehicle, setActiveVehicle] = useState(null);
  const [reservedSeats, setReservedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [boardingStopIndex, setBoardingStopIndex] = useState("");
  const [droppingStopIndex, setDroppingStopIndex] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    API.get("/routes").then(r => setRoutes(r.data)).catch(console.error);
  }, []);

  // Compute unique cities for Autocomplete
  const uniqueCities = useMemo(() => {
    const cities = new Set();
    routes.forEach(r => {
      if (r.origin) cities.add(r.origin);
      if (r.destination) cities.add(r.destination);
    });
    return Array.from(cities).sort();
  }, [routes]);

  // Handle Search Execution
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!fromCity || !toCity) return;
    
    setIsLoading(true);
    setIsSearched(false);
    setVehicles([]);
    setBoardingStopIndex("");
    setDroppingStopIndex("");
    
    // Attempt internal matching
    const matchedRoute = routes.find(
      r => r.origin?.toLowerCase() === fromCity.toLowerCase() && 
           r.destination?.toLowerCase() === toCity.toLowerCase()
    );

    setSelectedRoute(matchedRoute || null);

    if (matchedRoute) {
      try {
        const res = await API.get(`/vehicles/by-route/${matchedRoute._id}`);
        setVehicles(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    
    setIsLoading(false);
    setIsSearched(true);
  };

  // Reset search results on criteria change
  useEffect(() => {
    setIsSearched(false);
    setVehicles([]);
    setSelectedRoute(null);
  }, [fromCity, toCity, bDate, passengers]);

  const openSeatMap = async (vehicle) => {
    try {
      const res = await API.get(`/bookings/vehicle/${vehicle._id}`);
      const bookedSeatNums = (res.data || []).flatMap(b => b.seatNumbers || []);
      setReservedSeats(bookedSeatNums);
    } catch (err) {
      setReservedSeats([]);
    }
    
    setActiveVehicle(vehicle);
    setSelectedSeats([]);
    setBoardingStopIndex("");
    setDroppingStopIndex("");
    setOpenSeatDialog(true);
  };

  const toggleSeat = (num) => {
    setSelectedSeats(prev => prev.includes(num) ? prev.filter(s => s !== num) : [...prev, num]);
  };

  // Calculated properties for confirmation logic
  const bookingPricePerSeat = useMemo(() => {
    if (!selectedRoute) return 200;
    const distance = selectedRoute.distanceKm || 200;
    return Math.round(distance * 2); // ₹2 per km
  }, [selectedRoute]);

  const totalPrice = selectedSeats.length * bookingPricePerSeat;

  const confirmSelection = () => {
    setOpenSeatDialog(false);

    const boardingStop = selectedRoute?.stops?.[boardingStopIndex] || null;
    const droppingStop = selectedRoute?.stops?.[droppingStopIndex] || null;

    navigate("/book/confirm", {
      state: {
        vehicle: activeVehicle,
        routeId: selectedRoute?._id,
        seatNumbers: selectedSeats,
        totalFare: totalPrice,
        boardingStop,
        droppingStop,
        date: bDate,
        passengers,
      }
    });
  };

  const isBookingValid = selectedSeats.length > 0 && boardingStopIndex !== "" && droppingStopIndex !== "";

  return (
    <Box className="book-page-wrapper">
      <Container className="book-container" sx={{ mt: 4 }}>
        <Box className="book-header">
          <Typography className="book-title" variant="h3">
            Search & Book Tickets
          </Typography>
          <Typography className="book-subtitle" variant="subtitle1">
            Premium travel experience starts here.
          </Typography>
        </Box>

        <Box component="form" className="form-section premium-shadow" onSubmit={handleSearch}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'stretch', mt: 1 }} className="search-grid">
            {/* From Source */}
            <Box sx={{ flex: { xs: '1 1 auto', md: 2 } }}>
              <Autocomplete
                options={uniqueCities}
                value={fromCity}
                onChange={(e, val) => setFromCity(val || "")}
                freeSolo
                onInputChange={(e, val) => setFromCity(val || "")}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="From"
                    placeholder="Source"
                    className="styled-input location-input"
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start" sx={{ pl: 1 }}>
                          <LocationOnIcon className="input-icon" sx={{ color: 'var(--color-primary-600)' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Box>

            {/* To Destination */}
            <Box sx={{ flex: { xs: '1 1 auto', md: 2 } }}>
              <Autocomplete
                options={uniqueCities}
                value={toCity}
                onChange={(e, val) => setToCity(val || "")}
                freeSolo
                onInputChange={(e, val) => setToCity(val || "")}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="To"
                    placeholder="Destination"
                    className="styled-input location-input"
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start" sx={{ pl: 1 }}>
                          <LocationOnIcon className="input-icon" sx={{ color: 'var(--color-primary-600)' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Box>

            {/* Date Selection */}
            <Box sx={{ flex: { xs: '1 1 auto', md: 1.2 } }}>
              <TextField
                className="styled-input"
                label="Date"
                type="date"
                fullWidth
                required
                value={bDate}
                onChange={(e) => setBDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ pl: 1 }}>
                      <CalendarMonthIcon className="input-icon" color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* Passengers */}
            <Box sx={{ minWidth: { md: '110px' }, flex: { xs: '1 1 auto', md: '0.8' } }}>
              <TextField
                className="styled-input"
                label="Passengers"
                type="number"
                fullWidth
                required
                inputProps={{ min: 1, max: 10 }}
                value={passengers}
                onChange={(e) => setPassengers(Number(e.target.value))}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon className="input-icon" color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* Submit Button */}
            <Box sx={{ display: 'flex', flex: { xs: '1 1 auto', md: 1.2 } }}>
              <Button
                type="submit"
                className="search-buses-btn"
                variant="contained"
                fullWidth
                size="large"
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
                disabled={isLoading}
              >
                {isLoading ? "Searching" : "Search Buses"}
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Empty State: No matches found */}
        {isSearched && vehicles.length === 0 && (
          <Box className="empty-state">
            <DirectionsBusIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6">No route matches found</Typography>
            <Typography variant="body2" color="textSecondary">
              We couldn't find any buses operating between {fromCity} and {toCity}. 
              Try reversing locations or searching for major cities.
            </Typography>
          </Box>
        )}

        {/* Empty State: Prompt search */}
        {!isSearched && !isLoading && (
          <Box className="empty-state pre-search" sx={{ pb: 8 }}>
            <Typography variant="h6">Enter your destinations to view available buses.</Typography>
            <img src="https://cdni.iconscout.com/illustration/premium/thumb/bus-ticket-booking-4487405-3738459.png" alt="Travel illustration" className="empty-state-img" />
          </Box>
        )}

        {/* Results */}
        {isSearched && vehicles.length > 0 && (
          <Box className="results-section">
            <Typography variant="h5" className="results-title">
              Available Buses ({fromCity} to {toCity})
            </Typography>
            <Grid container spacing={3}>
              {vehicles.map(v => {
                const distanceKm = selectedRoute?.distanceKm || 300;
                const avgSpeedKmph = selectedRoute?.avgSpeedKmph || 50;
                const times = generateMockTimes(v._id, distanceKm, avgSpeedKmph);
                return (
                  <Grid item xs={12} md={6} lg={4} key={v._id}>
                    <Card className="vehicle-card premium-card">
                      <CardContent>
                        <Box className="vehicle-header">
                          <Typography className="vehicle-title" variant="h6" sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                            <DirectionsBusIcon color="primary" /> {v.model}
                          </Typography>
                          <Box className="vehicle-reg-badge">
                            {v.regNumber}
                          </Box>
                        </Box>
                        <Typography className="vehicle-route">
                          {selectedRoute?.name || `${fromCity} → ${toCity}`}
                        </Typography>
                        
                        <Grid container spacing={2} className="vehicle-times-grid" sx={{ mb: 2 }}>
                          <Grid item xs={4}>
                            <Typography className="time-label"><AccessTimeIcon fontSize="small"/> Departure</Typography>
                            <Typography className="time-value">{times.departureTime}</Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography className="time-label"><HourglassBottomIcon fontSize="small"/> Duration</Typography>
                            <Typography className="time-value highlight-sub">{times.durationText}</Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography className="time-label"><AccessTimeIcon fontSize="small"/> ETA</Typography>
                            <Typography className="time-value">{times.eta}</Typography>
                          </Grid>
                        </Grid>

                        <Divider sx={{ mb: 2 }} />

                        <Box className="vehicle-details-bottom">
                          <Box className="seats-info">
                            <Typography className="detail-label">Seats Info</Typography>
                            <Typography className="detail-value">{v.capacity} Total</Typography>
                          </Box>
                          <Box className="price-info">
                            <Typography className="detail-label">Price</Typography>
                            <Typography className="detail-value highlight-price">₹{bookingPricePerSeat}</Typography>
                          </Box>
                        </Box>
                        
                        <Button 
                          className="select-seats-btn"
                          sx={{ mt: 3 }} 
                          variant="contained" 
                          fullWidth
                          startIcon={<EventSeatIcon />}
                          onClick={() => openSeatMap(v)}
                        >
                          Select Seats
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}

        {/* Premium Seat Dialog / Trip Summary */}
        <Dialog 
          className="seat-dialog premium-dialog"
          open={openSeatDialog} 
          onClose={() => setOpenSeatDialog(false)} 
          maxWidth="lg" 
          fullWidth
          PaperProps={{ sx: { minHeight: '65vh', borderRadius: '24px', overflow: 'hidden' } }}
        >
          <DialogTitle className="dialog-title">
            Trip Summary & Seat Selection
          </DialogTitle>
          <DialogContent className="dialog-content" sx={{ p: 0, overflowX: 'hidden' }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'stretch', height: '100%', minHeight: '65vh', maxHeight: '75vh' }}>
              {/* Left Side - Seat Map / Canvas */}
              <Box sx={{ 
                flex: '0 0 50%', 
                width: { xs: '100%', md: '50%' }, 
                background: '#ffffff', 
                backgroundImage: 'radial-gradient(var(--color-gray-200) 1.5px, transparent 1.5px)',
                backgroundSize: '24px 24px',
                borderRight: '1px solid var(--color-gray-200)',
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                py: 4, 
                overflowY: 'auto' 
              }}>
                <SeatMap 
                  capacity={activeVehicle?.capacity || 40} 
                  reserved={reservedSeats} 
                  selected={selectedSeats} 
                  onToggle={toggleSeat} 
                />
              </Box>

              {/* Right Side - Trip Summary */}
              <Box className="trip-summary-panel" sx={{ flex: '0 0 50%', width: { xs: '100%', md: '50%' }, p: { xs: 3, md: 5 }, background: '#f1f5f9', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', overflowY: 'auto' }}>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 800, color: 'var(--color-gray-900)' }}>Booking Details</Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 1 }}>
                  <Box className="summary-row" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1" sx={{ color: 'var(--color-gray-600)', fontWeight: 600 }}>Route</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 800, color: 'var(--color-gray-900)', fontSize: '1.1rem' }}>{fromCity} → {toCity}</Typography>
                  </Box>
                  
                  <Box className="summary-row" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1" sx={{ color: 'var(--color-gray-600)', fontWeight: 600 }}>Departure Date</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 800, color: 'var(--color-gray-900)', fontSize: '1.1rem' }}>{bDate || "Not Selected"}</Typography>
                  </Box>
                  
                  <Box className="summary-row" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1" sx={{ color: 'var(--color-gray-600)', fontWeight: 600 }}>Bus Model</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 800, color: 'var(--color-gray-900)', fontSize: '1.1rem' }}>{activeVehicle?.model}</Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Box className="summary-row" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', minHeight: '40px' }}>
                  <Typography variant="body1" sx={{ color: 'var(--color-gray-600)', fontWeight: 600 }}>Selected Seats</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 800, color: 'var(--color-primary-600)', textAlign: 'right', fontSize: '1.1rem' }}>
                    {selectedSeats.length > 0 ? selectedSeats.join(", ") : "None"} 
                    {selectedSeats.length > 0 && ` (${selectedSeats.length})`}
                  </Typography>
                </Box>

                {selectedSeats.length === 0 ? (
                  <Box className="empty-seat-helper" sx={{ mt: 4, p: 3, textAlign: 'center', background: 'rgba(216, 78, 85, 0.05)', borderRadius: '12px', border: '1px dashed var(--color-primary-300)' }}>
                    <EventSeatIcon sx={{ fontSize: 40, color: 'var(--color-primary-400)', mb: 1 }} />
                    <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 600 }}>
                      Please select seats to continue with your booking.
                    </Typography>
                  </Box>
                ) : (() => {
                  const validDroppingStops = (selectedRoute?.stops || [])
                    .map((s, idx) => ({ ...s, originalIdx: idx }))
                    .filter(s => boardingStopIndex === "" || s.originalIdx > Number(boardingStopIndex));

                  return (
                    <Box className="fade-in-section" sx={{ animation: 'fadeInUp 0.4s ease-out', mt: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'var(--color-gray-800)', display: 'block', letterSpacing: '1px', textTransform: 'uppercase' }}>
                        Boarding & Dropping Points
                      </Typography>

                      <FormControl fullWidth size="medium">
                        <InputLabel>Boarding Point</InputLabel>
                        <Select
                          value={boardingStopIndex}
                          label="Boarding Point"
                          onChange={(e) => {
                            setBoardingStopIndex(e.target.value);
                            setDroppingStopIndex(""); // Reset dropping point on change
                          }}
                          sx={{ 
                            borderRadius: '12px', 
                            background: 'white',
                            boxShadow: '0 2px 12px rgba(0,0,0,0.02)',
                            "& fieldset": { borderColor: 'var(--color-gray-200)' }
                          }}
                        >
                          <MenuItem value=""><em>-- Required --</em></MenuItem>
                          {selectedRoute?.stops?.map((s, idx) => (
                            <MenuItem key={`board-${idx}`} value={idx} disabled={idx === selectedRoute.stops.length - 1}>
                              {s.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl fullWidth size="medium">
                        <InputLabel>Dropping Point</InputLabel>
                        <Select
                          value={droppingStopIndex}
                          label="Dropping Point"
                          onChange={(e) => setDroppingStopIndex(e.target.value)}
                          sx={{ 
                            borderRadius: '12px', 
                            background: 'white',
                            boxShadow: '0 2px 12px rgba(0,0,0,0.02)',
                            "& fieldset": { borderColor: 'var(--color-gray-200)' }
                          }}
                          disabled={boardingStopIndex !== "" && validDroppingStops.length === 0}
                        >
                          <MenuItem value="">
                            <em>
                              {boardingStopIndex !== "" && validDroppingStops.length === 0 
                                ? "No further stops available" 
                                : "-- Required --"}
                            </em>
                          </MenuItem>
                          {validDroppingStops.map((s) => (
                            <MenuItem key={`drop-${s.originalIdx}`} value={s.originalIdx}>{s.name}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                    <Divider sx={{ my: 3 }} />

                    <Box sx={{ mt: 'auto' }}>
                      <Box className="summary-row" sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body1" sx={{ color: 'var(--color-gray-600)', fontWeight: 600 }}>Price per seat</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 800, color: 'var(--color-gray-900)', fontSize: '1.1rem' }}>₹{bookingPricePerSeat}</Typography>
                      </Box>

                      <Box className="total-amount-box" sx={{ 
                        p: 3, 
                        borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                      }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'var(--color-gray-600)', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Amount</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: 'var(--color-gray-900)', letterSpacing: '-0.5px' }}>₹{totalPrice}</Typography>
                      </Box>
                    </Box>
                  </Box>
                  );
                })()}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions className="dialog-actions" sx={{ p: 4, px: { md: 5 }, background: 'white', justifyContent: 'space-between' }}>
            <Button sx={{ fontWeight: 700, color: 'var(--color-gray-500)', fontSize: '1rem', '&:hover': { background: 'var(--color-gray-100)' } }} onClick={() => setOpenSeatDialog(false)}>
              Back
            </Button>
            <Button 
              className={`dialog-confirm-btn ${isBookingValid ? 'premium-btn' : ''}`}
              variant="contained" 
              onClick={confirmSelection} 
              disabled={!isBookingValid}
              startIcon={<PaymentsIcon />}
              size="large"
            >
              {isBookingValid ? `Confirm Booking (₹${totalPrice})` : 'Select Details'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}