// すべてのページコンポーネントの初期化に使われるコンポーネント。
// すべてのページで共通な処理などを書くことができる。
import { useEffect } from "react";
import "../styles/globals.scss";
import type { AppProps } from "next/app";
// 対象スコープの外側をRecoilRootコンポーネントで囲むことでStateを使用できる。
import { RecoilRoot } from "recoil";
import { useAuth, useUser } from "../lib/auth";
import { useRouter } from "next/router";

type Props = {
  children: JSX.Element;
};

const Auth = ({ children }: Props): JSX.Element => {
  // Authコンポーネントを使用しているMyAppをexportするので、関数内に記述する。
  const router = useRouter();
  const user = useUser();

  // useEffectは初回レンダリング時も実行される
  useEffect(() => {
    if (user === null) {
      router.push("/");
    }
  }, [user]);

  const isLoading = useAuth();
  return isLoading ? (
    <div className="loading">
      <p>Loading...</p>
    </div>
  ) : (
    children
  );
};

function MyApp({ Component, pageProps }: AppProps) {
  return (
    // useAuth() は <RecoilRoot> の子孫コンポーネントでしか使用できないので <Auth> コンポーネントを作成し, その中で使用している
    <RecoilRoot>
      <Auth>
        <Component {...pageProps} />
      </Auth>
    </RecoilRoot>
  );
}

export default MyApp;
