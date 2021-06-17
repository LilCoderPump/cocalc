/*
 *  This file is part of CoCalc: Copyright © 2020 Sagemath, Inc.
 *  License: AGPLv3 s.t. "Commons Clause" – see LICENSE.md for details
 */

/*
Utility functions useful for frame-tree editors.
*/

import { path_split, separate_file_extension } from "smc-util/misc";
export { aux_file } from "smc-util/misc";
import { join } from "path";

export function parse_path(path: string): {
  directory: string;
  base: string;
  filename: string;
} {
  const x = path_split(path);
  const y = separate_file_extension(x.tail);
  return { directory: x.head, base: y.name, filename: x.tail };
}

/* Declare to Typescript that window has an extra app_base_path
   string param, so we don't have to write (window as any).app_base_path */

declare global {
  interface Window {
    app_base_path: string;
  }
}

export function raw_url(project_id: string, path: string): string {
  return join(window.app_base_path, project_id, "raw", path);
}
