import React, { useState, useEffect } from "react";
import { Calendar, Clock, User, FileText, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useApiQuery, useApiMutation } from "@/hooks/useApi";
import { createAppointment, fetchDoctors, fetchMyUpcomingAppointments } from "@/http/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function PatientBooking() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    doctor_id: '',
    appointment_date: '',
    appointment_time: '',
    notes: ''
  });

  useEffect(() => {
    document.title = "Book Appointment - Patient Appointment System";
  }, []);

  // API queries
  const { data: doctors = [], isLoading: isLoadingDoctors } = useApiQuery(
    ['doctors'], 
    fetchDoctors
  );

  const { data: upcomingAppointments = [], isLoading: isLoadingAppointments } = useApiQuery(
    ['upcomingAppointments'], 
    fetchMyUpcomingAppointments
  );

  // Mutations
  const createAppointmentMutation = useApiMutation(createAppointment, {
    successMessage: 'Appointment booked successfully',
    invalidateQueries: [['upcomingAppointments'], ['appointments']],
    onSuccess: () => {
      // Reset form
      setFormData({
        doctor_id: '',
    appointment_date: '',
    appointment_time: '',
    notes: ''
      });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.doctor_id || !formData.appointment_date || !formData.appointment_time) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Create datetime in YYYY-MM-DD HH:MM:SS format
    const appointmentDateTime = `${formData.appointment_date} ${formData.appointment_time}:00`;
    
    const data = {
      doctor_id: parseInt(formData.doctor_id),
      appointment_datetime: appointmentDateTime,
      notes: formData.notes || null,
    };

    createAppointmentMutation.mutate(data);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: "secondary",
      confirmed: "default", 
      completed: "default",
      cancelled: "destructive"
    };
    
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800", 
      cancelled: "bg-red-100 text-red-800"
    };

    return (
      <Badge variant={variants[status]} className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    };
  };

  return (
    <main className="grid gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
        {/* Book Appointment Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Book New Appointment
            </CardTitle>
            <CardDescription>
              Schedule an appointment with one of our doctors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="doctor" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Doctor *
                  </Label>
                  <Select 
                    value={formData.doctor_id} 
                    onValueChange={(value) => handleInputChange('doctor_id', value)}
                    disabled={isLoadingDoctors}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingDoctors ? "Loading doctors..." : "Select a doctor"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Available Doctors</SelectLabel>
                        {doctors.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id.toString()}>
                            <div className="flex flex-col">
                              <span className="font-medium">Dr. {doctor.full_name}</span>
                              {doctor.specialization && (
                                <span className="text-sm text-muted-foreground">{doctor.specialization}</span>
                              )}
                              {doctor.consultation_fee && (
                                <span className="text-sm text-muted-foreground">Fee: ${doctor.consultation_fee}</span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Date *
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.appointment_date}
                      onChange={(e) => handleInputChange('appointment_date', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="time" className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Time *
                    </Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.appointment_time}
                      onChange={(e) => handleInputChange('appointment_time', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Notes
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Describe your symptoms or reason for visit..."
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={createAppointmentMutation.isPending}
                className="w-full"
              >
                {createAppointmentMutation.isPending ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Booking...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Book Appointment
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* My Appointments Sidebar */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              My Appointments
            </CardTitle>
            <CardDescription>
              Your upcoming and recent appointments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingAppointments ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : upcomingAppointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No appointments scheduled</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="border rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium">
                        Dr. {appointment.doctor?.full_name}
                      </div>
                      {getStatusBadge(appointment.status)}
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {formatDateTime(appointment.appointment_datetime).date}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {formatDateTime(appointment.appointment_datetime).time}
                      </div>
                    </div>
                    
                    {appointment.notes && (
                      <div className="text-sm text-muted-foreground">
                        <strong>Notes:</strong> {appointment.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}