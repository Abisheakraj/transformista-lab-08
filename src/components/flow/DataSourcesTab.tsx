
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Database, Search, Plus } from "lucide-react";
import AddDataSourceDialog from "./AddDataSourceDialog";

interface DataSourcesTabProps {
  projectId: string;
}

const DataSourcesTab = ({ projectId }: DataSourcesTabProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddSourceDialogOpen, setIsAddSourceDialogOpen] = useState(false);
  
  // Sample data sources - in a real app, this would come from your backend
  const dataSources = [
    {
      id: "ds1",
      name: "MySQL Sales Database",
      type: "mysql",
      tables: 12,
      lastConnected: "2023-12-10T14:30:00Z"
    },
    {
      id: "ds2",
      name: "PostgreSQL Customer Data",
      type: "postgresql",
      tables: 8,
      lastConnected: "2023-12-15T09:45:00Z"
    },
    {
      id: "ds3",
      name: "CSV Product Catalog",
      type: "file",
      tables: 1,
      lastConnected: "2023-12-18T16:20:00Z"
    }
  ];

  const filteredSources = searchQuery
    ? dataSources.filter(source => 
        source.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        source.type.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : dataSources;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Data Sources</h2>
        <Button onClick={() => setIsAddSourceDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Data Source
        </Button>
      </div>
      
      <div className="flex items-center space-x-2 mb-4">
        <Search className="h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search data sources..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>
      
      {filteredSources.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <Database className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No data sources found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery 
                ? "No data sources match your search query. Try a different search term."
                : "You haven't added any data sources yet."}
            </p>
            {!searchQuery && (
              <Button onClick={() => setIsAddSourceDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Data Source
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSources.map((source) => (
              <Card key={source.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <div className="p-2 rounded-md bg-primary/10 mr-3">
                        <Database className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{source.name}</h3>
                        <p className="text-sm text-muted-foreground capitalize">
                          {source.type} {source.type !== "file" ? "Database" : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <Label className="text-muted-foreground">Tables</Label>
                      <span>{source.tables}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <Label className="text-muted-foreground">Last Connected</Label>
                      <span>{formatDate(source.lastConnected)}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t flex justify-between">
                    <Button variant="ghost" size="sm">Explore</Button>
                    <Button variant="outline" size="sm">Settings</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
      
      <AddDataSourceDialog 
        open={isAddSourceDialogOpen} 
        onOpenChange={setIsAddSourceDialogOpen} 
        projectId={projectId}
      />
    </div>
  );
};

export default DataSourcesTab;
