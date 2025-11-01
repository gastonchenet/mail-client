import type { Moment } from "moment";

export type RawMessage = {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  starred: boolean;
  seen_at: string | null;
  date: string;
  created_at: string;
  deleted_at: string | null;
};

export type User = {
  name: string | null;
  email: string;
};

export type Message = {
  id: string;
  sender: User;
  subject: string;
  preview: string;
  starred: boolean;
  seen_at: Moment | null;
  date: Moment;
  created_at: Moment;
  deleted_at: Moment;
};
