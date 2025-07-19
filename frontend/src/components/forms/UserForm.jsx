import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Briefcase, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export function UserForm({ 
  onSubmit, 
  isLoading = false, 
  onCancel, 
  initialData = {},
  userType = 'patient' 
}) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    mobile_number: '+88',
    password: '',
    user_type: userType,
    address_division: '',
    address_district: '',
    address_thana: '',
    // Doctor specific fields
    license_number: '',
    experience_years: '',
    consultation_fee: '',
    specialization: '',
    available_timeslots: [],
    ...initialData
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.mobile_number.match(/^\+88\d{11}$/)) {
      newErrors.mobile_number = 'Mobile number must start with +88 and be 14 digits total';
    }

    if (!initialData.id && !formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.user_type === 'doctor') {
      if (!formData.license_number) {
        newErrors.license_number = 'License number is required for doctors';
      }
      if (!formData.experience_years) {
        newErrors.experience_years = 'Experience years is required for doctors';
      }
      if (!formData.consultation_fee) {
        newErrors.consultation_fee = 'Consultation fee is required for doctors';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData = { ...formData };
    
    // Convert numeric fields
    if (submitData.experience_years) {
      submitData.experience_years = parseInt(submitData.experience_years);
    }
    if (submitData.consultation_fee) {
      submitData.consultation_fee = parseFloat(submitData.consultation_fee);
    }

    // Remove empty fields
    Object.keys(submitData).forEach(key => {
      if (submitData[key] === '' || submitData[key] === null) {
        delete submitData[key];
      }
    });

    onSubmit(submitData);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Basic Information</h3>
          
          <div className="space-y-2">
            <Label htmlFor="full_name" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Full Name *
            </Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              placeholder="Enter full name"
              className={errors.full_name ? 'border-red-500' : ''}
            />
            {errors.full_name && (
              <p className="text-sm text-red-500">{errors.full_name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter email address"
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile_number" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Mobile Number *
            </Label>
            <Input
              id="mobile_number"
              value={formData.mobile_number}
              onChange={(e) => handleInputChange('mobile_number', e.target.value)}
              placeholder="+8801XXXXXXXXX"
              className={errors.mobile_number ? 'border-red-500' : ''}
            />
            {errors.mobile_number && (
              <p className="text-sm text-red-500">{errors.mobile_number}</p>
            )}
          </div>

          {!initialData.id && (
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Enter password"
                className={errors.password ? 'border-red-500' : ''}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="user_type">User Type *</Label>
            <Select 
              value={formData.user_type} 
              onValueChange={(value) => handleInputChange('user_type', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="patient">Patient</SelectItem>
                <SelectItem value="doctor">Doctor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Address Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Address Information
          </h3>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="address_division">Division</Label>
              <Input
                id="address_division"
                value={formData.address_division}
                onChange={(e) => handleInputChange('address_division', e.target.value)}
                placeholder="Division"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address_district">District</Label>
              <Input
                id="address_district"
                value={formData.address_district}
                onChange={(e) => handleInputChange('address_district', e.target.value)}
                placeholder="District"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address_thana">Thana</Label>
              <Input
                id="address_thana"
                value={formData.address_thana}
                onChange={(e) => handleInputChange('address_thana', e.target.value)}
                placeholder="Thana"
              />
            </div>
          </div>
        </div>

        {/* Doctor Specific Fields */}
        {formData.user_type === 'doctor' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Professional Information
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="license_number">License Number *</Label>
              <Input
                id="license_number"
                value={formData.license_number}
                onChange={(e) => handleInputChange('license_number', e.target.value)}
                placeholder="Medical license number"
                className={errors.license_number ? 'border-red-500' : ''}
              />
              {errors.license_number && (
                <p className="text-sm text-red-500">{errors.license_number}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization</Label>
              <Input
                id="specialization"
                value={formData.specialization}
                onChange={(e) => handleInputChange('specialization', e.target.value)}
                placeholder="Medical specialization"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="experience_years">Experience (Years) *</Label>
                <Input
                  id="experience_years"
                  type="number"
                  min="0"
                  value={formData.experience_years}
                  onChange={(e) => handleInputChange('experience_years', e.target.value)}
                  placeholder="Years of experience"
                  className={errors.experience_years ? 'border-red-500' : ''}
                />
                {errors.experience_years && (
                  <p className="text-sm text-red-500">{errors.experience_years}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="consultation_fee" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Consultation Fee *
                </Label>
                <Input
                  id="consultation_fee"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.consultation_fee}
                  onChange={(e) => handleInputChange('consultation_fee', e.target.value)}
                  placeholder="Fee amount"
                  className={errors.consultation_fee ? 'border-red-500' : ''}
                />
                {errors.consultation_fee && (
                  <p className="text-sm text-red-500">{errors.consultation_fee}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="available_timeslots">Available Time Slots</Label>
              <Input
                id="available_timeslots"
                value={formData.available_timeslots?.join(', ') || ''}
                onChange={(e) => {
                  const slots = e.target.value.split(',').map(slot => slot.trim()).filter(slot => slot);
                  handleInputChange('available_timeslots', slots);
                }}
                placeholder="e.g., 2025-01-20 09:00:00, 2025-01-20 10:00:00"
              />
              <p className="text-xs text-muted-foreground">
                Enter available time slots in format: YYYY-MM-DD HH:MM:SS (comma separated)
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button 
          type="submit" 
          disabled={isLoading}
          className="min-w-[120px]"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              {initialData.id ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            initialData.id ? 'Update User' : 'Create User'
          )}
        </Button>
      </div>
    </form>
  );
}