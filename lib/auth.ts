import { useEffect, useState } from "react";
import { auth } from "../lib/firebase";
import { useSetRecoilState, useRecoilValue } from "recoil";
import { userState } from "../lib/atoms";
import { User } from "firebase/auth";
import {
  onAuthStateChanged,
  // signInWithRedirect,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";

// ユーザ認証を監視するための関数(ローディングを出力する関数)
export const useAuth = (): boolean => {
  const [isLoading, setIsLoading] = useState(true);
  // useSetRecoilStateはセッター関数のみを取り出す
  // 以下のonAuthStateChangedでsetUserにuserを追加するためにセッター関数を取り出している
  const setUser = useSetRecoilState(userState);

  // useEffectは初回レンダリング時も実行される
  useEffect(() => {
    // onAuthStateChangedはログイン状態を監視する。
    // 引数のauthを参照して、変更があった場合実行される
    // 引数のuserには、変化後のユーザー情報が入る
    return onAuthStateChanged(auth, (user) => {
      // 変化後のユーザー情報をatomに追加する
      setUser(user);
      setIsLoading(false);
    });
  }, [setUser]);
  return isLoading;
};


// ※useAuthはtrueかfalseのisLoadingを返して、
// atomのstateにログインしたユーザー情報を追加する関数。
// firebaseにユーザー情報を登録するとともに、recoilにも反映させる必要がある。
// ログイン時も登録時もユーザー認証が変更されるので、別ファイルで管理している

// Googleログイン
// リダイレクトで認証を行うコード。
// Vercelでデプロイするとエラーが起こった。
// const loginGoogle = (): Promise<void> => {
//   const provider = new GoogleAuthProvider();
//   return signInWithRedirect(auth, provider);
// };
// export const handleLoginGoogle = (): void => {
//   loginGoogle().catch((error) => console.error(error));
// };

// Googleログイン
// firebaseのAuthentication→setting→承認済みログインから、公開URLを登録する必要がある
export const handleLoginGoogle = async () => {
  const provider = new GoogleAuthProvider();
  await signInWithPopup(auth, provider).catch((err) => alert(err.message));
};



// Invalid hook call.エラーが出たコード
// router.pushに対してエラーが起こる
// const useLoginPush = ()=> {
//   const router = useRouter()
//   return  router.push('/TodoApp');
// }
// export const handleLoginGoogle = async () => {
//   const provider = new GoogleAuthProvider();
//   await signInWithPopup(auth, provider).then(() => {
//     useLoginPush();
//   }).catch((err) => alert(err.message));
// };


// authからログアウト
const logout = (): Promise<void> => {
  return signOut(auth);
};
export const handleLogout = (): void => {
  logout().catch((error) => console.error(error));
};


// nullか、ユーザー情報(DisplayName,uid,email...など)が入る
export type UserState = User | null;
// ユーザー情報を他のコンポーネントで呼び出すための関数。
// useRecoilValueを使うことで値を渡すことができる。
// 値の変更はできない。
export const useUser = (): UserState => {
  return useRecoilValue(userState);
};
