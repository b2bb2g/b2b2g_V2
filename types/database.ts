export type Json =
  | boolean
  | null
  | number
  | string
  | Json[]
  | { [key: string]: Json | undefined };

type BaseRow = {
  created_at: string;
  deleted_at: string | null;
  id: string;
  is_active: boolean;
  updated_at: string;
};

export type AccountApprovalStatus =
  | "approved"
  | "pending"
  | "rejected"
  | "suspended";
export type AccountRoleStatus =
  | "active"
  | "approved"
  | "inactive"
  | "rejected"
  | "requested"
  | "revoked"
  | "suspended"
  | "under_review";
export type ActivityStatus = "active" | "blocked" | "inactive";
export type AnalyticsEventType =
  | "buy_request_view"
  | "catalog_download"
  | "company_view"
  | "event_view"
  | "inquiry_click"
  | "product_view"
  | "showcase_view";
export type AnalyticsTargetTable =
  | "buy_requests"
  | "buy_sell_posts"
  | "companies"
  | "events"
  | "products"
  | "student_showcases";
export type AdminLogAction =
  | "badge_grant"
  | "buy_request_approve"
  | "buy_request_reject"
  | "buy_sell_approve"
  | "buy_sell_reject"
  | "category_change"
  | "company_approve"
  | "company_suspend"
  | "company_verify"
  | "fda_status_change"
  | "manual"
  | "member_approve"
  | "member_reject"
  | "member_suspend"
  | "menu_change"
  | "message_block"
  | "product_approve"
  | "product_reject"
  | "reward_approve"
  | "setting_change"
  | "translation_change";
export type AuditEventLevel = "business" | "security" | "system";
export type AuditEventSeverity = "critical" | "error" | "info" | "warning";
export type AuditEventType =
  | "admin_action"
  | "api_rate_limited"
  | "file_access_failed"
  | "login_failed"
  | "manual"
  | "message_blocked"
  | "rls_blocked"
  | "system_change"
  | "unauthorized_access";
export type ActivityLogType =
  | "badge_received"
  | "buyer_referred"
  | "career_rank_changed"
  | "company_approved"
  | "company_submitted"
  | "event_applied"
  | "event_attended"
  | "fda_application_submitted"
  | "manual"
  | "market_research_submitted"
  | "matching_approved"
  | "matching_requested"
  | "product_approved"
  | "product_submitted"
  | "profile_updated"
  | "reward_approved"
  | "showcase_created"
  | "showcase_inquiry_received"
  | "showcase_shared";
export type BannerPlacement =
  | "admin"
  | "dashboard"
  | "footer"
  | "public_home"
  | "public_section";
export type CompanyApprovalStatus =
  | "approved"
  | "draft"
  | "rejected"
  | "reviewing"
  | "submitted"
  | "suspended";
export type VerificationStatus =
  | "pending"
  | "rejected"
  | "suspended"
  | "verified";
export type ContentApprovalStatus =
  | "approved"
  | "draft"
  | "rejected"
  | "reviewing"
  | "submitted"
  | "suspended";
export type AnnouncementTargetScope = "all" | "member_type" | "profile";
export type ConversationMemberRole = "member" | "observer" | "owner";
export type ConversationType = "direct" | "group" | "support";
export type EventApplicationStatus =
  | "approved"
  | "attended"
  | "cancelled"
  | "rejected"
  | "submitted";
export type EventStatus = "archived" | "cancelled" | "draft" | "published";
export type MatchingStatus =
  | "approved"
  | "closed"
  | "rejected"
  | "requested"
  | "reviewing";
export type MatchingType =
  | "buyer_agent"
  | "professor_supplier"
  | "student_buyer"
  | "supplier_buyer";
export type MemberTypeCode =
  | "administrator"
  | "agent"
  | "buyer"
  | "professor"
  | "student"
  | "supplier";
export type MemberReferralOwnerType = "agent" | "professor";
export type MemberReferralSignupStatus = "active" | "pending" | "rejected";
export type MemberReferralTargetType = "buyer" | "student";
export type IdentityRoleKey = string;
export type ReferralRelationStatus = "active" | "blocked" | "inactive";
export type ReferralRewardStatus =
  | "approved"
  | "eligible"
  | "paid"
  | "pending"
  | "rejected";
export type RewardStatus =
  | "approved"
  | "cancelled"
  | "paid"
  | "pending"
  | "rejected";
export type RoleApplicationStatus =
  | "approved"
  | "cancelled"
  | "draft"
  | "rejected"
  | "requested"
  | "submitted"
  | "under_review"
  | "withdrawn";
export type RewardType =
  | "agent_performance"
  | "manual"
  | "referral"
  | "student_acquisition";
export type FeaturedLevel =
  | "featured"
  | "normal"
  | "premium_featured"
  | "top_featured";
export type NotificationChannel =
  | "email"
  | "in_app"
  | "kakaotalk"
  | "line"
  | "sms"
  | "whatsapp";
export type NotificationPriority = "critical" | "high" | "low" | "medium";
export type FileVisibility = "private" | "public" | "restricted";
export type StorageBucket =
  | "company-files"
  | "fda-files"
  | "message-attachments"
  | "product-files"
  | "public-assets"
  | "reports";
export type SeoTargetTable =
  | "buy_sell_posts"
  | "companies"
  | "epc_posts"
  | "events"
  | "industrial_posts"
  | "products";
export type FeaturedTargetTable =
  | "buy_sell_posts"
  | "companies"
  | "events"
  | "products";
export type BuyerSourceType =
  | "agent"
  | "direct"
  | "event"
  | "google"
  | "referral"
  | "student";
export type ShowcaseInquiryStatus =
  | "closed"
  | "connected"
  | "new"
  | "rejected"
  | "reviewing";
export type ShowcaseInquiryType =
  | "buyer_connection"
  | "matching_request"
  | "product_inquiry";
export type ShowcaseShareChannel =
  | "direct"
  | "email"
  | "facebook"
  | "kakaotalk"
  | "line"
  | "linkedin"
  | "whatsapp"
  | "x";
export type ThailandFdaServiceCategory =
  | "cosmetic_registration"
  | "food_registration"
  | "food_supplement_registration"
  | "formula_review"
  | "import_license_support"
  | "label_compliance"
  | "medical_device_registration";
export type ThailandFdaStatus =
  | "completed"
  | "draft"
  | "in_progress"
  | "quoted"
  | "rejected"
  | "reviewing"
  | "submitted"
  | "waiting_documents";

export type Database = {
  public: {
    Tables: {
      account_roles: {
        Row: {
          account_id: string;
          approved_at: string | null;
          approved_by: string | null;
          created_at: string;
          deleted_at: string | null;
          id: string;
          role_key: IdentityRoleKey;
          status: AccountRoleStatus;
          updated_at: string;
        };
        Insert: {
          account_id: string;
          approved_at?: string | null;
          approved_by?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          role_key: IdentityRoleKey;
          status?: AccountRoleStatus;
          updated_at?: string;
        };
        Update: Partial<{
          account_id: string;
          approved_at: string | null;
          approved_by: string | null;
          created_at: string;
          deleted_at: string | null;
          id: string;
          role_key: IdentityRoleKey;
          status: AccountRoleStatus;
          updated_at: string;
        }>;
        Relationships: [];
      };
      role_applications: {
        Row: {
          account_id: string;
          created_at: string;
          deleted_at: string | null;
          id: string;
          reason: string | null;
          rejection_reason: string | null;
          requested_role_key: IdentityRoleKey;
          reviewed_at: string | null;
          reviewed_by: string | null;
          status: RoleApplicationStatus;
          updated_at: string;
        };
        Insert: {
          account_id: string;
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          reason?: string | null;
          rejection_reason?: string | null;
          requested_role_key: IdentityRoleKey;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: RoleApplicationStatus;
          updated_at?: string;
        };
        Update: Partial<{
          account_id: string;
          created_at: string;
          deleted_at: string | null;
          id: string;
          reason: string | null;
          rejection_reason: string | null;
          requested_role_key: IdentityRoleKey;
          reviewed_at: string | null;
          reviewed_by: string | null;
          status: RoleApplicationStatus;
          updated_at: string;
        }>;
        Relationships: [];
      };
      member_types: {
        Row: BaseRow & {
          code: MemberTypeCode;
          description: string | null;
          is_system: boolean;
          name: string;
        };
        Insert: Partial<BaseRow> & {
          code: MemberTypeCode;
          description?: string | null;
          is_system?: boolean;
          name: string;
        };
        Update: Partial<
          BaseRow & {
            code: MemberTypeCode;
            description: string | null;
            is_system: boolean;
            name: string;
          }
        >;
        Relationships: [];
      };
      career_ranks: {
        Row: BaseRow & {
          code: string;
          level_order: number;
          name: string;
        };
        Insert: Partial<BaseRow> & {
          code: string;
          level_order: number;
          name: string;
        };
        Update: Partial<
          BaseRow & {
            code: string;
            level_order: number;
            name: string;
          }
        >;
        Relationships: [];
      };
      company_types: {
        Row: BaseRow & {
          code: string;
          name: string;
          sort_order: number;
        };
        Insert: Partial<BaseRow> & {
          code: string;
          name: string;
          sort_order?: number;
        };
        Update: Partial<
          BaseRow & {
            code: string;
            name: string;
            sort_order: number;
          }
        >;
        Relationships: [];
      };
      countries: {
        Row: BaseRow & {
          code: string;
          name: string;
          region_id: string | null;
          sort_order: number;
          status: "active" | "inactive";
        };
        Insert: Partial<BaseRow> & {
          code: string;
          name: string;
          region_id?: string | null;
          sort_order?: number;
          status?: "active" | "inactive";
        };
        Update: Partial<
          BaseRow & {
            code: string;
            name: string;
            region_id: string | null;
            sort_order: number;
            status: "active" | "inactive";
          }
        >;
        Relationships: [];
      };
      industries: {
        Row: BaseRow & {
          code: string;
          name: string;
          parent_id: string | null;
          sort_order: number;
        };
        Insert: Partial<BaseRow> & {
          code: string;
          name: string;
          parent_id?: string | null;
          sort_order?: number;
        };
        Update: Partial<
          BaseRow & {
            code: string;
            name: string;
            parent_id: string | null;
            sort_order: number;
          }
        >;
        Relationships: [];
      };
      languages: {
        Row: {
          code: string;
          created_at: string;
          deleted_at: string | null;
          is_active: boolean;
          name: string;
          native_name: string | null;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          deleted_at?: string | null;
          is_active?: boolean;
          name: string;
          native_name?: string | null;
          sort_order?: number;
          updated_at?: string;
        };
        Update: Partial<{
          code: string;
          created_at: string;
          deleted_at: string | null;
          is_active: boolean;
          name: string;
          native_name: string | null;
          sort_order: number;
          updated_at: string;
        }>;
        Relationships: [];
      };
      categories: {
        Row: BaseRow & {
          code: string;
          created_by: string | null;
          deleted_by: string | null;
          domain:
            | "buy_request"
            | "buy_sell"
            | "commercial"
            | "epc"
            | "event"
            | "industrial"
            | "notice"
            | "thailand_fda";
          label_key: string | null;
          name: string;
          parent_id: string | null;
          sort_order: number;
          updated_by: string | null;
        };
        Insert: Partial<BaseRow> & {
          code: string;
          created_by?: string | null;
          deleted_by?: string | null;
          domain:
            | "buy_request"
            | "buy_sell"
            | "commercial"
            | "epc"
            | "event"
            | "industrial"
            | "notice"
            | "thailand_fda";
          label_key?: string | null;
          name: string;
          parent_id?: string | null;
          sort_order?: number;
          updated_by?: string | null;
        };
        Update: Partial<
          BaseRow & {
            code: string;
            created_by: string | null;
            deleted_by: string | null;
            domain:
              | "buy_request"
              | "buy_sell"
              | "commercial"
              | "epc"
              | "event"
              | "industrial"
              | "notice"
              | "thailand_fda";
            label_key: string | null;
            name: string;
            parent_id: string | null;
            sort_order: number;
            updated_by: string | null;
          }
        >;
        Relationships: [];
      };
      menus: {
        Row: BaseRow & {
          code: string;
          created_by: string | null;
          deleted_by: string | null;
          href: string;
          is_visible: boolean;
          label_key: string;
          location: "admin" | "dashboard" | "footer" | "public_main";
          parent_id: string | null;
          sort_order: number;
          updated_by: string | null;
        };
        Insert: Partial<BaseRow> & {
          code: string;
          created_by?: string | null;
          deleted_by?: string | null;
          href: string;
          is_visible?: boolean;
          label_key: string;
          location?: "admin" | "dashboard" | "footer" | "public_main";
          parent_id?: string | null;
          sort_order?: number;
          updated_by?: string | null;
        };
        Update: Partial<
          BaseRow & {
            code: string;
            created_by: string | null;
            deleted_by: string | null;
            href: string;
            is_visible: boolean;
            label_key: string;
            location: "admin" | "dashboard" | "footer" | "public_main";
            parent_id: string | null;
            sort_order: number;
            updated_by: string | null;
          }
        >;
        Relationships: [];
      };
      site_settings: {
        Row: BaseRow & {
          created_by: string | null;
          deleted_by: string | null;
          description: string | null;
          is_public: boolean;
          key: string;
          updated_by: string | null;
          value: Json;
        };
        Insert: Partial<BaseRow> & {
          created_by?: string | null;
          deleted_by?: string | null;
          description?: string | null;
          is_public?: boolean;
          key: string;
          updated_by?: string | null;
          value?: Json;
        };
        Update: Partial<
          BaseRow & {
            created_by: string | null;
            deleted_by: string | null;
            description: string | null;
            is_public: boolean;
            key: string;
            updated_by: string | null;
            value: Json;
          }
        >;
        Relationships: [];
      };
      translations: {
        Row: BaseRow & {
          created_by: string | null;
          deleted_by: string | null;
          language_code: string;
          namespace: string;
          translation_key: string;
          updated_by: string | null;
          value: string;
        };
        Insert: Partial<BaseRow> & {
          created_by?: string | null;
          deleted_by?: string | null;
          language_code: string;
          namespace?: string;
          translation_key: string;
          updated_by?: string | null;
          value: string;
        };
        Update: Partial<
          BaseRow & {
            created_by: string | null;
            deleted_by: string | null;
            language_code: string;
            namespace: string;
            translation_key: string;
            updated_by: string | null;
            value: string;
          }
        >;
        Relationships: [];
      };
      buy_requests: {
        Row: BaseRow & {
          approval_status: ContentApprovalStatus;
          approved_at: string | null;
          approved_by: string | null;
          buyer_id: string;
          category_id: string | null;
          created_by: string | null;
          deleted_by: string | null;
          destination_country_id: string | null;
          details: string | null;
          industry_id: string | null;
          quantity: string | null;
          target_price: string | null;
          title: string;
          updated_by: string | null;
        };
        Insert: Partial<BaseRow> & {
          approval_status?: ContentApprovalStatus;
          approved_at?: string | null;
          approved_by?: string | null;
          buyer_id: string;
          category_id?: string | null;
          created_by?: string | null;
          deleted_by?: string | null;
          destination_country_id?: string | null;
          details?: string | null;
          industry_id?: string | null;
          quantity?: string | null;
          target_price?: string | null;
          title: string;
          updated_by?: string | null;
        };
        Update: Partial<
          BaseRow & {
            approval_status: ContentApprovalStatus;
            approved_at: string | null;
            approved_by: string | null;
            buyer_id: string;
            category_id: string | null;
            created_by: string | null;
            deleted_by: string | null;
            destination_country_id: string | null;
            details: string | null;
            industry_id: string | null;
            quantity: string | null;
            target_price: string | null;
            title: string;
            updated_by: string | null;
          }
        >;
        Relationships: [];
      };
      buy_sell_posts: {
        Row: BaseRow & {
          approval_status: ContentApprovalStatus;
          approved_at: string | null;
          approved_by: string | null;
          author_profile_id: string;
          category_id: string | null;
          created_by: string | null;
          deleted_by: string | null;
          description: string | null;
          post_type: "sell_product";
          supplier_id: string;
          target_country_id: string | null;
          title: string;
          updated_by: string | null;
        };
        Insert: Partial<BaseRow> & {
          approval_status?: ContentApprovalStatus;
          approved_at?: string | null;
          approved_by?: string | null;
          author_profile_id: string;
          category_id?: string | null;
          created_by?: string | null;
          deleted_by?: string | null;
          description?: string | null;
          post_type?: "sell_product";
          supplier_id: string;
          target_country_id?: string | null;
          title: string;
          updated_by?: string | null;
        };
        Update: Partial<
          BaseRow & {
            approval_status: ContentApprovalStatus;
            approved_at: string | null;
            approved_by: string | null;
            author_profile_id: string;
            category_id: string | null;
            created_by: string | null;
            deleted_by: string | null;
            description: string | null;
            post_type: "sell_product";
            supplier_id: string;
            target_country_id: string | null;
            title: string;
            updated_by: string | null;
          }
        >;
        Relationships: [];
      };
      epc_posts: {
        Row: BaseRow & {
          approval_status: ContentApprovalStatus;
          approved_at: string | null;
          approved_by: string | null;
          category_id: string | null;
          company_id: string;
          created_by: string | null;
          deleted_by: string | null;
          description: string | null;
          industry_id: string | null;
          project_country_id: string | null;
          project_scope: string | null;
          summary: string | null;
          supplier_id: string;
          title: string;
          updated_by: string | null;
        };
        Insert: Partial<BaseRow> & {
          approval_status?: ContentApprovalStatus;
          approved_at?: string | null;
          approved_by?: string | null;
          category_id?: string | null;
          company_id: string;
          created_by?: string | null;
          deleted_by?: string | null;
          description?: string | null;
          industry_id?: string | null;
          project_country_id?: string | null;
          project_scope?: string | null;
          summary?: string | null;
          supplier_id: string;
          title: string;
          updated_by?: string | null;
        };
        Update: Partial<
          BaseRow & {
            approval_status: ContentApprovalStatus;
            approved_at: string | null;
            approved_by: string | null;
            category_id: string | null;
            company_id: string;
            created_by: string | null;
            deleted_by: string | null;
            description: string | null;
            industry_id: string | null;
            project_country_id: string | null;
            project_scope: string | null;
            summary: string | null;
            supplier_id: string;
            title: string;
            updated_by: string | null;
          }
        >;
        Relationships: [];
      };
      industrial_posts: {
        Row: BaseRow & {
          approval_status: ContentApprovalStatus;
          approved_at: string | null;
          approved_by: string | null;
          category_id: string | null;
          company_id: string;
          created_by: string | null;
          deleted_by: string | null;
          description: string | null;
          industry_id: string | null;
          summary: string | null;
          supplier_id: string;
          title: string;
          updated_by: string | null;
        };
        Insert: Partial<BaseRow> & {
          approval_status?: ContentApprovalStatus;
          approved_at?: string | null;
          approved_by?: string | null;
          category_id?: string | null;
          company_id: string;
          created_by?: string | null;
          deleted_by?: string | null;
          description?: string | null;
          industry_id?: string | null;
          summary?: string | null;
          supplier_id: string;
          title: string;
          updated_by?: string | null;
        };
        Update: Partial<
          BaseRow & {
            approval_status: ContentApprovalStatus;
            approved_at: string | null;
            approved_by: string | null;
            category_id: string | null;
            company_id: string;
            created_by: string | null;
            deleted_by: string | null;
            description: string | null;
            industry_id: string | null;
            summary: string | null;
            supplier_id: string;
            title: string;
            updated_by: string | null;
          }
        >;
        Relationships: [];
      };
      products: {
        Row: BaseRow & {
          approval_status: ContentApprovalStatus;
          approved_at: string | null;
          approved_by: string | null;
          category_id: string | null;
          company_id: string;
          created_by: string | null;
          deleted_by: string | null;
          description: string | null;
          industry_id: string | null;
          main_file_id: string | null;
          summary: string | null;
          supplier_id: string;
          title: string;
          updated_by: string | null;
        };
        Insert: Partial<BaseRow> & {
          approval_status?: ContentApprovalStatus;
          approved_at?: string | null;
          approved_by?: string | null;
          category_id?: string | null;
          company_id: string;
          created_by?: string | null;
          deleted_by?: string | null;
          description?: string | null;
          industry_id?: string | null;
          main_file_id?: string | null;
          summary?: string | null;
          supplier_id: string;
          title: string;
          updated_by?: string | null;
        };
        Update: Partial<
          BaseRow & {
            approval_status: ContentApprovalStatus;
            approved_at: string | null;
            approved_by: string | null;
            category_id: string | null;
            company_id: string;
            created_by: string | null;
            deleted_by: string | null;
            description: string | null;
            industry_id: string | null;
            main_file_id: string | null;
            summary: string | null;
            supplier_id: string;
            title: string;
            updated_by: string | null;
          }
        >;
        Relationships: [];
      };
      student_showcases: {
        Row: BaseRow & {
          approval_status: "approved" | "draft" | "rejected" | "reviewing" | "submitted";
          approved_at: string | null;
          approved_by: string | null;
          created_by: string;
          deleted_by: string | null;
          description: string | null;
          student_id: string;
          target_country_id: string | null;
          title: string;
          updated_by: string | null;
        };
        Insert: Partial<BaseRow> & {
          approval_status?: "draft" | "submitted";
          approved_at?: string | null;
          approved_by?: string | null;
          created_by: string;
          deleted_by?: string | null;
          description?: string | null;
          student_id: string;
          target_country_id?: string | null;
          title: string;
          updated_by?: string | null;
        };
        Update: Partial<
          BaseRow & {
            approval_status: "approved" | "draft" | "rejected" | "reviewing" | "submitted";
            approved_at: string | null;
            approved_by: string | null;
            created_by: string;
            deleted_by: string | null;
            description: string | null;
            student_id: string;
            target_country_id: string | null;
            title: string;
            updated_by: string | null;
          }
        >;
        Relationships: [];
      };
      student_showcase_items: {
        Row: BaseRow & {
          created_by: string;
          deleted_by: string | null;
          display_order: number;
          product_id: string;
          showcase_id: string;
          student_note: string | null;
          updated_by: string | null;
        };
        Insert: Partial<BaseRow> & {
          created_by: string;
          deleted_by?: string | null;
          display_order?: number;
          product_id: string;
          showcase_id: string;
          student_note?: string | null;
          updated_by?: string | null;
        };
        Update: Partial<
          BaseRow & {
            created_by: string;
            deleted_by: string | null;
            display_order: number;
            product_id: string;
            showcase_id: string;
            student_note: string | null;
            updated_by: string | null;
          }
        >;
        Relationships: [];
      };
      market_research_reports: {
        Row: BaseRow & {
          approval_status: "approved" | "draft" | "rejected" | "reviewing" | "submitted";
          approved_at: string | null;
          approved_by: string | null;
          content: string | null;
          country_id: string | null;
          created_by: string;
          deleted_by: string | null;
          industry_id: string | null;
          student_id: string;
          summary: string | null;
          title: string;
          updated_by: string | null;
        };
        Insert: Partial<BaseRow> & {
          approval_status?: "draft" | "submitted";
          approved_at?: string | null;
          approved_by?: string | null;
          content?: string | null;
          country_id?: string | null;
          created_by: string;
          deleted_by?: string | null;
          industry_id?: string | null;
          student_id: string;
          summary?: string | null;
          title: string;
          updated_by?: string | null;
        };
        Update: Partial<
          BaseRow & {
            approval_status: "approved" | "draft" | "rejected" | "reviewing" | "submitted";
            approved_at: string | null;
            approved_by: string | null;
            content: string | null;
            country_id: string | null;
            created_by: string;
            deleted_by: string | null;
            industry_id: string | null;
            student_id: string;
            summary: string | null;
            title: string;
            updated_by: string | null;
          }
        >;
        Relationships: [];
      };
      matching_requests: {
        Row: BaseRow & {
          admin_note: string | null;
          created_by: string | null;
          deleted_by: string | null;
          matching_type: MatchingType;
          requester_profile_id: string;
          reviewed_at: string | null;
          reviewed_by: string | null;
          status: MatchingStatus;
          target_profile_id: string | null;
          updated_by: string | null;
        };
        Insert: Partial<BaseRow> & {
          admin_note?: string | null;
          created_by?: string | null;
          deleted_by?: string | null;
          matching_type: MatchingType;
          requester_profile_id: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: MatchingStatus;
          target_profile_id?: string | null;
          updated_by?: string | null;
        };
        Update: Partial<
          BaseRow & {
            admin_note: string | null;
            created_by: string | null;
            deleted_by: string | null;
            matching_type: MatchingType;
            requester_profile_id: string;
            reviewed_at: string | null;
            reviewed_by: string | null;
            status: MatchingStatus;
            target_profile_id: string | null;
            updated_by: string | null;
          }
        >;
        Relationships: [];
      };
      referral_codes: {
        Row: BaseRow & {
          buyer_id: string;
          code: string;
          created_by: string | null;
          deleted_by: string | null;
          referral_url: string | null;
          updated_by: string | null;
        };
        Insert: Partial<BaseRow> & {
          buyer_id: string;
          code: string;
          created_by?: string | null;
          deleted_by?: string | null;
          referral_url?: string | null;
          updated_by?: string | null;
        };
        Update: Partial<
          BaseRow & {
            buyer_id: string;
            code: string;
            created_by: string | null;
            deleted_by: string | null;
            referral_url: string | null;
            updated_by: string | null;
          }
        >;
        Relationships: [];
      };
      referral_relations: {
        Row: BaseRow & {
          child_buyer_id: string;
          created_by: string | null;
          deleted_by: string | null;
          parent_buyer_id: string;
          referral_code_id: string;
          reward_status: ReferralRewardStatus;
          status: ReferralRelationStatus;
          updated_by: string | null;
        };
        Insert: Partial<BaseRow> & {
          child_buyer_id: string;
          created_by?: string | null;
          deleted_by?: string | null;
          parent_buyer_id: string;
          referral_code_id: string;
          reward_status?: ReferralRewardStatus;
          status?: ReferralRelationStatus;
          updated_by?: string | null;
        };
        Update: Partial<
          BaseRow & {
            child_buyer_id: string;
            created_by: string | null;
            deleted_by: string | null;
            parent_buyer_id: string;
            referral_code_id: string;
            reward_status: ReferralRewardStatus;
            status: ReferralRelationStatus;
            updated_by: string | null;
          }
        >;
        Relationships: [];
      };
      member_referral_codes: {
        Row: BaseRow & {
          code: string;
          created_by: string | null;
          deleted_by: string | null;
          owner_member_type: MemberReferralOwnerType;
          owner_profile_id: string;
          referral_url: string | null;
          target_member_type: MemberReferralTargetType;
          updated_by: string | null;
        };
        Insert: Partial<BaseRow> & {
          code: string;
          created_by?: string | null;
          deleted_by?: string | null;
          owner_member_type: MemberReferralOwnerType;
          owner_profile_id: string;
          referral_url?: string | null;
          target_member_type: MemberReferralTargetType;
          updated_by?: string | null;
        };
        Update: Partial<
          BaseRow & {
            code: string;
            created_by: string | null;
            deleted_by: string | null;
            owner_member_type: MemberReferralOwnerType;
            owner_profile_id: string;
            referral_url: string | null;
            target_member_type: MemberReferralTargetType;
            updated_by: string | null;
          }
        >;
        Relationships: [];
      };
      member_referral_signups: {
        Row: BaseRow & {
          created_by: string | null;
          deleted_by: string | null;
          joined_at: string;
          owner_profile_id: string;
          referral_code_id: string;
          referred_profile_id: string;
          status: MemberReferralSignupStatus;
          updated_by: string | null;
        };
        Insert: Partial<BaseRow> & {
          created_by?: string | null;
          deleted_by?: string | null;
          joined_at?: string;
          owner_profile_id: string;
          referral_code_id: string;
          referred_profile_id: string;
          status?: MemberReferralSignupStatus;
          updated_by?: string | null;
        };
        Update: Partial<
          BaseRow & {
            created_by: string | null;
            deleted_by: string | null;
            joined_at: string;
            owner_profile_id: string;
            referral_code_id: string;
            referred_profile_id: string;
            status: MemberReferralSignupStatus;
            updated_by: string | null;
          }
        >;
        Relationships: [];
      };
      rewards: {
        Row: BaseRow & {
          admin_note: string | null;
          amount: number | null;
          approved_at: string | null;
          approved_by: string | null;
          created_by: string | null;
          currency: string | null;
          deleted_by: string | null;
          profile_id: string;
          reward_type: RewardType;
          source_id: string | null;
          source_table: string | null;
          status: RewardStatus;
          updated_by: string | null;
        };
        Insert: Partial<BaseRow> & {
          admin_note?: string | null;
          amount?: number | null;
          approved_at?: string | null;
          approved_by?: string | null;
          created_by?: string | null;
          currency?: string | null;
          deleted_by?: string | null;
          profile_id: string;
          reward_type: RewardType;
          source_id?: string | null;
          source_table?: string | null;
          status?: RewardStatus;
          updated_by?: string | null;
        };
        Update: Partial<
          BaseRow & {
            admin_note: string | null;
            amount: number | null;
            approved_at: string | null;
            approved_by: string | null;
            created_by: string | null;
            currency: string | null;
            deleted_by: string | null;
            profile_id: string;
            reward_type: RewardType;
            source_id: string | null;
            source_table: string | null;
            status: RewardStatus;
            updated_by: string | null;
          }
        >;
        Relationships: [];
      };
      badges: {
        Row: BaseRow & {
          code: string;
          created_by: string | null;
          criteria: Json;
          deleted_by: string | null;
          description: string | null;
          name: string;
          updated_by: string | null;
        };
        Insert: Partial<BaseRow> & {
          code: string;
          created_by?: string | null;
          criteria?: Json;
          deleted_by?: string | null;
          description?: string | null;
          name: string;
          updated_by?: string | null;
        };
        Update: Partial<
          BaseRow & {
            code: string;
            created_by: string | null;
            criteria: Json;
            deleted_by: string | null;
            description: string | null;
            name: string;
            updated_by: string | null;
          }
        >;
        Relationships: [];
      };
      profile_badges: {
        Row: BaseRow & {
          awarded_at: string;
          awarded_by: string | null;
          badge_id: string;
          created_by: string | null;
          deleted_by: string | null;
          profile_id: string;
          revoked_at: string | null;
          updated_by: string | null;
        };
        Insert: Partial<BaseRow> & {
          awarded_at?: string;
          awarded_by?: string | null;
          badge_id: string;
          created_by?: string | null;
          deleted_by?: string | null;
          profile_id: string;
          revoked_at?: string | null;
          updated_by?: string | null;
        };
        Update: Partial<
          BaseRow & {
            awarded_at: string;
            awarded_by: string | null;
            badge_id: string;
            created_by: string | null;
            deleted_by: string | null;
            profile_id: string;
            revoked_at: string | null;
            updated_by: string | null;
          }
        >;
        Relationships: [];
      };
      events: {
        Row: BaseRow & {
          capacity: number | null;
          category_id: string | null;
          created_by: string;
          deleted_by: string | null;
          description: string | null;
          ends_at: string | null;
          event_url: string | null;
          location: string | null;
          published_at: string | null;
          published_by: string | null;
          starts_at: string | null;
          status: EventStatus;
          summary: string | null;
          title: string;
          updated_by: string | null;
        };
        Insert: Partial<BaseRow> & {
          capacity?: number | null;
          category_id?: string | null;
          created_by: string;
          deleted_by?: string | null;
          description?: string | null;
          ends_at?: string | null;
          event_url?: string | null;
          location?: string | null;
          published_at?: string | null;
          published_by?: string | null;
          starts_at?: string | null;
          status?: EventStatus;
          summary?: string | null;
          title: string;
          updated_by?: string | null;
        };
        Update: Partial<
          BaseRow & {
            capacity: number | null;
            category_id: string | null;
            created_by: string;
            deleted_by: string | null;
            description: string | null;
            ends_at: string | null;
            event_url: string | null;
            location: string | null;
            published_at: string | null;
            published_by: string | null;
            starts_at: string | null;
            status: EventStatus;
            summary: string | null;
            title: string;
            updated_by: string | null;
          }
        >;
        Relationships: [];
      };
      event_applications: {
        Row: BaseRow & {
          admin_note: string | null;
          approved_at: string | null;
          approved_by: string | null;
          created_by: string;
          deleted_by: string | null;
          event_id: string;
          note: string | null;
          profile_id: string;
          status: EventApplicationStatus;
          updated_by: string | null;
        };
        Insert: Partial<BaseRow> & {
          admin_note?: string | null;
          approved_at?: string | null;
          approved_by?: string | null;
          created_by: string;
          deleted_by?: string | null;
          event_id: string;
          note?: string | null;
          profile_id: string;
          status?: EventApplicationStatus;
          updated_by?: string | null;
        };
        Update: Partial<
          BaseRow & {
            admin_note: string | null;
            approved_at: string | null;
            approved_by: string | null;
            created_by: string;
            deleted_by: string | null;
            event_id: string;
            note: string | null;
            profile_id: string;
            status: EventApplicationStatus;
            updated_by: string | null;
          }
        >;
        Relationships: [];
      };
      thailand_fda_applications: {
        Row: BaseRow & {
          admin_note: string | null;
          completed_at: string | null;
          completion_report_file_id: string | null;
          created_by: string;
          deleted_by: string | null;
          formula_summary: string | null;
          product_name: string;
          quoted_amount: number | null;
          quoted_currency: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          service_category: ThailandFdaServiceCategory;
          status: ThailandFdaStatus;
          submitted_at: string | null;
          supplier_id: string;
          updated_by: string | null;
        };
        Insert: Partial<BaseRow> & {
          admin_note?: string | null;
          completed_at?: string | null;
          completion_report_file_id?: string | null;
          created_by: string;
          deleted_by?: string | null;
          formula_summary?: string | null;
          product_name: string;
          quoted_amount?: number | null;
          quoted_currency?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          service_category: ThailandFdaServiceCategory;
          status?: ThailandFdaStatus;
          submitted_at?: string | null;
          supplier_id: string;
          updated_by?: string | null;
        };
        Update: Partial<
          BaseRow & {
            admin_note: string | null;
            completed_at: string | null;
            completion_report_file_id: string | null;
            created_by: string;
            deleted_by: string | null;
            formula_summary: string | null;
            product_name: string;
            quoted_amount: number | null;
            quoted_currency: string | null;
            reviewed_at: string | null;
            reviewed_by: string | null;
            service_category: ThailandFdaServiceCategory;
            status: ThailandFdaStatus;
            submitted_at: string | null;
            supplier_id: string;
            updated_by: string | null;
          }
        >;
        Relationships: [];
      };
      conversations: {
        Row: BaseRow & {
          blocked_at: string | null;
          blocked_by: string | null;
          conversation_type: ConversationType;
          created_by: string;
          deleted_by: string | null;
          is_blocked: boolean;
          subject: string | null;
          updated_by: string | null;
        };
        Insert: Partial<BaseRow> & {
          blocked_at?: string | null;
          blocked_by?: string | null;
          conversation_type?: ConversationType;
          created_by: string;
          deleted_by?: string | null;
          is_blocked?: boolean;
          subject?: string | null;
          updated_by?: string | null;
        };
        Update: Partial<
          BaseRow & {
            blocked_at: string | null;
            blocked_by: string | null;
            conversation_type: ConversationType;
            created_by: string;
            deleted_by: string | null;
            is_blocked: boolean;
            subject: string | null;
            updated_by: string | null;
          }
        >;
        Relationships: [];
      };
      conversation_members: {
        Row: BaseRow & {
          conversation_id: string;
          created_by: string | null;
          deleted_by: string | null;
          last_read_at: string | null;
          member_role: ConversationMemberRole;
          muted_at: string | null;
          profile_id: string;
          updated_by: string | null;
        };
        Insert: Partial<BaseRow> & {
          conversation_id: string;
          created_by?: string | null;
          deleted_by?: string | null;
          last_read_at?: string | null;
          member_role?: ConversationMemberRole;
          muted_at?: string | null;
          profile_id: string;
          updated_by?: string | null;
        };
        Update: Partial<
          BaseRow & {
            conversation_id: string;
            created_by: string | null;
            deleted_by: string | null;
            last_read_at: string | null;
            member_role: ConversationMemberRole;
            muted_at: string | null;
            profile_id: string;
            updated_by: string | null;
          }
        >;
        Relationships: [];
      };
      messages: {
        Row: BaseRow & {
          blocked_at: string | null;
          blocked_by: string | null;
          body: string;
          conversation_id: string;
          created_by: string;
          deleted_by: string | null;
          edited_at: string | null;
          sender_profile_id: string;
          updated_by: string | null;
        };
        Insert: Partial<BaseRow> & {
          blocked_at?: string | null;
          blocked_by?: string | null;
          body: string;
          conversation_id: string;
          created_by: string;
          deleted_by?: string | null;
          edited_at?: string | null;
          sender_profile_id: string;
          updated_by?: string | null;
        };
        Update: Partial<
          BaseRow & {
            blocked_at: string | null;
            blocked_by: string | null;
            body: string;
            conversation_id: string;
            created_by: string;
            deleted_by: string | null;
            edited_at: string | null;
            sender_profile_id: string;
            updated_by: string | null;
          }
        >;
        Relationships: [];
      };
      message_attachments: {
        Row: BaseRow & {
          created_by: string;
          deleted_by: string | null;
          file_id: string;
          file_mime_type: string | null;
          file_name: string | null;
          file_size: number | null;
          message_id: string;
          updated_by: string | null;
          uploaded_by: string;
        };
        Insert: Partial<BaseRow> & {
          created_by: string;
          deleted_by?: string | null;
          file_id: string;
          file_mime_type?: string | null;
          file_name?: string | null;
          file_size?: number | null;
          message_id: string;
          updated_by?: string | null;
          uploaded_by: string;
        };
        Update: Partial<
          BaseRow & {
            created_by: string;
            deleted_by: string | null;
            file_id: string;
            file_mime_type: string | null;
            file_name: string | null;
            file_size: number | null;
            message_id: string;
            updated_by: string | null;
            uploaded_by: string;
          }
        >;
        Relationships: [];
      };
      announcements: {
        Row: BaseRow & {
          body: string;
          created_by: string;
          deleted_by: string | null;
          expires_at: string | null;
          language_code: string | null;
          priority: NotificationPriority;
          published_at: string | null;
          sender_profile_id: string;
          target_member_type_code: string | null;
          target_profile_id: string | null;
          target_scope: AnnouncementTargetScope;
          title: string;
          updated_by: string | null;
        };
        Insert: Partial<BaseRow> & {
          body: string;
          created_by: string;
          deleted_by?: string | null;
          expires_at?: string | null;
          language_code?: string | null;
          priority?: NotificationPriority;
          published_at?: string | null;
          sender_profile_id: string;
          target_member_type_code?: string | null;
          target_profile_id?: string | null;
          target_scope?: AnnouncementTargetScope;
          title: string;
          updated_by?: string | null;
        };
        Update: Partial<
          BaseRow & {
            body: string;
            created_by: string;
            deleted_by: string | null;
            expires_at: string | null;
            language_code: string | null;
            priority: NotificationPriority;
            published_at: string | null;
            sender_profile_id: string;
            target_member_type_code: string | null;
            target_profile_id: string | null;
            target_scope: AnnouncementTargetScope;
            title: string;
            updated_by: string | null;
          }
        >;
        Relationships: [];
      };
      notifications: {
        Row: BaseRow & {
          announcement_id: string | null;
          body: string | null;
          channel: NotificationChannel;
          created_by: string | null;
          deleted_by: string | null;
          notification_type: string;
          priority: NotificationPriority;
          profile_id: string;
          read_at: string | null;
          sent_at: string | null;
          title: string;
          updated_by: string | null;
        };
        Insert: Partial<BaseRow> & {
          announcement_id?: string | null;
          body?: string | null;
          channel?: NotificationChannel;
          created_by?: string | null;
          deleted_by?: string | null;
          notification_type: string;
          priority?: NotificationPriority;
          profile_id: string;
          read_at?: string | null;
          sent_at?: string | null;
          title: string;
          updated_by?: string | null;
        };
        Update: Partial<
          BaseRow & {
            announcement_id: string | null;
            body: string | null;
            channel: NotificationChannel;
            created_by: string | null;
            deleted_by: string | null;
            notification_type: string;
            priority: NotificationPriority;
            profile_id: string;
            read_at: string | null;
            sent_at: string | null;
            title: string;
            updated_by: string | null;
          }
        >;
        Relationships: [];
      };
      files: {
        Row: BaseRow & {
          bucket: StorageBucket;
          checksum: string | null;
          created_by: string;
          deleted_by: string | null;
          metadata: Json;
          mime_type: string | null;
          original_name: string | null;
          owner_profile_id: string;
          path: string;
          size_bytes: number | null;
          updated_by: string | null;
          visibility: FileVisibility;
        };
        Insert: Partial<BaseRow> & {
          bucket: StorageBucket;
          checksum?: string | null;
          created_by: string;
          deleted_by?: string | null;
          metadata?: Json;
          mime_type?: string | null;
          original_name?: string | null;
          owner_profile_id: string;
          path: string;
          size_bytes?: number | null;
          updated_by?: string | null;
          visibility?: FileVisibility;
        };
        Update: Partial<
          BaseRow & {
            bucket: StorageBucket;
            checksum: string | null;
            created_by: string;
            deleted_by: string | null;
            metadata: Json;
            mime_type: string | null;
            original_name: string | null;
            owner_profile_id: string;
            path: string;
            size_bytes: number | null;
            updated_by: string | null;
            visibility: FileVisibility;
          }
        >;
        Relationships: [];
      };
      banners: {
        Row: BaseRow & {
          code: string;
          created_by: string | null;
          deleted_by: string | null;
          ends_at: string | null;
          file_id: string | null;
          is_visible: boolean;
          link_url: string | null;
          placement: BannerPlacement;
          sort_order: number;
          starts_at: string | null;
          subtitle: string | null;
          title: string | null;
          updated_by: string | null;
        };
        Insert: Partial<BaseRow> & {
          code: string;
          created_by?: string | null;
          deleted_by?: string | null;
          ends_at?: string | null;
          file_id?: string | null;
          is_visible?: boolean;
          link_url?: string | null;
          placement?: BannerPlacement;
          sort_order?: number;
          starts_at?: string | null;
          subtitle?: string | null;
          title?: string | null;
          updated_by?: string | null;
        };
        Update: Partial<
          BaseRow & {
            code: string;
            created_by: string | null;
            deleted_by: string | null;
            ends_at: string | null;
            file_id: string | null;
            is_visible: boolean;
            link_url: string | null;
            placement: BannerPlacement;
            sort_order: number;
            starts_at: string | null;
            subtitle: string | null;
            title: string | null;
            updated_by: string | null;
          }
        >;
        Relationships: [];
      };
      seo_metadata: {
        Row: BaseRow & {
          canonical_url: string | null;
          created_by: string | null;
          deleted_by: string | null;
          keywords: string[];
          meta_description: string | null;
          meta_title: string | null;
          og_image_file_id: string | null;
          structured_data: Json;
          target_id: string;
          target_table: SeoTargetTable;
          updated_by: string | null;
        };
        Insert: Partial<BaseRow> & {
          canonical_url?: string | null;
          created_by?: string | null;
          deleted_by?: string | null;
          keywords?: string[];
          meta_description?: string | null;
          meta_title?: string | null;
          og_image_file_id?: string | null;
          structured_data?: Json;
          target_id: string;
          target_table: SeoTargetTable;
          updated_by?: string | null;
        };
        Update: Partial<
          BaseRow & {
            canonical_url: string | null;
            created_by: string | null;
            deleted_by: string | null;
            keywords: string[];
            meta_description: string | null;
            meta_title: string | null;
            og_image_file_id: string | null;
            structured_data: Json;
            target_id: string;
            target_table: SeoTargetTable;
            updated_by: string | null;
          }
        >;
        Relationships: [];
      };
      featured_contents: {
        Row: BaseRow & {
          created_by: string | null;
          deleted_by: string | null;
          featured_by: string | null;
          featured_level: FeaturedLevel;
          featured_until: string | null;
          sort_order: number;
          target_id: string;
          target_table: FeaturedTargetTable;
          updated_by: string | null;
        };
        Insert: Partial<BaseRow> & {
          created_by?: string | null;
          deleted_by?: string | null;
          featured_by?: string | null;
          featured_level?: FeaturedLevel;
          featured_until?: string | null;
          sort_order?: number;
          target_id: string;
          target_table: FeaturedTargetTable;
          updated_by?: string | null;
        };
        Update: Partial<
          BaseRow & {
            created_by: string | null;
            deleted_by: string | null;
            featured_by: string | null;
            featured_level: FeaturedLevel;
            featured_until: string | null;
            sort_order: number;
            target_id: string;
            target_table: FeaturedTargetTable;
            updated_by: string | null;
          }
        >;
        Relationships: [];
      };
      showcase_views: {
        Row: BaseRow & {
          country_id: string | null;
          created_by: string | null;
          deleted_by: string | null;
          metadata: Json;
          occurred_at: string;
          referrer: string | null;
          session_id: string | null;
          showcase_id: string;
          updated_by: string | null;
          user_agent: string | null;
          viewer_profile_id: string | null;
        };
        Insert: Partial<BaseRow> & {
          country_id?: string | null;
          created_by?: string | null;
          deleted_by?: string | null;
          metadata?: Json;
          occurred_at?: string;
          referrer?: string | null;
          session_id?: string | null;
          showcase_id: string;
          updated_by?: string | null;
          user_agent?: string | null;
          viewer_profile_id?: string | null;
        };
        Update: Partial<
          BaseRow & {
            country_id: string | null;
            created_by: string | null;
            deleted_by: string | null;
            metadata: Json;
            occurred_at: string;
            referrer: string | null;
            session_id: string | null;
            showcase_id: string;
            updated_by: string | null;
            user_agent: string | null;
            viewer_profile_id: string | null;
          }
        >;
        Relationships: [];
      };
      showcase_shares: {
        Row: BaseRow & {
          channel: ShowcaseShareChannel;
          created_by: string | null;
          deleted_by: string | null;
          metadata: Json;
          occurred_at: string;
          session_id: string | null;
          sharer_profile_id: string | null;
          showcase_id: string;
          updated_by: string | null;
        };
        Insert: Partial<BaseRow> & {
          channel?: ShowcaseShareChannel;
          created_by?: string | null;
          deleted_by?: string | null;
          metadata?: Json;
          occurred_at?: string;
          session_id?: string | null;
          sharer_profile_id?: string | null;
          showcase_id: string;
          updated_by?: string | null;
        };
        Update: Partial<
          BaseRow & {
            channel: ShowcaseShareChannel;
            created_by: string | null;
            deleted_by: string | null;
            metadata: Json;
            occurred_at: string;
            session_id: string | null;
            sharer_profile_id: string | null;
            showcase_id: string;
            updated_by: string | null;
          }
        >;
        Relationships: [];
      };
      showcase_inquiries: {
        Row: BaseRow & {
          buyer_id: string | null;
          created_by: string | null;
          deleted_by: string | null;
          inquirer_profile_id: string | null;
          inquiry_type: ShowcaseInquiryType;
          message: string | null;
          metadata: Json;
          occurred_at: string;
          product_id: string | null;
          showcase_id: string;
          status: ShowcaseInquiryStatus;
          updated_by: string | null;
        };
        Insert: Partial<BaseRow> & {
          buyer_id?: string | null;
          created_by?: string | null;
          deleted_by?: string | null;
          inquirer_profile_id?: string | null;
          inquiry_type?: ShowcaseInquiryType;
          message?: string | null;
          metadata?: Json;
          occurred_at?: string;
          product_id?: string | null;
          showcase_id: string;
          status?: ShowcaseInquiryStatus;
          updated_by?: string | null;
        };
        Update: Partial<
          BaseRow & {
            buyer_id: string | null;
            created_by: string | null;
            deleted_by: string | null;
            inquirer_profile_id: string | null;
            inquiry_type: ShowcaseInquiryType;
            message: string | null;
            metadata: Json;
            occurred_at: string;
            product_id: string | null;
            showcase_id: string;
            status: ShowcaseInquiryStatus;
            updated_by: string | null;
          }
        >;
        Relationships: [];
      };
      buyer_sources: {
        Row: BaseRow & {
          buyer_id: string;
          campaign: string | null;
          created_by: string | null;
          deleted_by: string | null;
          landing_path: string | null;
          metadata: Json;
          referral_relation_id: string | null;
          source_agent_id: string | null;
          source_event_id: string | null;
          source_profile_id: string | null;
          source_student_id: string | null;
          source_type: BuyerSourceType;
          updated_by: string | null;
        };
        Insert: Partial<BaseRow> & {
          buyer_id: string;
          campaign?: string | null;
          created_by?: string | null;
          deleted_by?: string | null;
          landing_path?: string | null;
          metadata?: Json;
          referral_relation_id?: string | null;
          source_agent_id?: string | null;
          source_event_id?: string | null;
          source_profile_id?: string | null;
          source_student_id?: string | null;
          source_type: BuyerSourceType;
          updated_by?: string | null;
        };
        Update: Partial<
          BaseRow & {
            buyer_id: string;
            campaign: string | null;
            created_by: string | null;
            deleted_by: string | null;
            landing_path: string | null;
            metadata: Json;
            referral_relation_id: string | null;
            source_agent_id: string | null;
            source_event_id: string | null;
            source_profile_id: string | null;
            source_student_id: string | null;
            source_type: BuyerSourceType;
            updated_by: string | null;
          }
        >;
        Relationships: [];
      };
      analytics_events: {
        Row: BaseRow & {
          country_id: string | null;
          created_by: string | null;
          deleted_by: string | null;
          event_type: AnalyticsEventType;
          is_anonymous: boolean;
          metadata: Json;
          occurred_at: string;
          profile_id: string | null;
          session_id: string | null;
          target_id: string | null;
          target_table: AnalyticsTargetTable | null;
          updated_by: string | null;
        };
        Insert: Partial<BaseRow> & {
          country_id?: string | null;
          created_by?: string | null;
          deleted_by?: string | null;
          event_type: AnalyticsEventType;
          is_anonymous?: boolean;
          metadata?: Json;
          occurred_at?: string;
          profile_id?: string | null;
          session_id?: string | null;
          target_id?: string | null;
          target_table?: AnalyticsTargetTable | null;
          updated_by?: string | null;
        };
        Update: Partial<
          BaseRow & {
            country_id: string | null;
            created_by: string | null;
            deleted_by: string | null;
            event_type: AnalyticsEventType;
            is_anonymous: boolean;
            metadata: Json;
            occurred_at: string;
            profile_id: string | null;
            session_id: string | null;
            target_id: string | null;
            target_table: AnalyticsTargetTable | null;
            updated_by: string | null;
          }
        >;
        Relationships: [];
      };
      company_scores: {
        Row: BaseRow & {
          calculated_at: string;
          company_id: string;
          created_by: string | null;
          deleted_by: string | null;
          is_public: boolean;
          product_score: number;
          profile_completion_score: number;
          response_score: number;
          score: number;
          score_factors: Json;
          updated_by: string | null;
          verification_score: number;
        };
        Insert: Partial<BaseRow> & {
          calculated_at?: string;
          company_id: string;
          created_by?: string | null;
          deleted_by?: string | null;
          is_public?: boolean;
          product_score?: number;
          profile_completion_score?: number;
          response_score?: number;
          score?: number;
          score_factors?: Json;
          updated_by?: string | null;
          verification_score?: number;
        };
        Update: Partial<
          BaseRow & {
            calculated_at: string;
            company_id: string;
            created_by: string | null;
            deleted_by: string | null;
            is_public: boolean;
            product_score: number;
            profile_completion_score: number;
            response_score: number;
            score: number;
            score_factors: Json;
            updated_by: string | null;
            verification_score: number;
          }
        >;
        Relationships: [];
      };
      admin_logs: {
        Row: BaseRow & {
          action: AdminLogAction;
          actor_profile_id: string | null;
          after_data: Json | null;
          before_data: Json | null;
          created_by: string | null;
          deleted_by: string | null;
          ip_address: string | null;
          metadata: Json;
          occurred_at: string;
          reason: string | null;
          target_id: string | null;
          target_label: string | null;
          target_table: string;
          updated_by: string | null;
          user_agent: string | null;
        };
        Insert: Partial<BaseRow> & {
          action: AdminLogAction;
          actor_profile_id?: string | null;
          after_data?: Json | null;
          before_data?: Json | null;
          created_by?: string | null;
          deleted_by?: string | null;
          ip_address?: string | null;
          metadata?: Json;
          occurred_at?: string;
          reason?: string | null;
          target_id?: string | null;
          target_label?: string | null;
          target_table: string;
          updated_by?: string | null;
          user_agent?: string | null;
        };
        Update: Partial<
          BaseRow & {
            action: AdminLogAction;
            actor_profile_id: string | null;
            after_data: Json | null;
            before_data: Json | null;
            created_by: string | null;
            deleted_by: string | null;
            ip_address: string | null;
            metadata: Json;
            occurred_at: string;
            reason: string | null;
            target_id: string | null;
            target_label: string | null;
            target_table: string;
            updated_by: string | null;
            user_agent: string | null;
          }
        >;
        Relationships: [];
      };
      audit_events: {
        Row: BaseRow & {
          actor_profile_id: string | null;
          created_by: string | null;
          deleted_by: string | null;
          error_code: string | null;
          event_level: AuditEventLevel;
          event_type: AuditEventType;
          ip_address: string | null;
          message: string | null;
          metadata: Json;
          occurred_at: string;
          request_id: string | null;
          severity: AuditEventSeverity;
          target_id: string | null;
          target_table: string | null;
          updated_by: string | null;
          user_agent: string | null;
        };
        Insert: Partial<BaseRow> & {
          actor_profile_id?: string | null;
          created_by?: string | null;
          deleted_by?: string | null;
          error_code?: string | null;
          event_level: AuditEventLevel;
          event_type: AuditEventType;
          ip_address?: string | null;
          message?: string | null;
          metadata?: Json;
          occurred_at?: string;
          request_id?: string | null;
          severity?: AuditEventSeverity;
          target_id?: string | null;
          target_table?: string | null;
          updated_by?: string | null;
          user_agent?: string | null;
        };
        Update: Partial<
          BaseRow & {
            actor_profile_id: string | null;
            created_by: string | null;
            deleted_by: string | null;
            error_code: string | null;
            event_level: AuditEventLevel;
            event_type: AuditEventType;
            ip_address: string | null;
            message: string | null;
            metadata: Json;
            occurred_at: string;
            request_id: string | null;
            severity: AuditEventSeverity;
            target_id: string | null;
            target_table: string | null;
            updated_by: string | null;
            user_agent: string | null;
          }
        >;
        Relationships: [];
      };
      activity_logs: {
        Row: BaseRow & {
          activity_type: ActivityLogType;
          actor_profile_id: string | null;
          created_by: string | null;
          deleted_by: string | null;
          is_public: boolean;
          metadata: Json;
          occurred_at: string;
          profile_id: string;
          summary: string | null;
          target_id: string | null;
          target_table: string | null;
          updated_by: string | null;
        };
        Insert: Partial<BaseRow> & {
          activity_type: ActivityLogType;
          actor_profile_id?: string | null;
          created_by?: string | null;
          deleted_by?: string | null;
          is_public?: boolean;
          metadata?: Json;
          occurred_at?: string;
          profile_id: string;
          summary?: string | null;
          target_id?: string | null;
          target_table?: string | null;
          updated_by?: string | null;
        };
        Update: Partial<
          BaseRow & {
            activity_type: ActivityLogType;
            actor_profile_id: string | null;
            created_by: string | null;
            deleted_by: string | null;
            is_public: boolean;
            metadata: Json;
            occurred_at: string;
            profile_id: string;
            summary: string | null;
            target_id: string | null;
            target_table: string | null;
            updated_by: string | null;
          }
        >;
        Relationships: [];
      };
      agents: {
        Row: BaseRow & {
          approval_status: AccountApprovalStatus;
          created_by: string | null;
          deleted_by: string | null;
          profile_id: string;
          updated_by: string | null;
        };
        Insert: Partial<BaseRow> & {
          approval_status?: AccountApprovalStatus;
          created_by?: string | null;
          deleted_by?: string | null;
          profile_id: string;
          updated_by?: string | null;
        };
        Update: Partial<
          BaseRow & {
            approval_status: AccountApprovalStatus;
            created_by: string | null;
            deleted_by: string | null;
            profile_id: string;
            updated_by: string | null;
          }
        >;
        Relationships: [];
      };
      buyers: {
        Row: BaseRow & {
          approval_status: AccountApprovalStatus;
          company_name: string | null;
          country_id: string | null;
          created_by: string | null;
          deleted_by: string | null;
          profile_id: string;
          updated_by: string | null;
        };
        Insert: Partial<BaseRow> & {
          approval_status?: AccountApprovalStatus;
          company_name?: string | null;
          country_id?: string | null;
          created_by?: string | null;
          deleted_by?: string | null;
          profile_id: string;
          updated_by?: string | null;
        };
        Update: Partial<
          BaseRow & {
            approval_status: AccountApprovalStatus;
            company_name: string | null;
            country_id: string | null;
            created_by: string | null;
            deleted_by: string | null;
            profile_id: string;
            updated_by: string | null;
          }
        >;
        Relationships: [];
      };
      companies: {
        Row: BaseRow & {
          approval_status: CompanyApprovalStatus;
          approved_at: string | null;
          approved_by: string | null;
          company_type_id: string;
          country_id: string;
          created_by: string | null;
          deleted_by: string | null;
          description: string | null;
          industry_id: string;
          name: string;
          slug: string;
          updated_by: string | null;
          verification_status: VerificationStatus;
          verified_at: string | null;
          verified_by: string | null;
          website: string | null;
        };
        Insert: Partial<BaseRow> & {
          approval_status?: CompanyApprovalStatus;
          approved_at?: string | null;
          approved_by?: string | null;
          company_type_id: string;
          country_id: string;
          created_by?: string | null;
          deleted_by?: string | null;
          description?: string | null;
          industry_id: string;
          name: string;
          slug: string;
          updated_by?: string | null;
          verification_status?: VerificationStatus;
          verified_at?: string | null;
          verified_by?: string | null;
          website?: string | null;
        };
        Update: Partial<
          BaseRow & {
            approval_status: CompanyApprovalStatus;
            approved_at: string | null;
            approved_by: string | null;
            company_type_id: string;
            country_id: string;
            created_by: string | null;
            deleted_by: string | null;
            description: string | null;
            industry_id: string;
            name: string;
            slug: string;
            updated_by: string | null;
            verification_status: VerificationStatus;
            verified_at: string | null;
            verified_by: string | null;
            website: string | null;
          }
        >;
        Relationships: [];
      };
      company_verifications: {
        Row: BaseRow & {
          business_registration_checked: boolean;
          catalog_checked: boolean;
          certificate_checked: boolean;
          company_id: string;
          created_by: string | null;
          deleted_by: string | null;
          review_note: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          status: VerificationStatus;
          updated_by: string | null;
          website_checked: boolean;
        };
        Insert: Partial<BaseRow> & {
          business_registration_checked?: boolean;
          catalog_checked?: boolean;
          certificate_checked?: boolean;
          company_id: string;
          created_by?: string | null;
          deleted_by?: string | null;
          review_note?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: VerificationStatus;
          updated_by?: string | null;
          website_checked?: boolean;
        };
        Update: Partial<
          BaseRow & {
            business_registration_checked: boolean;
            catalog_checked: boolean;
            certificate_checked: boolean;
            company_id: string;
            created_by: string | null;
            deleted_by: string | null;
            review_note: string | null;
            reviewed_at: string | null;
            reviewed_by: string | null;
            status: VerificationStatus;
            updated_by: string | null;
            website_checked: boolean;
          }
        >;
        Relationships: [];
      };
      country_agents: {
        Row: BaseRow & {
          agent_id: string;
          assigned_at: string;
          country_id: string;
          created_by: string | null;
          deleted_by: string | null;
          status: "active" | "inactive" | "suspended";
          updated_by: string | null;
        };
        Insert: Partial<BaseRow> & {
          agent_id: string;
          assigned_at?: string;
          country_id: string;
          created_by?: string | null;
          deleted_by?: string | null;
          status?: "active" | "inactive" | "suspended";
          updated_by?: string | null;
        };
        Update: Partial<
          BaseRow & {
            agent_id: string;
            assigned_at: string;
            country_id: string;
            created_by: string | null;
            deleted_by: string | null;
            status: "active" | "inactive" | "suspended";
            updated_by: string | null;
          }
        >;
        Relationships: [];
      };
      profiles: {
        Row: BaseRow & {
          activity_status: ActivityStatus;
          approval_status: AccountApprovalStatus;
          career_rank_id: string | null;
          country_id: string | null;
          created_by: string | null;
          deleted_by: string | null;
          display_name: string | null;
          email: string;
          member_type_id: string;
          phone: string | null;
          primary_language: string | null;
          updated_by: string | null;
        };
        Insert: Partial<BaseRow> & {
          activity_status?: ActivityStatus;
          approval_status?: AccountApprovalStatus;
          career_rank_id?: string | null;
          country_id?: string | null;
          created_by?: string | null;
          deleted_by?: string | null;
          display_name?: string | null;
          email: string;
          id: string;
          member_type_id: string;
          phone?: string | null;
          primary_language?: string | null;
          updated_by?: string | null;
        };
        Update: Partial<
          BaseRow & {
            activity_status: ActivityStatus;
            approval_status: AccountApprovalStatus;
            career_rank_id: string | null;
            country_id: string | null;
            created_by: string | null;
            deleted_by: string | null;
            display_name: string | null;
            email: string;
            member_type_id: string;
            phone: string | null;
            primary_language: string | null;
            updated_by: string | null;
          }
        >;
        Relationships: [];
      };
      professors: {
        Row: BaseRow & {
          approval_status: AccountApprovalStatus;
          created_by: string | null;
          deleted_by: string | null;
          profile_id: string;
          university_name: string | null;
          updated_by: string | null;
        };
        Insert: Partial<BaseRow> & {
          approval_status?: AccountApprovalStatus;
          created_by?: string | null;
          deleted_by?: string | null;
          profile_id: string;
          university_name?: string | null;
          updated_by?: string | null;
        };
        Update: Partial<
          BaseRow & {
            approval_status: AccountApprovalStatus;
            created_by: string | null;
            deleted_by: string | null;
            profile_id: string;
            university_name: string | null;
            updated_by: string | null;
          }
        >;
        Relationships: [];
      };
      profile_roles: {
        Row: {
          created_at: string;
          profile_id: string;
          role_id: string;
        };
        Insert: {
          created_at?: string;
          profile_id: string;
          role_id: string;
        };
        Update: Partial<{
          created_at: string;
          profile_id: string;
          role_id: string;
        }>;
        Relationships: [];
      };
      students: {
        Row: BaseRow & {
          created_by: string | null;
          deleted_by: string | null;
          graduation_status: "enrolled" | "graduated";
          professor_id: string | null;
          profile_id: string;
          university_name: string | null;
          updated_by: string | null;
        };
        Insert: Partial<BaseRow> & {
          created_by?: string | null;
          deleted_by?: string | null;
          graduation_status?: "enrolled" | "graduated";
          professor_id?: string | null;
          profile_id: string;
          university_name?: string | null;
          updated_by?: string | null;
        };
        Update: Partial<
          BaseRow & {
            created_by: string | null;
            deleted_by: string | null;
            graduation_status: "enrolled" | "graduated";
            professor_id: string | null;
            profile_id: string;
            university_name: string | null;
            updated_by: string | null;
          }
        >;
        Relationships: [];
      };
      suppliers: {
        Row: BaseRow & {
          approval_status: AccountApprovalStatus;
          company_id: string;
          created_by: string | null;
          deleted_by: string | null;
          profile_id: string;
          updated_by: string | null;
        };
        Insert: Partial<BaseRow> & {
          approval_status?: AccountApprovalStatus;
          company_id: string;
          created_by?: string | null;
          deleted_by?: string | null;
          profile_id: string;
          updated_by?: string | null;
        };
        Update: Partial<
          BaseRow & {
            approval_status: AccountApprovalStatus;
            company_id: string;
            created_by: string | null;
            deleted_by: string | null;
            profile_id: string;
            updated_by: string | null;
          }
        >;
        Relationships: [];
      };
      regions: {
        Row: BaseRow & {
          name: string;
          sort_order: number;
        };
        Insert: Partial<BaseRow> & {
          name: string;
          sort_order?: number;
        };
        Update: Partial<
          BaseRow & {
            name: string;
            sort_order: number;
          }
        >;
        Relationships: [];
      };
      roles: {
        Row: BaseRow & {
          code: string;
          description: string | null;
          is_system: boolean;
          name: string;
        };
        Insert: Partial<BaseRow> & {
          code: string;
          description?: string | null;
          is_system?: boolean;
          name: string;
        };
        Update: Partial<
          BaseRow & {
            code: string;
            description: string | null;
            is_system: boolean;
            name: string;
          }
        >;
        Relationships: [];
      };
      permissions: {
        Row: BaseRow & {
          code: string;
          description: string | null;
          is_system: boolean;
          name: string;
        };
        Insert: Partial<BaseRow> & {
          code: string;
          description?: string | null;
          is_system?: boolean;
          name: string;
        };
        Update: Partial<
          BaseRow & {
            code: string;
            description: string | null;
            is_system: boolean;
            name: string;
          }
        >;
        Relationships: [];
      };
      role_permissions: {
        Row: {
          created_at: string;
          permission_id: string;
          role_id: string;
        };
        Insert: {
          created_at?: string;
          permission_id: string;
          role_id: string;
        };
        Update: Partial<{
          created_at: string;
          permission_id: string;
          role_id: string;
        }>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      current_profile_id: {
        Args: Record<PropertyKey, never>;
        Returns: string | null;
      };
      has_member_type: {
        Args: { member_type_code: string };
        Returns: boolean;
      };
      has_permission: {
        Args: { permission_code: string };
        Returns: boolean;
      };
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_profile_owner: {
        Args: { target_profile_id: string };
        Returns: boolean;
      };
      is_approved_product: {
        Args: { product_id: string };
        Returns: boolean;
      };
      can_access_showcase: {
        Args: { showcase_id: string };
        Returns: boolean;
      };
      can_manage_showcase: {
        Args: { showcase_id: string };
        Returns: boolean;
      };
      can_access_matching_request: {
        Args: { matching_request_id: string };
        Returns: boolean;
      };
      is_published_event: {
        Args: { event_id: string };
        Returns: boolean;
      };
      can_access_conversation: {
        Args: { target_conversation_id: string };
        Returns: boolean;
      };
      can_access_message: {
        Args: { target_message_id: string };
        Returns: boolean;
      };
      can_access_file: {
        Args: { target_file_id: string };
        Returns: boolean;
      };
      is_public_content_target: {
        Args: { target_record_id: string; target_table_name: string };
        Returns: boolean;
      };
      can_access_owned_seo_target: {
        Args: { target_record_id: string; target_table_name: string };
        Returns: boolean;
      };
      can_access_showcase_kpi: {
        Args: { target_showcase_id: string };
        Returns: boolean;
      };
      can_access_buyer_source: {
        Args: { target_buyer_source_id: string };
        Returns: boolean;
      };
      can_access_activity_log: {
        Args: { target_activity_log_id: string };
        Returns: boolean;
      };
      can_manage_country: {
        Args: { target_country_id: string };
        Returns: boolean;
      };
      current_agent_id: {
        Args: Record<PropertyKey, never>;
        Returns: string | null;
      };
      current_buyer_id: {
        Args: Record<PropertyKey, never>;
        Returns: string | null;
      };
      current_professor_id: {
        Args: Record<PropertyKey, never>;
        Returns: string | null;
      };
      current_student_id: {
        Args: Record<PropertyKey, never>;
        Returns: string | null;
      };
      current_supplier_id: {
        Args: Record<PropertyKey, never>;
        Returns: string | null;
      };
      is_assigned_student: {
        Args: { target_student_id: string };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
