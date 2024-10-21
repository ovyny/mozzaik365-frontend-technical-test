import {
  createFileRoute,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { useAuthentication } from "../contexts/authentication";
import { useEffect } from "react";
import { jwtDecode } from "jwt-decode";

export const Route = createFileRoute("/_authentication")({
  component: AuthenticatedRoute,
});

function AuthenticatedRoute() {
  const { state, signout } = useAuthentication();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (state.isAuthenticated) {
      const decodedToken = jwtDecode<{ exp: number }>(state.token);
      if (decodedToken.exp * 1000 <= Date.now()) {
        signout();
        navigate({
          to: "/login",
          search: { redirect: pathname },
          replace: true,
        });
      }
    }
  }, [state, signout, navigate, pathname]);

  if (!state.isAuthenticated) {
    return <Navigate to="/login" search={{ redirect: pathname }} replace />;
  }

  return <Outlet />;
}
