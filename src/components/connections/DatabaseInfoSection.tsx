
import React from "react";

const DatabaseInfoSection = () => {
  return (
    <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">Database Connection Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-md font-medium mb-2">Supported Databases</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-600">
            <li>MySQL / MariaDB</li>
            <li>PostgreSQL</li>
            <li>Oracle Database</li>
            <li>Microsoft SQL Server</li>
            <li>MongoDB</li>
            <li>Sybase</li>
            <li>SAP HANA</li>
            <li>Snowflake</li>
          </ul>
        </div>
        <div>
          <h3 className="text-md font-medium mb-2">Connection Security</h3>
          <p className="text-gray-600 mb-2">
            All database credentials are encrypted before being stored. We recommend using dedicated read-only accounts
            for source connections and limited-privilege accounts for target connections.
          </p>
          <p className="text-gray-600">
            You can use Supabase integration for enhanced security and to manage your database connections through a centralized service.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DatabaseInfoSection;
