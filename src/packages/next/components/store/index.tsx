/*
 *  This file is part of CoCalc: Copyright © 2022 Sagemath, Inc.
 *  License: AGPLv3 s.t. "Commons Clause" – see LICENSE.md for details
 */

import { unreachable } from "@cocalc/util/misc";
import { COLORS } from "@cocalc/util/theme";
import { Alert, Layout } from "antd";
import Anonymous from "components/misc/anonymous";
import Loading from "components/share/loading";
import SiteName from "components/share/site-name";
import { MAX_WIDTH } from "lib/config";
import useProfile from "lib/hooks/profile";
import useCustomize from "lib/use-customize";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Boost from "./boost";
import Cart from "./cart";
import Checkout from "./checkout";
import Congrats from "./congrats";
import DedicatedResource from "./dedicated";
import Menu from "./menu";
import Overview from "./overview";
import SiteLicense from "./site-license";
import { StoreInplaceSignInOrUp } from "./store-inplace-signup";

const { Content } = Layout;

interface Props {
  page: (
    | "site-license"
    | "boost"
    | "dedicated"
    | "cart"
    | "checkout"
    | "congrats"
    | undefined
  )[];
}

export default function StoreLayout({ page }: Props) {
  const { isCommercial } = useCustomize();
  const router = useRouter();
  const profile = useProfile({ noCache: true });

  useEffect(() => {
    router.prefetch("/store/site-license");
  }, []);

  function renderNotCommercial(): JSX.Element {
    return (
      <Alert
        showIcon
        style={{
          margin: "30px auto",
          maxWidth: "400px",
          fontSize: "12pt",
          padding: "15px 30px",
        }}
        type="warning"
        message={
          <>
            The <SiteName /> store is not enabled.
          </>
        }
      />
    );
  }

  if (!isCommercial) {
    return renderNotCommercial();
  }

  if (!profile) {
    return <Loading large center />;
  }
  const { account_id, is_anonymous } = profile;
  const noAccount = account_id == null;

  // wrapper, only the pages showing the prices will be shown to the general public or anonymous users
  function requireAccount(StorePage): JSX.Element {
    if (noAccount) {
      return (
        <Alert
          style={{ margin: "15px auto" }}
          type="warning"
          message={<StoreInplaceSignInOrUp />}
        />
      );
    }

    return <StorePage />;
  }

  const [main] = page;

  function body() {
    if (main == null) return <Overview />;

    if (is_anonymous) {
      return <Anonymous />;
    }

    switch (main) {
      case "site-license":
        return <SiteLicense noAccount={noAccount} />;
      case "boost":
        return <Boost noAccount={noAccount} />;
      case "dedicated":
        return <DedicatedResource noAccount={noAccount} />;
      case "cart":
        return requireAccount(Cart);
      case "checkout":
        return requireAccount(Checkout);
      case "congrats":
        return requireAccount(Congrats);
      default:
        unreachable(main);
    }
  }

  // this layout is the same as ../licenses/layout.tsx and ../billing/layout.tsx
  function renderMain(): JSX.Element {
    return (
      <Layout
        style={{
          padding: "0 24px 24px",
          backgroundColor: "white",
          color: COLORS.GRAY_D,
        }}
      >
        <Content
          style={{
            margin: 0,
            minHeight: "60vh",
          }}
        >
          <div style={{ maxWidth: MAX_WIDTH, margin: "auto" }}>
            <Menu main={main} />
            {body()}
          </div>
        </Content>
      </Layout>
    );
  }

  return renderMain();
}
