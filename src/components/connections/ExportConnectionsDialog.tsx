
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { FileDown } from "lucide-react";

interface ExportConnectionsDialogProps {
  connections: any[];
  schemas: any[];
  activeTab: string;
  onExport?: () => void;
}

const ExportConnectionsDialog = ({ connections, schemas, activeTab }: ExportConnectionsDialogProps) => {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState("json");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const filteredConnections = connections.filter(conn => conn.type === (activeTab === "sources" ? "source" : "target"));

  const handleExport = () => {
    setIsExportOpen(true);
  };

  const handleExportSubmit = () => {
    setIsLoading(true);

    setTimeout(() => {
      // Create a downloadable file with the connection data
      const exportData = {
        connections: filteredConnections,
        schemas: schemas,
        exportedAt: new Date().toISOString()
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `database-connections-${activeTab}.${exportFormat}`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();

      setIsExportOpen(false);
      setIsLoading(false);

      toast({
        title: "Export Successful",
        description: `Connections exported as ${exportFormat.toUpperCase()} file.`
      });
    }, 1000);
  };

  return (
    <>
      <Button 
        onClick={handleExport}
        variant="outline"
        disabled={filteredConnections.length === 0}
      >
        <FileDown className="h-4 w-4 mr-2" />
        Export Connections
      </Button>

      {/* Export Dialog */}
      <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Export Database Connections</DialogTitle>
            <DialogDescription>
              Export your {activeTab === "sources" ? "source" : "target"} database connections in various formats.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="export-format">Export Format</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="yaml">YAML</SelectItem>
                  <SelectItem value="sql">SQL Script</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExportOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExportSubmit} disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                  Exporting...
                </>
              ) : (
                "Export"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExportConnectionsDialog;
