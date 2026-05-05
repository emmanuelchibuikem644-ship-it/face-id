import Navbar from "./Component/Navbar";
import StatCard from "./Component/StatCard";
import ActionCard from "./Component/ActionCard";

import {
  Users,
  CheckCircle,
  ScanFace,
  UserPlus,
} from "lucide-react";

 const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export default function Dashboard() {
  return (
    <div>
      <Navbar />

      <div className="p-6">
        {/* Title */}
        <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
        <p className="text-gray-500 mb-6">
          Face ID attendance overview for {formattedDate}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatCard
            icon={<Users size={18} />}
            value="0"
            label="Registered Students"
            color="bg-purple-100 text-purple-600"
          />

          <StatCard
            icon={<CheckCircle size={18} />}
            value="0"
            label="Today's Check-ins"
            color="bg-green-100 text-green-600"
          />

          <StatCard
            icon={<ScanFace size={18} />}
            value="0%"
            label="Attendance Rate"
            color="bg-teal-100 text-teal-600"
          />
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-4">
          <ActionCard
            icon={<UserPlus size={18} className="text-purple-600" />}
            title="Register New Student"
            description="Capture a student's face and register them in the system for attendance tracking."
            buttonText="Get Started →"
            buttonStyle="bg-purple-600 text-white px-4 py-2 rounded-lg"
          />

          <ActionCard
            icon={<ScanFace size={18} className="text-teal-600" />}
            title="Start Check-in"
            description="Open the camera to scan faces and automatically mark attendance."
            buttonText="Open Scanner →"
            buttonStyle="border border-teal-500 text-teal-600 px-4 py-2 rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}