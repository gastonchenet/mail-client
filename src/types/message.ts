import type { Moment } from "moment";

export type RawMessage = {
  id: string;
  sender: string;
  recipients: string;
  subject: string;
  preview: string;
  date: string;
  created_at: string;
};

export type User = {
  name: string | null;
  email: string;
};

export type Message = {
  id: string;
  sender: User;
  recipients: User[];
  subject: string;
  preview: string;
  date: Moment;
  created_at: Moment;
};
