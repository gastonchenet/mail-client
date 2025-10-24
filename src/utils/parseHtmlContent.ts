import type { Descendant } from "slate";

type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  code?: boolean;
};

function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function leafToHtml(leaf: CustomText): string {
  let text = escapeHtml(leaf.text);
  if (leaf.code) text = `<code>${text}</code>`;
  if (leaf.bold) text = `<strong>${text}</strong>`;
  if (leaf.italic) text = `<em>${text}</em>`;
  if (leaf.underline) text = `<u>${text}</u>`;
  return text;
}

export function toHTMLContent(nodes: Descendant[]): string {
  function serializeNode(node: any): string {
    if (node.text !== undefined) {
      return leafToHtml(node as CustomText);
    }

    const childrenHtml = (node.children || []).map(serializeNode).join("");

    switch (node.type) {
      case "heading":
        return `<h2>${childrenHtml}</h2>`;
      case "numbered-list":
        return `<ol>${childrenHtml}</ol>`;
      case "bulleted-list":
        return `<ul>${childrenHtml}</ul>`;
      case "list-item":
        return `<li>${childrenHtml}</li>`;
      case "link": {
        const url = escapeHtml(node.url ?? "");
        return `<a href="${url}" target="_blank" rel="noopener noreferrer">${childrenHtml}</a>`;
      }
      case "image": {
        const src = escapeHtml(node.url ?? "");
        return `<img src="${src}" alt="" />`;
      }
      case "paragraph":
      default:
        return `<p>${childrenHtml}</p>`;
    }
  }

  return nodes.map(serializeNode).join("");
}

export function toTextContent(nodes: Descendant[]): string {
  function serializeTextNodes(nodes: any[], parentListType?: string): string {
    let out = "";

    if (!nodes || nodes.length === 0) return out;

    if (parentListType === "numbered-list") {
      for (let i = 0; i < nodes.length; i++) {
        const item = nodes[i];
        const content = serializeTextNodes(item.children || []);
        const prefix = `${i + 1}. `;
        const contentLines = content
          .trim()
          .split("\n")
          .map((l, idx) => (idx === 0 ? l : "   " + l))
          .join("\n");

        out += prefix + contentLines.trim() + "\n";
      }
      out += "\n";
      return out;
    }

    if (parentListType === "bulleted-list") {
      for (let i = 0; i < nodes.length; i++) {
        const item = nodes[i];
        const content = serializeTextNodes(item.children || []);
        const prefix = "- ";
        const contentLines = content
          .trim()
          .split("\n")
          .map((l, idx) => (idx === 0 ? l : "  " + l))
          .join("\n");

        out += prefix + contentLines.trim() + "\n";
      }

      out += "\n";
      return out;
    }

    for (const node of nodes) {
      if (node.text !== undefined) {
        out += node.text as string;
      } else {
        switch (node.type) {
          case "heading": {
            const content = serializeTextNodes(node.children || []);
            out += content.trim() + "\n\n";
            break;
          }

          case "paragraph": {
            const content = serializeTextNodes(node.children || []);
            out += content.trim() + "\n\n";
            break;
          }

          case "numbered-list":
          case "bulleted-list": {
            out += serializeTextNodes(node.children || [], node.type);
            break;
          }

          case "list-item": {
            out += serializeTextNodes(node.children || []) + "\n";
            break;
          }
          case "link": {
            const content = serializeTextNodes(node.children || []);
            const url = node.url ?? "";
            out += content.trim();
            if (url) out += ` (${url})`;
            break;
          }
          case "image": {
            const src = node.url ?? "";
            if (src) out += `[Image: ${src}]`;
            out += "\n\n";
            break;
          }
          default: {
            out += serializeTextNodes(node.children || []);
            break;
          }
        }
      }
    }

    return out;
  }

  return serializeTextNodes(nodes).replace(/\n{2}/g, "\n").trim();
}
