
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, Database, HardDrive, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import DatabaseTransformation from "@/components/connections/DatabaseTransformation";

interface DatabaseSchemaBrowserProps {
  selectedConnectionId: string | null;
  selectedSchema: string | null;
  selectedTable: string | null;
  schemas: any[];
  connections: any[];
  isLoading: boolean;
  onTableSelect: (schema: string, table: string) => void;
}

const DatabaseSchemaBrowser = ({
  selectedConnectionId,
  selectedSchema,
  selectedTable,
  schemas,
  connections,
  isLoading,
  onTableSelect
}: DatabaseSchemaBrowserProps) => {
  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-white">
        <CardTitle className="flex items-center">
          <Table className="h-5 w-5 mr-2 text-indigo-600" />
          Database Schema Browser
        </CardTitle>
        <CardDescription>
          Browse schemas and tables from your selected database connection
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {!selectedConnectionId && (
          <div className="text-center py-10 border border-dashed rounded-md">
            <Database className="h-10 w-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 mb-2">Select a connection to browse its schema</p>
          </div>
        )}
        
        {selectedConnectionId && !connections.find(c => c.id === selectedConnectionId)?.database && (
          <div className="text-center py-10 border border-dashed rounded-md">
            <HardDrive className="h-10 w-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 mb-2">Please select a database first</p>
            <p className="text-gray-400 text-sm">Click "Select Database" on the connection</p>
          </div>
        )}
        
        {selectedConnectionId && isLoading && (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
            <span className="ml-2">Loading schemas...</span>
          </div>
        )}
        
        {selectedConnectionId && 
          connections.find(c => c.id === selectedConnectionId)?.database && 
          !isLoading && 
          schemas.length === 0 && (
          <div className="text-center py-10 border border-dashed rounded-md">
            <Table className="h-10 w-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 mb-2">No schemas found in this database</p>
          </div>
        )}
        
        {selectedConnectionId && 
          connections.find(c => c.id === selectedConnectionId)?.database && 
          !isLoading && 
          schemas.length > 0 && (
          <div className="space-y-4">
            {schemas.map((schema) => (
              <div key={schema.name} className="border rounded-md p-4">
                <h3 className="text-md font-medium mb-2">{schema.name}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {schema.tables.map((table) => (
                    <div 
                      key={`${schema.name}.${table.name}`}
                      className={`border p-2 rounded hover:bg-gray-50 cursor-pointer flex items-center justify-between ${
                        selectedSchema === schema.name && selectedTable === table.name ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                      onClick={() => onTableSelect(schema.name, table.name)}
                    >
                      <div className="flex items-center">
                        <Table className="h-4 w-4 text-gray-500 mr-2" />
                        <span>{table.name}</span>
                      </div>
                      <Badge variant="outline" className="ml-2">{table.columns.length} cols</Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Transformation component */}
        <DatabaseTransformation 
          schema={selectedSchema}
          table={selectedTable}
        />
      </CardContent>
    </Card>
  );
};

export default DatabaseSchemaBrowser;
