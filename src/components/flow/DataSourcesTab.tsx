
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Database, Server, ArrowRightLeft, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddDataSourceDialog from "./AddDataSourceDialog";

interface DataSource {
  id: string;
  name: string;
  type: "source" | "target";
  connectionType: string;
  host: string;
  database: string;
  selected: boolean;
}

interface DataSourcesTabProps {
  projectId: string;
}

const DataSourcesTab = ({ projectId }: DataSourcesTabProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"source" | "target">("source");
  const [searchQuery, setSearchQuery] = useState("");
  const [dataSources, setDataSources] = useState<DataSource[]>([
    {
      id: "1",
      name: "Sales MySQL Database",
      type: "source",
      connectionType: "MySQL",
      host: "sales-db.example.com",
      database: "sales",
      selected: false,
    },
    {
      id: "2",
      name: "Customer PostgreSQL Database",
      type: "source",
      connectionType: "PostgreSQL",
      host: "customers-db.example.com",
      database: "customers",
      selected: false,
    },
    {
      id: "3",
      name: "Analytics Data Warehouse",
      type: "target",
      connectionType: "BigQuery",
      host: "analytics.example.com",
      database: "analytics_dwh",
      selected: false,
    },
    {
      id: "4",
      name: "Reporting Database",
      type: "target",
      connectionType: "Snowflake",
      host: "reporting.example.com",
      database: "reporting",
      selected: false,
    },
  ]);

  const handleAddDataSource = (dataSource: Omit<DataSource, "id" | "selected">) => {
    const newDataSource: DataSource = {
      id: Math.random().toString(36).substr(2, 9),
      ...dataSource,
      selected: false,
    };
    
    setDataSources([...dataSources, newDataSource]);
    setIsAddDialogOpen(false);
  };

  const handleToggleSelect = (id: string) => {
    setDataSources(dataSources.map(ds => 
      ds.id === id ? { ...ds, selected: !ds.selected } : ds
    ));
  };

  const filteredDataSources = dataSources.filter(ds => 
    ds.type === activeTab && 
    (searchQuery === "" || ds.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getConnectionIcon = (connectionType: string) => {
    switch (connectionType) {
      case "MySQL":
      case "PostgreSQL":
      case "SQLite":
        return <Database className="h-5 w-5 mr-2" />;
      case "BigQuery":
      case "Snowflake":
      case "Redshift":
        return <Server className="h-5 w-5 mr-2" />;
      default:
        return <ArrowRightLeft className="h-5 w-5 mr-2" />;
    }
  };

  const selectedCount = dataSources.filter(ds => ds.selected && ds.type === activeTab).length;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Data Connections</h2>
        <p className="text-muted-foreground mb-6">
          Select or add data sources and targets for your ETL flow. You'll be able to explore 
          the schema and tables from selected connections in the Flow Designer.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "source" | "target")}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <TabsList>
            <TabsTrigger value="source">Source Databases</TabsTrigger>
            <TabsTrigger value="target">Target Databases</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Input
              placeholder="Search databases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-[300px]"
            />
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add {activeTab === "source" ? "Source" : "Target"}
            </Button>
          </div>
        </div>

        <TabsContent value="source">
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              {selectedCount} source{selectedCount !== 1 ? "s" : ""} selected
            </p>
          </div>
          
          {filteredDataSources.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-muted-foreground mb-4">No source databases found.</p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Source Database
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDataSources.map((dataSource) => (
                <Card key={dataSource.id} className={dataSource.selected ? "border-primary" : ""}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        {getConnectionIcon(dataSource.connectionType)}
                        <CardTitle className="text-lg">{dataSource.name}</CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`rounded-full ${dataSource.selected ? "bg-primary/10" : ""}`}
                        onClick={() => handleToggleSelect(dataSource.id)}
                      >
                        {dataSource.selected ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      </Button>
                    </div>
                    <CardDescription className="text-xs font-medium uppercase tracking-wider mt-1">
                      {dataSource.connectionType}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm py-2">
                    <div className="grid grid-cols-2 gap-1">
                      <div className="text-muted-foreground">Host:</div>
                      <div className="truncate">{dataSource.host}</div>
                      <div className="text-muted-foreground">Database:</div>
                      <div className="truncate">{dataSource.database}</div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button variant="outline" size="sm" className="w-full">
                      Test Connection
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="target">
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              {selectedCount} target{selectedCount !== 1 ? "s" : ""} selected
            </p>
          </div>
          
          {filteredDataSources.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-muted-foreground mb-4">No target databases found.</p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Target Database
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDataSources.map((dataSource) => (
                <Card key={dataSource.id} className={dataSource.selected ? "border-primary" : ""}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        {getConnectionIcon(dataSource.connectionType)}
                        <CardTitle className="text-lg">{dataSource.name}</CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`rounded-full ${dataSource.selected ? "bg-primary/10" : ""}`}
                        onClick={() => handleToggleSelect(dataSource.id)}
                      >
                        {dataSource.selected ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      </Button>
                    </div>
                    <CardDescription className="text-xs font-medium uppercase tracking-wider mt-1">
                      {dataSource.connectionType}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm py-2">
                    <div className="grid grid-cols-2 gap-1">
                      <div className="text-muted-foreground">Host:</div>
                      <div className="truncate">{dataSource.host}</div>
                      <div className="text-muted-foreground">Database:</div>
                      <div className="truncate">{dataSource.database}</div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button variant="outline" size="sm" className="w-full">
                      Test Connection
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AddDataSourceDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddDataSource}
        type={activeTab}
      />
    </div>
  );
};

export default DataSourcesTab;
