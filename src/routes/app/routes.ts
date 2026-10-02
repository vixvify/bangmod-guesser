export const AppRoutes = {
  home: "/",
  game: "/game",
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
  profile: "/profile",
  admin: "/admin",
  adminUsers: "/admin/users",
  adminLocations: "/admin/locations",
  adminLocationCreate: "/admin/locations/create",
  adminLocationEdit: (id: string) => `/admin/locations/${id}/edit`,
} as const;
