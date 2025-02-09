/*
 *  This file is part of CoCalc: Copyright © 2020 Sagemath, Inc.
 *  License: AGPLv3 s.t. "Commons Clause" – see LICENSE.md for details
 */

/* Open ~/.snapshots directory.

- We call this Backups
- We will rewite this component with something better that gives
  just links to the info from backups about *this* file.
*/

import { Rendered, Component } from "../../app-framework";
import { Button } from "react-bootstrap";
import { TimeTravelActions } from "./actions";
import { Icon } from "../../components";
import track from "@cocalc/frontend/user-tracking";

interface Props {
  actions: TimeTravelActions;
}

export class OpenSnapshots extends Component<Props> {
  public render(): Rendered {
    return (
      <Button
        onClick={() => {
          this.props.actions.open_snapshots();
          track("snapshots", { action: "open", where: "time-travel" });
        }}
        title={
          "Open the filesystem snapshots of this project, which may also be helpful in recovering past versions."
        }
      >
        <Icon name={"life-ring"} /> Backups
      </Button>
    );
  }
}
