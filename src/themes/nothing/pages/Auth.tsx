import AuthPage from "@/pages/Auth";

export default function NothingAuth(props: { redirectAfterAuth: string }) {
  return (
    <div data-theme="nothing">
      <AuthPage {...props} />
    </div>
  );
}
