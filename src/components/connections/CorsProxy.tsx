
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, AlertCircle, Globe, Info } from 'lucide-react';

const CorsProxy = () => {
  const [proxyUrl, setProxyUrl] = useState('');
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Check if proxy is already enabled in localStorage on component mount
  useEffect(() => {
    const savedProxyUrl = localStorage.getItem('corsProxyUrl');
    if (savedProxyUrl) {
      setProxyUrl(savedProxyUrl);
      setIsEnabled(true);
    } else {
      // Default proxy URL is empty now since we have a direct ngrok URL
      setProxyUrl('');
    }
  }, []);

  const enableProxy = async () => {
    try {
      setIsLoading(true);
      
      // Check if proxyUrl is valid
      if (!proxyUrl.startsWith('http')) {
        toast({
          title: "Invalid Proxy URL",
          description: "Please enter a valid URL starting with http:// or https://",
          variant: "destructive"
        });
        return;
      }
      
      // Store proxy URL in localStorage
      localStorage.setItem('corsProxyUrl', proxyUrl);
      
      // Let's test the proxy
      try {
        const testUrl = `${proxyUrl}https://httpbin.org/get`;
        console.log("Testing CORS proxy with:", testUrl);
        
        const response = await fetch(testUrl, {
          method: 'GET',
          headers: {
            'X-Requested-With': 'XMLHttpRequest'
          }
        });
        
        if (response.ok) {
          setIsEnabled(true);
          toast({
            title: "CORS Proxy Enabled",
            description: "Successfully configured CORS proxy for API requests."
          });
        } else {
          toast({
            title: "CORS Proxy Test Failed",
            description: `The proxy returned status: ${response.status}`,
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("CORS proxy test error:", error);
        toast({
          title: "CORS Proxy Test Failed",
          description: error instanceof Error ? error.message : "Failed to test the proxy",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const disableProxy = () => {
    localStorage.removeItem('corsProxyUrl');
    setIsEnabled(false);
    toast({
      title: "CORS Proxy Disabled",
      description: "CORS proxy has been disabled for API requests."
    });
  };

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-purple-50 to-white">
        <CardTitle className="flex items-center">
          <Globe className="h-5 w-5 mr-2 text-purple-600" />
          CORS Proxy Configuration
        </CardTitle>
        <CardDescription>
          Configure a CORS proxy to help with cross-origin API requests
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {!isEnabled && (
            <Alert className="border-blue-200 bg-blue-50 text-blue-800">
              <div className="flex">
                <Info className="h-5 w-5 text-blue-500 mr-2" />
                <AlertDescription>
                  <p>The application is currently using the direct ngrok URL: </p>
                  <code className="font-mono bg-blue-100 px-1 py-0.5 rounded text-sm">
                    https://9574-2405-201-e01c-b2bd-d926-14ba-a311-6173.ngrok-free.app/api
                  </code>
                  <p className="mt-1">You only need to enable a CORS proxy if you experience connection issues.</p>
                </AlertDescription>
              </div>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="proxy-url">CORS Proxy URL</Label>
            <Input
              id="proxy-url"
              placeholder="e.g., https://cors-anywhere.herokuapp.com/"
              value={proxyUrl}
              onChange={(e) => setProxyUrl(e.target.value)}
              disabled={isEnabled}
            />
            <p className="text-xs text-muted-foreground">
              Enter the URL of a CORS proxy service that will forward API requests
            </p>
          </div>
          
          {isEnabled && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <div className="flex">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <AlertDescription>
                  CORS Proxy is currently enabled and configured to use: {proxyUrl}
                </AlertDescription>
              </div>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-3">
        {isEnabled ? (
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
            disabled={isLoading || !proxyUrl}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isLoading ? "Testing Proxy..." : "Enable Proxy"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default CorsProxy;
