import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useApiMutation } from "@/hooks/useApi";
import { registerUser } from "@/http/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { UserPlus, Mail, Phone, Lock, User, MapPin, Briefcase, DollarSign } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("patient");
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    mobile_number: "+88",
    password: "",
    confirmPassword: "",
    user_type: "patient",
    address_division: "",
    address_district: "",
    address_thana: "",
    // Doctor specific fields
    license_number: "",
    experience_years: "",
    consultation_fee: "",
    specialization: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    document.title = "Register - Patient Appointment System";
  }, []);

  const registerMutation = useApiMutation(registerUser, {
    successMessage: "Registration successful! Please login to continue.",
    onSuccess: () => {
      navigate("/Auth/Login");
    },
  });

  const validateForm = () => {
    const newErrors = {};

    // Basic validation
    if (!formData.full_name.trim()) {
      newErrors.full_name = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.mobile_number.match(/^\+88\d{11}$/)) {
      newErrors.mobile_number = "Mobile number must start with +88 and be 14 digits total";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = "Password must contain at least one uppercase letter";
    } else if (!/(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must contain at least one digit";
    } else if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(formData.password)) {
      newErrors.password = "Password must contain at least one special character";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Doctor specific validation
    if (formData.user_type === "doctor") {
      if (!formData.license_number) {
        newErrors.license_number = "License number is required for doctors";
      }
      if (!formData.experience_years) {
        newErrors.experience_years = "Experience years is required for doctors";
      } else if (parseInt(formData.experience_years) < 0) {
        newErrors.experience_years = "Experience years cannot be negative";
      }
      if (!formData.consultation_fee) {
        newErrors.consultation_fee = "Consultation fee is required for doctors";
      } else if (parseFloat(formData.consultation_fee) < 0) {
        newErrors.consultation_fee = "Consultation fee cannot be negative";
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

    const submitData = {
      ...formData,
      user_type: activeTab,
    };

    // Convert numeric fields for doctors
    if (activeTab === "doctor") {
      submitData.experience_years = parseInt(formData.experience_years);
      submitData.consultation_fee = parseFloat(formData.consultation_fee);
    }

    // Remove confirmPassword and empty fields
    delete submitData.confirmPassword;
    Object.keys(submitData).forEach(key => {
      if (submitData[key] === "" || submitData[key] === null) {
        delete submitData[key];
      }
    });

    registerMutation.mutate(submitData);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
    setFormData(prev => ({ ...prev, user_type: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <UserPlus className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>
            Join our healthcare appointment system
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="patient">Patient</TabsTrigger>
              <TabsTrigger value="doctor">Doctor</TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Basic Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => handleInputChange("full_name", e.target.value)}
                      placeholder="Enter your full name"
                      className={errors.full_name ? "border-red-500" : ""}
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
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="Enter your email"
                      className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mobile_number" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Mobile Number *
                    </Label>
                    <Input
                      id="mobile_number"
                      value={formData.mobile_number}
                      onChange={(e) => handleInputChange("mobile_number", e.target.value)}
                      placeholder="+8801XXXXXXXXX"
                      className={errors.mobile_number ? "border-red-500" : ""}
                    />
                    {errors.mobile_number && (
                      <p className="text-sm text-red-500">{errors.mobile_number}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Password *
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      placeholder="Create a strong password"
                      className={errors.password ? "border-red-500" : ""}
                    />
                    {errors.password && (
                      <p className="text-sm text-red-500">{errors.password}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    placeholder="Confirm your password"
                    className={errors.confirmPassword ? "border-red-500" : ""}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Address Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address_division">Division</Label>
                    <Input
                      id="address_division"
                      value={formData.address_division}
                      onChange={(e) => handleInputChange("address_division", e.target.value)}
                      placeholder="Division"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address_district">District</Label>
                    <Input
                      id="address_district"
                      value={formData.address_district}
                      onChange={(e) => handleInputChange("address_district", e.target.value)}
                      placeholder="District"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address_thana">Thana</Label>
                    <Input
                      id="address_thana"
                      value={formData.address_thana}
                      onChange={(e) => handleInputChange("address_thana", e.target.value)}
                      placeholder="Thana"
                    />
                  </div>
                </div>
              </div>

              {/* Doctor Specific Fields */}
              <TabsContent value="doctor" className="mt-0">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Professional Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="license_number">Medical License Number *</Label>
                      <Input
                        id="license_number"
                        value={formData.license_number}
                        onChange={(e) => handleInputChange("license_number", e.target.value)}
                        placeholder="Enter license number"
                        className={errors.license_number ? "border-red-500" : ""}
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
                        onChange={(e) => handleInputChange("specialization", e.target.value)}
                        placeholder="Medical specialization"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="experience_years">Years of Experience *</Label>
                      <Input
                        id="experience_years"
                        type="number"
                        min="0"
                        value={formData.experience_years}
                        onChange={(e) => handleInputChange("experience_years", e.target.value)}
                        placeholder="Years of experience"
                        className={errors.experience_years ? "border-red-500" : ""}
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
                        onChange={(e) => handleInputChange("consultation_fee", e.target.value)}
                        placeholder="Fee amount"
                        className={errors.consultation_fee ? "border-red-500" : ""}
                      />
                      {errors.consultation_fee && (
                        <p className="text-sm text-red-500">{errors.consultation_fee}</p>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create Account
                  </>
                )}
              </Button>
            </form>
          </Tabs>
        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/Auth/Login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}