import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useApiQuery, useApiMutation } from "@/hooks/useApi";
import { 
  fetchCurrentUser, 
  updateCurrentUser, 
  uploadProfileImage,
  fetchMyUpcomingAppointments 
} from "@/http/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Camera, 
  Save,
  Calendar,
  Clock,
  Briefcase,
  DollarSign
} from "lucide-react";
import { toast } from "sonner";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    document.title = "Profile - Patient Appointment System";
  }, []);

  // API queries
  const { data: currentUser, isLoading: isLoadingUser, refetch: refetchUser } = useApiQuery(
    ['currentUser'], 
    fetchCurrentUser
  );

  const { data: upcomingAppointments = [], isLoading: isLoadingAppointments } = useApiQuery(
    ['upcomingAppointments'], 
    fetchMyUpcomingAppointments
  );

  // Mutations
  const updateProfileMutation = useApiMutation(updateCurrentUser, {
    successMessage: 'Profile updated successfully',
    invalidateQueries: [['currentUser']],
    onSuccess: () => {
      setIsEditing(false);
      refetchUser();
    }
  });

  const uploadImageMutation = useApiMutation(uploadProfileImage, {
    successMessage: 'Profile image updated successfully',
    invalidateQueries: [['currentUser']],
    onSuccess: () => {
      setSelectedFile(null);
      refetchUser();
    }
  });

  useEffect(() => {
    if (currentUser) {
      setFormData({
        full_name: currentUser.full_name || '',
        address_division: currentUser.address_division || '',
        address_district: currentUser.address_district || '',
        address_thana: currentUser.address_thana || '',
        specialization: currentUser.specialization || '',
        consultation_fee: currentUser.consultation_fee || '',
      });
    }
  }, [currentUser]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = () => {
    const updateData = { ...formData };
    
    // Convert numeric fields
    if (updateData.consultation_fee) {
      updateData.consultation_fee = parseFloat(updateData.consultation_fee);
    }

    // Remove empty fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === '' || updateData[key] === null) {
        delete updateData[key];
      }
    });

    updateProfileMutation.mutate(updateData);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        toast.error('Only JPEG and PNG files are allowed');
        return;
      }
      setSelectedFile(file);
      uploadImageMutation.mutate(file);
    }
  };

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase() || 'U';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  return (
    <main className="grid gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList>
          <TabsTrigger value="profile">Profile Information</TabsTrigger>
          <TabsTrigger value="appointments">My Appointments</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          {/* Profile Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage 
                      src={currentUser?.profile_image} 
                      alt={currentUser?.full_name} 
                    />
                    <AvatarFallback className="text-lg">
                      {getInitials(currentUser?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <label 
                    htmlFor="profile-image" 
                    className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer hover:bg-primary/90"
                  >
                    <Camera className="h-3 w-3" />
                  </label>
                  <input
                    id="profile-image"
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold">{currentUser?.full_name}</h2>
                  <p className="text-muted-foreground">{currentUser?.email}</p>
                  <Badge variant="outline">
                    {currentUser?.user_type?.charAt(0).toUpperCase() + currentUser?.user_type?.slice(1)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Profile Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your personal details and contact information
                  </CardDescription>
                </div>
                <Button
                  variant={isEditing ? "outline" : "default"}
                  onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
                >
                  {isEditing ? "Cancel" : "Edit Profile"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Basic Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    {isEditing ? (
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => handleInputChange('full_name', e.target.value)}
                      />
                    ) : (
                      <p className="text-sm py-2">{currentUser?.full_name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <p className="text-sm py-2 text-muted-foreground">
                      {currentUser?.email} (Cannot be changed)
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Mobile Number
                  </Label>
                  <p className="text-sm py-2 text-muted-foreground">
                    {currentUser?.mobile_number} (Cannot be changed)
                  </p>
                </div>
              </div>

              <Separator />

              {/* Address Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Address Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address_division">Division</Label>
                    {isEditing ? (
                      <Input
                        id="address_division"
                        value={formData.address_division}
                        onChange={(e) => handleInputChange('address_division', e.target.value)}
                        placeholder="Division"
                      />
                    ) : (
                      <p className="text-sm py-2">{currentUser?.address_division || 'Not specified'}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address_district">District</Label>
                    {isEditing ? (
                      <Input
                        id="address_district"
                        value={formData.address_district}
                        onChange={(e) => handleInputChange('address_district', e.target.value)}
                        placeholder="District"
                      />
                    ) : (
                      <p className="text-sm py-2">{currentUser?.address_district || 'Not specified'}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address_thana">Thana</Label>
                    {isEditing ? (
                      <Input
                        id="address_thana"
                        value={formData.address_thana}
                        onChange={(e) => handleInputChange('address_thana', e.target.value)}
                        placeholder="Thana"
                      />
                    ) : (
                      <p className="text-sm py-2">{currentUser?.address_thana || 'Not specified'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Doctor Specific Information */}
              {currentUser?.user_type === 'doctor' && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Professional Information
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>License Number</Label>
                        <p className="text-sm py-2 text-muted-foreground">
                          {currentUser?.license_number} (Cannot be changed)
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label>Experience</Label>
                        <p className="text-sm py-2">
                          {currentUser?.experience_years} years
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="specialization">Specialization</Label>
                        {isEditing ? (
                          <Input
                            id="specialization"
                            value={formData.specialization}
                            onChange={(e) => handleInputChange('specialization', e.target.value)}
                            placeholder="Medical specialization"
                          />
                        ) : (
                          <p className="text-sm py-2">{currentUser?.specialization || 'Not specified'}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="consultation_fee" className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Consultation Fee
                        </Label>
                        {isEditing ? (
                          <Input
                            id="consultation_fee"
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.consultation_fee}
                            onChange={(e) => handleInputChange('consultation_fee', e.target.value)}
                            placeholder="Fee amount"
                          />
                        ) : (
                          <p className="text-sm py-2">
                            ${currentUser?.consultation_fee || 'Not set'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {isEditing && (
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveProfile}
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                My Upcoming Appointments
              </CardTitle>
              <CardDescription>
                View your scheduled appointments
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
                  <p>No upcoming appointments</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {formatDate(appointment.appointment_datetime)} at{' '}
                            {formatTime(appointment.appointment_datetime)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {currentUser?.user_type === 'patient' 
                            ? `Dr. ${appointment.doctor?.full_name}`
                            : appointment.patient?.full_name
                          }
                        </p>
                        {appointment.notes && (
                          <p className="text-sm text-muted-foreground">
                            Notes: {appointment.notes}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline">
                        {appointment.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}