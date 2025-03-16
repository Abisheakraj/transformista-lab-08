
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { FileSpreadsheet, BarChart2, PieChart as PieChartIcon } from "lucide-react";
import { DataVisualizationProps } from "@/types/file-types";

const DataVisualization = ({ data = [], columns = [], rows = [] }: DataVisualizationProps) => {
  const [activeTab, setActiveTab] = useState("table");
  
  // Determine if we can create a chart from this data
  const canCreateChart = data && data.length > 0 && columns && columns.length > 0;
  
  // Find numeric columns for charting
  const numericColumns = columns.filter(column => {
    if (!data || data.length === 0) return false;
    const sampleValue = data[0][column];
    return typeof sampleValue === 'number' || !isNaN(Number(sampleValue));
  });
  
  const hasNumericData = numericColumns.length > 0;
  
  // Prepare chart data (use up to 10 rows for clarity)
  const chartData = data?.slice(0, 10).map((row, i) => ({
    name: `Row ${i + 1}`,
    ...numericColumns.reduce((acc, col) => {
      acc[col] = Number(row[col]);
      return acc;
    }, {} as Record<string, number>)
  }));
  
  // For pie chart, just use the first numeric column and row labels
  const pieChartData = chartData?.map((item) => ({
    name: item.name,
    value: item[numericColumns[0]] || 0
  }));
  
  // Colors for charts
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="bg-white rounded-lg">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full bg-gray-100 p-1">
          <TabsTrigger value="table" className="flex items-center gap-1.5">
            <FileSpreadsheet className="h-4 w-4" />
            Table View
          </TabsTrigger>
          <TabsTrigger value="bar" className="flex items-center gap-1.5" disabled={!canCreateChart || !hasNumericData}>
            <BarChart2 className="h-4 w-4" />
            Bar Chart
          </TabsTrigger>
          <TabsTrigger value="pie" className="flex items-center gap-1.5" disabled={!canCreateChart || !hasNumericData}>
            <PieChartIcon className="h-4 w-4" />
            Pie Chart
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="table" className="p-0">
          <div className="overflow-auto max-h-96">
            {columns && columns.length > 0 && rows && rows.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((column, i) => (
                      <TableHead key={i} className="font-semibold">
                        {column}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.slice(0, 100).map((row, i) => (
                    <TableRow key={i}>
                      {row.map((cell, j) => (
                        <TableCell key={j}>
                          {cell !== null && cell !== undefined ? String(cell) : ''}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : data && data.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    {Object.keys(data[0]).map((key) => (
                      <TableHead key={key} className="font-semibold">
                        {key}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.slice(0, 100).map((row, i) => (
                    <TableRow key={i}>
                      {Object.values(row).map((value, j) => (
                        <TableCell key={j}>
                          {value !== null && value !== undefined ? String(value) : ''}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-6 text-center text-gray-500">
                No data available
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="bar" className="h-80 p-4">
          {hasNumericData ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={70} 
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip />
                <Legend wrapperStyle={{ bottom: 0 }} />
                {numericColumns.slice(0, 4).map((column, index) => (
                  <Bar key={column} dataKey={column} fill={COLORS[index % COLORS.length]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              No numeric data available for visualization
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="pie" className="h-80 p-4">
          {hasNumericData ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => value.toFixed(2)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              No numeric data available for visualization
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataVisualization;
