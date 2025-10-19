import formatBytes from "@/utils/formatBytes";
import type { Attachment } from "mailparser";
import styles from "./MessageAttachment.module.scss";
import { IoKeySharp } from "react-icons/io5";

type MessageAttachmentProps = {
  data: Attachment;
};

export default function MessageAttachment({ data }: MessageAttachmentProps) {
  return (
    <div className={styles.attachment}>
      {/image\/(?:jpe?g|png)/.test(data.contentType) && (
        <img
          className={styles.image}
          src={`data:${data.contentType};base64,${Buffer.from(
            data.content
          ).toString("base64")}`}
        />
      )}
      <div className={styles.attachmentLabel}>
        <p className={styles.fileName}>
          {/\.key$/.test(data.filename ?? "") ? (
            <IoKeySharp size={18} className={styles.icon} color="#3f3128" />
          ) : null}
          {data.filename}
        </p>
        <p className={styles.fileSize}>{formatBytes(data.size)}</p>
      </div>
    </div>
  );
}
