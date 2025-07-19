import React, { useState } from 'react';
import { Calendar, Clock, User, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useApiQuery } from '@/hooks/useApi';
import { fetchPatients, fetchDoctors } from '@/http/api';

export function AppointmentForm({ onSubmit, isLoading = false, onCancel }) {
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    appointment_date: '',
    appointment_time: '',
    notes: ''
  });

  const { data: patients = [], isLoading: isLoadingPatients } = useApiQuery(
    ['patients'], 
    fetchPatients
  );

  const { data: doctors = [], isLoading: isLoadingDoctors } = useApiQuery(
    ['doctors'], 
    fetchDoctors
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.patient_id || !formData.doctor_id || !formData.appointment_date || !formData.appointment_time) {
      return;
    }

    const appointmentDateTime = `${formData.appointment_date}T${formData.appointment_time}:00`;
    
    onSubmit({
      doctor_id: parseInt(formData.doctor_id),
      appointment_datetime: appointmentDateTime,
      notes: formData.notes || null,
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = formData.patient_id && formData.doctor_id && 
                     formData.appointment_date && formData.appointment_time;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="patient" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Patient *
          </Label>
          <Select 
            value={formData.patient_id} 
            onValueChange={(value) => handleInputChange('patient_id', value)}
            disabled={isLoadingPatients}
          >
            <SelectTrigger>
              <SelectValue placeholder={isLoadingPatients ? "Loading patients..." : "Select a patient"} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Patients</SelectLabel>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id.toString()}>
                    <div className="flex flex-col">
                      <span className="font-medium">{patient.full_name}</span>
                      <span className="text-sm text-muted-foreground">{patient.email}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

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
                <SelectLabel>Doctors</SelectLabel>
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
            placeholder="Additional notes or symptoms..."
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button 
          type="submit" 
          disabled={!isFormValid || isLoading}
          className="min-w-[120px]"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Creating...
            </>
          ) : (
            'Create Appointment'
          )}
        </Button>
      </div>
    </form>
  );
}