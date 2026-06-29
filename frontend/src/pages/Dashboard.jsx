import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/Sidebar';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { 
  Building, BedDouble, CalendarDays, Share2, Plus, 
  Trash2, Edit, Copy, ExternalLink, X, AlertTriangle, Menu, Check 
} from 'lucide-react';

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", 
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", 
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", 
  "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", 
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", 
  "Ladakh", "Lakshadweep", "Puducherry"
];

// Validation Schemas
const propertySchema = z.object({
  propertyName: z.string().min(1, 'Property Name is required'),
  contactNumber: z.string().min(10, 'Contact Number must be at least 10 digits'),
  whatsappNumber: z.string().min(10, 'WhatsApp Number must be at least 10 digits'),
  state: z.string().min(1, 'State is required'),
  region: z.string().min(1, 'Region is required'),
  address: z.string().min(1, 'Address is required'),
  emailId: z.string().email('Invalid email address'),
  backgroundImageUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

const roomSchema = z.object({
  roomName: z.string().min(1, 'Room Name is required'),
  noOfRooms: z.number().min(1, 'Must have at least 1 room'),
  priceRoomOnly: z.number().min(0, 'Price cannot be negative'),
  priceBreakfast: z.number().min(0, 'Price cannot be negative'),
  priceBreakfastDinner: z.number().min(0, 'Price cannot be negative'),
  priceAllMeals: z.number().min(0, 'Price cannot be negative'),
});

const bookingSchema = z.object({
  roomId: z.string().min(1, 'Room selection is required'),
  checkinDate: z.string().min(1, 'Check-in date is required'),
  noOfNights: z.number().min(1, 'Must block for at least 1 night'),
  guestName: z.string().min(1, 'Guest Name is required'),
  guestEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  guestPhone: z.string().optional().or(z.literal('')),
  noOfGuests: z.number().min(1, 'Must have at least 1 guest'),
  specialRequests: z.string().optional(),
});

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};
const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 }
};

const Dashboard = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [activeTab, setActiveTab] = useState('properties');
  const [loading, setLoading] = useState(true);

  // Modal States
  const [showPropModal, setShowPropModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [editRoom, setEditRoom] = useState(null);
  const [editProperty, setEditProperty] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Forms
  const { register: regProp, handleSubmit: handlePropSubmit, reset: resetProp, control: controlProp, setValue: setPropValue, formState: { errors: propErrors } } = useForm({
    resolver: zodResolver(propertySchema)
  });

  const { register: regRoom, handleSubmit: handleRoomSubmit, reset: resetRoom, setValue: setRoomValue, formState: { errors: roomErrors } } = useForm({
    resolver: zodResolver(roomSchema)
  });

  const { register: regBooking, handleSubmit: handleBookingSubmit, reset: resetBooking, watch: watchBooking, formState: { errors: bookingErrors } } = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: { noOfNights: 1, noOfGuests: 1 }
  });

  const watchCheckin = watchBooking('checkinDate');
  const watchNights = watchBooking('noOfNights');

  useEffect(() => {
    fetchData();
    
    // Check for Stripe success redirect
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const cancelled = urlParams.get('upgrade');
    
    if (sessionId) {
      verifyStripeSession(sessionId);
    } else if (cancelled === 'cancelled') {
      toast.error('Upgrade cancelled.');
      // Remove query param
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const verifyStripeSession = async (sessionId) => {
    try {
      setLoading(true);
      const res = await api.post('/stripe/upgrade-success', { session_id: sessionId });
      if (res.data.success) {
        toast.success(res.data.message);
        // User needs to re-login or reload to get new token, or just force reload
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      }
    } catch (error) {
      toast.error('Failed to verify payment. Please contact support.');
    } finally {
      // Remove query param
      window.history.replaceState({}, '', window.location.pathname);
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    try {
      const res = await api.post('/stripe/create-checkout-session');
      window.location.href = res.data.url;
    } catch (error) {
      toast.error('Failed to initiate checkout.');
    }
  };

  useEffect(() => {
    if (selectedProperty) {
      fetchRoomsAndBookings(selectedProperty._id);
    }
  }, [selectedProperty]);

  const fetchData = async () => {
    try {
      const res = await api.get('/properties');
      setProperties(res.data);
      if (res.data.length > 0) {
        setSelectedProperty(res.data[0]);
      }
    } catch (error) {
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoomsAndBookings = async (propertyId) => {
    try {
      const [roomsRes, bookingsRes] = await Promise.all([
        api.get(`/rooms?propertyId=${propertyId}`),
        api.get(`/bookings?propertyId=${propertyId}`)
      ]);
      setRooms(roomsRes.data);
      setBookings(bookingsRes.data);
    } catch (error) {
      toast.error('Failed to load rooms or bookings');
    }
  };

  // Property handlers
  const onSaveProperty = async (data) => {
    try {
      if (editProperty) {
        const res = await api.patch(`/properties/${editProperty._id}`, data);
        toast.success('Property updated successfully');
        setProperties(properties.map(p => p._id === editProperty._id ? res.data : p));
        setSelectedProperty(res.data);
      } else {
        if (user.plan === 'free' && properties.length >= 1) {
          setShowUpgradeModal(true);
          return;
        }
        const res = await api.post('/properties', data);
        toast.success('Property added successfully');
        setProperties([...properties, res.data]);
        setSelectedProperty(res.data);
      }
      setShowPropModal(false);
      resetProp();
      setEditProperty(null);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save property');
    }
  };

  // Room handlers
  const onSaveRoom = async (data) => {
    try {
      if (editRoom) {
        const res = await api.patch(`/rooms/${editRoom._id}`, { ...data, propertyId: selectedProperty._id });
        toast.success('Room updated successfully');
        setRooms(rooms.map(r => r._id === editRoom._id ? res.data : r));
      } else {
        if (user.plan === 'free' && rooms.length >= 4) {
          setShowUpgradeModal(true);
          return;
        }
        const res = await api.post('/rooms', { ...data, propertyId: selectedProperty._id });
        toast.success('Room added successfully');
        setRooms([...rooms, res.data]);
      }
      setShowRoomModal(false);
      setEditRoom(null);
      resetRoom();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save room');
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!confirm('Are you sure you want to delete this room type? This will also cancel all bookings for this room.')) return;
    try {
      await api.delete(`/rooms/${roomId}`);
      toast.success('Room deleted');
      setRooms(rooms.filter(r => r._id !== roomId));
      setBookings(bookings.filter(b => b.roomId !== roomId));
    } catch (error) {
      toast.error('Failed to delete room');
    }
  };

  // Booking handlers
  const onSaveBooking = async (data) => {
    try {
      const res = await api.post('/bookings', { ...data, propertyId: selectedProperty._id });
      toast.success('Room blocked / booked successfully');
      fetchRoomsAndBookings(selectedProperty._id);
      setShowBookingModal(false);
      resetBooking();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save booking');
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!confirm('Cancel/Delete this booking?')) return;
    try {
      await api.delete(`/bookings/${bookingId}`);
      toast.success('Booking deleted');
      setBookings(bookings.filter(b => b._id !== bookingId));
    } catch (error) {
      toast.error('Failed to delete booking');
    }
  };

  const getCheckoutDate = () => {
    if (!watchCheckin || !watchNights) return '';
    const date = new Date(watchCheckin);
    date.setDate(date.getDate() + Number(watchNights));
    return date.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1 flex items-center justify-center text-muted-foreground animate-pulse">
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      <main className="flex-1 overflow-y-auto px-6 pb-6 pt-24 lg:p-10 md:px-10 md:pb-10 space-y-8">
        
        {/* Header / Property Selector */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              {activeTab === 'properties' && 'Property Overview'}
              {activeTab === 'rooms' && 'Room Inventory'}
              {activeTab === 'bookings' && 'Booking Management'}
            </h1>
            <p className="text-muted-foreground mt-1">Manage your inventory across all channels.</p>
          </div>
          
          <div className="flex items-center gap-2 bg-card p-1.5 rounded-2xl shadow-lg border border-border/50 shrink-0">
            <div className="flex items-center gap-2 px-2 border-r min-w-[200px]">
              <Building className="w-4 h-4 text-primary shrink-0" />
              <Select 
                value={selectedProperty?._id || ''} 
                onValueChange={(val) => setSelectedProperty(properties.find(p => p._id === val))}
              >
                <SelectTrigger className="w-full border-0 shadow-none focus:ring-0 text-sm font-semibold p-0 h-auto bg-transparent data-[state=open]:bg-transparent focus:outline-none">
                  <SelectValue placeholder="No properties" />
                </SelectTrigger>
                <SelectContent>
                  {properties.length === 0 ? (
                    <SelectItem value="none" disabled>No properties</SelectItem>
                  ) : (
                    properties.map(p => (
                      <SelectItem key={p._id} value={p._id}>{p.propertyName}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => { setEditProperty(null); resetProp(); setShowPropModal(true); }} size="sm" variant="secondary" className="px-3">
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </div>
        </div>

        {selectedProperty ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              
              {/* === PROPERTIES TAB === */}
              {activeTab === 'properties' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Public Link Card */}
                  <div className="lg:col-span-1">
                    <Card className="shadow-xl border-slate-200 bg-white/80 backdrop-blur-xl h-full group overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                      <CardContent className="p-8 flex flex-col items-center text-center space-y-6 relative z-10">
                        <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200">
                          <QRCodeSVG value={`${window.location.origin}/p/${selectedProperty.publicSlug}`} size={120} />
                        </div>
                        <div>
                          <h4 className="font-heading font-extrabold text-xl mb-1 tracking-tight text-slate-900">Your Public Portal</h4>
                          <p className="text-sm text-slate-500 font-medium">
                            Share this link with guests to let them check availability instantly.
                          </p>
                        </div>
                        <div className="flex flex-col w-full gap-3 pt-6 border-t border-slate-100">
                          <Button variant="outline" className="w-full justify-center bg-white border-slate-300 hover:bg-slate-50 text-slate-700" onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/p/${selectedProperty.publicSlug}`);
                            toast.success('Link copied to clipboard!');
                          }}>
                            <Copy className="w-4 h-4 mr-2" /> Copy Link
                          </Button>
                          <a href={`/p/${selectedProperty.publicSlug}`} target="_blank" rel="noreferrer" className="w-full">
                            <Button className="w-full justify-center shadow-md hover:shadow-lg transition-all bg-primary text-white hover:bg-primary/90">
                              <ExternalLink className="w-4 h-4 mr-2" /> Open Live Page
                            </Button>
                          </a>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Details Card */}
                  <div className="lg:col-span-2">
                    <Card className="shadow-sm border-border h-full">
                      <CardHeader className="flex flex-row items-start justify-between space-y-0">
                        <div>
                          <CardTitle>Property Details</CardTitle>
                          <CardDescription>Update your contact and location information.</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => {
                          setEditProperty(selectedProperty);
                          setPropValue('propertyName', selectedProperty.propertyName);
                          setPropValue('contactNumber', selectedProperty.contactNumber);
                          setPropValue('whatsappNumber', selectedProperty.whatsappNumber);
                          setPropValue('state', selectedProperty.state);
                          setPropValue('region', selectedProperty.region);
                          setPropValue('address', selectedProperty.address);
                          setPropValue('emailId', selectedProperty.emailId);
                          setPropValue('backgroundImageUrl', selectedProperty.backgroundImageUrl || '');
                          setShowPropModal(true);
                        }}>
                          <Edit className="w-4 h-4 mr-2" /> Edit
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">State / Region</p>
                            <p className="font-medium text-foreground">{selectedProperty.state} — {selectedProperty.region}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email Address</p>
                            <p className="font-medium text-foreground">{selectedProperty.emailId}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact Phone</p>
                            <p className="font-medium text-foreground">{selectedProperty.contactNumber}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">WhatsApp</p>
                            <p className="font-medium text-foreground">{selectedProperty.whatsappNumber}</p>
                          </div>
                          <div className="md:col-span-2 space-y-1">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Address</p>
                            <p className="font-medium text-foreground bg-muted p-4 rounded-lg mt-2">{selectedProperty.address}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* === ROOMS TAB === */}
              {activeTab === 'rooms' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center bg-white/80 backdrop-blur-xl p-4 rounded-2xl border border-slate-200 shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <BedDouble className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-heading font-bold text-slate-900">Configured Units</p>
                        <p className="text-sm text-slate-500">{rooms.length} room types active</p>
                      </div>
                    </div>
                    <Button onClick={() => { setEditRoom(null); resetRoom(); setShowRoomModal(true); }} className="shadow-md hover:shadow-lg transition-all bg-primary hover:bg-primary/90 text-white">
                      <Plus className="w-4 h-4 mr-2" /> Add Room Type
                    </Button>
                  </div>

                  <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {rooms.map((room) => (
                      <motion.div variants={itemVariants} key={room._id}>
                        <Card className="shadow-sm border-border hover:border-primary/30 transition-colors h-full flex flex-col">
                          <CardHeader className="pb-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-xl font-heading font-bold">{room.roomName}</CardTitle>
                                <span className="inline-block mt-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                                  {room.noOfRooms} Units Available
                                </span>
                              </div>
                              <div className="flex gap-1 bg-muted p-1 rounded-lg">
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-foreground hover:bg-white" onClick={() => {
                                  setEditRoom(room);
                                  setRoomValue('roomName', room.roomName);
                                  setRoomValue('noOfRooms', room.noOfRooms);
                                  setRoomValue('priceRoomOnly', room.priceRoomOnly);
                                  setRoomValue('priceBreakfast', room.priceBreakfast);
                                  setRoomValue('priceBreakfastDinner', room.priceBreakfastDinner);
                                  setRoomValue('priceAllMeals', room.priceAllMeals);
                                  setShowRoomModal(true);
                                }}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-red-50" onClick={() => handleDeleteRoom(room._id)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="mt-auto pt-4 border-t bg-muted/30 font-mono text-sm space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Room Only</span>
                              <span className="font-semibold text-foreground">₹{room.priceRoomOnly}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">+ Breakfast</span>
                              <span className="font-medium text-foreground">₹{room.priceBreakfast}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">+ Half Board</span>
                              <span className="font-medium text-foreground">₹{room.priceBreakfastDinner}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">+ All Meals</span>
                              <span className="font-medium text-foreground">₹{room.priceAllMeals}</span>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                    {rooms.length === 0 && (
                      <div className="col-span-full py-16 text-center border-2 border-dashed border-border rounded-xl bg-muted/20">
                        <BedDouble className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-foreground">No room types</h3>
                        <p className="text-muted-foreground mb-4">You need to add rooms before taking bookings.</p>
                        <Button onClick={() => { setEditRoom(null); resetRoom(); setShowRoomModal(true); }}>Add Your First Room</Button>
                      </div>
                    )}
                  </motion.div>
                </div>
              )}

              {/* === BOOKINGS TAB === */}
              {activeTab === 'bookings' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center bg-white/80 backdrop-blur-xl p-4 rounded-2xl border border-slate-200 shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <CalendarDays className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-heading font-bold text-slate-900">Reservations</p>
                        <p className="text-sm text-slate-500">{bookings.length} active blocks</p>
                      </div>
                    </div>
                    <Button onClick={() => setShowBookingModal(true)} className="shadow-md hover:shadow-lg transition-all bg-primary hover:bg-primary/90 text-white">
                      <Plus className="w-4 h-4 mr-2" /> Block Dates
                    </Button>
                  </div>

                  <Card className="shadow-sm border-border overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/50 border-b">
                          <tr>
                            <th className="px-6 py-4">Guest</th>
                            <th className="px-6 py-4">Room Type</th>
                            <th className="px-6 py-4">Dates</th>
                            <th className="px-6 py-4 text-center">Nights</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          <AnimatePresence>
                            {bookings.map((b) => (
                              <motion.tr 
                                key={b._id} 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="bg-card hover:bg-muted/30 transition-colors"
                              >
                                <td className="px-6 py-4">
                                  <p className="font-semibold text-foreground">{b.guestName}</p>
                                  {b.guestPhone && <p className="text-xs text-muted-foreground font-mono mt-1">{b.guestPhone}</p>}
                                </td>
                                <td className="px-6 py-4">
                                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/20 text-primary border border-primary/30">
                                    {b.roomId?.roomName || 'Deleted Room'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 font-mono text-xs space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground w-6">In:</span> {new Date(b.checkinDate).toLocaleDateString()}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground w-6">Out:</span> {new Date(b.checkoutDate).toLocaleDateString()}
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <span className="font-mono font-bold text-primary text-lg">{b.noOfNights}</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <Button size="icon" variant="ghost" className="text-destructive hover:bg-destructive/10 h-8 w-8" onClick={() => handleDeleteBooking(b._id)}>
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </td>
                              </motion.tr>
                            ))}
                          </AnimatePresence>
                          {bookings.length === 0 && (
                            <tr>
                              <td colSpan="5" className="text-center py-16 text-muted-foreground">
                                <CalendarDays className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                                No active bookings for this property.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Building className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-heading font-bold mb-2">Welcome to your Inventory</h2>
              <p className="text-muted-foreground max-w-sm mx-auto">Create your first homestay property to start managing rooms and taking bookings.</p>
            </div>
            <Button size="lg" onClick={() => setShowPropModal(true)} className="px-8 shadow-lg">
              <Plus className="w-5 h-5 mr-2" /> Add Homestay
            </Button>
          </div>
        )}

      </main>

      {/* Add/Edit Property Modal */}
      <AnimatePresence>
        {showPropModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="flex justify-between items-center p-6 border-b bg-muted/30">
                <h3 className="text-xl font-heading font-bold text-foreground">
                  {editProperty ? 'Edit Property' : 'Add New Property'}
                </h3>
                <Button variant="ghost" size="icon" onClick={() => { setShowPropModal(false); setEditProperty(null); resetProp(); }} className="h-8 w-8 rounded-full">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="p-6 overflow-y-auto">
                <form id="propForm" onSubmit={handlePropSubmit(onSaveProperty)} className="space-y-5">
                  <div className="space-y-2">
                    <Label>Property Name</Label>
                    <Input {...regProp('propertyName')} className="bg-muted/50 border-border" placeholder="e.g. Sunset Villa" />
                    {propErrors.propertyName && <p className="text-xs text-destructive">{propErrors.propertyName.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Contact Number</Label>
                      <div className="flex">
                        <div className="flex items-center px-3 border border-r-0 border-border rounded-l-md bg-muted text-sm text-muted-foreground whitespace-nowrap font-medium">
                          🇮🇳 +91
                        </div>
                        <Input {...regProp('contactNumber')} className="rounded-l-none bg-muted/50 border-border" placeholder="9876543210" />
                      </div>
                      {propErrors.contactNumber && <p className="text-xs text-destructive">{propErrors.contactNumber.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>WhatsApp Number</Label>
                      <div className="flex">
                        <div className="flex items-center px-3 border border-r-0 border-border rounded-l-md bg-muted text-sm text-muted-foreground whitespace-nowrap font-medium">
                          🇮🇳 +91
                        </div>
                        <Input {...regProp('whatsappNumber')} className="rounded-l-none bg-muted/50 border-border" placeholder="9876543210" />
                      </div>
                      {propErrors.whatsappNumber && <p className="text-xs text-destructive">{propErrors.whatsappNumber.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>State / UT</Label>
                      <Controller
                        control={controlProp}
                        name="state"
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value || ""}>
                            <SelectTrigger className="w-full bg-muted/50 border-border h-10">
                              <SelectValue placeholder="Select State" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60 overflow-y-auto">
                              {INDIAN_STATES.map(s => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {propErrors.state && <p className="text-xs text-destructive">{propErrors.state.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Region / City</Label>
                      <Input {...regProp('region')} className="bg-muted/50 border-border" />
                      {propErrors.region && <p className="text-xs text-destructive">{propErrors.region.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Email ID</Label>
                    <Input {...regProp('emailId')} className="bg-muted/50 border-border" />
                    {propErrors.emailId && <p className="text-xs text-destructive">{propErrors.emailId.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Detailed Address</Label>
                    <textarea {...regProp('address')} className="flex min-h-[80px] w-full rounded-md border border-border bg-muted/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
                    {propErrors.address && <p className="text-xs text-destructive">{propErrors.address.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Background Image URL (Optional)</Label>
                    <Input {...regProp('backgroundImageUrl')} className="bg-muted/50 border-border" placeholder="https://example.com/image.jpg" />
                    {propErrors.backgroundImageUrl && <p className="text-xs text-destructive">{propErrors.backgroundImageUrl.message}</p>}
                    <p className="text-xs text-muted-foreground">This image will be displayed on your public booking page.</p>
                  </div>
                </form>
              </div>
              
              <div className="p-6 border-t bg-muted/30">
                <Button type="submit" form="propForm" className="w-full">
                  {editProperty ? 'Update Property' : 'Create Property'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add/Edit Room Modal */}
      <AnimatePresence>
        {showRoomModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="flex justify-between items-center p-6 border-b bg-muted/30">
                <h3 className="text-xl font-heading font-bold text-foreground">{editRoom ? 'Edit Room Type' : 'Add Room Type'}</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowRoomModal(false)} className="h-8 w-8 rounded-full">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="p-6 overflow-y-auto">
                <form id="roomForm" onSubmit={handleRoomSubmit(onSaveRoom)} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-2 md:col-span-1">
                      <Label>Room Type Name</Label>
                      <Input {...regRoom('roomName')} placeholder="e.g. Deluxe Suite" className="bg-muted/50" />
                      {roomErrors.roomName && <p className="text-xs text-destructive">{roomErrors.roomName.message}</p>}
                    </div>
                    <div className="space-y-2 col-span-2 md:col-span-1">
                      <Label>Total Units Available</Label>
                      <Input type="number" {...regRoom('noOfRooms', { valueAsNumber: true })} className="bg-muted/50 font-mono" />
                      {roomErrors.noOfRooms && <p className="text-xs text-destructive">{roomErrors.noOfRooms.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <Label className="text-base font-semibold">Pricing Tiers (₹ per night)</Label>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Only Room</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-muted-foreground font-mono">₹</span>
                          <Input type="number" {...regRoom('priceRoomOnly', { valueAsNumber: true })} className="pl-7 bg-muted/50 font-mono" />
                        </div>
                        {roomErrors.priceRoomOnly && <p className="text-xs text-destructive">{roomErrors.priceRoomOnly.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">+ Breakfast</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-muted-foreground font-mono">₹</span>
                          <Input type="number" {...regRoom('priceBreakfast', { valueAsNumber: true })} className="pl-7 bg-muted/50 font-mono" />
                        </div>
                        {roomErrors.priceBreakfast && <p className="text-xs text-destructive">{roomErrors.priceBreakfast.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">+ Breakfast & Dinner</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-muted-foreground font-mono">₹</span>
                          <Input type="number" {...regRoom('priceBreakfastDinner', { valueAsNumber: true })} className="pl-7 bg-muted/50 font-mono" />
                        </div>
                        {roomErrors.priceBreakfastDinner && <p className="text-xs text-destructive">{roomErrors.priceBreakfastDinner.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">+ All Meals</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-muted-foreground font-mono">₹</span>
                          <Input type="number" {...regRoom('priceAllMeals', { valueAsNumber: true })} className="pl-7 bg-muted/50 font-mono" />
                        </div>
                        {roomErrors.priceAllMeals && <p className="text-xs text-destructive">{roomErrors.priceAllMeals.message}</p>}
                      </div>
                    </div>
                  </div>
                </form>
              </div>
              
              <div className="p-6 border-t bg-muted/30">
                <Button type="submit" form="roomForm" className="w-full">Save Configuration</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Booking Modal */}
      <AnimatePresence>
        {showBookingModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="flex justify-between items-center p-6 border-b bg-muted/30">
                <h3 className="text-xl font-heading font-bold text-foreground">Block Room Dates</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowBookingModal(false)} className="h-8 w-8 rounded-full">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="p-6 overflow-y-auto">
                <form id="bookingForm" onSubmit={handleBookingSubmit(onSaveBooking)} className="space-y-5">
                  <div className="space-y-2">
                    <Label>Room Type</Label>
                    <select {...regBooking('roomId')} className="flex h-10 w-full rounded-md border border-border bg-muted/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                      <option value="">Select a room...</option>
                      {rooms.map(r => <option key={r._id} value={r._id}>{r.roomName}</option>)}
                    </select>
                    {bookingErrors.roomId && <p className="text-xs text-destructive">{bookingErrors.roomId.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Check-in Date</Label>
                      <Input type="date" {...regBooking('checkinDate')} className="bg-muted/50" />
                      {bookingErrors.checkinDate && <p className="text-xs text-destructive">{bookingErrors.checkinDate.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Nights</Label>
                      <Input type="number" {...regBooking('noOfNights', { valueAsNumber: true })} className="bg-muted/50 font-mono" />
                      {bookingErrors.noOfNights && <p className="text-xs text-destructive">{bookingErrors.noOfNights.message}</p>}
                    </div>
                  </div>

                  <div className="p-3 bg-secondary rounded-lg border flex items-center justify-between text-sm">
                    <span className="text-muted-foreground font-semibold uppercase tracking-wider text-xs">Checkout Date</span>
                    <span className="font-mono font-bold text-foreground">{getCheckoutDate() || '---'}</span>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <Label className="text-base font-semibold">Guest Information</Label>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Full Name</Label>
                      <Input {...regBooking('guestName')} className="bg-muted/50" />
                      {bookingErrors.guestName && <p className="text-xs text-destructive">{bookingErrors.guestName.message}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Email (Optional)</Label>
                        <Input {...regBooking('guestEmail')} className="bg-muted/50" />
                        {bookingErrors.guestEmail && <p className="text-xs text-destructive">{bookingErrors.guestEmail.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Phone (Optional)</Label>
                        <Input {...regBooking('guestPhone')} className="bg-muted/50 font-mono" />
                        {bookingErrors.guestPhone && <p className="text-xs text-destructive">{bookingErrors.guestPhone.message}</p>}
                      </div>
                    </div>
                  </div>
                </form>
              </div>
              
              <div className="p-6 border-t bg-muted/30">
                <Button type="submit" form="bookingForm" className="w-full">Confirm Block</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Upgrade Nudge Modal (Pricing Plans) */}
      <AnimatePresence>
        {showUpgradeModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl max-w-4xl w-full p-8 md:p-12 shadow-2xl relative overflow-hidden max-h-[95vh] overflow-y-auto">
              <Button variant="ghost" size="icon" onClick={() => setShowUpgradeModal(false)} className="absolute top-4 right-4 h-8 w-8 rounded-full z-10 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </Button>
              
              <div className="text-center max-w-xl mx-auto mb-10 mt-4">
                <h3 className="text-3xl font-heading font-extrabold text-slate-900 mb-4">Upgrade to Mezenga Pro</h3>
                <p className="text-muted-foreground text-lg">
                  You've hit the limits of the Free plan. Upgrade today to unlock unlimited inventory and scale your homestay business!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                {/* Free Plan Card */}
                <div className="border border-slate-200 rounded-2xl p-8 bg-slate-50 relative">
                  <div className="absolute top-0 right-0 bg-slate-200 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-bl-xl rounded-tr-xl uppercase tracking-wider">Current Plan</div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">Basic Host</h4>
                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-4xl font-extrabold">₹0</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-center gap-3 text-slate-600"><Check className="w-5 h-5 text-primary" /> 1 Property limit</li>
                    <li className="flex items-center gap-3 text-slate-600"><Check className="w-5 h-5 text-primary" /> Up to 4 Rooms</li>
                    <li className="flex items-center gap-3 text-slate-600"><Check className="w-5 h-5 text-primary" /> Basic WhatsApp Booking</li>
                    <li className="flex items-center gap-3 text-slate-400 opacity-60"><X className="w-5 h-5" /> Unlimited Properties</li>
                    <li className="flex items-center gap-3 text-slate-400 opacity-60"><X className="w-5 h-5" /> Advanced Analytics</li>
                  </ul>
                  <Button variant="outline" className="w-full h-12 border-slate-300 text-slate-500 font-semibold" disabled>Active Plan</Button>
                </div>

                {/* Pro Plan Card */}
                <div className="border-2 border-primary rounded-2xl p-8 bg-white relative shadow-xl transform md:-translate-y-4">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-md">Most Popular</div>
                  <h4 className="text-xl font-bold text-primary mb-2">Mezenga Pro</h4>
                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-4xl font-extrabold text-slate-900">₹999</span>
                    <span className="text-muted-foreground font-medium">/month</span>
                  </div>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-center gap-3 text-slate-900 font-medium"><Check className="w-5 h-5 text-primary drop-shadow-sm" /> Unlimited Properties</li>
                    <li className="flex items-center gap-3 text-slate-900 font-medium"><Check className="w-5 h-5 text-primary drop-shadow-sm" /> Unlimited Rooms</li>
                    <li className="flex items-center gap-3 text-slate-700"><Check className="w-5 h-5 text-primary" /> Priority WhatsApp Booking</li>
                    <li className="flex items-center gap-3 text-slate-700"><Check className="w-5 h-5 text-primary" /> Advanced Analytics</li>
                    <li className="flex items-center gap-3 text-slate-700"><Check className="w-5 h-5 text-primary" /> 24/7 Priority Support</li>
                  </ul>
                  <Button onClick={handleUpgrade} className="w-full h-12 text-base font-bold shadow-lg hover:shadow-xl transition-all">Upgrade to Pro</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Nav Header (Visible only on lg and below) */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-xl border-b border-slate-200 flex items-center px-4 justify-between z-40">
        <div className="flex items-center gap-2 text-lg font-heading font-extrabold text-slate-900 tracking-tight">
          <Building className="w-5 h-5 text-primary" /> Mezenga
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
          <Menu className="w-6 h-6 text-slate-900" />
        </Button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-50"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed inset-y-0 right-0 w-64 bg-white shadow-2xl z-50 flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b">
                <span className="font-heading font-bold text-lg text-slate-900">Menu</span>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <Sidebar 
                  activeTab={activeTab} 
                  setActiveTab={(tab) => { 
                    setActiveTab(tab); 
                    setIsMobileMenuOpen(false); 
                  }} 
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Dashboard;
