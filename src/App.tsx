
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
import { Dashboard } from './pages/Dashboard';
import { DataTransformationUpload } from './pages/DataTransformation';
import { DatabaseConnection } from './pages/DatabaseConnection';
import { DatabaseList } from './pages/DatabaseList';
import { FileUpload } from './pages/FileUpload';
import { Pipeline } from './pages/Pipeline';
import { PipelineMapping } from './pages/PipelineMapping';
import { Discover } from './pages/Discover';
import { Settings } from './pages/Settings';
import { SchoolSchema } from './pages/schemas/SchoolSchema';
import { HRSchema } from './pages/schemas/HRSchema';
import { HospitalSchema } from './pages/schemas/HospitalSchema';
import { InventorySchema } from './pages/schemas/InventorySchema';
import { PayrollSchema } from './pages/schemas/PayrollSchema';
import { ResetPassword } from './pages/ResetPassword';
import { DataTransformationPreview } from './pages/DataTransformationPreview';
import { useAuth } from './hooks/useAuth';

// Re-export useAuth for components that import from @/App
export { useAuth };

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/transform" element={<DataTransformationUpload />} />
        <Route path="/database-connection" element={<DatabaseConnection />} />
        <Route path="/database-list" element={<DatabaseList />} />
        <Route path="/file-upload" element={<FileUpload />} />
        <Route path="/pipeline" element={<Pipeline />} />
        <Route path="/pipeline/mapping" element={<PipelineMapping />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/schemas/school" element={<SchoolSchema />} />
        <Route path="/schemas/hr" element={<HRSchema />} />
        <Route path="/schemas/hospital" element={<HospitalSchema />} />
        <Route path="/schemas/inventory" element={<InventorySchema />} />
        <Route path="/schemas/payroll" element={<PayrollSchema />} />
        <Route path="/data-preview" element={<DataTransformationPreview />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
