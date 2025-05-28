import React, { useState, useEffect } from 'react';
import { BookOpen, Users, Clock, X, CheckCircle, AlertCircle, LogOut } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../UI/Card';
import Button from '../UI/Button';
import Badge from '../UI/Badge';
import { libraryAPI } from '../../services/api';

const LibrarySection = () => {
  const [libraries, setLibraries] = useState([]);
  const [selectedLibrary, setSelectedLibrary] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [userBookings, setUserBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    fetchLibraries();
    fetchBookings();
    // Auto refresh data every 30 seconds for real-time updates
    const interval = setInterval(() => {
      fetchLibraries();
      fetchBookings();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchLibraries = async () => {
    try {
      setError(null);
      const data = await libraryAPI.getLibraries();
      setLibraries(data);
    } catch (error) {
      setError('Failed to fetch libraries. Please check if the backend server is running.');
      console.error('Error fetching libraries:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const bookings = await libraryAPI.getBookings();
      setUserBookings(bookings.filter(b => b.type === 'library'));
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const handleLibrarySelect = (libraryId) => {
    setSelectedLibrary(libraryId);
    setSelectedSeat(null);
    setError(null);
    setSuccessMessage(null);
  };

  const handleSeatSelect = (seatNumber) => {
    const library = libraries.find(l => l._id === selectedLibrary);
    const seat = library?.seats.find(s => s.number === seatNumber);
    
    if (seat && !seat.isOccupied) {
      setSelectedSeat(seatNumber);
      setError(null);
    }
  };

  const handleBookSeat = async () => {
    if (selectedLibrary && selectedSeat) {
      setBookingLoading(true);
      try {
        await libraryAPI.bookSeat(selectedLibrary, selectedSeat);
        await fetchLibraries();
        await fetchBookings();
        setSelectedSeat(null);
        setError(null);
        
        const libraryName = libraries.find(l => l._id === selectedLibrary)?.name;
        setSuccessMessage(`🎉 Successfully booked Seat ${selectedSeat} in ${libraryName}!`);
        
        // Clear success message after 5 seconds
        setTimeout(() => setSuccessMessage(null), 5000);
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to book seat');
      } finally {
        setBookingLoading(false);
      }
    }
  };

  const handleLeaveSeat = async (bookingId, libraryName, seatNumber) => {
    try {
      await libraryAPI.leaveSeat(bookingId);
      await fetchLibraries();
      await fetchBookings();
      setError(null);
      setSuccessMessage(`✅ You have successfully left Seat ${seatNumber} in ${libraryName}. The seat is now available for other students.`);
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to leave seat');
    }
  };

  const getOccupancyStatus = (availableSeats, totalSeats) => {
    const occupancyRate = ((totalSeats - availableSeats) / totalSeats * 100);
    if (occupancyRate < 50) return { status: 'Low', color: 'green', badge: 'default' };
    if (occupancyRate < 80) return { status: 'Medium', color: 'yellow', badge: 'secondary' };
    return { status: 'High', color: 'red', badge: 'destructive' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading libraries...</p>
          <p className="text-sm text-gray-500">Fetching real-time seat availability</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
                      <span>Booked at {new Date(booking.bookedAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => handleLeaveSeat(booking._id, booking.library?.name, booking.seatNumber)}
                    className="text-red-600 border-red-300 hover:bg-red-50 flex items-center space-x-2"
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Library List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Available Libraries</h3>
            <button 
              onClick={() => { fetchLibraries(); fetchBookings(); }}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
            >
              <span>🔄 Refresh</span>
            </button>
          </div>
          
          {libraries.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No libraries available</p>
                <p className="text-sm text-gray-400">Please check if the backend server is running and database is seeded.</p>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()}
                  className="mt-4"
                >
                  Reload Page
                </Button>
              </CardContent>
            </Card>
          ) : (
            libraries.map((library) => {
              const availableSeats = library.seats.filter(seat => !seat.isOccupied).length;
              const occupancyRate = ((library.totalSeats - availableSeats) / library.totalSeats * 100).toFixed(0);
              const { status, badge } = getOccupancyStatus(availableSeats, library.totalSeats);
              
              return (
                <Card 
                  key={library._id} 
                  className={`cursor-pointer transition-all ${
                    selectedLibrary === library._id ? 'ring-2 ring-blue-500 shadow-md' : 'hover:shadow-md'
                  }`}
                  onClick={() => handleLibrarySelect(library._id)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{library.name}</span>
                      <Badge variant={badge}>
                        {availableSeats} available
                      </Badge>
                    </CardTitle>
                    <CardDescription>{library.floor}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4" />
                          <span>Total Seats: {library.totalSeats}</span>
                        </div>
                        <span className="text-gray-600">{occupancyRate}% occupied</span>
                      </div>
                      
                      {/* Occupancy Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all ${
                            occupancyRate < 50 ? 'bg-green-500' : 
                            occupancyRate < 80 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${occupancyRate}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>Occupancy: {status}</span>
                        <span>{library.totalSeats - availableSeats} occupied</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Seat Selection */}
        <div>
          {selectedLibrary ? (
            <Card>
              <CardHeader>
                <CardTitle>Select Your Seat</CardTitle>
                <CardDescription>
                  {libraries.find(l => l._id === selectedLibrary)?.name} - Click on an available seat to book
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Seat Grid */}
                  <div className="grid grid-cols-10 gap-1">
                    {libraries.find(l => l._id === selectedLibrary)?.seats.map((seat) => (
                      <div
                        key={seat.number}
                        onClick={() => handleSeatSelect(seat.number)}
                        className={`
                          w-8 h-8 rounded text-xs flex items-center justify-center cursor-pointer transition-all font-medium border
                          ${seat.isOccupied 
                            ? 'bg-red-500 text-white cursor-not-allowed border-red-600' 
                            : selectedSeat === seat.number 
                              ? 'bg-blue-500 text-white shadow-lg border-blue-600' 
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300 hover:border-gray-400'
                          }
                        `}
                        title={seat.isOccupied ? 'Occupied' : `Seat ${seat.number} - Available`}
                      >
                        {seat.number}
                      </div>
                    ))}
                  </div>

                  {/* Legend */}
                  <div className="flex justify-center space-x-6 text-xs">
                    <div className="flex items-center space-x-1">
                      <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
                      <span>Available</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span>Selected</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-4 h-4 bg-red-500 rounded"></div>
                      <span>Occupied</span>
                    </div>
                  </div>

                  {/* Book Button */}
                  {selectedSeat && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-blue-900">Seat {selectedSeat}</p>
                          <p className="text-sm text-blue-700">
                            {libraries.find(l => l._id === selectedLibrary)?.name}
                          </p>
                          <p className="text-xs text-blue-600 mt-1">
                            Remember to leave when you're done studying
                          </p>
                        </div>
                        <Button 
                          onClick={handleBookSeat}
                          disabled={bookingLoading || userBookings.length > 0}
                          className="flex items-center space-x-2"
                        >
                          {bookingLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Booking...</span>
                            </>
                          ) : (
                            <>
                              <BookOpen className="h-4 w-4" />
                              <span>Book Seat</span>
                            </>
                          )}
                        </Button>
                      </div>
                      {userBookings.length > 0 && (
                        <p className="text-xs text-orange-600 mt-2">
                          ⚠️ You already have an active booking. Please leave your current seat first.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">Select a library to view available seats</p>
                <p className="text-sm text-gray-400">Choose from LHC, ESB, or Apex library to see real-time seat availability</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default LibrarySection;