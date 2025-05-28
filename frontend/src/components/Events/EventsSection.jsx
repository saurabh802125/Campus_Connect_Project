import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Users, Ticket } from 'lucide-react';
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

  useEffect(() => {
    fetchEvents();
    fetchBookings();
  }, []);

  const fetchEvents = async () => {
    try {
      const data = await eventAPI.getEvents();
      setEvents(data);
    } catch (error) {
      setError('Failed to fetch events');
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
  };

  const handleSeatSelect = (seatId) => {
    setSelectedSeat(seatId);
  };

  const handleBookTicket = async () => {
    if (selectedEvent && selectedSeat) {
      try {
        await eventAPI.bookSeat(selectedEvent, selectedSeat);
        await fetchEvents();
        await fetchBookings();
        setSelectedSeat(null);
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to book ticket');
      }
    }
  };

  if (loading) return <div className="text-center">Loading events...</div>;
  if (error) return <div className="text-red-600 text-center">{error}</div>;

  return (
    <div className="space-y-6">
      {userBookings.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-800">
              <Ticket className="h-5 w-5" />
              <span>My Bookings</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userBookings.map((booking) => (
                <div key={booking._id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div>
                    <p className="font-medium">{booking.event?.title}</p>
                    <p className="text-sm text-gray-600">
                      Seat {booking.seatNumber} • {booking.event?.venue}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(booking.event?.date).toLocaleDateString()} at {booking.event?.time}
                    </p>
                  </div>
                  <Badge variant="outline">₹{booking.price}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Upcoming Events</h3>
          {events.map((event) => {
            const availableSeats = event.seats.filter(seat => !seat.isOccupied).length;
            return (
              <Card 
                key={event._id} 
                className={`cursor-pointer transition-all ${
                  selectedEvent === event._id ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
                }`}
                onClick={() => handleEventSelect(event._id)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{event.title}</span>
                    <Badge>{event.category}</Badge>
                  </CardTitle>
                  <CardDescription>{event.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>{event.venue}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>{availableSeats} seats available</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div>
          {selectedEvent ? (
            <Card>
              <CardHeader>
                <CardTitle>Select Your Seat</CardTitle>
                <CardDescription>
                  {events.find(e => e._id === selectedEvent)?.title}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-full h-8 bg-gray-800 rounded-t-full flex items-center justify-center text-white text-sm">
                      STAGE
                    </div>
                  </div>

                  <div className="space-y-2">
                    {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((row) => {
                      const event = events.find(e => e._id === selectedEvent);
                      const rowSeats = event.seats.filter(seat => seat.row === row).slice(0, 15);
                      
                      return (
                        <div key={row} className="flex items-center space-x-1">
                          <span className="w-6 text-center text-sm font-medium">{row}</span>
                          <div className="flex space-x-1">
                            {rowSeats.map((seat) => (
                              <div
                                key={seat._id}
                                onClick={() => !seat.isOccupied && handleSeatSelect(seat._id)}
                                className={`
                                  w-8 h-8 rounded text-xs flex items-center justify-center cursor-pointer transition-colors
                                  ${seat.isOccupied ? 'bg-red-500 text-white cursor-not-allowed' : 
                                    selectedSeat === seat._id ? 'bg-blue-500 text-white' : 
                                    row <= 'C' ? 'bg-yellow-200 hover:bg-yellow-300' :
                                    row <= 'F' ? 'bg-green-200 hover:bg-green-300' :
                                    'bg-gray-200 hover:bg-gray-300'}
                                `}
                                title={`${row}${seat.number} - ₹${seat.price}`}
                              >
                                {seat.number}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center space-x-1">
                      <div className="w-4 h-4 bg-yellow-200 rounded"></div>
                      <span>Premium (₹100)</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-4 h-4 bg-green-200 rounded"></div>
                      <span>Standard (₹75)</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-4 h-4 bg-gray-200 rounded"></div>
                      <span>Economy (₹50)</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-4 h-4 bg-red-500 rounded"></div>
                      <span>Occupied</span>
                    </div>
                  </div>

                  {selectedSeat && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            Seat {events.find(e => e._id === selectedEvent)?.seats.find(s => s._id === selectedSeat)?.row}
                            {events.find(e => e._id === selectedEvent)?.seats.find(s => s._id === selectedSeat)?.number}
                          </p>
                          <p className="text-sm text-blue-600">
                            ₹{events.find(e => e._id === selectedEvent)?.seats.find(s => s._id === selectedSeat)?.price}
                          </p>
                        </div>
                        <Button onClick={handleBookTicket}>
                          Book Ticket
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-500">Select an event to view seat layout</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventsSection;
