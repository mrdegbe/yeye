
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Header from '../components/Header';
import { Calendar, Clock, User, CheckCircle, XCircle } from 'lucide-react';

interface Booking {
  id: string;
  service_name: string;
  client_name: string;
  scheduled_time: string;
  status: string;
}

const ProviderDashboard: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isAvailable, setIsAvailable] = useState(user.is_available);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    // try {
    //   const data = await api.getMyBookings();
    //   setBookings(data.bookings || []);
    // } catch (error) {
    //   console.error('Error fetching bookings:', error);
    // }
  };

  const toggleAvailability = async () => {
    setIsLoading(true);

    try {
      const userId = user.id
      await api.toggleAvailability(userId, !isAvailable);
      setIsAvailable(!isAvailable);
      toast({
        title: "Availability updated",
        description: `You are now ${!isAvailable ? 'available' : 'unavailable'} for new bookings.`,
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Could not update availability. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const upcomingBookings = bookings.filter(booking => 
    new Date(booking.scheduled_time) > new Date()
  );
  
  const pastBookings = bookings.filter(booking => 
    new Date(booking.scheduled_time) <= new Date()
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Provider Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your availability and view appointments</p>
        </div>

        {/* Availability Toggle */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Availability Status</span>
              <div className="flex items-center space-x-2">
                {isAvailable ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <Badge variant={isAvailable ? 'default' : 'secondary'}>
                  {isAvailable ? 'Available' : 'Unavailable'}
                </Badge>
              </div>
            </CardTitle>
            <CardDescription>
              Toggle your availability to receive new booking assignments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Switch
                id="availability"
                checked={isAvailable}
                onCheckedChange={toggleAvailability}
                disabled={isLoading}
              />
              <Label htmlFor="availability">
                {isAvailable ? 'Available for new bookings' : 'Not accepting new bookings'}
              </Label>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Bookings */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Upcoming Appointments ({upcomingBookings.length})
            </h2>
            <div className="space-y-4">
              {upcomingBookings.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-gray-500">No upcoming appointments</p>
                  </CardContent>
                </Card>
              ) : (
                upcomingBookings.map((booking) => (
                  <Card key={booking.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{booking.service_name}</h3>
                          <div className="flex items-center text-gray-600 mt-1">
                            <User className="h-4 w-4 mr-2" />
                            <span>Client: {booking.client_name}</span>
                          </div>
                        </div>
                        <Badge variant="default">
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

          {/* Past Bookings */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Completed Services ({pastBookings.length})
            </h2>
            <div className="space-y-4">
              {pastBookings.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-gray-500">No completed services yet</p>
                  </CardContent>
                </Card>
              ) : (
                pastBookings.map((booking) => (
                  <Card key={booking.id} className="border-l-4 border-l-green-500 opacity-75">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{booking.service_name}</h3>
                          <div className="flex items-center text-gray-600 mt-1">
                            <User className="h-4 w-4 mr-2" />
                            <span>Client: {booking.client_name}</span>
                          </div>
                        </div>
                        <Badge variant="secondary">
                          Completed
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

export default ProviderDashboard;
