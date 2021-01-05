/*
 *  This file is part of CoCalc: Copyright © 2020 Sagemath, Inc.
 *  License: AGPLv3 s.t. "Commons Clause" – see LICENSE.md for details
 */

// Component that allows WYSIWYG editing of markdown.

/* TODO:

*/

import { SAVE_DEBOUNCE_MS } from "../../code-editor/const";
import { debounce } from "lodash";
import {
  CSS,
  React,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "../../../app-framework";
import { Actions } from "../actions";
import { Node, createEditor } from "slate";
import { Slate, Editable, withReact } from "slate-react";
import { MAX_WIDTH_NUM } from "../../options";
import { use_font_size_scaling } from "../../frame-tree/hooks";

import { slate_to_markdown } from "./slate-to-markdown";
import { markdown_to_slate } from "./markdown-to-slate";
import { Element, Leaf } from "./render";

const STYLE = {
  width: "100%",
  margin: "0 auto",
  padding: "50px 75px",
  border: "1px solid lightgrey",
  background: "white",
} as CSS;

interface Props {
  actions: Actions;
  id: string;
  path: string;
  project_id: string;
  font_size: number;
  read_only: boolean;
  value: string;
  reload_images: boolean;
}

export const EditableMarkdown: React.FC<Props> = ({
  actions,
  font_size,
  value,
}) => {
  const editor = useMemo(() => withMath(withReact(createEditor())), []);
  const lastSavedValueRef = useRef<string>(value);
  const [editor_value, setEditorValue] = useState<Node[]>(
    markdown_to_slate(value)
  );
  const scaling = use_font_size_scaling(font_size);

  const save_value = useCallback((doc) => {
    const new_value: string = slate_to_markdown(doc);
    lastSavedValueRef.current = new_value;
    actions.set_value(new_value);
    actions.ensure_syncstring_is_saved();
  }, []);

  // We don't want to do save_value too much, since it presumably can be slow,
  // especially if the document is large. By debouncing, we only do this when
  // the user pauses typing for a moment. Also, this avoids making too many commits.
  const save_value_debounce = useMemo(
    () => debounce(save_value, SAVE_DEBOUNCE_MS),
    []
  );

  useEffect(() => {
    if (value === lastSavedValueRef.current) {
      // Setting to the value we just saved -- no-op
      return;
    }
    setEditorValue(markdown_to_slate(value));
  }, [value]);

  return (
    <div
      className="smc-vfill"
      style={{ overflowY: "auto", backgroundColor: "#eee" }}
    >
      <div
        style={{
          ...STYLE,
          fontSize: font_size,
          maxWidth: `${(1 + (scaling - 1) / 2) * MAX_WIDTH_NUM}px`,
        }}
      >
        <Slate
          editor={editor}
          value={editor_value}
          onChange={(new_value) => {
            scroll_hack();
            setEditorValue(new_value);
            save_value_debounce(new_value);
          }}
        >
          <Editable
            renderElement={Element}
            renderLeaf={Leaf}
            onBlur={() => {
              // save immediately rather than waiting for the debounced save_value.
              // This is important since the user might edit the codemirror instance
              // immediately before the debounced save_value happens.
              save_value(editor_value);
            }}
          />
        </Slate>
      </div>
    </div>
  );
};

const withMath = (editor) => {
  const { isVoid } = editor;

  editor.isVoid = (element) => {
    return element.type == "math" ? true : isVoid(element);
  };

  return editor;
};

// Scroll the current contenteditable cursor into view if necessary.
// This is needed on Chrome (on macOS) at least, but not with Safari.
// This is similar to https://github.com/ianstormtaylor/slate/issues/1032
function scroll_hack() {
  (window.getSelection()?.focusNode
    ?.parentNode as any)?.scrollIntoViewIfNeeded?.();
}
