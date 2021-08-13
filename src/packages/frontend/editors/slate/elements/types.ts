/*
 *  This file is part of CoCalc: Copyright © 2020 Sagemath, Inc.
 *  License: AGPLv3 s.t. "Commons Clause" – see LICENSE.md for details
 */

// Register all the types.

// The order of registering these does NOT matter and has no
// impact on semantics or speed.

// IMPORTANT: You must import the entire module **and** separately import
// the type; otherwise the code in the module to register it is not run.

import "./elements.css";

import type { Meta } from "./meta";
import "./meta/editable";

import type { Checkbox } from "./checkbox";
import "./checkbox/editable";

import type { Emoji } from "./emoji";
import "./emoji";

import type { Hashtag } from "./hashtag";
import "./hashtag";

import type { HR } from "./hr";
import "./hr";

import type { Paragraph } from "./paragraph";
import "./paragraph/editable";

import type { CodeBlock } from "./code-block";
import "./code-block/editable";

import type { Hardbreak, Softbreak } from "./break";
import "./break/editable";

import type { DisplayMath, InlineMath } from "./math";
import "./math/editable";

import type { Heading } from "./heading";
import "./heading/editable";

import type { HtmlBlock, HtmlInline } from "./html";
import "./html";

import type { Mention } from "./mention";
import "./mention";

import type { Table, THead, TBody, TR, TD, TH } from "./table";
import "./table";

import type { BlockQuote } from "./blockquote";
import "./blockquote";

import type { Link } from "./link";
import "./link";

import type { Image } from "./image";
import "./image";

import type { ListItem } from "./list/list-item";
import "./list/editable-list-item";

import type { BulletList, OrderedList } from "./list";
import "./list/editable-list";

import type { Generic } from "./generic";
import "./generic";

import type { Marks } from "../markdown-to-slate/handle-marks";

declare module "slate" {
  export interface CustomTypes {
    Element:
      | Meta
      | Checkbox
      | Emoji
      | Hashtag
      | HR
      | Paragraph
      | CodeBlock
      | Hardbreak
      | Softbreak
      | DisplayMath
      | InlineMath
      | Heading
      | HtmlBlock
      | HtmlInline
      | Mention
      | Table
      | THead
      | TBody
      | TR
      | TD
      | TH
      | BlockQuote
      | Link
      | Image
      | ListItem
      | BulletList
      | OrderedList
      | Generic;
    Text: Marks;
  }
}

import { Element } from "slate";

export function isElementOfType(x, type: string | string[]): boolean {
  return (
    Element.isElement(x) &&
    ((typeof type == "string" && x["type"] == type) ||
      (typeof type != "string" && type.indexOf(x["type"]) != -1))
  );
}
