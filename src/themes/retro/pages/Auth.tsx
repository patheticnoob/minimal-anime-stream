import AuthPage from "@/pages/Auth";

export default function RetroAuth(props: { redirectAfterAuth: string }) {
  return (
    <div data-theme="retro">
      <AuthPage {...props} />
    </div>
  );
}
