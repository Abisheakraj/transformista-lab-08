
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { FileSpreadsheet, BarChart2, PieChart as PieChartIcon } from "lucide-react";
import { DataVisualizationProps } from "@/types/file-types";

const DataVisualization = ({ data = [], columns = [], rows = [], file }: DataVisualizationProps) => {
  const [activeTab, setActiveTab] = useState("table");
  
  // Use data from file if provided, otherwise use direct data
  const displayData = file?.rows || data;
  const displayColumns = file?.columns || columns;
  const displayRows = file?.rows || rows;
  
  // Determine if we can create a chart from this data
  const canCreateChart = displayData && displayData.length > 0;
  
  // Find numeric columns for charting
  const numericColumns = displayColumns ? displayColumns.filter(column => {
    if (!displayData || displayData.length === 0) return false;
    // For file data structure
    if (displayRows && displayRows.length > 0) {
      const sampleValue = displayRows[0][displayColumns.indexOf(column)];
      return typeof sampleValue === 'number' || !isNaN(Number(sampleValue));
    }
    // For object data structure
    const sampleValue = displayData[0][column];
    return typeof sampleValue === 'number' || !isNaN(Number(sampleValue));
  }) : [];
  
  const hasNumericData = numericColumns.length > 0;
  
  // Prepare chart data (use up to 10 rows for clarity)
  const chartData = canCreateChart ? displayData.slice(0, 10).map((row, i) => {
    if (Array.isArray(row)) {
      // Handle row-based data
      return {
        name: `Row ${i + 1}`,
        ...numericColumns.reduce((acc, col, colIndex) => {
          const value = row[displayColumns.indexOf(col)];
          acc[col] = Number(value) || 0;
          return acc;
        }, {} as Record<string, number>)
      };
    } else {
      // Handle object-based data
      return {
        name: `Row ${i + 1}`,
        ...numericColumns.reduce((acc, col) => {
          acc[col] = Number(row[col]) || 0;
          return acc;
        }, {} as Record<string, number>)
      };
    }
  }) : [];
  
  // For pie chart, just use the first numeric column and row labels
  const pieChartData = hasNumericData ? chartData?.map((item) => ({
    name: item.name,
    value: item[numericColumns[0]] || 0
  })) : [];
  
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
            {displayColumns && displayColumns.length > 0 && displayRows && displayRows.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    {displayColumns.map((column, i) => (
                      <TableHead key={i} className="font-semibold">
                        {column}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayRows.slice(0, 100).map((row, i) => (
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
            ) : displayData && displayData.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    {Object.keys(displayData[0]).map((key) => (
                      <TableHead key={key} className="font-semibold">
                        {key}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayData.slice(0, 100).map((row, i) => (
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
                <Tooltip formatter={(value) => {
                  return typeof value === 'number' ? value.toFixed(2) : value;
                }} />
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
                <Tooltip formatter={(value) => {
                  return typeof value === 'number' ? value.toFixed(2) : value;
                }} />
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
