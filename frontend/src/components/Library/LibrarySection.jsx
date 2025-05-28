import React, { useState, useEffect } from 'react';
import { BookOpen, Users, Clock, X, CheckCircle, AlertCircle, LogOut, MapPin, Wifi, Coffee, Volume2 } from 'lucide-react';

// Mock data - replace with your actual API calls
const mockLibraries = [
  {
    _id: '1',
    name: "LHC Library",
    floor: "Learning Hub Complex - Ground Floor",
    totalSeats: 150,
    features: ['Wi-Fi', 'Silent Zone', 'AC', 'Study Pods'],
    seats: Array.from({ length: 150 }, (_, i) => ({
      number: i + 1,
      isOccupied: Math.random() < 0.25,
      occupiedBy: null,
      occupiedAt: null
    }))
  },
  {
    _id: '2',
    name: "ESB Library",
    floor: "Engineering Sciences Block - First Floor",
    totalSeats: 120,
    features: ['Wi-Fi', 'Group Study', 'AC', 'Printing'],
    seats: Array.from({ length: 120 }, (_, i) => ({
      number: i + 1,
      isOccupied: Math.random() < 0.35,
      occupiedBy: null,
      occupiedAt: null
    }))
  },
  {
    _id: '3',
    name: "Apex Library",
    floor: "Apex Building - Second Floor",
    totalSeats: 80,
    features: ['Wi-Fi', 'Silent Zone', 'AC', 'Research Area'],
    seats: Array.from({ length: 80 }, (_, i) => ({
      number: i + 1,
      isOccupied: Math.random() < 0.20,
      occupiedBy: null,
      occupiedAt: null
    }))
  }
];

const mockUserBookings = [];

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
    success: "bg-green-100 text-green-800"
  };
  
  return (
    <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};

const EnhancedLibraryBooking = () => {
  const [libraries, setLibraries] = useState(mockLibraries);
  const [selectedLibrary, setSelectedLibrary] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [userBookings, setUserBookings] = useState(mockUserBookings);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const handleLibrarySelect = (library) => {
    setSelectedLibrary(library);
    setSelectedSeat(null);
    setError(null);
    setSuccessMessage(null);
  };

  const handleSeatSelect = (seatNumber) => {
    const library = selectedLibrary;
    const seat = library?.seats.find(s => s.number === seatNumber);
    
    if (seat && !seat.isOccupied) {
      setSelectedSeat(seatNumber);
      setError(null);
    }
  };

  const handleBookSeat = () => {
    if (selectedLibrary && selectedSeat) {
      // Simulate booking
      const updatedLibraries = libraries.map(lib => {
        if (lib._id === selectedLibrary._id) {
          const updatedSeats = lib.seats.map(seat => {
            if (seat.number === selectedSeat) {
              return { ...seat, isOccupied: true, occupiedBy: 'currentUser', occupiedAt: new Date() };
            }
            return seat;
          });
          return { ...lib, seats: updatedSeats };
        }
        return lib;
      });
      
      setLibraries(updatedLibraries);
      setSelectedLibrary(updatedLibraries.find(l => l._id === selectedLibrary._id));
      
      // Add to user bookings
      const newBooking = {
        _id: Date.now().toString(),
        library: selectedLibrary,
        seatNumber: selectedSeat,
        bookedAt: new Date(),
        type: 'library'
      };
      setUserBookings([...userBookings, newBooking]);
      
      setSelectedSeat(null);
      setShowBookingModal(false);
      setSuccessMessage(`🎉 Successfully booked Seat ${selectedSeat} in ${selectedLibrary.name}!`);
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  };

  const handleLeaveSeat = (bookingId) => {
    const booking = userBookings.find(b => b._id === bookingId);
    if (booking) {
      // Update library seats
      const updatedLibraries = libraries.map(lib => {
        if (lib._id === booking.library._id) {
          const updatedSeats = lib.seats.map(seat => {
            if (seat.number === parseInt(booking.seatNumber)) {
              return { ...seat, isOccupied: false, occupiedBy: null, occupiedAt: null };
            }
            return seat;
          });
          return { ...lib, seats: updatedSeats };
        }
        return lib;
      });
      
      setLibraries(updatedLibraries);
      if (selectedLibrary) {
        setSelectedLibrary(updatedLibraries.find(l => l._id === selectedLibrary._id));
      }
      
      // Remove from user bookings
      setUserBookings(userBookings.filter(b => b._id !== bookingId));
      
      setSuccessMessage(`✅ You have successfully left Seat ${booking.seatNumber} in ${booking.library.name}. The seat is now available for other students.`);
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  };

  const getOccupancyStatus = (availableSeats, totalSeats) => {
    const occupancyRate = ((totalSeats - availableSeats) / totalSeats * 100);
    if (occupancyRate < 50) return { status: 'Low', color: 'green', badge: 'success' };
    if (occupancyRate < 80) return { status: 'Medium', color: 'yellow', badge: 'secondary' };
    return { status: 'High', color: 'red', badge: 'destructive' };
  };

  const renderSeatLayout = (library) => {
    const seatsPerRow = 15;
    const rows = Math.ceil(library.totalSeats / seatsPerRow);
    
    return (
      <div className="space-y-4">
        {/* Library Entrance */}
        <div className="text-center">
          <div className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center text-white text-sm font-medium shadow-lg mb-4">
            🚪 LIBRARY ENTRANCE 🚪
          </div>
        </div>

        {/* Seat Grid with Sections */}
        <div className="space-y-6">
          {/* Front Section - Individual Study */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-3 flex items-center">
              <Volume2 className="h-4 w-4 mr-2" />
              Silent Study Section (Rows A-C)
            </h4>
            <div className="grid grid-cols-15 gap-1">
              {Array.from({ length: 45 }, (_, i) => {
                const seatNumber = i + 1;
                const seat = library.seats.find(s => s.number === seatNumber);
                const row = String.fromCharCode(65 + Math.floor(i / 15));
                const seatInRow = (i % 15) + 1;
                
                return (
                  <div
                    key={seatNumber}
                    onClick={() => handleSeatSelect(seatNumber)}
                    className={`
                      w-8 h-8 rounded-md text-xs flex items-center justify-center cursor-pointer transition-all font-medium border-2 relative
                      ${seat?.isOccupied 
                        ? 'bg-red-500 text-white cursor-not-allowed border-red-600' 
                        : selectedSeat === seatNumber 
                          ? 'bg-blue-500 text-white shadow-lg border-blue-600 scale-110' 
                          : 'bg-white hover:bg-blue-100 border-blue-300 hover:border-blue-500 hover:scale-105'
                      }
                    `}
                    title={`${row}${seatInRow} - ${seat?.isOccupied ? 'Occupied' : 'Available'}`}
                  >
                    {seatInRow}
                    {selectedSeat === seatNumber && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border border-white"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Middle Section - Group Study */}
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="text-sm font-medium text-green-800 mb-3 flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Group Study Section (Rows D-F)
            </h4>
            <div className="grid grid-cols-15 gap-1">
              {Array.from({ length: 45 }, (_, i) => {
                const seatNumber = i + 46;
                const seat = library.seats.find(s => s.number === seatNumber);
                const row = String.fromCharCode(65 + Math.floor((i + 45) / 15));
                const seatInRow = (i % 15) + 1;
                
                return (
                  <div
                    key={seatNumber}
                    onClick={() => handleSeatSelect(seatNumber)}
                    className={`
                      w-8 h-8 rounded-md text-xs flex items-center justify-center cursor-pointer transition-all font-medium border-2 relative
                      ${seat?.isOccupied 
                        ? 'bg-red-500 text-white cursor-not-allowed border-red-600' 
                        : selectedSeat === seatNumber 
                          ? 'bg-blue-500 text-white shadow-lg border-blue-600 scale-110' 
                          : 'bg-white hover:bg-green-100 border-green-300 hover:border-green-500 hover:scale-105'
                      }
                    `}
                    title={`${row}${seatInRow} - ${seat?.isOccupied ? 'Occupied' : 'Available'}`}
                  >
                    {seatInRow}
                    {selectedSeat === seatNumber && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border border-white"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Back Section - Reading Area */}
          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="text-sm font-medium text-purple-800 mb-3 flex items-center">
              <BookOpen className="h-4 w-4 mr-2" />
              Reading & Research Section (Remaining Seats)
            </h4>
            <div className="grid grid-cols-15 gap-1">
              {Array.from({ length: library.totalSeats - 90 }, (_, i) => {
                const seatNumber = i + 91;
                const seat = library.seats.find(s => s.number === seatNumber);
                const row = String.fromCharCode(65 + Math.floor((i + 90) / 15));
                const seatInRow = (i % 15) + 1;
                
                return (
                  <div
                    key={seatNumber}
                    onClick={() => handleSeatSelect(seatNumber)}
                    className={`
                      w-8 h-8 rounded-md text-xs flex items-center justify-center cursor-pointer transition-all font-medium border-2 relative
                      ${seat?.isOccupied 
                        ? 'bg-red-500 text-white cursor-not-allowed border-red-600' 
                        : selectedSeat === seatNumber 
                          ? 'bg-blue-500 text-white shadow-lg border-blue-600 scale-110' 
                          : 'bg-white hover:bg-purple-100 border-purple-300 hover:border-purple-500 hover:scale-105'
                      }
                    `}
                    title={`${row}${seatInRow} - ${seat?.isOccupied ? 'Occupied' : 'Available'}`}
                  >
                    {seatInRow}
                    {selectedSeat === seatNumber && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border border-white"></div>
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
              <div className="w-4 h-4 bg-white border-2 border-blue-300 rounded"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>Selected</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>Occupied</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full border border-white"></div>
              <span>Your Selection</span>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Library Seat Booking</h1>
        <p className="text-gray-600">Choose your preferred library and book a seat like booking movie tickets</p>
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
              <CheckCircle className="h-5 w-5" />
              <span>My Current Library Booking</span>
            </CardTitle>
            <CardDescription className="text-green-700">
              You are currently occupying a library seat. Please remember to leave when you're done.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userBookings.map((booking) => (
                <div key={booking._id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-green-200">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-5 w-5 text-green-600" />
                      <p className="font-medium text-green-800">{booking.library?.name}</p>
                    </div>
                    <p className="text-sm text-gray-600">
                      <strong>Seat {booking.seatNumber}</strong> • {booking.library?.floor}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>Booked at {booking.bookedAt.toLocaleString()}</span>
                    </div>
                  </div>
                  <Button 
                    variant="destructive" 
                    onClick={() => handleLeaveSeat(booking._id)}
                    className="flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Leave Library</span>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Library Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Choose Library</h3>
          {libraries.map((library) => {
            const availableSeats = library.seats.filter(seat => !seat.isOccupied).length;
            const { status, badge } = getOccupancyStatus(availableSeats, library.totalSeats);
            
            return (
              <Card 
                key={library._id} 
                className={`cursor-pointer transition-all ${
                  selectedLibrary?._id === library._id ? 'ring-2 ring-blue-500 shadow-md' : 'hover:shadow-md'
                }`}
                onClick={() => handleLibrarySelect(library)}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-lg">{library.name}</h4>
                      <Badge variant={badge}>
                        {availableSeats} available
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{library.floor}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {library.features?.map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {feature === 'Wi-Fi' && <Wifi className="h-3 w-3 mr-1" />}
                          {feature === 'AC' && <span className="mr-1">❄️</span>}
                          {feature === 'Silent Zone' && <Volume2 className="h-3 w-3 mr-1" />}
                          {feature}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Occupancy: {status}</span>
                        <span>{library.totalSeats - availableSeats}/{library.totalSeats} occupied</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            status === 'Low' ? 'bg-green-500' : 
                            status === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${((library.totalSeats - availableSeats) / library.totalSeats) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Seat Layout */}
        <div className="lg:col-span-2">
          {selectedLibrary ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Select Your Seat - {selectedLibrary.name}</span>
                  {selectedSeat && (
                    <Button 
                      onClick={() => setShowBookingModal(true)}
                      disabled={userBookings.length > 0}
                      className="flex items-center space-x-2"
                    >
                      <BookOpen className="h-4 w-4" />
                      <span>Book Seat {selectedSeat}</span>
                    </Button>
                  )}
                </CardTitle>
                <CardDescription>
                  Click on an available seat to select it. Seats are organized by study zones.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderSeatLayout(selectedLibrary)}
                
                {userBookings.length > 0 && (
                  <div className="mt-4 p-3 bg-orange-100 border border-orange-300 rounded-lg">
                    <p className="text-sm text-orange-700">
                      ⚠️ You already have an active booking. Please leave your current seat first to book a new one.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">Select a library to view available seats</p>
                <p className="text-sm text-gray-400">Choose from LHC, ESB, or Apex library to see real-time seat availability with PVR-style layout</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Booking Confirmation Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Confirm Your Booking</h3>
              <div className="space-y-3">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="font-medium text-blue-900">{selectedLibrary?.name}</p>
                  <p className="text-sm text-blue-700">{selectedLibrary?.floor}</p>
                  <p className="text-lg font-bold text-blue-800">Seat {selectedSeat}</p>
                </div>
                <div className="text-sm text-gray-600">
                  <p>• Please arrive within 15 minutes of booking</p>
                  <p>• Remember to click "Leave Library" when you're done</p>
                  <p>• Keep your belongings with you at all times</p>
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
                  onClick={handleBookSeat}
                  className="flex-1"
                >
                  Confirm Booking
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedLibraryBooking;