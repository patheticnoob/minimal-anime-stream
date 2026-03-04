import Landing from "@/pages/Landing";

export default function ClassicLanding() {
  // Classic theme uses the default Landing page with InfoModal
  return (
    <div data-theme="classic" className="theme-classic w-full min-h-screen">
      <Landing />
    </div>
  );
}