import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, Users, Clock, X, CheckCircle, AlertCircle, LogOut, MapPin, Wifi, Volume2, Monitor } from 'lucide-react';
import { libraryAPI } from '../../services/api';
import socketService from '../../services/socket';
import { useAuth } from '../../context/AuthContext';

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
    destructive: "bg-red-600 text-white hover:bg-red-700",
    success: "bg-green-600 text-white hover:bg-green-700"
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
    warning: "bg-yellow-100 text-yellow-800"
  };
  
  return (
    <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};

const PVRStyleLibraryBooking = () => {
  const [libraries, setLibraries] = useState([]);
  const [selectedLibrary, setSelectedLibrary] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [userBookings, setUserBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [hoveredSeat, setHoveredSeat] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);

  const { user } = useAuth();

  // Initialize socket connection and fetch data
  useEffect(() => {
    initializeApp();
    return () => {
      cleanupSocket();
    };
  }, []);

  // Socket event handlers
  useEffect(() => {
    if (socketConnected) {
      socketService.onSeatUpdate(handleRealTimeSeatUpdate);
      socketService.onLibrarySeatUpdate(handleRealTimeSeatUpdate);
    }

    return () => {
      socketService.offSeatUpdate();
    };
  }, [socketConnected, selectedLibrary]);

  // Join library room when library is selected
  useEffect(() => {
    if (selectedLibrary && socketConnected) {
      socketService.joinLibrary(selectedLibrary._id);
    }
  }, [selectedLibrary, socketConnected]);

  const initializeApp = async () => {
    try {
      setLoading(true);
      
      // Connect socket
      const socket = socketService.connect();
      if (socket) {
        socket.on('connect', () => {
          setSocketConnected(true);
          console.log('Socket connected for library booking');
        });
        
        socket.on('disconnect', () => {
          setSocketConnected(false);
          console.log('Socket disconnected');
        });
      }

      // Fetch libraries and bookings
      await Promise.all([
        fetchLibraries(),
        fetchUserBookings()
      ]);
    } catch (error) {
      console.error('Failed to initialize app:', error);
      setError('Failed to load library data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const cleanupSocket = () => {
    if (selectedLibrary) {
      socketService.leaveLibrary(selectedLibrary._id);
    }
    socketService.disconnect();
  };

  const fetchLibraries = async () => {
    try {
      const librariesData = await libraryAPI.getLibraries();
      setLibraries(librariesData);
    } catch (error) {
      console.error('Error fetching libraries:', error);
      setError('Failed to fetch libraries');
    }
  };

  const fetchUserBookings = async () => {
    try {
      const bookingsData = await libraryAPI.getBookings();
      setUserBookings(bookingsData.filter(booking => booking.type === 'library'));
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const handleRealTimeSeatUpdate = useCallback((data) => {
    console.log('Processing real-time seat update:', data);
    
    setLibraries(prevLibraries => {
      return prevLibraries.map(library => {
        if (library._id === data.libraryId) {
          const updatedSeats = library.seats.map(seat => {
            if (seat.number === data.seatNumber) {
              if (data.type === 'booked') {
                return {
                  ...seat,
                  isOccupied: true,
                  occupiedBy: data.userId,
                  occupiedAt: new Date(data.timestamp)
                };
              } else if (data.type === 'released') {
                return {
                  ...seat,
                  isOccupied: false,
                  occupiedBy: null,
                  occupiedAt: null
                };
              }
            }
            return seat;
          });
          
          const updatedLibrary = { ...library, seats: updatedSeats };
          
          // Update selected library if it's the same one
          if (selectedLibrary && selectedLibrary._id === library._id) {
            setSelectedLibrary(updatedLibrary);
          }
          
          return updatedLibrary;
        }
        return library;
      });
    });

    // Show notification for other users
    if (data.userId !== user?._id) {
      if (data.type === 'booked') {
        setSuccessMessage(`📍 ${data.userName || 'Someone'} just booked a seat in ${data.libraryName || 'the library'}`);
      } else {
        setSuccessMessage(`✅ A seat just became available in ${data.libraryName || 'the library'}`);
      }
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  }, [selectedLibrary, user]);

  const handleLibrarySelect = (library) => {
    // Leave previous library room
    if (selectedLibrary && socketConnected) {
      socketService.leaveLibrary(selectedLibrary._id);
    }
    
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
    } else if (seat && seat.occupiedBy === user?._id) {
      // Allow user to select their own seat to leave
      setSelectedSeat(seatNumber);
      setError(null);
    }
  };

  const handleBookSeat = async () => {
    if (selectedLibrary && selectedSeat) {
      // Check if user already has a booking
      if (userBookings.length > 0) {
        setError('You already have an active booking. Please leave your current seat first.');
        return;
      }

      try {
        setLoading(true);
        const response = await libraryAPI.bookSeat(selectedLibrary._id, selectedSeat);
        
        // Emit socket event for real-time updates
        if (socketConnected) {
          socketService.emitSeatBooked({
            libraryId: selectedLibrary._id,
            libraryName: selectedLibrary.name,
            seatNumber: selectedSeat,
            userId: user._id,
            userName: user.name
          });
        }
        
        // Update local state
        const updatedLibraries = libraries.map(lib => {
          if (lib._id === selectedLibrary._id) {
            const updatedSeats = lib.seats.map(seat => {
              if (seat.number === selectedSeat) {
                return { 
                  ...seat, 
                  isOccupied: true, 
                  occupiedBy: user._id, 
                  occupiedAt: new Date() 
                };
              }
              return seat;
            });
            return { ...lib, seats: updatedSeats };
          }
          return lib;
        });
        
        setLibraries(updatedLibraries);
        setSelectedLibrary(updatedLibraries.find(l => l._id === selectedLibrary._id));
        
        // Refresh bookings
        await fetchUserBookings();
        
        setSelectedSeat(null);
        setShowBookingModal(false);
        setSuccessMessage(`🎉 Successfully booked Seat ${getSeatRowLabel(selectedSeat, selectedLibrary.layout.seatsPerRow)}${getSeatNumberInRow(selectedSeat, selectedLibrary.layout.seatsPerRow)} in ${selectedLibrary.name}!`);
        setTimeout(() => setSuccessMessage(null), 5000);
      } catch (error) {
        console.error('Booking error:', error);
        setError(error.response?.data?.message || 'Failed to book seat');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleLeaveSeat = async (bookingId) => {
    const booking = userBookings.find(b => b._id === bookingId);
    if (booking) {
      try {
        setLoading(true);
        await libraryAPI.leaveSeat(bookingId);
        
        // Emit socket event for real-time updates
        if (socketConnected) {
          socketService.emitSeatReleased({
            libraryId: booking.library._id,
            libraryName: booking.library.name,
            seatNumber: parseInt(booking.seatNumber),
            userId: user._id,
            userName: user.name
          });
        }
        
        // Update local state
        const updatedLibraries = libraries.map(lib => {
          if (lib._id === booking.library._id) {
            const updatedSeats = lib.seats.map(seat => {
              if (seat.number === parseInt(booking.seatNumber)) {
                return { 
                  ...seat, 
                  isOccupied: false, 
                  occupiedBy: null, 
                  occupiedAt: null 
                };
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
        
        // Refresh bookings
        await fetchUserBookings();
        
        setSuccessMessage(`✅ You have successfully left Seat ${getSeatRowLabel(booking.seatNumber, booking.library.layout?.seatsPerRow || 15)}${getSeatNumberInRow(booking.seatNumber, booking.library.layout?.seatsPerRow || 15)} in ${booking.library.name}. The seat is now available for other students.`);
        setTimeout(() => setSuccessMessage(null), 5000);
      } catch (error) {
        console.error('Leave seat error:', error);
        setError(error.response?.data?.message || 'Failed to leave seat');
      } finally {
        setLoading(false);
      }
    }
  };

  const getOccupancyStatus = (availableSeats, totalSeats) => {
    const occupancyRate = ((totalSeats - availableSeats) / totalSeats * 100);
    if (occupancyRate < 50) return { status: 'Low', color: 'green', badge: 'success' };
    if (occupancyRate < 80) return { status: 'Medium', color: 'yellow', badge: 'warning' };
    return { status: 'High', color: 'red', badge: 'destructive' };
  };

  const getSeatRowLabel = (seatNumber, seatsPerRow) => {
    return String.fromCharCode(65 + Math.floor((seatNumber - 1) / seatsPerRow));
  };

  const getSeatNumberInRow = (seatNumber, seatsPerRow) => {
    return ((seatNumber - 1) % seatsPerRow) + 1;
  };

  const renderPVRSeatLayout = (library) => {
    if (!library.layout) {
      // Fallback for libraries without layout
      library.layout = { rows: 8, seatsPerRow: Math.ceil(library.totalSeats / 8) };
    }
    
    const { rows, seatsPerRow } = library.layout;
    
    return (
      <div className="space-y-6">
        {/* Library Info Header - Similar to movie screen */}
        <div className="text-center">
          <div className="w-full h-16 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white text-lg font-bold shadow-lg mb-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10 animate-pulse"></div>
            <div className="relative z-10 flex items-center space-x-3">
              <BookOpen className="h-6 w-6" />
              <span>{library.name.toUpperCase()}</span>
              <Monitor className="h-6 w-6" />
            </div>
            {socketConnected && (
              <div className="absolute top-2 right-2 w-3 h-3 bg-green-400 rounded-full animate-pulse" title="Real-time updates active"></div>
            )}
          </div>
        </div>

        {/* Seat Layout - PVR Style */}
        <div className="bg-gray-900 rounded-xl p-6 space-y-4">
          {Array.from({ length: rows }, (_, rowIndex) => {
            const rowLabel = String.fromCharCode(65 + rowIndex);
            const isPreferredRow = rowIndex >= 2 && rowIndex <= 5; // Middle rows are preferred
            
            return (
              <div key={rowIndex} className="flex items-center justify-center space-x-2">
                {/* Row Label */}
                <div className="w-8 text-center">
                  <span className="text-white font-bold text-sm">{rowLabel}</span>
                </div>
                
                {/* Left Section */}
                <div className="flex space-x-1">
                  {Array.from({ length: Math.floor(seatsPerRow / 3) }, (_, seatIndex) => {
                    const seatNumber = rowIndex * seatsPerRow + seatIndex + 1;
                    if (seatNumber > library.totalSeats) return null;
                    
                    const seat = library.seats.find(s => s.number === seatNumber);
                    const isUserSeat = seat?.occupiedBy === user?._id;
                    const isOccupied = seat?.isOccupied && !isUserSeat;
                    const isSelected = selectedSeat === seatNumber;
                    const isHovered = hoveredSeat === seatNumber;
                    
                    return (
                      <div
                        key={seatNumber}
                        onClick={() => handleSeatSelect(seatNumber)}
                        onMouseEnter={() => setHoveredSeat(seatNumber)}
                        onMouseLeave={() => setHoveredSeat(null)}
                        className={`
                          w-8 h-8 rounded-t-lg cursor-pointer transition-all duration-200 text-xs flex items-center justify-center font-bold border-2 relative transform
                          ${isOccupied 
                            ? 'bg-red-500 border-red-600 text-white cursor-not-allowed' 
                            : isUserSeat
                              ? 'bg-orange-500 border-orange-600 text-white shadow-lg ring-2 ring-orange-300'
                              : isSelected 
                                ? 'bg-blue-500 border-blue-600 text-white shadow-lg scale-110 ring-2 ring-blue-300' 
                                : isPreferredRow
                                  ? 'bg-green-200 border-green-400 text-green-800 hover:bg-green-300 hover:scale-105'
                                  : 'bg-gray-200 border-gray-400 text-gray-700 hover:bg-gray-300 hover:scale-105'
                          }
                          ${isHovered && !isOccupied ? 'shadow-xl z-10' : ''}
                        `}
                        title={`${rowLabel}${getSeatNumberInRow(seatNumber, seatsPerRow)} ${
                          isOccupied ? '(Occupied)' : 
                          isUserSeat ? '(Your Seat)' : 
                          isPreferredRow ? '(Premium)' : '(Standard)'
                        }`}
                      >
                        {getSeatNumberInRow(seatNumber, seatsPerRow)}
                        
                        {/* Status indicators */}
                        {isUserSeat && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border border-white animate-pulse"></div>
                        )}
                        {isSelected && !isUserSeat && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-300 rounded-full border border-white"></div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* Aisle Gap */}
                <div className="w-8"></div>
                
                {/* Middle Section */}
                <div className="flex space-x-1">
                  {Array.from({ length: Math.floor(seatsPerRow / 3) }, (_, seatIndex) => {
                    const seatNumber = rowIndex * seatsPerRow + Math.floor(seatsPerRow / 3) + seatIndex + 1;
                    if (seatNumber > library.totalSeats) return null;
                    
                    const seat = library.seats.find(s => s.number === seatNumber);
                    const isUserSeat = seat?.occupiedBy === user?._id;
                    const isOccupied = seat?.isOccupied && !isUserSeat;
                    const isSelected = selectedSeat === seatNumber;
                    const isHovered = hoveredSeat === seatNumber;
                    
                    return (
                      <div
                        key={seatNumber}
                        onClick={() => handleSeatSelect(seatNumber)}
                        onMouseEnter={() => setHoveredSeat(seatNumber)}
                        onMouseLeave={() => setHoveredSeat(null)}
                        className={`
                          w-8 h-8 rounded-t-lg cursor-pointer transition-all duration-200 text-xs flex items-center justify-center font-bold border-2 relative transform
                          ${isOccupied 
                            ? 'bg-red-500 border-red-600 text-white cursor-not-allowed' 
                            : isUserSeat
                              ? 'bg-orange-500 border-orange-600 text-white shadow-lg ring-2 ring-orange-300'
                              : isSelected 
                                ? 'bg-blue-500 border-blue-600 text-white shadow-lg scale-110 ring-2 ring-blue-300' 
                                : isPreferredRow
                                  ? 'bg-green-200 border-green-400 text-green-800 hover:bg-green-300 hover:scale-105'
                                  : 'bg-gray-200 border-gray-400 text-gray-700 hover:bg-gray-300 hover:scale-105'
                          }
                          ${isHovered && !isOccupied ? 'shadow-xl z-10' : ''}
                        `}
                        title={`${rowLabel}${getSeatNumberInRow(seatNumber, seatsPerRow)} ${
                          isOccupied ? '(Occupied)' : 
                          isUserSeat ? '(Your Seat)' : 
                          isPreferredRow ? '(Premium)' : '(Standard)'
                        }`}
                      >
                        {getSeatNumberInRow(seatNumber, seatsPerRow)}
                        
                        {isUserSeat && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border border-white animate-pulse"></div>
                        )}
                        {isSelected && !isUserSeat && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-300 rounded-full border border-white"></div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* Aisle Gap */}
                <div className="w-8"></div>
                
                {/* Right Section */}
                <div className="flex space-x-1">
                  {Array.from({ length: seatsPerRow - 2 * Math.floor(seatsPerRow / 3) }, (_, seatIndex) => {
                    const seatNumber = rowIndex * seatsPerRow + 2 * Math.floor(seatsPerRow / 3) + seatIndex + 1;
                    if (seatNumber > library.totalSeats) return null;
                    
                    const seat = library.seats.find(s => s.number === seatNumber);
                    const isUserSeat = seat?.occupiedBy === user?._id;
                    const isOccupied = seat?.isOccupied && !isUserSeat;
                    const isSelected = selectedSeat === seatNumber;
                    const isHovered = hoveredSeat === seatNumber;
                    
                    return (
                      <div
                        key={seatNumber}
                        onClick={() => handleSeatSelect(seatNumber)}
                        onMouseEnter={() => setHoveredSeat(seatNumber)}
                        onMouseLeave={() => setHoveredSeat(null)}
                        className={`
                          w-8 h-8 rounded-t-lg cursor-pointer transition-all duration-200 text-xs flex items-center justify-center font-bold border-2 relative transform
                          ${isOccupied 
                            ? 'bg-red-500 border-red-600 text-white cursor-not-allowed' 
                            : isUserSeat
                              ? 'bg-orange-500 border-orange-600 text-white shadow-lg ring-2 ring-orange-300'
                              : isSelected 
                                ? 'bg-blue-500 border-blue-600 text-white shadow-lg scale-110 ring-2 ring-blue-300' 
                                : isPreferredRow
                                  ? 'bg-green-200 border-green-400 text-green-800 hover:bg-green-300 hover:scale-105'
                                  : 'bg-gray-200 border-gray-400 text-gray-700 hover:bg-gray-300 hover:scale-105'
                          }
                          ${isHovered && !isOccupied ? 'shadow-xl z-10' : ''}
                        `}
                        title={`${rowLabel}${getSeatNumberInRow(seatNumber, seatsPerRow)} ${
                          isOccupied ? '(Occupied)' : 
                          isUserSeat ? '(Your Seat)' : 
                          isPreferredRow ? '(Premium)' : '(Standard)'
                        }`}
                      >
                        {getSeatNumberInRow(seatNumber, seatsPerRow)}
                        
                        {isUserSeat && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border border-white animate-pulse"></div>
                        )}
                        {isSelected && !isUserSeat && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-300 rounded-full border border-white"></div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* Row Label Right */}
                <div className="w-8 text-center">
                  <span className="text-white font-bold text-sm">{rowLabel}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend - PVR Style */}
        <div className="bg-gray-100 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-800 mb-3">Seat Legend</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gray-200 border-2 border-gray-400 rounded-t-lg"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-green-200 border-2 border-green-400 rounded-t-lg"></div>
              <span>Premium</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-500 border-2 border-blue-600 rounded-t-lg"></div>
              <span>Selected</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-red-500 border-2 border-red-600 rounded-t-lg"></div>
              <span>Occupied</span>
            </div>
          </div>
          <div className="mt-3 flex items-center space-x-2">
            <div className="w-6 h-6 bg-orange-500 border-2 border-orange-600 rounded-t-lg relative">
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full border border-white"></div>
            </div>
            <span>Your Current Seat</span>
          </div>
        </div>

        {/* Seat Selection Info */}
        {hoveredSeat && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Seat {getSeatRowLabel(hoveredSeat, library.layout.seatsPerRow)}{getSeatNumberInRow(hoveredSeat, library.layout.seatsPerRow)}</strong>
              {' - '}
              {library.seats.find(s => s.number === hoveredSeat)?.isOccupied 
                ? library.seats.find(s => s.number === hoveredSeat)?.occupiedBy === user?._id
                  ? 'This is your current seat'
                  : 'This seat is currently occupied'
                : 'Click to select this seat'
              }
            </p>
          </div>
        )}
      </div>
    );
  };

  if (loading && libraries.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-6 flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading library data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Library Seat Booking</h1>
        <p className="text-gray-600">Choose your preferred library and book a seat with our PVR-style interface</p>
        <div className="flex items-center justify-center mt-2 space-x-2">
          <div className={`w-3 h-3 rounded-full ${socketConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-500">
            {socketConnected ? 'Real-time updates active' : 'Connecting...'}
          </span>
        </div>
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

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Current Bookings */}
      {userBookings.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-orange-800">
              <CheckCircle className="h-5 w-5" />
              <span>My Current Library Booking</span>
            </CardTitle>
            <CardDescription className="text-orange-700">
              You are currently occupying a library seat. Please remember to leave when you're done to make it available for others.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userBookings.map((booking) => (
                <div key={booking._id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-orange-200">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-5 w-5 text-orange-600" />
                      <p className="font-medium text-orange-800">{booking.library?.name}</p>
                    </div>
                    <p className="text-sm text-gray-600">
                      <strong>Seat {getSeatRowLabel(booking.seatNumber, booking.library?.layout?.seatsPerRow || 15)}{getSeatNumberInRow(booking.seatNumber, booking.library?.layout?.seatsPerRow || 15)}</strong> • {booking.library?.floor}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>Booked at {new Date(booking.bookedAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <Button 
                    variant="destructive" 
                    onClick={() => handleLeaveSeat(booking._id)}
                    className="flex items-center space-x-2"
                    disabled={loading}
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
                  {selectedSeat && !selectedLibrary.seats.find(s => s.number === selectedSeat)?.isOccupied && (
                    <Button 
                      onClick={() => setShowBookingModal(true)}
                      disabled={userBookings.length > 0 || loading}
                      className="flex items-center space-x-2"
                    >
                      <BookOpen className="h-4 w-4" />
                      <span>Book Seat {getSeatRowLabel(selectedSeat, selectedLibrary.layout?.seatsPerRow || 15)}{getSeatNumberInRow(selectedSeat, selectedLibrary.layout?.seatsPerRow || 15)}</span>
                    </Button>
                  )}
                  {selectedSeat && selectedLibrary.seats.find(s => s.number === selectedSeat)?.occupiedBy === user?._id && (
                    <Button 
                      variant="destructive"
                      onClick={() => {
                        const booking = userBookings.find(b => b.seatNumber == selectedSeat);
                        if (booking) handleLeaveSeat(booking._id);
                      }}
                      className="flex items-center space-x-2"
                      disabled={loading}
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Leave Seat</span>
                    </Button>
                  )}
                </CardTitle>
                <CardDescription>
                  Click on an available seat to select it. PVR-style layout with premium middle rows highlighted in green.
                  {socketConnected && <span className="text-green-600"> • Real-time updates active</span>}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderPVRSeatLayout(selectedLibrary)}
                
                {userBookings.length > 0 && selectedSeat && !selectedLibrary.seats.find(s => s.number === selectedSeat)?.occupiedBy === user?._id && (
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
                <p className="text-sm text-gray-400">Choose from LHC, ESB, Apex, or Central library to see real-time seat availability with our new PVR-style interface</p>
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
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="font-medium text-blue-900">{selectedLibrary?.name}</p>
                  <p className="text-sm text-blue-700">{selectedLibrary?.floor}</p>
                  <p className="text-lg font-bold text-blue-800">
                    Seat {getSeatRowLabel(selectedSeat, selectedLibrary.layout?.seatsPerRow || 15)}{getSeatNumberInRow(selectedSeat, selectedLibrary.layout?.seatsPerRow || 15)}
                  </p>
                  <div className="mt-2 flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-500 border border-blue-600 rounded-t"></div>
                    <span className="text-sm text-blue-700">This seat will be marked as occupied (red) for other students</span>
                  </div>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>• Please arrive within 15 minutes of booking</p>
                  <p>• Remember to click "Leave Library" when you're done</p>
                  <p>• Your seat will show as orange with a yellow indicator</p>
                  <p>• Other students will see it as red (occupied)</p>
                  <p>• Keep your belongings with you at all times</p>
                  {socketConnected && <p>• Real-time updates will notify others instantly</p>}
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <Button 
                  variant="outline"
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleBookSeat}
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? 'Booking...' : 'Confirm Booking'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Updates Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Monitor className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Real-time Seat Updates</h4>
              <p className="text-sm text-blue-700">
                Seat availability updates instantly across all devices! When you book a seat, it turns orange for you and red for others. 
                When you leave, it becomes available (gray/green) for everyone immediately - just like PVR movie booking system.
                {socketConnected 
                  ? ' Socket connection is active for live updates.' 
                  : ' Reconnecting to enable live updates...'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PVRStyleLibraryBooking;