/**
 * Shared TypeScript types used across the application.
 */

export interface User {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  is_verified?: boolean;
}

export interface Event {
  id: string;
  name: string;
  date: string;
  venue_name: string;
  status: string;
  total_tokens: number;
}

export interface Venue {
  id: string;
  name: string;
  address: string | null;
  table_count: number;
  status: string;
}
