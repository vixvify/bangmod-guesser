import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import { adminAccessControl, authRoles } from "@/features/auth/lib/auth-permissions";

export const authClient = createAuthClient({
  plugins: [adminClient({ ac: adminAccessControl, roles: authRoles })],
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;
