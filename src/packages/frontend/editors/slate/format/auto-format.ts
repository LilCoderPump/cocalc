/*
 *  This file is part of CoCalc: Copyright © 2020 Sagemath, Inc.
 *  License: AGPLv3 s.t. "Commons Clause" – see LICENSE.md for details
 */


import { withInsertText } from "./insert-text";
import { withDeleteBackward } from "./delete-backward";
import { SlateEditor } from "../editable-markdown";
import { Editor, Operation, Transforms, Path, Point, Text } from "slate";
import { len } from "@cocalc/util/misc";
import { markdown_to_slate } from "../markdown-to-slate";
import { applyOperations } from "../operations";
import { slateDiff } from "../slate-diff";
import { getRules } from "../elements";
import { ReactEditor } from "../slate-react";
import { formatHeading, setSelectionAndFocus } from "./commands";

export const withAutoFormat = (editor) => {
  withInsertText(editor);
  withDeleteBackward(editor);

  return editor;
};


// Use conversion back and forth to markdown to autoformat
// what is right before the cursor in the current text node.
// Returns true if autoformat actually happens.
export function markdownAutoformat(editor: SlateEditor): boolean {
  const { selection } = editor;
  if (!selection) return false;
  const [node] = Editor.node(editor, selection.focus.path);

  // Must be a text node
  if (!Text.isText(node)) return false;

  // If we wanted the format to always be undo-able.
  // editor.saveValue(true);

  let r: boolean | Function = false;
  try {
    Editor.withoutNormalizing(editor, () => {
      editor.apply({
        type: "split_node",
        path: selection.focus.path,
        position: selection.focus.offset,
        properties: node, // important to preserve text properties on split (seems fine to leave text field)
      });
      r = markdownAutoformatAt(editor, selection.focus.path);
    });
  } catch (err) {
    console.warn(`SLATE -- issue in markdownAutoformat ${err}`);
  }

  if (typeof r == "function") {
    // code to run after normalizing.
    // @ts-ignore
    r();
    r = true;
  }
  return r;
}

// Use conversion back and forth to markdown to autoformat
// what is in the current text node.
function markdownAutoformatAt(
  editor: SlateEditor,
  path: Path
): boolean | Function {
  const [node] = Editor.node(editor, path);
  // Must be a text node
  if (!Text.isText(node)) return false;
  const pos = path[path.length - 1]; // position among siblings.

  // Find the first whitespace from the end after triming whitespace.
  // This is what we autoformat on by default, since it is the most predictable,
  // and doesn't suddenly do something with text earlier in the node
  // that the user already explicitly decided not to autoformat.
  // NOTE that there are several cases below where we move start back though,
  // e.g., checkboxes that are written using "[ ]".
  let text = node.text;
  if (text.endsWith(" ")) {
    // do not autoformat if there is already whitespace at the end, e.g., maybe
    // user chose not to autoformat this earlier.
    return false;
  }
  let start = text.lastIndexOf(" ", text.trimRight().length - 1);

  // Special case some block level formatting (for better handling and speed).
  if (path.length == 2 && pos == 0 && start <= 0) {
    switch (text) {
      case "#":
      case "##":
      case "###":
      case "####":
      case "#####":
      case "######":
        // This could sets the block containing the selection
        // to be formatted with exactly the right heading.
        formatHeading(editor, text.length);
        // However, because we just typed some hashes to get this
        // to happen, we need to delete them.  But this has to wait
        // until after normalize, and this whole function is run
        // in a withoutNormalizing block, so we return some code to
        // run afterwards.
        return () => editor.deleteBackward("word");
    }
  }

  // However, there are some cases where we extend the range of
  // the autofocus further to the left from start:
  //    - "[ ]" for checkboxes.
  //    - "[link text](url)", since link text may have spaces in it.
  //    - formatting, e.g., "consider `foo bar`".
  //    - NOTE: I'm not allowing for space in  math formulas ($ or $$) here,
  //      since it is very annoying if you trying to type USD amounts. A
  //      workaround is create the inline formula with no spaces, then edit it.
  const text0 = text.trimRight();
  if (text0.endsWith(")") && text0.includes("[") && text0.includes("](")) {
    // may be a link such as [link text](url):
    const i = text.lastIndexOf("[");
    if (i != -1) {
      start = Math.min(i - 1, start);
    }
  } else if (text0.endsWith("]") && text0.includes("[")) {
    const i = text.lastIndexOf("[");
    if (i != -1) {
      start = Math.min(i - 1, start);
    }
  } else {
    // The text formatting markers and *also* math formatting.
    // Note that $$ is first since $ would match it.
    for (const delim of ["`", "**", "*", "_", "~~", "$$", "$"]) {
      if (text0.endsWith(delim)) {
        const i = text.lastIndexOf(delim, text0.length - delim.length - 1);
        if (i != -1) {
          start = Math.min(i - 1, start);
          break;
        }
      }
    }
  }

  text = text.slice(start + 1).trim();
  if (text.length == 0) return false;

  // make a copy to avoid any caching issues (??).
  const doc = [...(markdown_to_slate(text, true) as any)];
  // console.log(`autoformat '${text}' = \n`, JSON.stringify(doc, undefined, 2));

  if (
    doc.length == 1 &&
    doc[0].type == "paragraph" &&
    doc[0].children.length == 1 &&
    Text.isText(doc[0].children[0]) &&
    doc[0].children[0].text.trim() == text.trim()
  ) {
    // No "auto format" action since no real change.
    return false;
  }

  const isInline =
    doc.length == 1 &&
    doc[0].type == "paragraph" &&
    Text.isText(doc[0].children[0]);

  if (!isInline) {
    if (start > 0 || pos > 0) {
      return false;
    }
  }

  // **INLINE CASE**
  if (isInline) {
    const children = doc[0].children;
    if (start != -1) {
      if (children[0]["text"] === "") {
        // In case the first node in children is empty text, remove that,
        // since otherwise it will get normalized away after doing this,
        // and that throws the cursor computation off below, causing a crash.
        children.shift();
      }
      // Add text from before starting point back, since we excluded it above.
      const first = { ...node };
      first.text = node.text.slice(0, start + 1);
      children.unshift(first);
    }
    // Add a space at the end.
    if (
      len(children[children.length - 1]) == 1 &&
      children[children.length - 1]["text"] != null
    ) {
      // text node with NO marks, i.e., it is plain text.
      children[children.length - 1]["text"] += " ";
    } else {
      // last node has marks so we append another node.
      children.push({ text: " " });
    }

    // Find a sequence of operations that converts our input
    // text node into the new list of inline nodes.
    const operations = slateDiff(
      [node],
      children,
      path.slice(0, path.length - 1)
    );

    // Adjust the last entry in path for each operation computed
    // above to account for fact that node might not be first sibling.
    for (const op of operations) {
      shift_path(op, pos);
    }

    applyOperations(editor, operations);
    // Move the cursor to the right position.
    const new_path = [...path];
    new_path[new_path.length - 1] += children.length - 1;
    const new_cursor = {
      offset: children[children.length - 1]["text"].length,
      path: new_path,
    };
    focusEditorAt(editor, new_cursor);
  } else {
    // **NON-INLINE CASE**
    // Remove the node with the text that we're autoformatting
    // so the new doc replaces it.  NOTE that doing this works
    // **much** better than selecting the corresponding text
    // and letting insertNodes take care of it.
    Transforms.removeNodes(editor, { at: path });
    Transforms.insertNodes(editor, doc);

    // Normally just move the cursor beyond what was just
    // inserted, though sometimes it makes more sense to
    // focus it.
    const type = doc[0].type;
    const rules = getRules(type);
    if (!rules?.autoFocus) {
      // move cursor out of the newly created block element.
      Transforms.move(editor, { distance: 1 });
    }
    if (rules?.autoAdvance) {
      setSelectionAndFocus(editor, {
        focus: { path, offset: 0 },
        anchor: { path, offset: 0 },
      });
      setTimeout(() => {
        Transforms.move(editor, { distance: 1, unit: "line" });
      }, 0);
    }
  }
  return true;
}

function shift_path(op: Operation, shift: number): void {
  const path = [...op["path"]];
  path[path.length - 1] += shift;
  op["path"] = path;
}


// This is pretty scary, but I need it especially in the weird case
// where you insert a checkbox in an empty document and everything
// loses focus.
// This is a SCARY function..
export function focusEditorAt(editor: ReactEditor, point: Point): void {
  setSelectionAndFocus(editor, { focus: point, anchor: point });
}
