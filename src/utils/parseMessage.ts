import { Message, RawMessage } from "@/types/message";
import moment from "moment";
import parseUser from "./parseUser";

export default function parseMessage(message: RawMessage): Message {
  return {
    id: message.id,
    sender: parseUser(message.sender),
    recipients: message.recipients.split(/,\s+/g).map(parseUser),
    subject: message.subject,
    preview: message.preview,
    date: moment(message.date),
    created_at: moment(message.created_at),
  };
}
