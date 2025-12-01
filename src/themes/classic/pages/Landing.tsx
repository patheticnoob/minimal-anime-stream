import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { HeroBanner } from "@/components/HeroBanner";
import { ContentRail } from "@/components/ContentRail";
import { FullscreenLoader } from "@/components/FullscreenLoader";

export default function ClassicLanding() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("home");

  if (isLoading) {
    return <FullscreenLoader label="Loading anime..." />;
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={(section) => {
          if (section === "history") {
            navigate("/history");
            return;
          }
          setActiveSection(section);
        }}
      />
      
      <main className="md:ml-20 transition-all duration-300">
        <div className="px-6 md:px-10 pb-10 pt-8 max-w-[2000px] mx-auto">
          <h1 className="text-4xl font-bold mb-8">Classic Theme - Coming Soon</h1>
          <p className="text-gray-400">This is the classic theme landing page. Full implementation coming next.</p>
        </div>
      </main>
    </div>
  );
}
