/**
 * Portfolio Type Definitions
 * Types for mutual fund portfolio tracking, holdings, and notifications
 */

export interface PortfolioHolding {
  id: string;
  folio_number: string;
  scheme_code: string;
  scheme_name: string;
  isin?: string;  // ISIN for NAV tracking and goal mapping
  amc_name: string | null;
  unit_balance: number;
  avg_cost_per_unit: number;
  cost_value: number;
  current_nav: number;
  nav_date: string;
  nav_last_fetched_at?: string;  // Timestamp when NAV was last fetched from MFAPI
  market_value: number;
  absolute_profit: number;
  absolute_return_percentage: number;
  xirr_percentage?: number | null;
  is_active: boolean;
  last_updated: string;
  created_at: string;
}

export interface PortfolioSummary {
  total_investment: number;
  current_value: number;
  total_profit: number;
  overall_return: number;
  holdings_count: number;
}

export interface PortfolioNotification {
  id: string;
  user_id: string;
  holding_id: string | null;
  notification_type: 'GAIN_10_PERCENT' | 'LOSS_10_PERCENT' | 'NAV_UPDATE_FAILED';
  title: string;
  message: string;
  folio_number: string | null;
  scheme_name: string | null;
  change_percentage: number | null;
  old_value: number | null;
  new_value: number | null;
  is_read: boolean;
  is_email_sent: boolean;
  email_sent_at: string | null;
  created_at: string;
  read_at: string | null;
}

export interface UploadedFile {
  id: string;
  user_id: string;
  file_name: string;
  file_type: 'PDF' | 'XLSX';
  file_size: number;
  file_url: string | null;
  processing_status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  error_message: string | null;
  folios_extracted: number;
  holdings_created: number;
  total_investment: number;
  created_at: string;
  processed_at: string | null;
}

export interface UploadResult {
  success: boolean;
  message: string;
  data?: {
    file_id: string;
    folios_extracted: number;
    holdings_created: number;
    total_investment: number;
  };
}
