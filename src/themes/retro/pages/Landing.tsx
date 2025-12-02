import Landing from "@/pages/Landing";

export default function RetroLanding() {
  // Retro theme uses the default Landing page with InfoModal
  return (
    <div data-theme="retro" className="theme-retro w-full min-h-screen">
      <Landing />
    </div>
  );
}