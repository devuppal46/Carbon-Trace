import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Download,
  ArrowLeft,
  Factory,
  AlertTriangle,
  Cloud,
  CheckCircle2,
  XCircle,
  Trash2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const COLORS = [
  "#0ea5e9", // Vivid Sky Blue
  "#22c55e", // Neon Green
  "#e11d48", // Rose Red
  "#f59e0b", // Amber
  "#8b5cf6", // Violet
  "#ec4899", // Pink
];
const BASE_URL = "http://localhost:8000";

const DashboardPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const auditData = location.state?.auditData;

  useEffect(() => {
    if (!auditData) {
      navigate("/upload");
    }

    // Cleanup job files when leaving the dashboard
    const cleanupJob = () => {
      if (auditData?.job_id) {
        // Use fetch with keepalive ensuring the request completes even if the page unloads
        fetch(`${BASE_URL}/outputs/${auditData.job_id}`, {
          method: "DELETE",
          keepalive: true,
        }).catch(console.error);
      }
    };

    window.addEventListener("beforeunload", cleanupJob);
    return () => {
      window.removeEventListener("beforeunload", cleanupJob);
      // Also cleanup on component unmount if navigating away within the app
      cleanupJob();
    };
  }, [auditData, navigate]);

  if (!auditData) return null;

  const { summary, sector_breakdown, violators, factories, files, job_id } =
    auditData;

  // Prepare data for charts
  const sectorData = Object.entries(sector_breakdown).map(([name, data]) => ({
    name,
    emissions: Math.round(data.total_emissions_kg / 1000), // Convert to tons for better display
    factories: data.factories,
  }));

  const violatorData = violators.slice(0, 5).map((v) => ({
    name: v.id,
    emissions: Math.round(v.total / 1000),
    alerts: v.alerts,
  }));

  const handleDownload = (url, filename) => {
    const a = document.createElement("a");
    a.href = `${BASE_URL}${url}`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 p-6 pt-24 max-w-7xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              Audit Results
            </h1>
            <p className="text-muted-foreground mt-1 text-sm font-medium">Job ID: <span className="font-mono text-xs bg-secondary/50 px-2 py-1 rounded border border-border/50 text-foreground">{job_id}</span></p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/upload")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/80 border border-border/50 hover:bg-secondary transition-all duration-200 text-secondary-foreground text-sm font-medium shadow-sm hover:shadow-md"
            >
              <ArrowLeft className="w-4 h-4" />
              New Audit
            </button>
            <button
              onClick={() =>
                handleDownload(files.audit_csv, "audit_summary.csv")
              }
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 text-sm font-medium shadow-lg shadow-primary/20 hover:shadow-primary/40"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-card/40 backdrop-blur-xl border-border/50 shadow-lg shadow-black/5 hover:shadow-cyan-500/10 transition-all duration-300">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center shrink-0 border border-cyan-500/20">
                <Factory className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Factories
                </p>
                <h3 className="text-2xl font-bold text-foreground">
                  {summary.total_factories}
                </h3>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/40 backdrop-blur-xl border-border/50 shadow-lg shadow-black/5 hover:shadow-emerald-500/10 transition-all duration-300">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                <Cloud className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Emissions (Tons)
                </p>
                <h3 className="text-2xl font-bold text-foreground">
                  {summary.total_emissions_tons.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}
                </h3>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/40 backdrop-blur-xl border-border/50 shadow-lg shadow-black/5 hover:shadow-pink-500/10 transition-all duration-300">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-pink-500/10 flex items-center justify-center shrink-0 border border-pink-500/20">
                <AlertTriangle className="w-6 h-6 text-pink-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Factories Over Cap
                </p>
                <h3 className="text-2xl font-bold text-foreground">
                  {summary.factories_over_cap}
                </h3>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-card/40 backdrop-blur-xl border-border/50 shadow-lg shadow-black/5">
            <CardHeader>
              <CardTitle>Emissions by Sector (Tons)</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sectorData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="emissions"
                    stroke="none"
                  >
                    {sectorData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => `${value.toLocaleString()} Tons`}
                    contentStyle={{
                      backgroundColor: "rgba(10, 15, 30, 0.9)",
                      backdropFilter: "blur(10px)",
                      borderRadius: "12px",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#fff",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)"
                    }}
                    itemStyle={{ color: "#fff" }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-card/40 backdrop-blur-xl border-border/50 shadow-lg shadow-black/5">
            <CardHeader>
              <CardTitle>Top 5 Violators (Tons)</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={violatorData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.05)" }}
                    contentStyle={{
                      backgroundColor: "rgba(10, 15, 30, 0.9)",
                      backdropFilter: "blur(10px)",
                      borderRadius: "12px",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#fff",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)"
                    }}
                    itemStyle={{ color: "#fff" }}
                  />
                  <Bar
                    dataKey="emissions"
                    fill="#e11d48"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={50}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Data Tables */}
        <Card className="bg-card/40 backdrop-blur-xl border-border/50 shadow-lg shadow-black/5 overflow-hidden">
          <CardContent className="p-0">
            <Tabs defaultValue="all" className="w-full">
              <div className="px-6 pt-6 pb-2 border-b border-border/10">
                <TabsList className="bg-secondary/20 border border-border/10">
                  <TabsTrigger value="all" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary-foreground">All Factories</TabsTrigger>
                  <TabsTrigger value="violators" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary-foreground">Violators</TabsTrigger>
                  <TabsTrigger value="sectors" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary-foreground">Sector Breakdown</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="all" className="m-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-border/10">
                        <TableHead className="text-muted-foreground">Factory ID</TableHead>
                        <TableHead className="text-muted-foreground">Sector</TableHead>
                        <TableHead className="text-right text-muted-foreground">
                          Total Emissions (kg)
                        </TableHead>
                        <TableHead className="text-right text-muted-foreground">
                          Avg Monthly (kg)
                        </TableHead>
                        <TableHead className="text-center text-muted-foreground">Alerts</TableHead>
                        <TableHead className="text-muted-foreground">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {factories.map((factory) => (
                        <TableRow
                          key={factory.factory_id}
                          className="border-border/10 hover:bg-muted/50 transition-colors"
                        >
                          <TableCell className="font-medium text-foreground">
                            {factory.factory_id}
                          </TableCell>
                          <TableCell className="text-muted-foreground">{factory.sector}</TableCell>
                          <TableCell className="text-right text-foreground font-mono">
                            {factory.total_emissions_kg.toLocaleString(
                              undefined,
                              { maximumFractionDigits: 1 },
                            )}
                          </TableCell>
                          <TableCell className="text-right text-foreground font-mono">
                            {factory.avg_monthly_kg.toLocaleString(undefined, {
                              maximumFractionDigits: 1,
                            })}
                          </TableCell>
                          <TableCell className="text-center">
                            {factory.alerts > 0 ? (
                              <Badge
                                variant="destructive"
                                className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20"
                              >
                                {factory.alerts}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground/50">0</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {factory.status === "COMPLIANT" ? (
                              <div className="flex items-center gap-1.5 text-emerald-400 text-sm font-medium">
                                <CheckCircle2 className="w-4 h-4" />
                                Compliant
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-red-400 text-sm font-medium">
                                <XCircle className="w-4 h-4" />
                                Exceeded
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="violators" className="m-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-border/10">
                        <TableHead className="text-muted-foreground">Factory ID</TableHead>
                        <TableHead className="text-muted-foreground">Sector</TableHead>
                        <TableHead className="text-right text-muted-foreground">
                          Total Emissions (kg)
                        </TableHead>
                        <TableHead className="text-center text-muted-foreground">
                          Months Exceeded
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {violators.map((violator) => (
                        <TableRow
                          key={violator.id}
                          className="border-border/10 hover:bg-muted/50 transition-colors"
                        >
                          <TableCell className="font-medium text-pink-500">
                            {violator.id}
                          </TableCell>
                          <TableCell className="text-muted-foreground">{violator.sector}</TableCell>
                          <TableCell className="text-right font-medium font-mono text-foreground">
                            {violator.total.toLocaleString(undefined, {
                              maximumFractionDigits: 1,
                            })}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="destructive" className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20">
                              {violator.alerts} months
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      {violators.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="text-center py-8 text-muted-foreground"
                          >
                            No violators found. All factories are compliant!
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="sectors" className="m-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-border/10">
                        <TableHead className="text-muted-foreground">Sector</TableHead>
                        <TableHead className="text-center text-muted-foreground">Factories</TableHead>
                        <TableHead className="text-right text-muted-foreground">
                          Total Emissions (kg)
                        </TableHead>
                        <TableHead className="text-right text-muted-foreground">
                          Avg per Factory (kg)
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(sector_breakdown).map(
                        ([sector, data]) => (
                          <TableRow
                            key={sector}
                            className="border-border/10 hover:bg-muted/50 transition-colors"
                          >
                            <TableCell className="font-medium text-foreground">
                              {sector}
                            </TableCell>
                            <TableCell className="text-center text-muted-foreground">
                              {data.factories}
                            </TableCell>
                            <TableCell className="text-right text-foreground font-mono">
                              {data.total_emissions_kg.toLocaleString(
                                undefined,
                                { maximumFractionDigits: 1 },
                              )}
                            </TableCell>
                            <TableCell className="text-right text-foreground font-mono">
                              {data.avg_per_factory_kg.toLocaleString(
                                undefined,
                                { maximumFractionDigits: 1 },
                              )}
                            </TableCell>
                          </TableRow>
                        ),
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Generated Chart Image */}
        <Card className="bg-card/40 backdrop-blur-xl border-border/50 shadow-lg shadow-black/5 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Cumulative Emissions Chart</CardTitle>
              <CardDescription>Generated by the audit pipeline</CardDescription>
            </div>
            <button
              onClick={() => handleDownload(files.chart, "emissions_chart.png")}
              className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
              title="Download Chart"
            >
              <Download className="w-5 h-5" />
            </button>
          </CardHeader>
          <CardContent className="flex justify-center bg-muted/20 p-6">
            <img
              src={`${BASE_URL}${files.chart}`}
              alt="Emissions Chart"
              className="max-w-full h-auto rounded-xl shadow-lg border border-border/10"
            />
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default DashboardPage;
