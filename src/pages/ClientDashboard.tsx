
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import Header from '../components/Header';
import { Calendar, Clock, User } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description: string;
  price?: number;
}

interface Booking {
  id: string;
  service_name: string;
  provider_name: string;
  scheduled_time: string;
  status: string;
}

const ClientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [scheduledTime, setScheduledTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchServices();
    fetchBookings();
  }, []);

  const fetchServices = async () => {
    try {
      const data = await api.getServices();
      setServices(data.services || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchBookings = async () => {
    // try {
    //   const data = await api.getMyBookings();
    //   setBookings(data.bookings || []);
    // } catch (error) {
    //   console.error('Error fetching bookings:', error);
    // }
  };

  const handleBookService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !scheduledTime) return;

    setIsLoading(true);
    try {
      await api.createBooking(selectedService.id, scheduledTime);
      toast({
        title: "Booking confirmed!",
        description: `Your ${selectedService.name} has been booked successfully.`,
      });
      setSelectedService(null);
      setScheduledTime('');
      fetchBookings();
    } catch (error) {
      toast({
        title: "Booking failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
          <p className="text-gray-600 mt-2">Book services and manage your appointments</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Available Services */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Available Services</h2>
            <div className="space-y-4">
              {services.map((service) => (
                <Card 
                  key={service.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedService?.id === service.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedService(service)}
                >
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      {service.name}
                      {service.price && (
                        <span className="text-green-600 font-bold">${service.price}</span>
                      )}
                    </CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>

            {/* Booking Form */}
            {selectedService && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Book {selectedService.name}</CardTitle>
                  <CardDescription>Select your preferred date and time</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleBookService} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="datetime">Preferred Date & Time</Label>
                      <Input
                        id="datetime"
                        type="datetime-local"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        required
                        min={new Date().toISOString().slice(0, 16)}
                      />
                    </div>
                    <div className="flex space-x-3">
                      <Button type="submit" disabled={isLoading} className="flex-1">
                        {isLoading ? 'Booking...' : 'Book Service'}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setSelectedService(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>

          {/* My Bookings */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">My Bookings</h2>
            <div className="space-y-4">
              {bookings.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-gray-500">No bookings yet. Book your first service!</p>
                  </CardContent>
                </Card>
              ) : (
                bookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{booking.service_name}</h3>
                          <div className="flex items-center text-gray-600 mt-1">
                            <User className="h-4 w-4 mr-2" />
                            <span>Provider: {booking.provider_name}</span>
                          </div>
                        </div>
                        <Badge 
                          variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
                        >
                          {booking.status}
                        </Badge>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{new Date(booking.scheduled_time).toLocaleDateString()}</span>
                        <Clock className="h-4 w-4 ml-4 mr-2" />
                        <span>{new Date(booking.scheduled_time).toLocaleTimeString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
