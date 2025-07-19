import React, { useEffect } from "react";
import { 
  Copy, 
  Pencil, 
  Users, 
  Calendar, 
  Clock, 
  TrendingUp, 
  Activity,
  UserCheck,
  CalendarDays,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useApiQuery } from "@/hooks/useApi";
import { 
  fetchCurrentUser,
  fetchTodaysAppointments, 
  fetchTotalPatients, 
  fetchTotalDoctors,
  fetchTotalPendingAppointmentCount,
  fetchTotalCompletedAppointmentCount,
  fetchAppointments,
  fetchAppointmentStats
} from "@/http/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ApiStatusIndicator } from "@/components/ApiStatus";
import { useAuth } from "@/hooks/useAuth";

export default function Dashboard() {
  const { user, userRole, isAdmin, isDoctor, isPatient } = useAuth();
  
  useEffect(() => {
    document.title = "Dashboard - Patient Appointment System";
  }, []);

  // API queries
  const { data: todaysAppointments = [], isLoading: isLoadingAppointments } = useApiQuery(
    ['todaysAppointments'], 
    fetchTodaysAppointments
  );

  // Only load these stats for admin users
  const { data: totalPatients = 0, isLoading: isLoadingPatients } = useApiQuery(
    ['totalPatients'], 
    fetchTotalPatients,
    { enabled: isAdmin }
  );

  const { data: totalDoctors = 0, isLoading: isLoadingDoctors } = useApiQuery(
    ['totalDoctors'], 
    fetchTotalDoctors,
    { enabled: isAdmin }
  );

  const { data: pendingCount = 0, isLoading: isLoadingPending } = useApiQuery(
    ['pendingCount'], 
    fetchTotalPendingAppointmentCount,
    { enabled: isAdmin || isDoctor }
  );

  const { data: completedCount = 0, isLoading: isLoadingCompleted } = useApiQuery(
    ['completedCount'], 
    fetchTotalCompletedAppointmentCount,
    { enabled: isAdmin || isDoctor }
  );

  const { data: recentAppointments = [], isLoading: isLoadingRecent } = useApiQuery(
    ['recentAppointments'], 
    () => fetchAppointments({ limit: 10 })
  );

  const { data: appointmentStats, isLoading: isLoadingStats } = useApiQuery(
    ['appointmentStats'], 
    fetchAppointmentStats,
    { enabled: isAdmin || isDoctor }
  );

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

  const calculateCompletionRate = () => {
    if (!isAdmin && !isDoctor) return 0;
    const total = appointmentStats?.total_appointments || 0;
    const completed = appointmentStats?.completed_appointments || 0;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
        
        {/* Welcome Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Welcome back, {user?.full_name || 'User'}!
            </CardTitle>
            <CardDescription>
              {isAdmin && "Here's what's happening in your healthcare system today."}
              {isDoctor && "Here's your schedule and appointment overview."}
              {isPatient && "Here's your appointment information and profile overview."}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Statistics Cards */}
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
          {isAdmin && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingPatients ? <LoadingSpinner size="sm" /> : totalPatients}
              </div>
              <p className="text-xs text-muted-foreground">
                Registered in system
              </p>
            </CardContent>
          </Card>
          )}

          {isAdmin && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingDoctors ? <LoadingSpinner size="sm" /> : totalDoctors}
              </div>
              <p className="text-xs text-muted-foreground">
                Medical professionals
              </p>
            </CardContent>
          </Card>
          )}

          {(isAdmin || isDoctor) && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Appointments</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingPending ? <LoadingSpinner size="sm" /> : pendingCount}
              </div>
              <p className="text-xs text-muted-foreground">
                Awaiting confirmation
              </p>
            </CardContent>
          </Card>
          )}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {isPatient ? "My Appointments" : "Today's Appointments"}
              </CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingAppointments ? <LoadingSpinner size="sm" /> : todaysAppointments.length}
              </div>
              <p className="text-xs text-muted-foreground">
                {isPatient ? "Your appointments" : "Scheduled for today"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Completion Rate Card */}
        {(isAdmin || isDoctor) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Appointment Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Completed Appointments</span>
                <span>{completedCount} / {(appointmentStats?.total_appointments || 0)}</span>
              </div>
              <Progress value={calculateCompletionRate()} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {calculateCompletionRate()}% completion rate this month
              </p>
            </div>
          </CardContent>
        </Card>
        )}

        {/* Appointments Table */}
        <Tabs defaultValue="today" className="w-full">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="today">Today's Schedule</TabsTrigger>
              <TabsTrigger value="recent">Recent Activity</TabsTrigger>
            </TabsList>
            <ApiStatusIndicator 
              isLoading={isLoadingAppointments || isLoadingRecent} 
              isError={false} 
            />
          </div>
          
          <TabsContent value="today">
            <Card>
              <CardHeader>
                <CardTitle>Today's Appointments</CardTitle>
                <CardDescription>
                  {isPatient ? "Your appointments for today" : "All appointments scheduled for today"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingAppointments ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : todaysAppointments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No appointments scheduled for today</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {todaysAppointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {isDoctor 
                                  ? appointment.patient?.full_name || 'Unknown Patient'
                                  : appointment.patient?.full_name || 'Unknown Patient'
                                }
                              </div>
                              {!isPatient && (
                              <div className="text-sm text-muted-foreground">
                                {appointment.patient?.email}
                              </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {isPatient 
                                ? `Dr. ${appointment.doctor?.full_name || 'Unknown Doctor'}`
                                : `Dr. ${appointment.doctor?.full_name || 'Unknown Doctor'}`
                              }
                            </div>
                          </TableCell>
                          <TableCell>
                            {formatTime(appointment.appointment_datetime)}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(appointment.status)}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {appointment.notes || 'No notes'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recent">
            <Card>
              <CardHeader>
                <CardTitle>Recent Appointments</CardTitle>
                <CardDescription>
                  Latest appointment activity across all dates
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingRecent ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentAppointments.slice(0, 10).map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell>
                            <div className="font-medium">
                              {isDoctor 
                                ? appointment.patient?.full_name || 'Unknown Patient'
                                : appointment.patient?.full_name || 'Unknown Patient'
                              }
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {isPatient 
                                ? `Dr. ${appointment.doctor?.full_name || 'Unknown Doctor'}`
                                : `Dr. ${appointment.doctor?.full_name || 'Unknown Doctor'}`
                              }
                            </div>
                          </TableCell>
                          <TableCell>
                            {formatDate(appointment.appointment_datetime)}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(appointment.status)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* User Profile & System Stats Sidebar */}
      <div className="space-y-4">
        {/* User Profile Card */}
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-start bg-muted/50">
            <div className="grid gap-0.5">
              <CardTitle className="group flex items-center gap-2 text-lg">
                {user?.full_name || 'Admin User'}
                <Button
                  size="icon"
                  variant="outline"
                  className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Copy className="h-3 w-3" />
                  <span className="sr-only">Copy User ID</span>
                </Button>
              </CardTitle>
              <CardDescription>{user?.email}</CardDescription>
              <Badge variant="outline" className="w-fit mt-1">
                {user?.user_type?.charAt(0).toUpperCase() + user?.user_type?.slice(1)}
              </Badge>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <Button size="sm" variant="outline">
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6 text-sm">
            <div className="grid gap-3">
              <div className="font-semibold">System Overview</div>
              <ul className="grid gap-3">
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Patients</span>
                  <span>{isAdmin ? totalPatients : 'N/A'}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Doctors</span>
                  <span>{isAdmin ? totalDoctors : 'N/A'}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">Pending</span>
                  <span className="flex items-center gap-1">
                    {(isAdmin || isDoctor) ? pendingCount : 'N/A'}
                    {(isAdmin || isDoctor) && pendingCount > 0 && <AlertCircle className="h-3 w-3 text-yellow-500" />}
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">Completed</span>
                  <span>{(isAdmin || isDoctor) ? completedCount : 'N/A'}</span>
                </li>
              </ul>
            </div>
            <Separator className="my-4" />
            <div className="grid gap-3">
              <div className="font-semibold">Quick Actions</div>
              <div className="grid gap-2">
                {(isAdmin || isPatient) && (
                <Button size="sm" className="w-full">
                  <Calendar className="mr-2 h-4 w-4" />
                  New Appointment
                </Button>
                )}
                {isAdmin && (
                <Button size="sm" variant="outline" className="w-full">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Generate Report
                </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Health Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">API Status</span>
              <ApiStatusIndicator isLoading={false} isError={false} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Database</span>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                Connected
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Last Updated</span>
              <span className="text-sm text-muted-foreground">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}