import { auth } from "../auth";
import { signOutFromMotoLog } from "./actions";
import { GoogleSignInPage } from "./google-sign-in-page";
import MotoLogDashboard from "./motolog-dashboard";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await auth();
  if (!session?.user) return <GoogleSignInPage />;

  return (
    <>
      <div className="session-bar">
        <span>{session.user.email}</span>
        <form action={signOutFromMotoLog}>
          <button className="secondary" type="submit">Cerrar sesión</button>
        </form>
      </div>
      <MotoLogDashboard />
    </>
  );
}
