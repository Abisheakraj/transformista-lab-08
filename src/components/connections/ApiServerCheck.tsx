
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { checkApiServer, testCorsProxy } from '@/lib/api-check';
import { AlertCircle, CheckCircle, Globe, RefreshCw, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from "@/components/ui/separator";

const ApiServerCheck = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<{
    accessible: boolean;
    corsIssue: boolean;
    message: string;
  } | null>(null);
  const [proxyUrl, setProxyUrl] = useState('');
  const [isProxyEnabled, setIsProxyEnabled] = useState(false);
  const [isTestingProxy, setIsTestingProxy] = useState(false);
  const { toast } = useToast();

  // Check if proxy is already enabled in localStorage
  useEffect(() => {
    const savedProxyUrl = localStorage.getItem('corsProxyUrl');
    if (savedProxyUrl) {
      setProxyUrl(savedProxyUrl);
      setIsProxyEnabled(true);
    } else {
      // Default proxy URL suggestion
      setProxyUrl('https://corsproxy.io/?');
    }
    
    // Run initial server check
    runServerCheck();
  }, []);

  const runServerCheck = async () => {
    setIsChecking(true);
    try {
      const result = await checkApiServer();
      setCheckResult(result);
      
      if (result.accessible && !result.corsIssue) {
        toast({
          title: "Server Check",
          description: "API server is accessible and properly configured."
        });
      } else if (result.corsIssue) {
        toast({
          title: "CORS Issue Detected",
          description: "The API server is blocking cross-origin requests. Try enabling a CORS proxy.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Server Unreachable",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Server check error:", error);
      toast({
        title: "Check Failed",
        description: "Failed to complete API server check.",
        variant: "destructive"
      });
    } finally {
      setIsChecking(false);
    }
  };

  const enableProxy = async () => {
    try {
      setIsTestingProxy(true);
      
      // Check if proxyUrl is valid
      if (!proxyUrl.startsWith('http')) {
        toast({
          title: "Invalid Proxy URL",
          description: "Please enter a valid URL starting with http:// or https://",
          variant: "destructive"
        });
        return;
      }
      
      // Test the proxy
      const testResult = await testCorsProxy(proxyUrl);
      
      if (testResult.success) {
        // Store proxy URL in localStorage
        localStorage.setItem('corsProxyUrl', proxyUrl);
        setIsProxyEnabled(true);
        
        toast({
          title: "CORS Proxy Enabled",
          description: "Successfully configured CORS proxy for API requests."
        });
        
        // Re-run server check with the proxy
        runServerCheck();
      } else {
        toast({
          title: "CORS Proxy Test Failed",
          description: testResult.message,
          variant: "destructive"
        });
      }
    } finally {
      setIsTestingProxy(false);
    }
  };

  const disableProxy = () => {
    localStorage.removeItem('corsProxyUrl');
    setIsProxyEnabled(false);
    toast({
      title: "CORS Proxy Disabled",
      description: "CORS proxy has been disabled for API requests."
    });
    
    // Re-run server check without the proxy
    runServerCheck();
  };

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-white">
        <CardTitle className="flex items-center">
          <Globe className="h-5 w-5 mr-2 text-indigo-600" />
          API Server Connection Check
        </CardTitle>
        <CardDescription>
          Check API server accessibility and CORS configuration
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-4">
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={runServerCheck}
            disabled={isChecking}
            className="flex items-center gap-1"
          >
            {isChecking ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Run Check
              </>
            )}
          </Button>
        </div>
        
        {checkResult && (
          <Alert 
            className={`${
              checkResult.accessible && !checkResult.corsIssue
                ? "border-green-200 bg-green-50 text-green-800" 
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            <div className="flex">
              {checkResult.accessible && !checkResult.corsIssue ? (
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              )}
              <AlertDescription>
                <p className="font-medium">
                  {checkResult.accessible && !checkResult.corsIssue 
                    ? "API Server Check Passed" 
                    : checkResult.corsIssue 
                      ? "CORS Issue Detected" 
                      : "API Server Unreachable"}
                </p>
                <p className="mt-1">{checkResult.message}</p>
                
                {checkResult.corsIssue && !isProxyEnabled && (
                  <p className="mt-2 text-sm">
                    Enable a CORS proxy below to resolve this issue.
                  </p>
                )}
              </AlertDescription>
            </div>
          </Alert>
        )}
        
        <Separator className="my-4" />
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cors-proxy-url">CORS Proxy URL</Label>
            <Input
              id="cors-proxy-url"
              placeholder="e.g., https://corsproxy.io/?"
              value={proxyUrl}
              onChange={(e) => setProxyUrl(e.target.value)}
              disabled={isProxyEnabled}
            />
            <p className="text-xs text-muted-foreground">
              Enter the URL of a CORS proxy service that will forward API requests.
              Recommended: <code className="bg-gray-100 px-1 rounded">https://corsproxy.io/?</code>
            </p>
          </div>
          
          {isProxyEnabled && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <div className="flex">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <AlertDescription>
                  <p className="font-medium">CORS Proxy is enabled</p>
                  <p>Currently using: {proxyUrl}</p>
                  <p className="mt-1 text-sm">All API requests will be routed through this proxy to avoid CORS issues.</p>
                </AlertDescription>
              </div>
            </Alert>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-end gap-3">
        {isProxyEnabled ? (
          <Button 
            variant="outline" 
            onClick={disableProxy}
            className="border-red-200 text-red-700 hover:bg-red-50"
          >
            Disable Proxy
          </Button>
        ) : (
          <Button 
            onClick={enableProxy}
            disabled={isTestingProxy || !proxyUrl}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isTestingProxy ? "Testing Proxy..." : "Enable Proxy"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ApiServerCheck;
