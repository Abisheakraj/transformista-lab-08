
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Database, HardDrive } from "lucide-react";
import ConnectionList from "@/components/connections/ConnectionList";
import ConnectionForm from "@/components/connections/ConnectionForm";
import { useToast } from "@/hooks/use-toast";

interface ConnectionPanelProps {
  type: "source" | "target";
  selectedConnectionId: string | null;
  onSelectConnection: (connectionId: string) => void;
  onDeleteConnection: (connectionId: string) => void;
}

const ConnectionPanel = ({ 
  type, 
  selectedConnectionId, 
  onSelectConnection, 
  onDeleteConnection 
}: ConnectionPanelProps) => {
  const { toast } = useToast();

  return (
    <div className="md:w-1/3">
      <ConnectionList 
        type={type} 
        onSelectConnection={onSelectConnection}
        selectedConnectionId={selectedConnectionId}
        onDeleteConnection={onDeleteConnection}
      />
      <div className="mt-8">
        <Card className="border-indigo-100">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-white">
            <CardTitle className="flex items-center">
              {type === "source" ? (
                <Database className="h-5 w-5 mr-2 text-indigo-600" />
              ) : (
                <HardDrive className="h-5 w-5 mr-2 text-indigo-600" />
              )}
              Add {type === "source" ? "Source" : "Target"} Connection
            </CardTitle>
            <CardDescription>
              Connect to a database system {type === "source" 
                ? "that you want to extract data from" 
                : "where you want to load your transformed data"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ConnectionForm 
              type={type} 
              onSuccess={() => {
                toast({
                  title: `${type === "source" ? "Source" : "Target"} Connection Added`,
                  description: "Your database connection has been successfully added.",
                });
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConnectionPanel;
