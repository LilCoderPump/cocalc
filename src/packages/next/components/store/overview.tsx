/*
 *  This file is part of CoCalc: Copyright © 2022 Sagemath, Inc.
 *  License: AGPLv3 s.t. "Commons Clause" – see LICENSE.md for details
 */

import { Icon } from "@cocalc/frontend/components/icon";
import A from "components/misc/A";
import SiteName from "components/share/site-name";
import {
  OverviewRow,
  OVERVIEW_LARGE_ICON,
  OVERVIEW_STYLE,
  Product,
} from "lib/styles/layouts";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Overview() {
  const router = useRouter();

  // most likely, user will go to the cart next
  useEffect(() => {
    router.prefetch("/store/site-license");
  }, []);

  return (
    <div style={OVERVIEW_STYLE}>
      <Icon style={OVERVIEW_LARGE_ICON} name="shopping-cart" />

      <h2 style={{ marginBottom: "30px" }}>
        Welcome to the <SiteName /> Store!
      </h2>

      <OverviewRow>
        <Product
          icon="key"
          title="Site License Upgrade"
          href="/store/site-license"
        >
          Upgrade your project, remove the warning banner, get internet access,
          more CPU and Memory, etc.
        </Product>
        <Product icon="rocket" title="License Booster" href="/store/boost">
          Add additional upgrades to an existing license.
        </Product>
        <Product
          href={"/store/dedicated?type=disk"}
          icon="save"
          title="Dedicated Disk"
        >
          Add local storage to your project.
        </Product>
        <Product
          href={"/store/dedicated?type=vm"}
          icon="dedicated"
          title="Dedicated VM"
        >
          Move your project to a much more powerful VM.
        </Product>
      </OverviewRow>
      <div style={{ marginTop: "4em" }}>
        If you already selected one or more items, view your{" "}
        <A href="/store/cart">shopping cart</A> or go straight to{" "}
        <A href="/store/checkout">checkout</A>.
      </div>
      <p>
        You can also browse your <A href="/billing">billing records</A> or{" "}
        <A href="/licenses">licenses</A>.
      </p>
    </div>
  );
}
