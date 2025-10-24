"use client";

import { useMemo, useRef, useState } from "react";
import {
  BaseEditor,
  createEditor,
  Descendant,
  Editor,
  Element as SlateElement,
  Transforms,
} from "slate";
import {
  Editable,
  ReactEditor,
  RenderElementProps,
  RenderLeafProps,
  Slate,
  useSlate,
  withReact,
} from "slate-react";
import styles from "./page.module.scss";
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaHeading,
  FaListUl,
  FaListOl,
  FaLink,
  FaImage,
  FaCode,
  FaPaperclip,
} from "react-icons/fa";
import { IconType } from "react-icons";
import AddressField from "@/components/AddressField";
import formatBytes from "@/utils/formatBytes";
import { VscClose } from "react-icons/vsc";
import { RiMailSendLine } from "react-icons/ri";
import { HashLoader } from "react-spinners";
import Link from "next/link";
import { toHTMLContent, toTextContent } from "@/utils/parseHtmlContent";
import sendMessage from "@/api/sendMessage";
import { MdOutlineReportGmailerrorred } from "react-icons/md";
import { useRouter } from "next/navigation";

type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  code?: boolean;
};

type CustomElement = {
  type:
    | "paragraph"
    | "heading"
    | "numbered-list"
    | "bulleted-list"
    | "link"
    | "image"
    | "list-item";
  url?: string;
  children: CustomText[];
};

type CustomEditor = BaseEditor & ReactEditor;

declare module "slate" {
  interface CustomTypes {
    Editor: CustomEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

function Element({ attributes, children, element }: RenderElementProps) {
  switch (element.type) {
    case "heading":
      return <h2 {...attributes}>{children}</h2>;
    case "numbered-list":
      return <ol {...attributes}>{children}</ol>;
    case "bulleted-list":
      return <ul {...attributes}>{children}</ul>;
    case "list-item":
      return <li {...attributes}>{children}</li>;
    case "link":
      return (
        <a
          {...attributes}
          href={element.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </a>
      );
    case "image":
      return <img {...attributes} src={element.url} alt="" />;
    default:
      return <p {...attributes}>{children}</p>;
  }
}

function Leaf({ attributes, children, leaf }: RenderLeafProps) {
  if (leaf.bold) children = <strong>{children}</strong>;
  if (leaf.italic) children = <em>{children}</em>;
  if (leaf.underline) children = <u>{children}</u>;
  if (leaf.code) children = <code>{children}</code>;
  return <span {...attributes}>{children}</span>;
}

type MarkButtonProps = {
  Icon: IconType;
  format: keyof Omit<CustomText, "text">;
};

type BlockButtonProps = {
  Icon: IconType;
  format: CustomElement["type"];
};

type ButtonProps = {
  Icon: IconType;
  onClick?: (e: React.MouseEvent) => void;
  active?: boolean;
};

const LIST_TYPES = Object.freeze(["numbered-list", "bulleted-list"]);

function Button({ Icon, onClick, active }: ButtonProps) {
  return (
    <button
      className={active ? styles.buttonActive : styles.button}
      onClick={onClick}
    >
      <Icon className={styles.icon} />
    </button>
  );
}

function MarkButton({ Icon, format }: MarkButtonProps) {
  const editor = useSlate();

  const isMarkActive = (): boolean => {
    const marks = Editor.marks(editor);
    return !!marks?.[format];
  };

  const toggleMark = (): void => {
    if (isMarkActive()) Editor.removeMark(editor, format);
    else Editor.addMark(editor, format, true);
  };

  return <Button Icon={Icon} onClick={toggleMark} active={isMarkActive()} />;
}

function BlockButton({ Icon, format }: BlockButtonProps) {
  const editor = useSlate();

  const isBlockActive = (): boolean => {
    const [match] = Editor.nodes(editor, {
      match: (n) =>
        !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format,
    });

    return !!match;
  };

  const toggleBlock = (): void => {
    const isActive = isBlockActive();
    const isList = LIST_TYPES.includes(format);

    Transforms.unwrapNodes(editor, {
      match: (n) => LIST_TYPES.includes("type" in n ? n.type : ""),
      split: true,
    });

    const newType = isActive ? "paragraph" : isList ? "list-item" : format;
    Transforms.setNodes(editor, { type: newType });

    if (!isActive && isList) {
      const block: CustomElement = { type: format, children: [] };
      Transforms.wrapNodes(editor, block);
    }
  };

  return <Button Icon={Icon} onClick={toggleBlock} active={isBlockActive()} />;
}

export default function Page() {
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [value, setValue] = useState<Descendant[]>([
    { type: "paragraph", children: [{ text: "" }] },
  ]);

  const [toAddresses, setToAddresses] = useState<Set<string>>(new Set());
  const [ccAddresses, setCcAddresses] = useState<Set<string>>(new Set());
  const [subject, setSubject] = useState("");

  const editor = useMemo(() => withReact(createEditor()), []);

  const renderElement = (props: RenderElementProps) => <Element {...props} />;
  const renderLeaf = (props: RenderLeafProps) => <Leaf {...props} />;

  const attachFile = () => {
    const inpEl = document.createElement("input");
    inpEl.type = "file";
    inpEl.click();

    inpEl.onchange = () => {
      const attachments: File[] = [];

      for (const file of inpEl.files ?? []) {
        attachments.push(file);
      }

      setAttachments((prev) => prev.concat(attachments));
      inpEl.remove();
    };
  };

  const removeFile = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const send = async () => {
    setSending(true);
    setError(null);

    const error = await sendMessage({
      to: [...toAddresses],
      cc: [...ccAddresses],
      subject,
      text: toTextContent(value),
      html: toHTMLContent(value),
      attachments,
    });

    setSending(false);
    if (error) return setError(error);

    router.push("/");
  };

  return (
    <div className={styles.container}>
      <div className={styles.fields}>
        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label className={styles.label}>To:</label>
            <AddressField onChange={setToAddresses} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Cc:</label>
            <AddressField onChange={setCcAddresses} />
          </div>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Subject:</label>
          <input
            className={styles.subjectInput}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>
      </div>
      <div className={styles.body}>
        <Slate
          editor={editor}
          initialValue={value}
          onChange={(val) => setValue(val)}
        >
          <div className={styles.toolbar}>
            <div className={styles.buttonRow}>
              <MarkButton Icon={FaBold} format="bold" />
              <MarkButton Icon={FaItalic} format="italic" />
              <MarkButton Icon={FaUnderline} format="underline" />
              <MarkButton Icon={FaCode} format="code" />
            </div>
            <div className={styles.buttonRow}>
              <BlockButton Icon={FaHeading} format="heading" />
              <BlockButton Icon={FaListOl} format="numbered-list" />
              <BlockButton Icon={FaListUl} format="bulleted-list" />
            </div>
            <div className={styles.buttonRow}>
              <BlockButton Icon={FaLink} format="link" />
              <BlockButton Icon={FaImage} format="image" />
              <Button Icon={FaPaperclip} onClick={attachFile} />
            </div>
          </div>
          <Editable
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            className={styles.editorInput}
            spellCheck
            placeholder="Enter body..."
          />
          <div className={styles.attachments}>
            {attachments.map((attachment, index) => (
              <div key={index} className={styles.attachment}>
                <p className={styles.fileName}>{attachment.name}</p>
                <p className={styles.fileSize}>
                  {formatBytes(attachment.size)}
                </p>
                <button
                  className={styles.close}
                  onClick={() => removeFile(index)}
                >
                  <VscClose className={styles.icon} />
                </button>
              </div>
            ))}
          </div>
        </Slate>
      </div>
      <div className={styles.actionButtons}>
        <button
          className={sending ? styles.sendingButton : styles.sendButton}
          onClick={send}
        >
          {sending ? (
            <HashLoader color="#ffffff" size={15} />
          ) : (
            <RiMailSendLine size={15} />
          )}
          <span className={styles.label}>
            {sending ? "Sending..." : "Send"}
          </span>
        </button>
        <Link href="/" className={styles.cancelLink}>
          Cancel
        </Link>
      </div>
      {error && (
        <p className={styles.error}>
          <MdOutlineReportGmailerrorred size={16} className={styles.icon} />
          <b>Error: </b>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
