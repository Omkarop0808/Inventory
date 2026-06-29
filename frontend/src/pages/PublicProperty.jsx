import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { AnimatedGridPattern } from '../components/ui/animated-grid-pattern';
import { 
  Building, MapPin, Phone, Mail, ChevronRight, 
  BedDouble, Coffee, UtensilsCrossed, CalendarDays, ExternalLink
} from 'lucide-react';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import { Input } from '../components/ui/input';

const PublicProperty = () => {
  const { slug } = useParams();
  const [property, setProperty] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search State
  const [checkin, setCheckin] = useState('');
  const [checkout, setCheckout] = useState('');
  const [availableRooms, setAvailableRooms] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');

  useEffect(() => {
    fetchData();
  }, [slug]);

  const fetchData = async () => {
    try {
      const propRes = await api.get(`/public/property/${slug}`);
      setProperty(propRes.data);
    } catch (err) {
      setError('Property not found or link is invalid.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!checkin || !checkout) return;
    
    if (calculateNights() <= 0) {
      toast.error('Check-out date must be after check-in date');
      return;
    }

    setIsSearching(true);
    try {
      const res = await api.post('/public/availability', {
        slug: property.publicSlug,
        checkin,
        checkout
      });
      setAvailableRooms(res.data);
      if (res.data.length > 0) {
        setSelectedRoomId(res.data[0]._id);
      } else {
        setSelectedRoomId('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const calculateNights = () => {
    if (!checkin || !checkout) return 0;
    const diffTime = Math.abs(new Date(checkout) - new Date(checkin));
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleWhatsAppInquiry = (room, mealPlan) => {
    let price = 0;
    let planName = '';
    
    switch(mealPlan) {
      case 'roomOnly': price = room.priceRoomOnly; planName = 'Room Only'; break;
      case 'breakfast': price = room.priceBreakfast; planName = 'Room + Breakfast'; break;
      case 'halfBoard': price = room.priceBreakfastDinner; planName = 'Half Board (Breakfast & Dinner)'; break;
      case 'allMeals': price = room.priceAllMeals; planName = 'All Meals'; break;
    }

    const nights = calculateNights();
    const totalPrice = price * nights;
    
    const message = `Hello! I would like to book the *${room.roomName}* at *${property.propertyName}*.\n\n` +
      `📅 Check-in: ${new Date(checkin).toLocaleDateString()}\n` +
      `📅 Check-out: ${new Date(checkout).toLocaleDateString()}\n` +
      `🌙 Nights: ${nights}\n` +
      `🍽️ Plan: ${planName}\n\n` +
      `Is it available to confirm?`;

    let cleanNumber = property.whatsappNumber?.replace(/[^0-9]/g, '');
    if (cleanNumber?.length === 10) {
      cleanNumber = '91' + cleanNumber;
    }
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Building className="w-10 h-10 text-muted-foreground/30" />
          <p className="text-muted-foreground">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 text-center">
        <Card className="max-w-md w-full border-dashed shadow-none">
          <CardContent className="pt-10 pb-8 flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
              <Building className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Property Not Found</h1>
            <p className="text-muted-foreground">The link you followed might be broken or the property has been removed.</p>
            <Button className="mt-4 w-full" onClick={() => window.location.href = '/'}>Go to Homepage</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
      
      {/* Background Section */}
      {property.backgroundImageUrl ? (
        <div className="fixed inset-0 pointer-events-none z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${property.backgroundImageUrl})` }}
          />
          <div className="absolute inset-0 bg-white/70 backdrop-blur-md" />
        </div>
      ) : (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <AnimatedGridPattern
            numSquares={30}
            maxOpacity={0.1}
            duration={3}
            repeatDelay={1}
            className={cn(
              "[mask-image:radial-gradient(1000px_circle_at_center,white,transparent)]",
              "inset-0 h-full w-[200%] skew-y-12 opacity-50"
            )}
          />
        </div>
      )}

      <main className="flex-1 relative z-10 container max-w-6xl mx-auto px-4 py-8 md:py-16">
        
        {/* Header section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-2xl border border-slate-200 p-8 md:p-12 rounded-[2.5rem] shadow-xl text-center space-y-6 max-w-3xl mx-auto relative overflow-hidden group"
        >
          {/* Subtle glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary border border-primary/20 shadow-sm relative z-10">
            <Building className="w-12 h-12" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold text-slate-900 tracking-tight relative z-10">
            {property.propertyName}
          </h1>
          
          <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-3 text-slate-600 font-medium relative z-10">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
              <MapPin className="w-4 h-4 text-primary" />
              <span>{property.region}, {property.state}</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
              <Phone className="w-4 h-4 text-primary" />
              <span>{property.contactNumber}</span>
            </div>
            {property.whatsappNumber && (
              <div className="flex items-center gap-2 bg-[#25D366]/10 px-4 py-2 rounded-full border border-[#25D366]/30 shadow-sm text-[#128C7E]">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                </svg>
                <span>{property.whatsappNumber}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Availability Checker Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-12 bg-white/80 backdrop-blur-2xl rounded-3xl p-6 shadow-xl border border-slate-200 max-w-4xl mx-auto sticky top-4 z-40"
        >
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2 w-full">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Check-in</label>
              <input 
                type="date" 
                required
                min={new Date().toISOString().split('T')[0]}
                value={checkin}
                onChange={e => setCheckin(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-2xl h-14 px-4 text-slate-900 font-medium focus:ring-2 focus:ring-primary focus:outline-none transition-all shadow-sm"
              />
            </div>
            <div className="flex-1 space-y-2 w-full">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Check-out</label>
              <input 
                type="date" 
                required
                min={checkin || new Date().toISOString().split('T')[0]}
                value={checkout}
                onChange={e => setCheckout(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-2xl h-14 px-4 text-slate-900 font-medium focus:ring-2 focus:ring-primary focus:outline-none transition-all shadow-sm"
              />
            </div>
            <Button 
              type="submit" 
              disabled={isSearching}
              className="h-14 px-8 rounded-2xl w-full md:w-auto text-lg font-bold shadow-[0_8px_30px_rgba(37,99,235,0.2)] hover:shadow-[0_8px_40px_rgba(37,99,235,0.3)] hover:-translate-y-1 transition-all bg-primary hover:bg-primary/90 text-white"
            >
              {isSearching ? 'Checking...' : 'Check Availability'}
            </Button>
          </form>
        </motion.div>

        {/* Results Section */}
        <AnimatePresence mode="wait">
          {availableRooms && (
            <motion.div 
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-12 space-y-8"
            >
              <div className="text-center">
                <h3 className="text-2xl font-heading font-bold text-slate-900">Select a Room</h3>
                <p className="text-slate-500">Showing availability for {calculateNights()} night(s)</p>
              </div>

              {availableRooms.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl text-center border border-slate-200 shadow-xl max-w-2xl mx-auto">
                  <CalendarDays className="w-16 h-16 text-slate-300 mx-auto mb-6" />
                  <h4 className="text-2xl font-bold mb-3 text-slate-900">No Rooms Available</h4>
                  <p className="text-slate-600 text-lg">We are fully booked for these dates. Please try selecting different dates.</p>
                </div>
              ) : (
                <div className="space-y-8 max-w-7xl mx-auto">
                  <div className="max-w-md mx-auto">
                    <Input 
                      type="text" 
                      placeholder="Filter by room type (e.g. Deluxe, Beach view)" 
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="h-14 rounded-2xl border-slate-300 shadow-sm text-base px-6 bg-white/80 backdrop-blur-sm focus:bg-white transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {availableRooms
                      .filter(roomObj => roomObj.room.roomName.toLowerCase().includes(filterType.toLowerCase()))
                      .map(({ room, availableCount }) => (
                      <Card key={room._id} className="border border-slate-200 shadow-xl flex flex-col h-full bg-white/80 backdrop-blur-xl overflow-hidden hover:border-primary/50 transition-colors group">
                        <div className="h-56 bg-slate-100 flex items-center justify-center relative overflow-hidden border-b border-slate-200">
                          {/* Placeholder image pattern for room */}
                          <div className="absolute inset-0 bg-primary/5 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                          <BedDouble className="w-20 h-20 text-primary/30 z-10 group-hover:scale-110 group-hover:text-primary/50 transition-all duration-500" />
                          
                          {availableCount === 0 && (
                            <div className="absolute top-4 left-4 bg-red-100/90 backdrop-blur-md text-red-700 border border-red-200 text-xs font-extrabold uppercase tracking-wider px-4 py-2 rounded-full shadow-sm z-20">
                              Sold Out
                            </div>
                          )}
                          <div className={`absolute top-4 right-4 backdrop-blur-md text-xs font-bold px-4 py-2 rounded-full shadow-sm z-20 ${availableCount === 0 ? 'bg-slate-100/90 text-slate-500 border border-slate-200' : 'bg-primary/10 text-primary border border-primary/20'}`}>
                            {availableCount} Available
                          </div>
                        </div>
                        
                        <CardHeader className="pb-4">
                          <CardTitle className="text-2xl font-heading font-extrabold tracking-tight text-slate-900">{room.roomName}</CardTitle>
                        </CardHeader>
                        
                        <CardContent className={`pt-2 pb-6 flex-1 ${availableCount === 0 ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                        <div className="space-y-4">
                          {/* Room Only */}
                          <div className="relative">
                            <input type="radio" name={`plan-${room._id}`} id={`r-${room._id}`} className="peer sr-only" defaultChecked />
                            <label htmlFor={`r-${room._id}`} className="flex items-center justify-between p-4 border-2 border-primary rounded-2xl cursor-pointer peer-checked:border-slate-300 peer-checked:bg-slate-100 hover:bg-slate-50 transition-all">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center peer-checked:bg-slate-200 peer-checked:text-slate-500 transition-all">
                                  <BedDouble className="w-5 h-5" />
                                </div>
                                <div className="text-sm font-semibold text-slate-700">Room Only</div>
                              </div>
                              <div className="text-right">
                                <div className="font-mono font-bold text-lg text-slate-900 tracking-tight">₹{room.priceRoomOnly * (calculateNights() || 1)}</div>
                                {calculateNights() > 0 && <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">For {calculateNights()} night(s)</div>}
                              </div>
                            </label>
                            
                            {/* Book Button overlay */}
                            <div className="hidden peer-checked:block mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                              <Button className="w-full h-12 text-base font-bold bg-[#25D366] hover:bg-[#128C7E] text-white shadow-md hover:shadow-lg transition-all" onClick={() => handleWhatsAppInquiry(room, 'roomOnly')}>
                                Book via WhatsApp <ExternalLink className="w-4 h-4 ml-2" />
                              </Button>
                            </div>
                          </div>

                          {/* Breakfast */}
                          {room.priceBreakfast > 0 && (
                            <div className="relative">
                              <input type="radio" name={`plan-${room._id}`} id={`b-${room._id}`} className="peer sr-only" />
                              <label htmlFor={`b-${room._id}`} className="flex items-center justify-between p-4 border-2 border-primary rounded-2xl cursor-pointer peer-checked:border-slate-300 peer-checked:bg-slate-100 hover:bg-slate-50 transition-all">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center peer-checked:bg-slate-200 peer-checked:text-slate-500 transition-all">
                                    <Coffee className="w-5 h-5" />
                                  </div>
                                  <div className="text-sm font-semibold text-slate-700">+ Breakfast</div>
                                </div>
                                <div className="text-right">
                                  <div className="font-mono font-bold text-lg text-slate-900 tracking-tight">₹{room.priceBreakfast * (calculateNights() || 1)}</div>
                                  {calculateNights() > 0 && <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">For {calculateNights()} night(s)</div>}
                                </div>
                              </label>
                              <div className="hidden peer-checked:block mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                <Button className="w-full h-12 text-base font-bold bg-[#25D366] hover:bg-[#128C7E] text-white shadow-md hover:shadow-lg transition-all" onClick={() => handleWhatsAppInquiry(room, 'breakfast')}>
                                  Book via WhatsApp <ExternalLink className="w-4 h-4 ml-2" />
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* Half Board */}
                          {room.priceBreakfastDinner > 0 && (
                            <div className="relative">
                              <input type="radio" name={`plan-${room._id}`} id={`hb-${room._id}`} className="peer sr-only" />
                              <label htmlFor={`hb-${room._id}`} className="flex items-center justify-between p-4 border-2 border-primary rounded-2xl cursor-pointer peer-checked:border-slate-300 peer-checked:bg-slate-100 hover:bg-slate-50 transition-all">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center peer-checked:bg-slate-200 peer-checked:text-slate-500 transition-all">
                                    <UtensilsCrossed className="w-5 h-5" />
                                  </div>
                                  <div className="text-sm font-semibold text-left">
                                    <div className="text-slate-700">Half Board</div>
                                    <div className="text-xs text-slate-500 font-medium mt-0.5">Breakfast & Dinner</div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-mono font-bold text-lg text-slate-900 tracking-tight">₹{room.priceBreakfastDinner * (calculateNights() || 1)}</div>
                                  {calculateNights() > 0 && <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">For {calculateNights()} night(s)</div>}
                                </div>
                              </label>
                              <div className="hidden peer-checked:block mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                <Button className="w-full h-12 text-base font-bold bg-[#25D366] hover:bg-[#128C7E] text-white shadow-md hover:shadow-lg transition-all" onClick={() => handleWhatsAppInquiry(room, 'halfBoard')}>
                                  Book via WhatsApp <ExternalLink className="w-4 h-4 ml-2" />
                                </Button>
                              </div>
                            </div>
                          )}
                          
                          {/* All Meals */}
                          {room.priceAllMeals > 0 && (
                            <div className="relative">
                              <input type="radio" name={`plan-${room._id}`} id={`am-${room._id}`} className="peer sr-only" />
                              <label htmlFor={`am-${room._id}`} className="flex items-center justify-between p-4 border-2 border-primary rounded-2xl cursor-pointer peer-checked:border-slate-300 peer-checked:bg-slate-100 hover:bg-slate-50 transition-all">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center peer-checked:bg-slate-200 peer-checked:text-slate-500 transition-all">
                                    <UtensilsCrossed className="w-5 h-5" />
                                  </div>
                                  <div className="text-sm font-semibold text-left">
                                    <div className="text-slate-700">All Meals</div>
                                    <div className="text-xs text-slate-500 font-medium mt-0.5">Breakfast, Lunch, Dinner</div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-mono font-bold text-lg text-slate-900 tracking-tight">₹{room.priceAllMeals * (calculateNights() || 1)}</div>
                                  {calculateNights() > 0 && <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">For {calculateNights()} night(s)</div>}
                                </div>
                              </label>
                              <div className="hidden peer-checked:block mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                <Button className="w-full h-12 text-base font-bold bg-[#25D366] hover:bg-[#128C7E] text-white shadow-md hover:shadow-lg transition-all" onClick={() => handleWhatsAppInquiry(room, 'allMeals')}>
                                  Book via WhatsApp <ExternalLink className="w-4 h-4 ml-2" />
                                </Button>
                              </div>
                            </div>
                          )}

                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {availableRooms.filter(roomObj => roomObj.room.roomName.toLowerCase().includes(filterType.toLowerCase())).length === 0 && filterType && (
                    <div className="col-span-full text-center py-12 text-slate-500">
                      No rooms match your filter "{filterType}"
                    </div>
                  )}
                </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </main>
      
      {/* Footer */}
      <footer className="py-8 text-center text-sm text-slate-500 relative z-10 border-t border-slate-200 bg-white/50 backdrop-blur-md mt-auto">
        Powered by <span className="font-heading font-extrabold text-primary tracking-tight">Mezenga Inventory Checker</span>
      </footer>

    </div>
  );
};

export default PublicProperty;
