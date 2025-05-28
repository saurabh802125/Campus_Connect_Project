import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Users, Ticket, Star, AlertCircle, X, CheckCircle, Volume2, Wifi, Coffee } from 'lucide-react';

// Mock data for events with different venues
const mockEvents = [
  {
    _id: '1',
    title: "Tech Innovation Summit 2024",
    description: "Annual technology summit featuring industry leaders and innovation showcases",
    date: new Date('2024-12-20'),
    time: "10:00 AM",
    venue: "Apex Auditorium",
    category: "Technology",
    totalSeats: 300,
    features: ['AC', 'Sound System', 'Projector', 'Wi-Fi'],
    seats: Array.from({ length: 300 }, (_, i) => {
      const row = String.fromCharCode(65 + Math.floor(i / 25));
      const seatNum = (i % 25) + 1;
      return {
        _id: `seat_${i}`,
        row,
        number: seatNum,
        isOccupied: Math.random() < 0.15,
        price: row <= 'C' ? 150 : row <= 'F' ? 100 : 75,
        occupiedBy: null
      };
    })
  },
  {
    _id: '2',
    title: "Cultural Fest 2024 - Opening Ceremony",
    description: "Grand opening ceremony with traditional and modern cultural performances",
    date: new Date('2024-12-22'),
    time: "6:00 PM",
    venue: "LHC Seminar Hall 1",
    category: "Cultural",
    totalSeats: 150,
    features: ['AC', 'Stage Lighting', 'Sound System'],
    seats: Array.from({ length: 150 }, (_, i) => {
      const row = String.fromCharCode(65 + Math.floor(i / 20));
      const seatNum = (i % 20) + 1;
      return {
        _id: `seat_${i}`,
        row,
        number: seatNum,
        isOccupied: Math.random() < 0.30,
        price: row <= 'D' ? 100 : 75,
        occupiedBy: null
      };
    })
  },
  {
    _id: '3',
    title: "Data Science Workshop",
    description: "Hands-on workshop on machine learning and data analytics",
    date: new Date('2024-12-18'),
    time: "2:00 PM",
    venue: "ESB Seminar Hall 1",
    category: "Workshop",
    totalSeats: 80,
    features: ['AC', 'Computers', 'Wi-Fi', 'Whiteboard'],
    seats: Array.from({ length: 80 }, (_, i) => {
      const row = String.fromCharCode(65 + Math.floor(i / 16));
      const seatNum = (i % 16) + 1;
      return {
        _id: `seat_${i}`,
        row,
        number: seatNum,
        isOccupied: Math.random() < 0.40,
        price: 50,
        occupiedBy: null
      };
    })
  },
  {
    _id: '4',
    title: "Industry Connect Seminar",
    description: "Connect with industry professionals and explore career opportunities",
    date: new Date('2024-12-25'),
    time: "11:00 AM",
    venue: "LHC Seminar Hall 2",
    category: "Career",
    totalSeats: 100,
    features: ['AC', 'Projector', 'Wi-Fi', 'Recording'],
    seats: Array.from({ length: 100 }, (_, i) => {
      const row = String.fromCharCode(65 + Math.floor(i / 20));
      const seatNum = (i % 20) + 1;
      return {
        _id: `seat_${i}`,
        row,
        number: seatNum,
        isOccupied: Math.random() < 0.25,
        price: 75,
        occupiedBy: null
      };
    })
  },
  {
    _id: '5',
    title: "Startup Pitch Competition",
    description: "Student entrepreneurs present their innovative startup ideas",
    date: new Date('2024-12-28'),
    time: "3:00 PM",
    venue: "ESB Seminar Hall 2",
    category: "Competition",
    totalSeats: 120,
    features: ['AC', 'Stage', 'Microphones', 'Projector'],
    seats: Array.from({ length: 120 }, (_, i) => {
      const row = String.fromCharCode(65 + Math.floor(i / 20));
      const seatNum = (i % 20) + 1;
      return {
        _id: `seat_${i}`,
        row,
        number: seatNum,
        isOccupied: Math.random() < 0.20,
        price: 25,
        occupiedBy: null
      };
    })
  }
];

const mockUserBookings = [];

// UI Components
const Card = ({ children, className = "" }) => (
  <div className={`rounded-lg border bg-white shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>
    {children}
  </h3>
);

const CardDescription = ({ children, className = "" }) => (
  <p className={`text-sm text-gray-600 ${className}`}>
    {children}
  </p>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, variant = "default", className = "", disabled = false }) => {
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-gray-300 bg-white hover:bg-gray-50 text-gray-900",
    destructive: "bg-red-600 text-white hover:bg-red-700"
  };
  
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-10 px-4 py-2 disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const Badge = ({ children, variant = "default", className = "" }) => {
  const variants = {
    default: "bg-blue-100 text-blue-800",
    secondary: "bg-gray-100 text-gray-800",
    destructive: "bg-red-100 text-red-800",
    success: "bg-green-100 text-green-800",
    premium: "bg-yellow-100 text-yellow-800",
    standard: "bg-green-100 text-green-800",
    economy: "bg-gray-100 text-gray-800"
  };
  
  return (
    <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};

const EnhancedEventBooking = () => {
  const [events, setEvents] = useState(mockEvents);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [userBookings, setUserBookings] = useState(mockUserBookings);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const handleEventSelect = (event) => {
    setSelectedEvent(event);
    setSelectedSeat(null);
    setError(null);
    setSuccessMessage(null);
  };

  const handleSeatSelect = (seat) => {
    if (!seat.isOccupied) {
      setSelectedSeat(seat);
      setError(null);
    }
  };

  const handleBookTicket = () => {
    if (selectedEvent && selectedSeat) {
      // Simulate booking
      const updatedEvents = events.map(event => {
        if (event._id === selectedEvent._id) {
          const updatedSeats = event.seats.map(seat => {
            if (seat._id === selectedSeat._id) {
              return { ...seat, isOccupied: true, occupiedBy: 'currentUser' };
            }
            return seat;
          });
          return { ...event, seats: updatedSeats };
        }
        return event;
      });
      
      setEvents(updatedEvents);
      setSelectedEvent(updatedEvents.find(e => e._id === selectedEvent._id));
      
      // Add to user bookings
      const newBooking = {
        _id: Date.now().toString(),
        event: selectedEvent,
        seatNumber: `${selectedSeat.row}${selectedSeat.number}`,
        price: selectedSeat.price,
        bookedAt: new Date(),
        type: 'event'
      };
      setUserBookings([...userBookings, newBooking]);
      
      setSelectedSeat(null);
      setShowBookingModal(false);
      setSuccessMessage(`🎉 Ticket booked successfully! ${selectedSeat.row}${selectedSeat.number} for ${selectedEvent.title}`);
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Technology': 'bg-blue-100 text-blue-800',
      'Cultural': 'bg-purple-100 text-purple-800',
      'Workshop': 'bg-green-100 text-green-800',
      'Career': 'bg-orange-100 text-orange-800',
      'Competition': 'bg-red-100 text-red-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getVenueIcon = (venue) => {
    if (venue.includes('Auditorium')) return '🎭';
    if (venue.includes('ESB')) return '🏢';
    if (venue.includes('LHC')) return '📚';
    return '🏛️';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const renderSeatLayout = (event) => {
    const seatsPerRow = event.venue.includes('Auditorium') ? 25 : 20;
    const rows = Math.ceil(event.totalSeats / seatsPerRow);
    
    return (
      <div className="space-y-4">
        {/* Stage/Screen */}
        <div className="text-center">
          <div className="w-full h-12 bg-gradient-to-r from-gray-700 to-gray-900 rounded-t-lg flex items-center justify-center text-white text-sm font-medium shadow-lg mb-4">
            🎭 STAGE / SCREEN 🎭
          </div>
        </div>

        {/* Seat Sections */}
        <div className="space-y-6">
          {/* Premium Section */}
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h4 className="text-sm font-medium text-yellow-800 mb-3 flex items-center">
              <Star className="h-4 w-4 mr-2" />
              Premium Section (Front Rows A-C) - ₹{Math.max(...event.seats.map(s => s.price))}
            </h4>
            <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${seatsPerRow}, minmax(0, 1fr))` }}>
              {event.seats.filter(seat => seat.row <= 'C').map((seat) => {
                const isSelected = selectedSeat?._id === seat._id;
                const isOccupied = seat.isOccupied;
                
                return (
                  <div
                    key={seat._id}
                    onClick={() => handleSeatSelect(seat)}
                    className={`
                      w-8 h-8 rounded text-xs flex items-center justify-center cursor-pointer transition-all font-medium border-2 relative
                      ${isOccupied 
                        ? 'bg-red-500 text-white cursor-not-allowed border-red-600' 
                        : isSelected 
                          ? 'bg-blue-500 text-white shadow-lg border-blue-600 scale-110' 
                          : 'bg-yellow-200 hover:bg-yellow-300 border-yellow-400 text-yellow-800 hover:scale-105'
                      }
                    `}
                    title={`${seat.row}${seat.number} - ₹${seat.price} ${isOccupied ? '(Occupied)' : ''}`}
                  >
                    {seat.number}
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full border border-white"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Standard Section */}
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="text-sm font-medium text-green-800 mb-3 flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Standard Section (Middle Rows D-F) - ₹{Math.floor((Math.max(...event.seats.map(s => s.price)) + Math.min(...event.seats.map(s => s.price))) / 2)}
            </h4>
            <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${seatsPerRow}, minmax(0, 1fr))` }}>
              {event.seats.filter(seat => seat.row >= 'D' && seat.row <= 'F').map((seat) => {
                const isSelected = selectedSeat?._id === seat._id;
                const isOccupied = seat.isOccupied;
                
                return (
                  <div
                    key={seat._id}
                    onClick={() => handleSeatSelect(seat)}
                    className={`
                      w-8 h-8 rounded text-xs flex items-center justify-center cursor-pointer transition-all font-medium border-2 relative
                      ${isOccupied 
                        ? 'bg-red-500 text-white cursor-not-allowed border-red-600' 
                        : isSelected 
                          ? 'bg-blue-500 text-white shadow-lg border-blue-600 scale-110' 
                          : 'bg-green-200 hover:bg-green-300 border-green-400 text-green-800 hover:scale-105'
                      }
                    `}
                    title={`${seat.row}${seat.number} - ₹${seat.price} ${isOccupied ? '(Occupied)' : ''}`}
                  >
                    {seat.number}
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full border border-white"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Economy Section */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="text-sm font-medium text-gray-800 mb-3 flex items-center">
              <Ticket className="h-4 w-4 mr-2" />
              Economy Section (Back Rows) - ₹{Math.min(...event.seats.map(s => s.price))}
            </h4>
            <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${seatsPerRow}, minmax(0, 1fr))` }}>
              {event.seats.filter(seat => seat.row > 'F').map((seat) => {
                const isSelected = selectedSeat?._id === seat._id;
                const isOccupied = seat.isOccupied;
                
                return (
                  <div
                    key={seat._id}
                    onClick={() => handleSeatSelect(seat)}
                    className={`
                      w-8 h-8 rounded text-xs flex items-center justify-center cursor-pointer transition-all font-medium border-2 relative
                      ${isOccupied 
                        ? 'bg-red-500 text-white cursor-not-allowed border-red-600' 
                        : isSelected 
                          ? 'bg-blue-500 text-white shadow-lg border-blue-600 scale-110' 
                          : 'bg-gray-200 hover:bg-gray-300 border-gray-400 text-gray-800 hover:scale-105'
                      }
                    `}
                    title={`${seat.row}${seat.number} - ₹${seat.price} ${isOccupied ? '(Occupied)' : ''}`}
                  >
                    {seat.number}
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full border border-white"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50 p-4 rounded-lg">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-200 border border-yellow-400 rounded"></div>
              <span>Premium (₹{Math.max(...event.seats.map(s => s.price))})</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-200 border border-green-400 rounded"></div>
              <span>Standard (₹{Math.floor((Math.max(...event.seats.map(s => s.price)) + Math.min(...event.seats.map(s => s.price))) / 2)})</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-200 border border-gray-400 rounded"></div>
              <span>Economy (₹{Math.min(...event.seats.map(s => s.price))})</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>Occupied</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Event Ticket Booking</h1>
        <p className="text-gray-600">Book tickets for college events across different venues</p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-green-500 hover:text-green-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Current Bookings */}
      {userBookings.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-800">
              <Ticket className="h-5 w-5" />
              <span>My Event Bookings</span>
            </CardTitle>
            <CardDescription className="text-green-700">
              Your confirmed event tickets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userBookings.map((booking) => (
                <div key={booking._id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-green-200">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{getVenueIcon(booking.event?.venue)}</span>
                      <p className="font-medium text-green-800">{booking.event?.title}</p>
                    </div>
                    <p className="text-sm text-gray-600">
                      <strong>Seat {booking.seatNumber}</strong> • {booking.event?.venue}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(booking.event?.date)} at {booking.event?.time}</span>
                      </div>
                      <Badge variant="success" className="text-xs">
                        ₹{booking.price}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Events List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Upcoming Events</h3>
          {events.map((event) => {
            const availableSeats = event.seats.filter(seat => !seat.isOccupied).length;
            const isAlmostFull = availableSeats < 10;
            
            return (
              <Card 
                key={event._id} 
                className={`cursor-pointer transition-all ${
                  selectedEvent?._id === event._id ? 'ring-2 ring-blue-500 shadow-md' : 'hover:shadow-md'
                }`}
                onClick={() => handleEventSelect(event)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{getVenueIcon(event.venue)}</span>
                      <span className="text-lg">{event.title}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getCategoryColor(event.category)}>
                        {event.category}
                      </Badge>
                      {isAlmostFull && (
                        <Badge variant="destructive" className="text-xs">
                          Almost Full
                        </Badge>
                      )}
                    </div>
                  </CardTitle>
                  <CardDescription className="text-gray-700">{event.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">{formatDate(event.date)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-green-600" />
                        <span>{event.time}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="h-4 w-4 text-red-600" />
                      <span className="font-medium">{event.venue}</span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {event.features?.map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {feature === 'Wi-Fi' && <Wifi className="h-3 w-3 mr-1" />}
                          {feature === 'AC' && <span className="mr-1">❄️</span>}
                          {feature === 'Sound System' && <Volume2 className="h-3 w-3 mr-1" />}
                          {feature}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-purple-600" />
                        <span>{availableSeats} seats available</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-gray-600">₹{Math.min(...event.seats.map(s => s.price))} onwards</span>
                      </div>
                    </div>
                    
                    {/* Seat Availability Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          availableSeats > event.totalSeats * 0.5 ? 'bg-green-500' : 
                          availableSeats > event.totalSeats * 0.2 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${(availableSeats / event.totalSeats) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Seat Selection */}
        <div className="lg:col-span-2">
          {selectedEvent ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Select Your Seat - {selectedEvent.title}</span>
                  {selectedSeat && (
                    <Button 
                      onClick={() => setShowBookingModal(true)}
                      className="flex items-center space-x-2"
                    >
                      <Ticket className="h-4 w-4" />
                      <span>Book ₹{selectedSeat.price}</span>
                    </Button>
                  )}
                </CardTitle>
                <CardDescription>
                  {selectedEvent.venue} - Choose your preferred seat like in a movie theater
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderSeatLayout(selectedEvent)}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">Select an event to view seat layout</p>
                <p className="text-sm text-gray-400">Choose from upcoming college events across different venues</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Booking Confirmation Modal */}
      {showBookingModal && selectedSeat && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Confirm Your Booking</h3>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="font-medium text-blue-900">{selectedEvent?.title}</p>
                  <p className="text-sm text-blue-700">{selectedEvent?.venue}</p>
                  <p className="text-sm text-blue-600">
                    {formatDate(selectedEvent?.date)} at {selectedEvent?.time}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-lg font-bold text-blue-800">
                      Seat {selectedSeat.row}{selectedSeat.number}
                    </p>
                    <p className="text-xl font-bold text-green-600">₹{selectedSeat.price}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>• Please arrive 15 minutes before the event</p>
                  <p>• Ticket is non-transferable and non-refundable</p>
                  <p>• Follow the venue guidelines and dress code</p>
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <Button 
                  variant="outline"
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleBookTicket}
                  className="flex-1"
                >
                  Confirm & Pay ₹{selectedSeat.price}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedEventBooking;