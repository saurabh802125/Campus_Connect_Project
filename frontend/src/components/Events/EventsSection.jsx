import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Users, Ticket, Star, AlertCircle, X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../UI/Card';
import Button from '../UI/Button';
import Badge from '../UI/Badge';
import { eventAPI, libraryAPI } from '../../services/api';

const EventsSection = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [userBookings, setUserBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    fetchEvents();
    fetchBookings();
  }, []);

  const fetchEvents = async () => {
    try {
      setError(null);
      const data = await eventAPI.getEvents();
      setEvents(data);
    } catch (error) {
      setError('Failed to fetch events. Please check if the backend server is running.');
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const bookings = await libraryAPI.getBookings();
      setUserBookings(bookings.filter(b => b.type === 'event'));
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const handleEventSelect = (eventId) => {
    setSelectedEvent(eventId);
    setSelectedSeat(null);
    setError(null);
  };

  const handleSeatSelect = (seatId) => {
    setSelectedSeat(seatId);
    setError(null);
  };

  const handleBookTicket = async () => {
    if (selectedEvent && selectedSeat) {
      try {
        await eventAPI.bookSeat(selectedEvent, selectedSeat);
        await fetchEvents();
        await fetchBookings();
        setSelectedSeat(null);
        setError(null);
        
        const event = events.find(e => e._id === selectedEvent);
        const seat = event?.seats.find(s => s._id === selectedSeat);
        setSuccessMessage(`🎉 Ticket booked successfully! ${seat?.row}${seat?.number} for ${event?.title}`);
        
        setTimeout(() => setSuccessMessage(null), 5000);
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to book ticket');
      }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading events...</p>
          <p className="text-sm text-gray-500">Fetching upcoming college events</p>
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
          <span>{successMessage}</span>
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
                      <Badge variant="outline" className="text-xs">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Events List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Upcoming Events</h3>
            <button 
              onClick={fetchEvents}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
            >
              <span>🔄 Refresh</span>
            </button>
          </div>
          
          {events.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No upcoming events</p>
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
            events.map((event) => {
              const availableSeats = event.seats.filter(seat => !seat.isOccupied).length;
              const isAlmostFull = availableSeats < 10;
              const isPastEvent = new Date(event.date) < new Date();
              
              return (
                <Card 
                  key={event._id} 
                  className={`cursor-pointer transition-all ${
                    selectedEvent === event._id ? 'ring-2 ring-blue-500 shadow-md' : 'hover:shadow-md'
                  } ${isPastEvent ? 'opacity-60' : ''}`}
                  onClick={() => !isPastEvent && handleEventSelect(event._id)}
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
                        {isAlmostFull && !isPastEvent && (
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
                      
                      {isPastEvent && (
                        <Badge variant="secondary" className="w-full justify-center">
                          Event Completed
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Seat Selection */}
        <div>
          {selectedEvent ? (
            <Card>
              <CardHeader>
                <CardTitle>Select Your Seat</CardTitle>
                <CardDescription>
                  {events.find(e => e._id === selectedEvent)?.title} - Choose your preferred seat
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Stage/Screen */}
                  <div className="text-center">
                    <div className="w-full h-10 bg-gradient-to-r from-gray-700 to-gray-900 rounded-t-lg flex items-center justify-center text-white text-sm font-medium shadow-lg">
                      🎭 STAGE / SCREEN 🎭
                    </div>
                  </div>

                  {/* Seat Layout */}
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].map((row) => {
                      const event = events.find(e => e._id === selectedEvent);
                      const rowSeats = event?.seats.filter(seat => seat.row === row) || [];
                      
                      if (rowSeats.length === 0) return null;
                      
                      return (
                        <div key={row} className="flex items-center space-x-2">
                          <span className="w-6 text-center text-sm font-bold text-gray-700">{row}</span>
                          <div className="flex space-x-1 flex-wrap">
                            {rowSeats.map((seat) => {
                              const isSelected = selectedSeat === seat._id;
                              const isOccupied = seat.isOccupied;
                              const seatClass = `
                                w-7 h-7 rounded text-xs flex items-center justify-center cursor-pointer transition-all font-medium border
                                ${isOccupied 
                                  ? 'bg-red-500 text-white cursor-not-allowed border-red-600' 
                                  : isSelected 
                                    ? 'bg-blue-500 text-white shadow-lg border-blue-600' 
                                    : seat.price >= 100
                                      ? 'bg-yellow-200 hover:bg-yellow-300 border-yellow-400 text-yellow-800'
                                      : seat.price >= 75
                                        ? 'bg-green-200 hover:bg-green-300 border-green-400 text-green-800'
                                        : 'bg-gray-200 hover:bg-gray-300 border-gray-400 text-gray-800'
                                }
                              `;
                              
                              return (
                                <div
                                  key={seat._id}
                                  onClick={() => !isOccupied && handleSeatSelect(seat._id)}
                                  className={seatClass}
                                  title={`${row}${seat.number} - ₹${seat.price} ${isOccupied ? '(Occupied)' : ''}`}
                                >
                                  {seat.number}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center space-x-1">
                      <div className="w-4 h-4 bg-yellow-200 border border-yellow-400 rounded"></div>
                      <span>Premium (₹100+)</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-4 h-4 bg-green-200 border border-green-400 rounded"></div>
                      <span>Standard (₹75+)</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-4 h-4 bg-gray-200 border border-gray-400 rounded"></div>
                      <span>Economy (₹50+)</span>
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
                          <p className="font-medium text-blue-900">
                            Seat {events.find(e => e._id === selectedEvent)?.seats.find(s => s._id === selectedSeat)?.row}
                            {events.find(e => e._id === selectedEvent)?.seats.find(s => s._id === selectedSeat)?.number}
                          </p>
                          <p className="text-sm text-blue-700">
                            {events.find(e => e._id === selectedEvent)?.venue}
                          </p>
                          <p className="text-lg font-bold text-blue-800">
                            ₹{events.find(e => e._id === selectedEvent)?.seats.find(s => s._id === selectedSeat)?.price}
                          </p>
                        </div>
                        <Button 
                          onClick={handleBookTicket}
                          className="flex items-center space-x-2"
                        >
                          <Ticket className="h-4 w-4" />
                          <span>Book Ticket</span>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">Select an event to view seat layout</p>
                <p className="text-sm text-gray-400">Choose from upcoming college events to book your seat like in a movie theater</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventsSection;