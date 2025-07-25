/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { Typography } from ".";
import Link from "next/link";

export function SlateViewer({ value }: { value: any[] }) {
  return (
    <div>
      {value.map((node, i) => (
        <Element key={i} node={node} />
      ))}
    </div>
  );
}

function Element({ node }: { node: any }) {
  const children = (node.children || []).map((child: any, i: number) =>
    typeof child.text === "string" || child.text === "" ? (
      <Leaf key={i} leaf={child} />
    ) : (
      <Element key={i} node={child} />
    )
  );

  switch (node.type) {
    case "h1":
      return <Typography.H1>{children}</Typography.H1>;
    case "h2":
      return <Typography.H2>{children}</Typography.H2>;
    case "h3":
      return <Typography.H3>{children}</Typography.H3>;
    case "p":
      return <Typography.P>{children}</Typography.P>;
    case "a":
      return (
        <Link href={node.url} target="_blank" rel="noopener noreferrer">
          {children}
        </Link>
      );
    case "ol":
      return <ol>{children}</ol>;
    case "ul":
      return <ul>{children}</ul>;
    case "li":
      return <li>{children}</li>;
    case "lic": // "list item content" in nested Slate structure
      return <Typography.P>{children}</Typography.P>;
    case "media_embed":
      return (
        <div style={{ margin: "1em 0" }}>
          <iframe
            src={node.url}
            width="560"
            height="315"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Embedded media"
          />
        </div>
      );
    case "img":
      return (
        <figure style={{ margin: "1em 0" }}>
          <img
            src={node.url}
            alt={getPlainText(node.caption)}
            style={{
              maxWidth: "100%",
              height: "auto",
              display: "block",
            }}
          />
          {node.caption && (
            <figcaption
              style={{ textAlign: "center", fontSize: "0.9em", color: "#555" }}
            >
              {node.caption.map((c: any, i: number) => (
                <Leaf key={i} leaf={c} />
              ))}
            </figcaption>
          )}
        </figure>
      );
    default:
      return <div>{children}</div>;
  }
}

function Leaf({ leaf }: { leaf: any }) {
  let text = <>{leaf.text}</>;

  if (leaf.bold) text = <strong>{text}</strong>;
  if (leaf.italic) text = <em>{text}</em>;
  if (leaf.underline) text = <u>{text}</u>;
  if (leaf.strikethrough) text = <s>{text}</s>;

  return text;
}

function getPlainText(nodes: any[]): string {
  return nodes
    .map((n: any) => (typeof n.text === "string" ? n.text : ""))
    .join("");
}
