
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="container mx-auto py-6 flex justify-between items-center">
        <div className="text-2xl font-bold text-blue-600">DataFlow</div>
        <div className="flex gap-4">
          <Link to="/dashboard">
            <Button variant="outline">Dashboard</Button>
          </Link>
          <Button>Get Started</Button>
        </div>
      </header>

      <main className="container mx-auto py-20 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-6">
          Visual Data Pipeline Designer
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
          Build, test, and deploy data pipelines with an intuitive drag-and-drop interface. Connect to any data source and transform your data without writing code.
        </p>
        <div className="flex justify-center gap-4">
          <Button size="lg" className="text-lg px-8">Get Started</Button>
          <Button size="lg" variant="outline" className="text-lg px-8">View Demo</Button>
        </div>
      </main>
    </div>
  );
}
