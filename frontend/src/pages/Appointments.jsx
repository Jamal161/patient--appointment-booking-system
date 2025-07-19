import React, { useMemo, useState, useEffect } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ChevronDown, Copy, Calendar, Clock, User, FileText } from "lucide-react";
import { toast } from "sonner";

import { useApiQuery, useApiMutation } from "@/hooks/useApi";
import {
  createAppointment,
  fetchAppointments,
  fetchPatients,
  fetchDoctors,
  updateAppointmentStatus,
} from "@/http/api";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";

export default function Appointments() {
  const { userRole, isAdmin, isDoctor } = useAuth();
  const [displayAppointmentCard, setDisplayAppointmentCard] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  
  // Form states
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [notes, setNotes] = useState("");

  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});

  useEffect(() => {
    document.title = "Appointments - Patient Appointment System";
  }, []);

  // API queries
  const { data: appointments = [], isLoading: isLoadingAppointments } = useApiQuery(
    ['appointments'], 
    fetchAppointments
  );

  const { data: patients = [], isLoading: isLoadingPatients } = useApiQuery(
    ['patients'], 
    fetchPatients
  );

  const { data: doctors = [], isLoading: isLoadingDoctors } = useApiQuery(
    ['doctors'], 
    fetchDoctors
  );

  // Mutations
  const createAppointmentMutation = useApiMutation(createAppointment, {
    successMessage: 'Appointment created successfully',
    invalidateQueries: [['appointments']],
    onSuccess: () => {
      // Reset form
      setSelectedPatient("");
      setSelectedDoctor("");
      setAppointmentDate("");
      setAppointmentTime("");
      setNotes("");
    }
  });

  const updateStatusMutation = useApiMutation(updateAppointmentStatus, {
    successMessage: 'Appointment status updated successfully',
    invalidateQueries: [['appointments']],
  });

  const handleAppointmentSubmit = () => {
    if (!selectedPatient || !selectedDoctor || !appointmentDate || !appointmentTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Create datetime in YYYY-MM-DD HH:MM:SS format
    const appointmentDateTime = `${appointmentDate} ${appointmentTime}:00`;
    
    const data = {
      doctor_id: parseInt(selectedDoctor),
      appointment_datetime: appointmentDateTime,
      notes: notes || null,
    };

    createAppointmentMutation.mutate(data);
  };

  const viewAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setDisplayAppointmentCard(true);
  };

  const handleStatusUpdate = (appointmentId, newStatus) => {
    updateStatusMutation.mutate({
      appointmentId,
      status: newStatus
    });
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

  const columns = useMemo(
    () => [
      {
        accessorKey: "patient.full_name",
        header: "Patient",
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.patient?.full_name}</div>
            <div className="text-sm text-muted-foreground">{row.original.patient?.email}</div>
          </div>
        ),
      },
      {
        accessorKey: "doctor.full_name",
        header: "Doctor",
        cell: ({ row }) => (
          <div className="font-medium">{row.original.doctor?.full_name}</div>
        ),
      },
      {
        accessorKey: "appointment_datetime",
        header: "Date & Time",
        cell: ({ row }) => {
          const { date, time } = formatDateTime(row.original.appointment_datetime);
          return (
            <div>
              <div className="font-medium">{date}</div>
              <div className="text-sm text-muted-foreground">{time}</div>
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => getStatusBadge(row.original.status),
      },
      {
        accessorKey: "notes",
        header: "Notes",
        cell: ({ row }) => (
          <div className="max-w-xs truncate">
            {row.original.notes || "No notes"}
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: appointments,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  if (isLoadingAppointments || isLoadingPatients || isLoadingDoctors) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  return (
    <main className="grid flex gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
        <Tabs defaultValue="all">
          <TabsContent value="all">
            <Card>
              <CardHeader className="px-7">
                <div className="justify-between flex">
                  <CardTitle>Appointments</CardTitle>
                  {isAdmin && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button>
                        <Calendar className="mr-2 h-4 w-4" />
                        New Appointment
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="max-w-md">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Create New Appointment</AlertDialogTitle>
                        <AlertDialogDescription>
                          Fill in the appointment details below.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Patient *</label>
                          <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a patient" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Patients</SelectLabel>
                                {patients.map((patient) => (
                                  <SelectItem key={patient.id} value={patient.id.toString()}>
                                    {patient.full_name} - {patient.email}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm font-medium">Doctor *</label>
                          <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a doctor" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Doctors</SelectLabel>
                                {doctors.map((doctor) => (
                                  <SelectItem key={doctor.id} value={doctor.id.toString()}>
                                    {doctor.full_name}
                                    {doctor.license_number && ` - ${doctor.license_number}`}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Date *</label>
                            <Input
                              type="date"
                              value={appointmentDate}
                              onChange={(e) => setAppointmentDate(e.target.value)}
                              min={new Date().toISOString().split('T')[0]}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Time *</label>
                            <Input
                              type="time"
                              value={appointmentTime}
                              onChange={(e) => setAppointmentTime(e.target.value)}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium">Notes</label>
                          <Textarea
                            placeholder="Additional notes..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                          />
                        </div>
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleAppointmentSubmit}
                          disabled={createAppointmentMutation.isPending}
                        >
                          {createAppointmentMutation.isPending ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            'Create Appointment'
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  )}
                </div>
                <CardDescription>
                  {isAdmin ? "Manage all patient appointments" : "View and manage your appointments"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full">
                  <div className="flex items-center py-4">
                    <Input
                      placeholder="Search by patient name..."
                      onChange={(event) =>
                        table
                          .getColumn("patient.full_name")
                          ?.setFilterValue(event.target.value)
                      }
                      className="max-w-sm"
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                          Columns <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {table
                          .getAllColumns()
                          .filter((column) => column.getCanHide())
                          .map((column) => {
                            return (
                              <DropdownMenuCheckboxItem
                                key={column.id}
                                className="capitalize"
                                checked={column.getIsVisible()}
                                onCheckedChange={(value) =>
                                  column.toggleVisibility(!!value)
                                }
                              >
                                {column.id}
                              </DropdownMenuCheckboxItem>
                            );
                          })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                          <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                              return (
                                <TableHead key={header.id}>
                                  {header.isPlaceholder
                                    ? null
                                    : flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                      )}
                                </TableHead>
                              );
                            })}
                          </TableRow>
                        ))}
                      </TableHeader>
                      <TableBody>
                        {table.getRowModel().rows?.length ? (
                          table.getRowModel().rows.map((row) => (
                            <TableRow
                              key={row.id}
                              data-state={row.getIsSelected() && "selected"}
                              onClick={() => viewAppointment(row.original)}
                              className="cursor-pointer hover:bg-muted/50"
                            >
                              {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id}>
                                  {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext()
                                  )}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={columns.length}
                              className="h-24 text-center"
                            >
                              No appointments found.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex items-center justify-end space-x-2 py-4">
                    <div className="flex-1 text-sm text-muted-foreground">
                      {table.getFilteredSelectedRowModel().rows.length} of{" "}
                      {table.getFilteredRowModel().rows.length} row(s) selected.
                    </div>
                    <div className="space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Appointment Details Card */}
      {displayAppointmentCard && selectedAppointment && (
        <div>
          <Card className="overflow-hidden mt-2.5">
            <CardHeader className="flex flex-row items-start bg-muted/50">
              <div className="grid gap-0.5">
                <CardTitle className="group flex items-center gap-2 text-lg">
                  <User className="h-4 w-4" />
                  {selectedAppointment.patient?.full_name}
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Copy className="h-3 w-3" />
                    <span className="sr-only">Copy Patient Info</span>
                  </Button>
                </CardTitle>
                <CardDescription>{selectedAppointment.patient?.email}</CardDescription>
              </div>
              <div className="ml-auto">
                {getStatusBadge(selectedAppointment.status)}
              </div>
            </CardHeader>
            <CardContent className="p-6 text-sm">
              <div className="grid gap-3">
                <div className="font-semibold">Appointment Details</div>
                <ul className="grid gap-3">
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Date & Time
                    </span>
                    <span>
                      {formatDateTime(selectedAppointment.appointment_datetime).date} at{' '}
                      {formatDateTime(selectedAppointment.appointment_datetime).time}
                    </span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Doctor
                    </span>
                    <span>{selectedAppointment.doctor?.full_name}</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span>{getStatusBadge(selectedAppointment.status)}</span>
                  </li>
                </ul>
                
                {selectedAppointment.notes && (
                  <>
                    <Separator className="my-2" />
                    <div className="font-semibold flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Notes
                    </div>
                    <p className="text-muted-foreground">{selectedAppointment.notes}</p>
                  </>
                )}

                <Separator className="my-2" />
                <div className="font-semibold">Patient Information</div>
                <ul className="grid gap-3">
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <span>{selectedAppointment.patient?.email}</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">Phone</span>
                    <span>{selectedAppointment.patient?.mobile_number || 'Not provided'}</span>
                  </li>
                </ul>

                {(isAdmin || isDoctor) && selectedAppointment.status === 'pending' && (
                  <div className="flex gap-2 mt-4">
                    <Button 
                      size="sm" 
                      onClick={() => handleStatusUpdate(selectedAppointment.id, 'confirmed')}
                      disabled={updateStatusMutation.isPending}
                    >
                      Confirm
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleStatusUpdate(selectedAppointment.id, 'cancelled')}
                      disabled={updateStatusMutation.isPending}
                    >
                      Cancel
                    </Button>
                  </div>
                )}

                {(isAdmin || isDoctor) && selectedAppointment.status === 'confirmed' && (
                  <div className="flex gap-2 mt-4">
                    <Button 
                      size="sm"
                      onClick={() => handleStatusUpdate(selectedAppointment.id, 'completed')}
                      disabled={updateStatusMutation.isPending}
                    >
                      Mark Complete
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
}