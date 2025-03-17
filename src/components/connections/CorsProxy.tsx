
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, AlertCircle, Globe, Info, ExternalLink } from 'lucide-react';

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
      // Default proxy URL suggestion
      setProxyUrl('https://corsproxy.io/?');
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
            <Alert className="border-red-200 bg-red-50 text-red-800">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <AlertDescription>
                  <p className="font-medium">CORS Error Detected</p>
                  <p className="mt-1">Your browser is blocking cross-origin requests to the API server. To fix this, enable a CORS proxy below.</p>
                </AlertDescription>
              </div>
            </Alert>
          )}
          
          <Alert className="border-blue-200 bg-blue-50 text-blue-800">
            <div className="flex">
              <Info className="h-5 w-5 text-blue-500 mr-2" />
              <AlertDescription>
                <p>The application is currently using the direct ngrok URL: </p>
                <code className="font-mono bg-blue-100 px-1 py-0.5 rounded text-sm">
                  https://9574-2405-201-e01c-b2bd-d926-14ba-a311-6173.ngrok-free.app/api
                </code>
                <p className="mt-1">{isEnabled ? 'The CORS proxy is active and helping bypass cross-origin issues.' : 'You need to enable a CORS proxy to resolve connection issues.'}</p>
              </AlertDescription>
            </div>
          </Alert>
          
          <div className="space-y-2">
            <Label htmlFor="proxy-url">CORS Proxy URL</Label>
            <Input
              id="proxy-url"
              placeholder="e.g., https://corsproxy.io/?"
              value={proxyUrl}
              onChange={(e) => setProxyUrl(e.target.value)}
              disabled={isEnabled}
            />
            <p className="text-xs text-muted-foreground">
              Enter the URL of a CORS proxy service that will forward API requests. Recommended: <a href="https://corsproxy.io/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center inline-flex">corsproxy.io <ExternalLink className="h-3 w-3 ml-1" /></a>
            </p>
          </div>
          
          {isEnabled && (
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
          
          <Alert className="border-amber-200 bg-amber-50 text-amber-800">
            <div className="flex">
              <Info className="h-5 w-5 text-amber-500 mr-2" />
              <AlertDescription>
                <p className="font-medium">Recommended Free CORS Proxies:</p>
                <ul className="list-disc ml-5 mt-1 space-y-1">
                  <li><a href="https://corsproxy.io/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">corsproxy.io</a> (use URL: <code className="bg-amber-100 px-1 rounded">https://corsproxy.io/?</code>)</li>
                  <li><a href="https://cors-anywhere.herokuapp.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">CORS Anywhere</a> (may require activation)</li>
                  <li>Or use a browser extension like <a href="https://chrome.google.com/webstore/detail/cors-unblock/lfhmikememgdcahcdlaciloancbhjino" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">CORS Unblock</a></li>
                </ul>
              </AlertDescription>
            </div>
          </Alert>
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
