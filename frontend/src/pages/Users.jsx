import React, { useMemo, useState, useEffect } from "react";
import { Plus, UserPlus, Users as UsersIcon } from "lucide-react";
import { useApiQuery, useApiMutation } from "@/hooks/useApi";
import { createUser, fetchUsers } from "@/http/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/DataTable";
import { UserForm } from "@/components/forms/UserForm";

export default function Users() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState("all");

  useEffect(() => {
    document.title = "Users - Patient Appointment System";
  }, []);

  // API queries
  const { data: allUsers = [], isLoading, isError, error } = useApiQuery(
    ['users'], 
    fetchUsers
  );

  const { data: patients = [] } = useApiQuery(
    ['patients'], 
    () => fetchUsers({ user_type: 'patient' })
  );

  const { data: doctors = [] } = useApiQuery(
    ['doctors'], 
    () => fetchUsers({ user_type: 'doctor' })
  );

  // Mutations
  const createUserMutation = useApiMutation(createUser, {
    successMessage: 'User created successfully',
    invalidateQueries: [['users'], ['patients'], ['doctors']],
    onSuccess: () => {
      setIsCreateDialogOpen(false);
    }
  });

  const getUserTypeColor = (userType) => {
    const colors = {
      admin: "bg-purple-100 text-purple-800",
      doctor: "bg-blue-100 text-blue-800",
      patient: "bg-green-100 text-green-800"
    };
    return colors[userType] || "bg-gray-100 text-gray-800";
  };

  const baseColumns = [
    {
      accessorKey: "full_name",
      header: "Name",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.full_name}</div>
          <div className="text-sm text-muted-foreground">{row.original.email}</div>
        </div>
      ),
    },
    {
      accessorKey: "mobile_number",
      header: "Mobile",
    },
    {
      accessorKey: "user_type",
      header: "Type",
      cell: ({ row }) => (
        <Badge className={getUserTypeColor(row.original.user_type)}>
          {row.original.user_type.charAt(0).toUpperCase() + row.original.user_type.slice(1)}
        </Badge>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Joined",
      cell: ({ row }) => (
        new Date(row.original.created_at).toLocaleDateString()
      ),
    },
  ];

  const doctorColumns = [
    ...baseColumns,
    {
      accessorKey: "specialization",
      header: "Specialization",
      cell: ({ row }) => row.original.specialization || "Not specified",
    },
    {
      accessorKey: "consultation_fee",
      header: "Fee",
      cell: ({ row }) => row.original.consultation_fee ? `$${row.original.consultation_fee}` : "N/A",
    },
    {
      accessorKey: "experience_years",
      header: "Experience",
      cell: ({ row }) => row.original.experience_years ? `${row.original.experience_years} years` : "N/A",
    },
  ];

  const handleCreateUser = (userData) => {
    createUserMutation.mutate(userData);
  };

  const getTabData = () => {
    switch (selectedUserType) {
      case 'doctors':
        return { data: doctors, columns: doctorColumns };
      case 'patients':
        return { data: patients, columns: baseColumns };
      default:
        return { data: allUsers, columns: baseColumns };
    }
  };

  const { data: currentData, columns: currentColumns } = getTabData();

  return (
    <main className="grid gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage patients, doctors, and administrators
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Add a new user to the system. Fill in the required information below.
              </DialogDescription>
            </DialogHeader>
            <UserForm
              onSubmit={handleCreateUser}
              isLoading={createUserMutation.isPending}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allUsers.length}</div>
            <p className="text-xs text-muted-foreground">
              All registered users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doctors</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{doctors.length}</div>
            <p className="text-xs text-muted-foreground">
              Medical professionals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patients</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patients.length}</div>
            <p className="text-xs text-muted-foreground">
              Registered patients
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            View and manage all system users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedUserType} onValueChange={setSelectedUserType}>
            <TabsList>
              <TabsTrigger value="all">All Users</TabsTrigger>
              <TabsTrigger value="doctors">Doctors</TabsTrigger>
              <TabsTrigger value="patients">Patients</TabsTrigger>
            </TabsList>
            
            <TabsContent value={selectedUserType} className="mt-6">
              <DataTable
                columns={currentColumns}
                data={currentData}
                isLoading={isLoading}
                isError={isError}
                error={error}
                searchColumn="full_name"
                searchPlaceholder="Search users..."
                emptyMessage="No users found."
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  );
}