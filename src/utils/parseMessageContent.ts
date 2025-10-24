import React from "react";
import {
  parse,
  type Node as HTMLNode,
  HTMLElement,
  type TextNode,
} from "node-html-parser";

const BLACKLISTED_TAGS = Object.freeze([
  "html",
  "body",
  "font",
  "meta",
  "head",
  "style+content",
]);

const PROPERTY_MAP: Readonly<Record<string, string>> = Object.freeze({
  class: "className",
  for: "htmlFor",
  cellpadding: "cellPadding",
  cellspacing: "cellSpacing",
  tabindex: "tabIndex",
});

function toCamelCaseCss(prop: string) {
  if (prop.startsWith("--")) return prop;
  return prop.replace(/-([a-z])/g, (_, ch) => ch.toUpperCase());
}

function parseStyleString(style: string) {
  const styles: React.CSSProperties = {};
  if (!styles) return styles;

  style
    .split(";")
    .map((s) => s.trim())
    .filter((v) => !!v)
    .forEach((decl) => {
      const [rawProp, ...rawValParts] = decl.split(":");
      if (!rawProp || rawValParts.length === 0) return;
      const key = toCamelCaseCss(rawProp.trim());
      const val = rawValParts.join(":").trim();

      if (/^-?\d+(\.\d+)?$/.test(val)) {
        (styles as any)[key] = Number(val);
      } else {
        (styles as any)[key] = val;
      }
    });

  return styles;
}

function attrsToProps(attrs: Record<string, string>) {
  if (!attrs) return {};
  const props: Record<string, any> = {};

  for (const [key, value] of Object.entries(attrs)) {
    if (key === "style") props.style = parseStyleString(value);
    else if (key in PROPERTY_MAP) props[PROPERTY_MAP[key]] = value;
    else props[key] = value;
  }

  return props;
}

function processNode(
  node: HTMLNode,
  tagClasses: Record<string, string>,
  key: string
) {
  if (node.nodeType === 3) {
    const textNode = node as TextNode;
    const text = textNode.text;
    return text || null;
  } else if (node.nodeType === 1) {
    const el = node as HTMLElement;

    const children: React.ReactNode[] = el.childNodes
      .map((child, idx) => processNode(child, tagClasses, `${key}-${idx}`))
      .filter((c) => !!c);

    const className = tagClasses[el.rawTagName];
    if (className) el.classList.add(className);

    for (const tag of BLACKLISTED_TAGS) {
      const [tagName, content] = tag.split("+");
      if (tagName !== el.rawTagName) continue;
      if (children.length === 0 || content === "content") return null;
      if (children.length === 1) return children[0];

      return React.createElement(React.Fragment, { key }, children);
    }

    const props = { key, ...attrsToProps(el.attributes) };

    return React.createElement(
      el.rawTagName,
      props,
      children.length > 0 ? children : null
    );
  } else {
    return null;
  }
}

function flattenBlacklistedNodes(nodes: HTMLNode[]): HTMLNode[] {
  const result: HTMLNode[] = [];

  for (const node of nodes) {
    if (
      node.nodeType === 1 &&
      BLACKLISTED_TAGS.includes((node as HTMLElement).rawTagName)
    ) {
      result.push(...(node as HTMLElement).childNodes);
    } else {
      result.push(node);
    }
  }

  return result;
}

export default function parseMessageContent(
  html: string,
  tagClasses: Record<string, string>
) {
  html = html.replace(/<!doctype [^>]*>/gi, "");
  const root = parse(html);
  const flattened = flattenBlacklistedNodes(root.childNodes);

  return flattened
    .map((node, i) => processNode(node, tagClasses, `root-${i}`))
    .filter((n) => !!n);
}
