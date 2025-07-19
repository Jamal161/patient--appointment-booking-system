import React from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import  { useEffect, useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

import { CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import {
  Home,
  LineChart,
  Package,
  Package2,
  PanelLeft,
  Users2,
  UserCheck,
  Menu,
  Timer,
  TimerIcon,
  User,
  Calendar,
  FileText,
} from "lucide-react";

import { Outlet } from "react-router-dom";
import { ModeToggle } from "@/components/ui/mode-toggle";
import useStoreToken from "@/http/store";
import { useAuth } from "@/hooks/useAuth";



  function LiveClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZone: 'Asia/Dhaka',
  }).format(time);

  const dateString = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Dhaka',
  }).format(time);

  return (
    <span>
      {dateString} — {timeString}
    </span>
  );
}


function MainLayout() {
  const token = useStoreToken((state) => state.token);
  const setToken = useStoreToken((state) => state.setToken);
  const { user, userRole, canAccessRoute } = useAuth();

  if (token === "") {
    return <Navigate to="/Auth/Login" replace />;
  }

  const logOut = () => {
    setToken("");
  };
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <Link
            to="#"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
            <Package2 className="h-4 w-4 transition-all group-hover:scale-110" />
            <span className="sr-only">Admin Panel</span>
          </Link>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/Dashboard"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                >
                  <Home className="h-5 w-5" />
                  <span className="sr-only">Dashboard</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Dashboard</TooltipContent>
            </Tooltip>
           
            {canAccessRoute('/Patients') && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/Patients"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                >
                  <Users2 className="h-5 w-5" />
                  <span className="sr-only">Patients</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Patients</TooltipContent>
            </Tooltip>
            )}
            
            {canAccessRoute('/Appointments') && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/Appointments"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                >
                  <LineChart className="h-5 w-5" />
                  <span className="sr-only">Appointments</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Appointments</TooltipContent>
            </Tooltip>
            )}
            
            {canAccessRoute('/Users') && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/Users"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                >
                  <UserCheck className="h-5 w-5" />
                  <span className="sr-only">Users</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Users</TooltipContent>
            </Tooltip>
            )}
            
            {userRole === 'patient' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/BookAppointment"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                >
                  <Calendar className="h-5 w-5" />
                  <span className="sr-only">Book Appointment</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Book Appointment</TooltipContent>
            </Tooltip>
            )}
            
            {userRole === 'admin' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/Reports"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                >
                  <FileText className="h-5 w-5" />
                  <span className="sr-only">Reports</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Reports</TooltipContent>
            </Tooltip>
            )}
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/Profile"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                >
                  <User className="h-5 w-5" />
                  <span className="sr-only">Profile</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Profile</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </nav>
      </aside>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
              <nav className="grid gap-6 text-lg font-medium">
                <Link
                  to="#"
                  className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                >
                  <Package2 className="h-5 w-5 transition-all group-hover:scale-110" />
                  <span className="sr-only">Admin Panel</span>
                </Link>
                <Link
                  to="/Dashboard"
                  className="flex items-center gap-4 px-2.5 text-foreground"
                >
                  <Home className="h-5 w-5" />
                  Dashboard
                </Link>
                {canAccessRoute('/Patients') && (
                <Link
                  to="/Patients"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <Users2 className="h-5 w-5" />
                  Patients
                </Link>
                )}
                {canAccessRoute('/Appointments') && (
                <Link
                  to="/Appointments"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <LineChart className="h-5 w-5" />
                  Appointments
                </Link>
                )}
                {canAccessRoute('/Users') && (
                <Link
                  to="/Users"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <UserCheck className="h-5 w-5" />
                  Users
                </Link>
                )}
                {userRole === 'patient' && (
                <Link
                  to="/BookAppointment"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <Calendar className="h-5 w-5" />
                  Book Appointment
                </Link>
                )}
                {userRole === 'admin' && (
                <Link
                  to="/Reports"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <FileText className="h-5 w-5" />
                  Reports
                </Link>
                )}
                <Link
                  to="/Profile"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <User className="h-5 w-5" />
                  Profile
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
          <CardTitle className="ml-3 w-full">
             Welcome {user?.full_name || 'User'} ({userRole?.charAt(0).toUpperCase() + userRole?.slice(1)}) || <LiveClock />
          </CardTitle>
          <div className="relative ml-auto flex-1 md:grow-0">
            {/* <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
            /> */}
          </div>
          <ModeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="overflow-hidden rounded-full"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Profile</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link to="/Profile" className="w-full">
                  View Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logOut}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <Outlet />
        <Toaster />
      </div>
    </div>
  );
}

export default MainLayout;
