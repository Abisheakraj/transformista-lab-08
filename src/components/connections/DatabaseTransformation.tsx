
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDatabaseConnections } from "@/hooks/useDatabaseConnections";
import { 
  Wand2, 
  AlertCircle, 
  CheckCircle, 
  DatabaseIcon, 
  Code,
  RefreshCcw
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DatabaseTransformationProps {
  schema: string | null;
  table: string | null;
}

const DatabaseTransformation = ({ schema, table }: DatabaseTransformationProps) => {
  const [instruction, setInstruction] = useState("");
  const [customSQL, setCustomSQL] = useState("");
  const [transformationType, setTransformationType] = useState<"instructions" | "sql">("instructions");
  const { processTransformation, processingResult, isLoading } = useDatabaseConnections();
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  useEffect(() => {
    // Log when component props change for debugging purposes
    console.log("DatabaseTransformation props changed:", { schema, table });
  }, [schema, table]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!schema || !table) {
      console.log("Missing required data for transformation:", { schema, table });
      return;
    }
    
    const inputText = transformationType === "instructions" ? instruction.trim() : customSQL.trim();
    
    if (!inputText) {
      console.log("Missing input text for transformation");
      return;
    }
    
    console.log("Submitting transformation:", { 
      type: transformationType, 
      text: inputText, 
      table, 
      schema 
    });
    
    try {
      await processTransformation(inputText, table, schema);
      console.log("Transformation completed");
    } catch (error) {
      console.error("Error during transformation:", error);
    }
  };

  // Debug button to toggle showing debug info
  const toggleDebugInfo = () => {
    setShowDebugInfo(!showDebugInfo);
  };

  // If schema or table is missing, show debug info instead of null
  if (!schema || !table) {
    return (
      <Card className="mt-6 border-amber-100">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-white">
          <CardTitle className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-amber-600" />
            Waiting for Table Selection
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-amber-700 mb-4">
            Please select a schema and table to enable data transformation.
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleDebugInfo}
            className="text-xs"
          >
            {showDebugInfo ? "Hide Debug Info" : "Show Debug Info"}
          </Button>
          
          {showDebugInfo && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md text-xs font-mono overflow-auto">
              <p>Current props:</p>
              <pre>schema: {JSON.stringify(schema)}</pre>
              <pre>table: {JSON.stringify(table)}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  console.log("Rendering DatabaseTransformation for", { schema, table });

  return (
    <Card className="mt-6 border-indigo-100">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-white">
        <CardTitle className="flex items-center">
          <Wand2 className="h-5 w-5 mr-2 text-indigo-600" />
          Transform Table Data
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <Tabs value={transformationType} onValueChange={(v) => setTransformationType(v as "instructions" | "sql")} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="instructions" className="flex items-center gap-2">
              <Wand2 className="h-4 w-4" />
              Natural Language
            </TabsTrigger>
            <TabsTrigger value="sql" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Custom SQL
            </TabsTrigger>
          </TabsList>
          
          <form onSubmit={handleSubmit}>
            <TabsContent value="instructions">
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">
                  Enter instructions to transform the data in <span className="font-semibold">{schema}.{table}</span>
                </p>
                <Textarea
                  placeholder="e.g., 'Normalize the base_airport column' or 'Convert all country names to uppercase'"
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="sql">
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">
                  Enter a custom SQL query to transform <span className="font-semibold">{schema}.{table}</span>
                </p>
                <Textarea
                  placeholder="e.g., 'SELECT * FROM airline WHERE country = 'USA'' or 'UPDATE airline SET country = UPPER(country)'"
                  value={customSQL}
                  onChange={(e) => setCustomSQL(e.target.value)}
                  className="min-h-[100px] font-mono text-sm"
                />
                <div className="text-xs text-amber-600 mt-1">
                  <p>⚠️ Custom SQL queries directly modify data. Use with caution.</p>
                </div>
              </div>
            </TabsContent>
            
            {processingResult && (
              <Alert 
                className={`mb-4 ${
                  processingResult.success 
                    ? "border-green-200 bg-green-50 text-green-800" 
                    : "border-red-200 bg-red-50 text-red-800"
                }`}
              >
                <div className="flex">
                  {processingResult.success 
                    ? <CheckCircle className="h-5 w-5 text-green-500 mr-2" /> 
                    : <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  }
                  <AlertDescription>
                    {processingResult.message}
                  </AlertDescription>
                </div>
              </Alert>
            )}
            
            <div className="flex justify-end space-x-2">
              <Button 
                type="button"
                variant="outline"
                onClick={() => setTransformationType(transformationType === "instructions" ? "sql" : "instructions")}
                className="flex items-center"
              >
                <RefreshCcw className="h-4 w-4 mr-2" />
                Switch to {transformationType === "instructions" ? "SQL" : "Natural Language"}
              </Button>
              
              <Button 
                type="submit" 
                disabled={isLoading || (transformationType === "instructions" ? !instruction.trim() : !customSQL.trim())} 
                className="flex items-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Process {transformationType === "instructions" ? "Transformation" : "SQL"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DatabaseTransformation;
