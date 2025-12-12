import Landing from "@/pages/Landing";
import { NothingNavBar } from "../components/NothingNavBar";

export default function NothingLanding() {
  return (
    <div data-theme="nothing" className="w-full min-h-screen">
      <Landing NavBarComponent={NothingNavBar} />
    </div>
  );
}