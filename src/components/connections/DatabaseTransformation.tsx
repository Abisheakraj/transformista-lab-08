
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useDatabaseConnections } from "@/hooks/useDatabaseConnections";
import { Loader2, Wand2 } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface DatabaseTransformationProps {
  schema: string | null;
  table: string | null;
}

const DatabaseTransformation = ({ schema, table }: DatabaseTransformationProps) => {
  const [instruction, setInstruction] = useState("");
  const { isLoading, selectedConnection, processTransformation, processingResult } = useDatabaseConnections();

  const handleProcess = async () => {
    if (!schema || !table || !instruction.trim()) return;
    
    await processTransformation(instruction, table, schema);
  };

  if (!selectedConnection || !schema || !table) {
    return null;
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Wand2 className="h-5 w-5 mr-2 text-purple-600" /> Data Transformation
        </CardTitle>
        <CardDescription>
          Apply transformations to {schema}.{table} using natural language instructions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Textarea
            placeholder="Enter your transformation instruction (e.g., 'normalize the base_airport column')"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            className="min-h-[100px]"
          />
          
          {processingResult && (
            <Alert variant={processingResult.success ? "default" : "destructive"}>
              <AlertTitle>{processingResult.success ? "Success" : "Error"}</AlertTitle>
              <AlertDescription>
                {processingResult.message}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex justify-end">
            <Button 
              onClick={handleProcess} 
              disabled={isLoading || !instruction.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Process Transformation
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DatabaseTransformation;
