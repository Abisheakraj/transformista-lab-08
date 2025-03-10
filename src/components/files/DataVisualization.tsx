
import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { UploadedFile } from './FileUploadArea';
import { BarChart2, LineChart as LineChartIcon, PieChart as PieChartIcon, RefreshCw, Settings } from 'lucide-react';

interface DataVisualizationProps {
  file: UploadedFile;
}

const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#FCA5A5'];

const DataVisualization = ({ file }: DataVisualizationProps) => {
  const [chartType, setChartType] = useState<string>('bar');
  const [xAxisKey, setXAxisKey] = useState<string>('');
  const [yAxisKey, setYAxisKey] = useState<string>('');
  const [availableFields, setAvailableFields] = useState<string[]>([]);
  const [numericalFields, setNumericalFields] = useState<string[]>([]);
  const [processedData, setProcessedData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [colorScheme, setColorScheme] = useState<string>('default');

  useEffect(() => {
    if (file && Array.isArray(file.data) && file.data.length > 0) {
      // Extract all available fields
      const fields = Object.keys(file.data[0]);
      setAvailableFields(fields);
      
      // Identify numerical fields for Y-axis
      const numFields = fields.filter(field => {
        const sample = file.data.slice(0, 10).find(item => item[field] !== null && item[field] !== undefined);
        return sample && !isNaN(Number(sample[field]));
      });
      setNumericalFields(numFields);
      
      // Set default X and Y axes
      if (fields.length > 0) {
        setXAxisKey(fields[0]);
      }
      
      if (numFields.length > 0) {
        setYAxisKey(numFields[0]);
      }
      
      // Process and limit data for visualization
      const processedData = file.data.slice(0, 50).map(item => {
        const processed: Record<string, any> = {};
        
        Object.keys(item).forEach(key => {
          if (numFields.includes(key)) {
            processed[key] = Number(item[key]) || 0;
          } else {
            processed[key] = item[key];
          }
        });
        
        return processed;
      });
      
      setProcessedData(processedData);
      setIsLoading(false);
    }
  }, [file]);

  const handleRefreshChart = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 300);
  };

  const getChartColors = () => {
    switch (colorScheme) {
      case 'blues': return ['#DBEAFE', '#BFDBFE', '#93C5FD', '#60A5FA', '#3B82F6', '#2563EB'];
      case 'greens': return ['#DCFCE7', '#BBF7D0', '#86EFAC', '#4ADE80', '#22C55E', '#16A34A'];
      case 'purples': return ['#EDE9FE', '#DDD6FE', '#C4B5FD', '#A78BFA', '#8B5CF6', '#7C3AED'];
      case 'oranges': return ['#FFEDD5', '#FED7AA', '#FDBA74', '#FB923C', '#F97316', '#EA580C'];
      default: return COLORS;
    }
  };

  const renderChart = () => {
    if (isLoading) {
      return (
        <div className="w-full h-72 flex items-center justify-center">
          <RefreshCw className="h-8 w-8 text-indigo-300 animate-spin" />
        </div>
      );
    }

    if (!xAxisKey || !yAxisKey || processedData.length === 0) {
      return (
        <div className="w-full h-72 flex items-center justify-center bg-gray-50 rounded-md">
          <p className="text-gray-500">Please select valid X and Y axes to visualize the data</p>
        </div>
      );
    }

    const colors = getChartColors();

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={processedData}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey={xAxisKey} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey={yAxisKey} fill={colors[0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={processedData}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey={xAxisKey} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey={yAxisKey} 
                stroke={colors[0]}
                strokeWidth={2}
                dot={{ stroke: colors[0], strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        // Process data for pie chart - group by x-axis value
        const pieData = processedData.reduce((acc: any[], item) => {
          const existingItem = acc.find(i => i.name === item[xAxisKey]);
          
          if (existingItem) {
            existingItem.value += Number(item[yAxisKey]) || 0;
          } else {
            acc.push({
              name: item[xAxisKey] || 'Unknown',
              value: Number(item[yAxisKey]) || 0
            });
          }
          
          return acc;
        }, []);
        
        return (
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      
      default:
        return null;
    }
  };

  if (!file || !Array.isArray(file.data)) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">
            <p>Please upload a valid data file to visualize</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-indigo-100">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-white px-6">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center">
              <BarChart2 className="h-5 w-5 mr-2 text-indigo-600" />
              Data Visualization
            </CardTitle>
            <CardDescription>
              Visualize your data with different chart types
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefreshChart}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-6 pt-4">
        <Tabs defaultValue={chartType} value={chartType} onValueChange={setChartType} className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList className="grid grid-cols-3 w-[300px]">
              <TabsTrigger value="bar" className="flex items-center gap-1.5">
                <BarChart2 className="h-3.5 w-3.5" />
                Bar Chart
              </TabsTrigger>
              <TabsTrigger value="line" className="flex items-center gap-1.5">
                <LineChartIcon className="h-3.5 w-3.5" />
                Line Chart
              </TabsTrigger>
              <TabsTrigger value="pie" className="flex items-center gap-1.5">
                <PieChartIcon className="h-3.5 w-3.5" />
                Pie Chart
              </TabsTrigger>
            </TabsList>
            
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4 mr-1.5" />
              Options
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <Label htmlFor="x-axis">X-Axis Field</Label>
              <Select value={xAxisKey} onValueChange={setXAxisKey}>
                <SelectTrigger id="x-axis">
                  <SelectValue placeholder="Select X-Axis" />
                </SelectTrigger>
                <SelectContent>
                  {availableFields.map(field => (
                    <SelectItem key={field} value={field}>{field}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="y-axis">Y-Axis Field</Label>
              <Select value={yAxisKey} onValueChange={setYAxisKey}>
                <SelectTrigger id="y-axis">
                  <SelectValue placeholder="Select Y-Axis" />
                </SelectTrigger>
                <SelectContent>
                  {numericalFields.map(field => (
                    <SelectItem key={field} value={field}>{field}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="color-scheme">Color Scheme</Label>
              <Select value={colorScheme} onValueChange={setColorScheme}>
                <SelectTrigger id="color-scheme">
                  <SelectValue placeholder="Color Scheme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="blues">Blues</SelectItem>
                  <SelectItem value="greens">Greens</SelectItem>
                  <SelectItem value="purples">Purples</SelectItem>
                  <SelectItem value="oranges">Oranges</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2 pt-7">
              <Switch
                id="show-grid"
                checked={showGrid}
                onCheckedChange={setShowGrid}
              />
              <Label htmlFor="show-grid">Show Grid</Label>
            </div>
          </div>
          
          <TabsContent value="bar">
            {renderChart()}
          </TabsContent>
          
          <TabsContent value="line">
            {renderChart()}
          </TabsContent>
          
          <TabsContent value="pie">
            {renderChart()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DataVisualization;
