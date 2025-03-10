
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

interface DataVisualizationProps {
  data: any[];
}

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe", "#00C49F", "#FFBB28"];

const DataVisualization: React.FC<DataVisualizationProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState("table");

  if (!data || data.length === 0) {
    return (
      <Card className="p-4">
        <p className="text-center text-gray-500">No data available for visualization</p>
      </Card>
    );
  }

  // Extract column names from the data
  const columns = Object.keys(data[0]);
  
  // Try to find numeric columns for charts
  const numericColumns = columns.filter(column => {
    return data.some(row => typeof row[column] === 'number' || !isNaN(Number(row[column])));
  });
  
  // Prepare data for bar chart
  const getBarChartData = () => {
    if (numericColumns.length === 0) return [];
    
    // Use first numeric column by default
    const valueColumn = numericColumns[0];
    const categoryColumn = columns.find(col => col !== valueColumn) || columns[0];
    
    return data.slice(0, 10).map((item) => ({
      name: String(item[categoryColumn]).substring(0, 15), // Truncate long names
      value: Number(item[valueColumn]) || 0
    }));
  };
  
  // Prepare data for pie chart
  const getPieChartData = () => {
    if (numericColumns.length === 0) return [];
    
    // Use first numeric column by default
    const valueColumn = numericColumns[0];
    const categoryColumn = columns.find(col => col !== valueColumn) || columns[0];
    
    return data.slice(0, 5).map((item) => ({
      name: String(item[categoryColumn]).substring(0, 15), // Truncate long names
      value: Number(item[valueColumn]) || 0
    }));
  };

  // Calculate data summary
  const getDataSummary = () => {
    const summary = {
      rowCount: data.length,
      columnCount: columns.length,
      numericColumns: numericColumns.length,
    };
    
    // Add summary stats for numeric columns
    const numericSummaries = numericColumns.map(column => {
      const values = data.map(row => Number(row[column])).filter(val => !isNaN(val));
      const sum = values.reduce((acc, val) => acc + val, 0);
      const avg = values.length > 0 ? sum / values.length : 0;
      const min = values.length > 0 ? Math.min(...values) : 0;
      const max = values.length > 0 ? Math.max(...values) : 0;
      
      return {
        column,
        min: min.toFixed(2),
        max: max.toFixed(2),
        avg: avg.toFixed(2),
        sum: sum.toFixed(2)
      };
    });
    
    return { summary, numericSummaries };
  };
  
  const barChartData = getBarChartData();
  const pieChartData = getPieChartData();
  const { summary, numericSummaries } = getDataSummary();

  return (
    <Card className="border border-gray-200 rounded-lg overflow-hidden">
      <Tabs defaultValue="table" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b px-4">
          <TabsList className="h-10">
            <TabsTrigger value="table" className="data-[state=active]:bg-gray-100">Table View</TabsTrigger>
            <TabsTrigger value="bar" className="data-[state=active]:bg-gray-100">Bar Chart</TabsTrigger>
            <TabsTrigger value="pie" className="data-[state=active]:bg-gray-100">Pie Chart</TabsTrigger>
            <TabsTrigger value="line" className="data-[state=active]:bg-gray-100">Line Chart</TabsTrigger>
            <TabsTrigger value="summary" className="data-[state=active]:bg-gray-100">Summary</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="table" className="m-0">
          <div className="overflow-x-auto max-h-[400px]">
            <table className="w-full border-collapse min-w-full">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  {columns.map((column, index) => (
                    <th key={index} className="py-2 px-4 text-left text-sm font-medium text-gray-600 border-b">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 100).map((row, rowIndex) => (
                  <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    {columns.map((column, colIndex) => (
                      <td key={colIndex} className="py-2 px-4 text-sm text-gray-800 border-b">
                        {row[column] !== undefined && row[column] !== null 
                          ? String(row[column]).substring(0, 50) // Truncate long values
                          : ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.length > 100 && (
            <div className="p-3 text-center text-sm text-gray-500">
              Showing 100 of {data.length} rows
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="bar" className="m-0 p-4">
          {barChartData.length > 0 ? (
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barChartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end"
                    height={80}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              No numeric data available for bar chart visualization
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="pie" className="m-0 p-4">
          {pieChartData.length > 0 ? (
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              No numeric data available for pie chart visualization
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="line" className="m-0 p-4">
          {barChartData.length > 0 ? (
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={barChartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end"
                    height={80}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              No numeric data available for line chart visualization
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="summary" className="m-0">
          <div className="p-4">
            <h3 className="text-lg font-medium mb-3">Data Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="p-4 bg-indigo-50">
                <h4 className="text-sm font-medium text-indigo-800 mb-1">Rows</h4>
                <p className="text-2xl font-bold text-indigo-600">{summary.rowCount}</p>
              </Card>
              <Card className="p-4 bg-emerald-50">
                <h4 className="text-sm font-medium text-emerald-800 mb-1">Columns</h4>
                <p className="text-2xl font-bold text-emerald-600">{summary.columnCount}</p>
              </Card>
              <Card className="p-4 bg-amber-50">
                <h4 className="text-sm font-medium text-amber-800 mb-1">Numeric Columns</h4>
                <p className="text-2xl font-bold text-amber-600">{summary.numericColumns}</p>
              </Card>
            </div>
            
            {numericSummaries.length > 0 && (
              <>
                <h3 className="text-lg font-medium mb-3">Numeric Column Statistics</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="py-2 px-4 text-left text-sm font-medium text-gray-600 border">Column</th>
                        <th className="py-2 px-4 text-left text-sm font-medium text-gray-600 border">Min</th>
                        <th className="py-2 px-4 text-left text-sm font-medium text-gray-600 border">Max</th>
                        <th className="py-2 px-4 text-left text-sm font-medium text-gray-600 border">Average</th>
                        <th className="py-2 px-4 text-left text-sm font-medium text-gray-600 border">Sum</th>
                      </tr>
                    </thead>
                    <tbody>
                      {numericSummaries.map((item, index) => (
                        <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="py-2 px-4 text-sm text-gray-800 border">{item.column}</td>
                          <td className="py-2 px-4 text-sm text-gray-800 border">{item.min}</td>
                          <td className="py-2 px-4 text-sm text-gray-800 border">{item.max}</td>
                          <td className="py-2 px-4 text-sm text-gray-800 border">{item.avg}</td>
                          <td className="py-2 px-4 text-sm text-gray-800 border">{item.sum}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default DataVisualization;
