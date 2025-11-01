import { Message, RawMessage } from "@/types/message";
import moment from "moment";
import parseUser from "./parseUser";

export default function parseMessage(message: RawMessage): Message {
  return {
    id: message.id,
    sender: parseUser(message.sender),
    subject: message.subject,
    preview: message.preview,
    starred: message.starred,
    seen_at: message.seen_at ? moment(message.seen_at) : null,
    date: moment(message.date),
    created_at: moment(message.created_at),
    deleted_at: moment(message.deleted_at),
  };
}
