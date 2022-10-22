import { useState, useEffect } from "react";
import { auth } from "../lib/firebase";
import { pattern } from "../constants/constants";
import { handleLoginGoogle, useUser } from "../lib/auth";
import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import useSnackbar from "../lib/useSnackbar";
import { Modal } from "@material-ui/core";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";

const Home: NextPage = () => {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const { setMessage, AlertSnackbar } = useSnackbar();
  const [openModal, setOpenModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  // exportするコンポーネントの中で使用するときは、コンポーネント内に書く。
  const router = useRouter();
  // auth.tsのuseUser関数を以下のuserで実行することにより、現在のユーザー情報を取得できる。
  // DisplayName,uid,email...など様々な情報が入る
  const user = useUser();

//  ログインするとアプリへ遷移
// useEffectは初回レンダリング時も実行される
  useEffect(() => {
    if (user !== null) {
      router.push("./TodoApp");
    }
  }, [user]);

  const handleLoginEmail = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    // data.getはinputのname属性を指定する
    const email =
      data.get("loginEmail") !== null ? data.get("loginEmail")!.toString() : "";
    const password =
      data.get("loginPassword") !== null ? data.get("loginPassword")!.toString() : "";

    if (email === "") {
      setMessage("メールアドレスが入力されていません");
      return;
    }
    if (!pattern.test(email)) {
      setMessage("メールアドレスに不正な値が入力されています");
      return;
    }
    if (password === "") {
      setMessage("パスワードが入力されていません");
      return;
    }
    if (password.length < 6) {
      setMessage("パスワードが6文字以上入力されていません");
      return;
    }
    if (password === password.slice(0, 1).repeat(password.length)) {
      setMessage("パスワードが全て同じ文字です");
      return;
    }
    signInWithEmailAndPassword(auth, loginEmail, loginPassword)
      // 引数に登録情報を受け取れる
      .then(() => {
        alert("ログインに成功しました");
        setLoginEmail("");
        setLoginPassword("");
      })
      .catch((error) => {
        const errorCode = error.code;

        switch (errorCode) {
          case "auth/cancelled-popup-request":
          case "auth/popup-closed-by-user":
            return;
          case "auth/email-already-in-use":
            setMessage("このメールアドレスは使用されています");
            return;
          case "auth/invalid-email":
            setMessage("メールアドレスの形式が正しくありません");
            return;
          case "auth/user-disabled":
            setMessage("サービスの利用が停止されています");
            return;
          case "auth/user-not-found":
            setMessage("メールアドレスまたはパスワードが違います");
            return;
          case "auth/user-mismatch":
            setMessage(
              "認証されているユーザーと異なるアカウントが選択されました"
            );
            return;
          case "auth/weak-password":
            setMessage("パスワードは6文字以上にしてください");
            return;
          case "auth/wrong-password":
            setMessage("メールアドレスまたはパスワードが違います");
            return;
          case "auth/popup-blocked":
            setMessage(
              "認証ポップアップがブロックされました。ポップアップブロックをご利用の場合は設定を解除してください"
            );
            return;
          case "auth/operation-not-supported-in-this-environment":
          case "auth/auth-domain-config-required":
          case "auth/operation-not-allowed":
          case "auth/unauthorized-domain":
            setMessage("現在この認証方法はご利用頂けません");
            return;
          case "auth/requires-recent-login":
            setMessage("認証の有効期限が切れています");
            return;
          default:
            setMessage(
              "認証に失敗しました。しばらく時間をおいて再度お試しください"
            );
            return;
        }
      });
  };

  // パスワードリセット(forgat password)
  const sendResetEmail = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await sendPasswordResetEmail(auth, resetEmail)
      .then(() => {
        setMessage("送信完了しました");
        setOpenModal(false);
        setResetEmail("");
      })
      .catch(() => {
        if (resetEmail === "") {
          setMessage("メールアドレスが入力されていません");
          return;
        }
        if (!pattern.test(resetEmail)) {
          setMessage("メールアドレスに不正な値が入力されています");
          return;
        }
        alert("メールを送信できません");
        setResetEmail("");
      });
  };

  return (
    <>
      <Head>
        <title>Todoアプリ</title>
      </Head>
      <div className="container">
        <form className="" onSubmit={handleLoginEmail}>
          <span className="pageTitle">LOGIN</span>
          <ul className="form">
            <li className="form-item">
              <label>Email Address</label>
              <input
                name="loginEmail"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
            </li>
            <li className="form-item">
              <label>Password</label>
              <input
                name="loginPassword"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
            </li>
          </ul>
          {/* <button className="submitButton mail" onClick={handleLoginEmail}> */}
          <button className="submitButton mail">
            LOGIN
          </button>
          <div className="login-items">
            <span className="pointer" onClick={() => setOpenModal(true)}>
              <a>Forgot password?</a>
            </span>
            <Link href="./Register">
              <a>Create new account ?</a>
            </Link>
          </div>
          <AlertSnackbar />
        </form>
        <button className="submitButton google" onClick={handleLoginGoogle}>
          Login with Google
        </button>
      </div>
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <form className="modal" onSubmit={sendResetEmail}>
          <div className="">
            <label>
              パスワード再設定ページのURLをお送りするメールアドレスをご入力ください。
            </label>
            <input
              name="email"
              value={resetEmail}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setResetEmail(e.target.value);
              }}
            />
            <button className="submitButton submit">Send</button>
          </div>
        </form>
      </Modal>
    </>
  );
};
export default Home;
