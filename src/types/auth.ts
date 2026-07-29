export type MembershipStatus = "active" | "suspended" | "removed";

export type ActiveMembership = {
  membershipId: string;
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  jobTitle: string | null;
  status: MembershipStatus;
  roles: string[];
};

export type AuthContext = {
  userId: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  memberships: ActiveMembership[];
  activeTenantId: string | null;
};

export type ActiveTenant = ActiveMembership;
