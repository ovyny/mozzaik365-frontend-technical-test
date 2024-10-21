import { jwtDecode } from "jwt-decode";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type AuthenticationState =
  | {
      isAuthenticated: true;
      token: string;
      userId: string;
    }
  | {
      isAuthenticated: false;
    };

export type Authentication = {
  state: AuthenticationState;
  authenticate: (token: string) => void;
  signout: () => void;
};

export const AuthenticationContext = createContext<Authentication | undefined>(
  undefined
);

const TOKEN_STORAGE_KEY = "auth_token";

export const AuthenticationProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [state, setState] = useState<AuthenticationState>(() => {
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (storedToken) {
      try {
        const decodedToken = jwtDecode<{ id: string; exp: number }>(
          storedToken
        );
        if (decodedToken.exp * 1000 > Date.now()) {
          return {
            isAuthenticated: true,
            token: storedToken,
            userId: decodedToken.id,
          };
        }
      } catch (error) {
        console.error("Failed to decode stored token:", error);
      }
    }
    return { isAuthenticated: false };
  });

  const authenticate = useCallback(
    (token: string) => {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      setState({
        isAuthenticated: true,
        token,
        userId: jwtDecode<{ id: string }>(token).id,
      });
    },
    [setState]
  );

  const signout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setState({ isAuthenticated: false });
  }, [setState]);

  useEffect(() => {
    const checkTokenExpiration = () => {
      if (state.isAuthenticated) {
        const decodedToken = jwtDecode<{ exp: number }>(state.token);
        if (decodedToken.exp * 1000 <= Date.now()) {
          signout();
        }
      }
    };

    const intervalId = setInterval(checkTokenExpiration, 60000); // Check every minute
    return () => clearInterval(intervalId);
  }, [state, signout]);

  useEffect(() => {
    const handleSignout = () => {
      signout();
    };

    window.addEventListener("auth:signout", handleSignout);
    return () => {
      window.removeEventListener("auth:signout", handleSignout);
    };
  }, [signout]);

  const contextValue = useMemo(
    () => ({ state, authenticate, signout }),
    [state, authenticate, signout]
  );

  return (
    <AuthenticationContext.Provider value={contextValue}>
      {children}
    </AuthenticationContext.Provider>
  );
};

export function useAuthentication() {
  const context = useContext(AuthenticationContext);
  if (!context) {
    throw new Error(
      "useAuthentication must be used within an AuthenticationProvider"
    );
  }
  return context;
}

export function useAuthToken() {
  const { state } = useAuthentication();
  if (!state.isAuthenticated) {
    throw new Error("User is not authenticated");
  }
  return state.token;
}
