
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { LineChart, BarChart, PieChart, Line, Bar, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { DataVisualizationProps } from "@/types/file-types";

const DataVisualization: React.FC<DataVisualizationProps> = ({ data, columns, rows }) => {
  const [activeTab, setActiveTab] = useState("table");

  if (!data && !rows) {
    return <div className="p-4 text-center text-gray-500">No data to visualize</div>;
  }

  const displayData = data || rows || [];
  const columnHeaders = columns || (displayData[0] ? Object.keys(displayData[0]) : []);
  
  // Prepare data for charts
  const chartData = data ? data.slice(0, 50) : rows ? 
    rows.slice(0, 50).map((row, index) => {
      const rowData: Record<string, any> = { name: `Row ${index + 1}` };
      if (columns) {
        columns.forEach((col, colIndex) => {
          rowData[col] = row[colIndex];
        });
      }
      return rowData;
    }) : [];
  
  // Get numerical columns for charts
  const numericColumns = columnHeaders.filter(col => {
    const firstValue = data ? data[0]?.[col] : rows && columns ? rows[0]?.[columnHeaders.indexOf(col)] : null;
    return typeof firstValue === 'number';
  });

  // Random colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

  return (
    <Card>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full bg-gray-100 p-0 rounded-t-lg border-b">
          <TabsTrigger value="table" className="flex-1 rounded-none rounded-tl-lg">Table View</TabsTrigger>
          {numericColumns.length > 0 && (
            <>
              <TabsTrigger value="bar" className="flex-1 rounded-none">Bar Chart</TabsTrigger>
              <TabsTrigger value="line" className="flex-1 rounded-none">Line Chart</TabsTrigger>
              <TabsTrigger value="pie" className="flex-1 rounded-none rounded-tr-lg">Pie Chart</TabsTrigger>
            </>
          )}
        </TabsList>
        
        <CardContent className="p-0">
          <TabsContent value="table" className="m-0">
            <div className="max-h-[400px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columnHeaders.map((column, index) => (
                      <TableHead key={index} className="font-semibold">
                        {column}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data ? (
                    data.slice(0, 100).map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {columnHeaders.map((column, colIndex) => (
                          <TableCell key={colIndex}>{row[column]?.toString() || ''}</TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    rows?.slice(0, 100).map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <TableCell key={cellIndex}>{cell?.toString() || ''}</TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          {numericColumns.length > 0 && (
            <>
              <TabsContent value="bar" className="m-0">
                <div className="h-[400px] w-full p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {numericColumns.slice(0, 3).map((column, index) => (
                        <Bar key={column} dataKey={column} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
              
              <TabsContent value="line" className="m-0">
                <div className="h-[400px] w-full p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {numericColumns.slice(0, 3).map((column, index) => (
                        <Line 
                          key={column} 
                          type="monotone" 
                          dataKey={column} 
                          stroke={COLORS[index % COLORS.length]} 
                          activeDot={{ r: 8 }} 
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
              
              <TabsContent value="pie" className="m-0">
                <div className="h-[400px] w-full p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData.slice(0, 10)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey={numericColumns[0]}
                      >
                        {chartData.slice(0, 10).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </>
          )}
        </CardContent>
      </Tabs>
    </Card>
  );
};

export default DataVisualization;
