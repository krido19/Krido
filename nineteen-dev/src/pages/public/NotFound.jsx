import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

const NotFound = () => (
  <div className="min-h-screen bg-white flex items-center justify-center p-8">
    <div className="text-center max-w-md">
      {/* Big 404 */}
      <div className="relative mb-8">
        <span className="text-[10rem] font-extrabold text-muted leading-none select-none">404</span>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-primary rounded-lg p-5">
            <AlertTriangle className="w-12 h-12 text-white" />
          </div>
        </div>
      </div>

      <h1 className="text-3xl font-extrabold text-foreground mb-3">Page Not Found</h1>
      <p className="text-gray-500 font-medium mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>

      <Link to="/" className="btn-primary inline-flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>
    </div>
  </div>
);

export default NotFound;
