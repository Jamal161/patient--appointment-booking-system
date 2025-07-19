import React, { useState, useEffect } from "react";
import { Calendar, FileText, Download, TrendingUp, Users, DollarSign } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useApiMutation } from "@/hooks/useApi";
import { generateMonthlyReport } from "@/http/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { toast } from "sonner";

export default function Reports() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [generatedReports, setGeneratedReports] = useState([]);

  useEffect(() => {
    document.title = "Reports - Patient Appointment System";
  }, []);

  const generateReportMutation = useApiMutation(
    ({ year, month }) => generateMonthlyReport(year, month),
    {
      successMessage: 'Monthly report generated successfully',
      onSuccess: (data) => {
        setGeneratedReports(data);
      }
    }
  );

  const handleGenerateReport = () => {
    if (!selectedYear || !selectedMonth) {
      toast.error('Please select both year and month');
      return;
    }

    generateReportMutation.mutate({
      year: selectedYear,
      month: selectedMonth
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getMonthName = (monthNumber) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNumber - 1];
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const totalEarnings = generatedReports.reduce((sum, report) => sum + (report.total_earnings || 0), 0);
  const totalAppointments = generatedReports.reduce((sum, report) => sum + (report.total_appointments || 0), 0);
  const totalPatients = generatedReports.reduce((sum, report) => sum + (report.total_patients || 0), 0);

  return (
    <main className="grid gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Reports
          </h1>
          <p className="text-muted-foreground">
            Generate and view monthly reports for doctors and appointments
          </p>
        </div>
      </div>

      {/* Report Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Generate Monthly Report
          </CardTitle>
          <CardDescription>
            Select a month and year to generate a comprehensive report
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="month">Month</Label>
              <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month} value={month.toString()}>
                      {getMonthName(month)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleGenerateReport}
              disabled={generateReportMutation.isPending}
              className="w-full"
            >
              {generateReportMutation.isPending ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Report
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Summary */}
      {generatedReports.length > 0 && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalEarnings)}</div>
                <p className="text-xs text-muted-foreground">
                  {getMonthName(selectedMonth)} {selectedYear}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalAppointments}</div>
                <p className="text-xs text-muted-foreground">
                  Completed appointments
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalPatients}</div>
                <p className="text-xs text-muted-foreground">
                  Unique patients served
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Report */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Doctor Performance Report</CardTitle>
                  <CardDescription>
                    {getMonthName(selectedMonth)} {selectedYear} - Detailed breakdown by doctor
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {generatedReports.map((report, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">Doctor ID: {report.doctor_id}</h3>
                        <p className="text-sm text-muted-foreground">
                          Report Period: {report.month}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {report.total_appointments} appointments
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-muted/50 rounded">
                        <div className="text-2xl font-bold text-blue-600">
                          {report.total_patients}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Patients Treated
                        </div>
                      </div>
                      
                      <div className="text-center p-3 bg-muted/50 rounded">
                        <div className="text-2xl font-bold text-green-600">
                          {report.total_appointments}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Appointments Completed
                        </div>
                      </div>
                      
                      <div className="text-center p-3 bg-muted/50 rounded">
                        <div className="text-2xl font-bold text-purple-600">
                          {formatCurrency(report.total_earnings)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Total Earnings
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Empty State */}
      {generatedReports.length === 0 && !generateReportMutation.isPending && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Reports Generated</h3>
            <p className="text-muted-foreground mb-4">
              Select a month and year above to generate your first report
            </p>
          </CardContent>
        </Card>
      )}
    </main>
  );
}