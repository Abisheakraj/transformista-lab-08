
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Database, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ChevronRight, 
  ExternalLink,
  Eye
} from "lucide-react";
import { useDatabaseConnections } from "@/hooks/useDatabaseConnections";

interface ConnectionListProps {
  type: "source" | "target";
  onSelectConnection?: (connectionId: string) => void;
  selectedConnectionId?: string | null;
}

const ConnectionList = ({ type, onSelectConnection, selectedConnectionId }: ConnectionListProps) => {
  const { connections, testConnection } = useDatabaseConnections();
  const [testingId, setTestingId] = useState<string | null>(null);

  // Filter connections by type
  const filteredConnections = connections.filter(conn => conn.type === type);

  const handleTest = async (e: React.MouseEvent, connectionId: string) => {
    e.stopPropagation(); // Prevent selecting the connection when clicking test
    setTestingId(connectionId);
    await testConnection(connectionId);
    setTestingId(null);
  };

  // Handle connection selection
  const handleSelect = (connectionId: string) => {
    if (onSelectConnection) {
      onSelectConnection(connectionId);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          {type === "source" ? (
            <><Database className="h-5 w-5 mr-2 text-blue-600" /> Source Connections</>
          ) : (
            <><Database className="h-5 w-5 mr-2 text-green-600" /> Target Connections</>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {filteredConnections.length === 0 ? (
          <div className="text-center py-8 border border-dashed rounded-md">
            <Database className="h-10 w-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 mb-2">No {type} connections yet</p>
            <p className="text-gray-400 text-sm">Add a connection using the form below</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredConnections.map((connection) => (
              <div 
                key={connection.id} 
                className={`border rounded-md p-3 hover:border-indigo-200 transition-colors cursor-pointer ${
                  selectedConnectionId === connection.id ? 'border-indigo-500 bg-indigo-50' : ''
                }`}
                onClick={() => handleSelect(connection.id)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{connection.name}</h4>
                  <Badge 
                    variant={connection.status === "connected" ? "outline" : "outline"} 
                    className={`${
                      connection.status === "connected" 
                        ? "border-green-300 text-green-700 bg-green-50" 
                        : connection.status === "failed"
                        ? "border-red-300 text-red-700 bg-red-50"
                        : "border-yellow-300 text-yellow-700 bg-yellow-50"
                    }`}
                  >
                    {connection.status}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  <div className="flex items-center gap-1 mb-1">
                    <Database className="h-3 w-3 text-gray-400" />
                    <span>{connection.connectionType.toUpperCase()}</span>
                  </div>
                  <div className="text-gray-500">
                    {connection.host}{connection.port ? `:${connection.port}` : ""}/{connection.database}
                  </div>
                </div>
                <div className="flex justify-between items-center mt-3">
                  <div className="text-xs text-gray-500 flex items-center">
                    {connection.lastTested ? (
                      <>
                        <Calendar className="h-3 w-3 mr-1" />
                        Last tested: {new Date(connection.lastTested).toLocaleDateString()}
                      </>
                    ) : (
                      <>
                        <Clock className="h-3 w-3 mr-1" />
                        Not tested yet
                      </>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={(e) => handleTest(e, connection.id)}
                      disabled={testingId === connection.id}
                    >
                      {testingId === connection.id ? (
                        <>
                          <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1"></div>
                          Testing...
                        </>
                      ) : (
                        "Test"
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(connection.id);
                      }}
                      className="flex items-center"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      Browse
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConnectionList;
