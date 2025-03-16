
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDatabaseConnections } from "@/hooks/useDatabaseConnections";
import { Wand2, AlertCircle, CheckCircle, DatabaseIcon } from "lucide-react";

interface DatabaseTransformationProps {
  schema: string | null;
  table: string | null;
}

const DatabaseTransformation = ({ schema, table }: DatabaseTransformationProps) => {
  const [instruction, setInstruction] = useState("");
  const { processTransformation, processingResult, isLoading } = useDatabaseConnections();
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  useEffect(() => {
    // Log when component props change for debugging purposes
    console.log("DatabaseTransformation props changed:", { schema, table });
  }, [schema, table]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schema || !table || !instruction.trim()) {
      console.log("Missing required data for transformation:", { schema, table, instruction });
      return;
    }
    
    console.log("Submitting transformation:", { instruction, table, schema });
    
    try {
      await processTransformation(instruction, table, schema);
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
        <form onSubmit={handleSubmit}>
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
          
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isLoading || !instruction.trim()} 
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
                  Process Transformation
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default DatabaseTransformation;
