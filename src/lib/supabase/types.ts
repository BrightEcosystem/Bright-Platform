/**
 * Tipos do banco de dados, escritos à mão a partir de `database/migrations/`.
 *
 * Nenhum projeto Supabase real existe ainda — quando existir, regenerar com:
 *   npx supabase gen types typescript --project-id <ref> > src/lib/supabase/types.ts
 * e revisar o diff antes de substituir este arquivo.
 */

type Timestamps = {
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      tenants: {
        Row: Timestamps & {
          id: string;
          name: string;
          slug: string;
          status: string;
          deleted_at: string | null;
        };
        Insert: Partial<Timestamps> & {
          id?: string;
          name: string;
          slug: string;
          status?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["tenants"]["Insert"]>;
      };
      profiles: {
        Row: Timestamps & {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          email: string;
          status: string;
          deleted_at: string | null;
        };
        Insert: Partial<Timestamps> & {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          email: string;
          status?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      tenant_memberships: {
        Row: Timestamps & {
          id: string;
          tenant_id: string;
          profile_id: string;
          job_title: string | null;
          status: string;
        };
        Insert: Partial<Timestamps> & {
          id?: string;
          tenant_id: string;
          profile_id: string;
          job_title?: string | null;
          status?: string;
        };
        Update: Partial<Database["public"]["Tables"]["tenant_memberships"]["Insert"]>;
      };
      roles: {
        Row: Timestamps & {
          id: string;
          tenant_id: string | null;
          name: string;
          is_system: boolean;
        };
        Insert: Partial<Timestamps> & {
          id?: string;
          tenant_id?: string | null;
          name: string;
          is_system?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["roles"]["Insert"]>;
      };
      permissions: {
        Row: Timestamps & {
          id: string;
          code: string;
          name: string | null;
          description: string | null;
          module: string | null;
          action: string | null;
          status: string;
        };
        Insert: Partial<Timestamps> & {
          id?: string;
          code: string;
          name?: string | null;
          description?: string | null;
          module?: string | null;
          action?: string | null;
          status?: string;
        };
        Update: Partial<Database["public"]["Tables"]["permissions"]["Insert"]>;
      };
      role_permissions: {
        Row: {
          role_id: string;
          permission_id: string;
          created_at: string;
        };
        Insert: {
          role_id: string;
          permission_id: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["role_permissions"]["Insert"]>;
      };
      membership_roles: {
        Row: {
          membership_id: string;
          role_id: string;
          created_at: string;
        };
        Insert: {
          membership_id: string;
          role_id: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["membership_roles"]["Insert"]>;
      };
      products: {
        Row: Timestamps & {
          id: string;
          code: string;
          name: string;
          description: string | null;
          status: string;
        };
        Insert: Partial<Timestamps> & {
          id?: string;
          code: string;
          name: string;
          description?: string | null;
          status?: string;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
      };
      tenant_products: {
        Row: Timestamps & {
          id: string;
          tenant_id: string;
          product_id: string;
          status: string;
          plan: string | null;
          activated_at: string | null;
          deactivated_at: string | null;
        };
        Insert: Partial<Timestamps> & {
          id?: string;
          tenant_id: string;
          product_id: string;
          status?: string;
          plan?: string | null;
          activated_at?: string | null;
          deactivated_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["tenant_products"]["Insert"]>;
      };
      audit_logs: {
        Row: {
          id: string;
          tenant_id: string | null;
          profile_id: string | null;
          action: string;
          resource: string;
          metadata: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string | null;
          profile_id?: string | null;
          action: string;
          resource: string;
          metadata?: Record<string, unknown>;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["audit_logs"]["Insert"]>;
      };
    };
  };
};
