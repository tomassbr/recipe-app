export type ProfileRole = "user" | "admin";

export type ProfileRow = {
  id: string;
  email: string | null;
  display_name: string | null;
  role: ProfileRole;
};
