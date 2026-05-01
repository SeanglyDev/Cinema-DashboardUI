export interface UserListItem {
  user_id: number;
  role_id: number | null;
  role_name: string | null;
  name: string;
  email: string;
  profile_user: string | null;
  is_active: boolean | null;
  created_at: Date | null;
}
