import AuthPage from "@/pages/Auth";

export default function ClassicAuth(props: { redirectAfterAuth: string }) {
  return <AuthPage {...props} />;
}
