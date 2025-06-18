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
import { Calendar, Clock, User, CheckCircle, XCircle, Plus, Minus } from 'lucide-react';

interface Booking {
  id: string;
  service_name: string;
  client_name: string;
  scheduled_time: string;
  status: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
}

interface ProviderService {
  id: string;
  provider_id: number;
  service_id: string;
  service: Service;
}

const ProviderDashboard: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [myServices, setMyServices] = useState<ProviderService[]>([]);
  const [isAvailable, setIsAvailable] = useState(user?.is_available || false);
  const [isLoading, setIsLoading] = useState(false);
  const [servicesLoading, setServicesLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchBookings();
    fetchServices();
    fetchMyServices();
  }, []);

  const fetchBookings = async () => {
    // Bookings functionality will be implemented later
    console.log('Fetching bookings...');
  };

  const fetchServices = async () => {
    try {
      const data = await api.getServices();
      setAllServices(data.services || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: "Error",
        description: "Could not load available services.",
        variant: "destructive",
      });
    }
  };

  const fetchMyServices = async () => {
    if (!user) return;
    
    try {
      const data = await api.getProviderServices(user.id);
      setMyServices(data.provider_services || []);
    } catch (error) {
      console.error('Error fetching my services:', error);
      toast({
        title: "Error",
        description: "Could not load your services.",
        variant: "destructive",
      });
    }
  };

  const addService = async (serviceId: string) => {
    if (!user) return;
    
    setServicesLoading(true);
    try {
      await api.addProviderService(user.id, serviceId);
      await fetchMyServices();
      toast({
        title: "Service added",
        description: "Service has been added to your offerings.",
      });
    } catch (error) {
      console.error('Error adding service:', error);
      toast({
        title: "Error",
        description: "Could not add service. Please try again.",
        variant: "destructive",
      });
    } finally {
      setServicesLoading(false);
    }
  };

  const removeService = async (providerServiceId: string) => {
    setServicesLoading(true);
    try {
      await api.removeProviderService(providerServiceId);
      await fetchMyServices();
      toast({
        title: "Service removed",
        description: "Service has been removed from your offerings.",
      });
    } catch (error) {
      console.error('Error removing service:', error);
      toast({
        title: "Error",
        description: "Could not remove service. Please try again.",
        variant: "destructive",
      });
    } finally {
      setServicesLoading(false);
    }
  };

  const toggleAvailability = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      await api.toggleAvailability(user.id, !isAvailable);
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

  const myServiceIds = myServices.map(ms => ms.service_id);
  const availableServices = allServices.filter(service => !myServiceIds.includes(service.id));

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Provider Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your availability, services, and view appointments</p>
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

        {/* Service Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Available Services */}
          <Card>
            <CardHeader>
              <CardTitle>Available Services</CardTitle>
              <CardDescription>
                Services you can add to your offerings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {availableServices.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    All services are already in your offerings
                  </p>
                ) : (
                  availableServices.map((service) => (
                    <div key={service.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{service.name}</h4>
                        <p className="text-sm text-gray-600">{service.description}</p>
                        <p className="text-sm font-medium text-green-600">${service.price}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => addService(service.id)}
                        disabled={servicesLoading}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* My Services */}
          <Card>
            <CardHeader>
              <CardTitle>My Services ({myServices.length})</CardTitle>
              <CardDescription>
                Services you currently offer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {myServices.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No services added yet
                  </p>
                ) : (
                  myServices.map((providerService) => (
                    <div key={providerService.id} className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
                      <div>
                        <h4 className="font-medium">{providerService.service.name}</h4>
                        <p className="text-sm text-gray-600">{providerService.service.description}</p>
                        <p className="text-sm font-medium text-green-600">${providerService.service.price}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeService(providerService.id)}
                        disabled={servicesLoading}
                      >
                        <Minus className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bookings Section */}
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
