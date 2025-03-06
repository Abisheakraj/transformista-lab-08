
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthForm } from '@/components/AuthForm';
import { Boxes } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function SignIn() {
  const location = useLocation();
  const message = location.state?.message;

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-10"></div>
        </div>

        {/* Content */}
        <div className="relative w-full max-w-2xl mx-auto px-12 py-24 flex flex-col justify-between">
          {/* Logo and Brand */}
          <div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/5 rounded-lg backdrop-blur-sm">
                <Boxes className="h-10 w-10 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">Quantum</span>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-8">
            <h1 className="text-5xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white/90 to-white/80">
              AI That Thinks.
              <br />
              Data That Works.
            </h1>
            <p className="text-xl text-white/80 leading-relaxed max-w-lg">
              Building smarter systems for a connected world. Transform your data infrastructure with AI-powered insights and seamless integration.
            </p>

            {/* Feature List */}
            <div className="grid grid-cols-2 gap-6 mt-12">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center backdrop-blur-sm">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Lightning Fast</h3>
                  <p className="text-white/60 text-sm">Process data at unprecedented speeds</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center backdrop-blur-sm">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Secure</h3>
                  <p className="text-white/60 text-sm">Enterprise-grade security built-in</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center backdrop-blur-sm">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Scalable</h3>
                  <p className="text-white/60 text-sm">Grows with your business needs</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center backdrop-blur-sm">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">AI-Powered</h3>
                  <p className="text-white/60 text-sm">Smart insights and automation</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-12">
            <div className="flex items-center space-x-4 text-sm text-white/40">
              <span>© 2025 Quantum</span>
              <span>•</span>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <span>•</span>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Sign In Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          <div className="flex items-center justify-center lg:hidden mb-8">
            <Boxes className="h-8 w-8 text-indigo-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">Quantum</span>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Sign in</CardTitle>
              <CardDescription>Smart Integration Starts with AI</CardDescription>
            </CardHeader>
            <CardContent>
              {message && (
                <div className="mb-4 p-4 rounded-md bg-green-50 text-green-700 text-sm">
                  {message}
                </div>
              )}
              <AuthForm type="signin" />
              
              <div className="mt-4 text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/signup" className="font-medium text-primary hover:underline">
                  Create one now
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
