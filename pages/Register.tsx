import { useState, useEffect } from "react";
import { auth } from "../lib/firebase";
import { pattern } from "../constants/constants";
import { handleLoginGoogle, useUser } from "../lib/auth";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import useSnackbar from "../lib/useSnackbar";
import { Modal } from "@material-ui/core";
import {
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { useRecoilState } from "recoil";
import { usernameState } from "../lib/atoms";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // const [username, setUsername] = useState("");
  const { setMessage, AlertSnackbar } = useSnackbar();
  const [openModal, setOpenModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [username, setUsername] = useRecoilState<any>(usernameState);
  const router = useRouter();
  const user = useUser();

  //  ログインするとアプリへ遷移
  // useEffectは初回レンダリング時も実行される
  useEffect(() => {
    if (user !== null) {
      router.push("./TodoApp");
    }
  }, [user]);
  // Eメールパスワード登録が成功したときに、
  // setUsername(userName);を実行してTodoApp.tsxでユーザー名を表示させているので、
  // ログアウトしたときにinputにユーザー名が残らないように初期化する。
  useEffect(() => {
    if (user === null) {
      setUsername("");
    }
  }, [user]);

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

  // ユーザー情報を登録する
  // formタグにonSubmitを指定しているときはeventの型をReact.FormEvent<HTMLFormElement>にする。buttonタグにonClickを指定するとエラーになる。
  const handleRegisterEmail = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    // data.getはinputのname属性を指定する
    const userName =
      // ビックリマークが後ろについているのは、undefinedやnullになることはありません、と教える記述
      // エラー回避
      data.get("username") !== null ? data.get("username")!.toString() : "";
    const email =
      data.get("email") !== null ? data.get("email")!.toString() : "";
    const password =
      data.get("password") !== null ? data.get("password")!.toString() : "";

    if (userName === "") {
      setMessage("ユーザーネームが入力されていません");
      return;
    }
    if (userName.length >= 15) {
      setMessage("ユーザーネームは15文字以上入力できません");
      return;
    }
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
   createUserWithEmailAndPassword(auth, email, password)
      // 引数に登録情報を受け取れる
      .then((authUser) => {
        // 登録が成功したら、authUserオブジェクトの中にある、
        // ユーザープロパティのdisplayNameに入力したユーザー名を設定。
        //  おそらく、updateProfileの反映が間に合っていないため、
        //  TodoApp.tsxでのユーザー名表示がされない。
        //  そのためにusernameをatomで管理し、setUsername(userName);を実行している。
        if (authUser.user) {
          updateProfile(authUser.user, {
            displayName: userName,
          });
        }
        alert("サインアップが完了しました");
        // setUsername("");
        setEmail("");
        setPassword("");
        setUsername(userName);
        router.push("./TodoApp");

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
          case "auth/weak-password":
            setMessage("パスワードは6文字以上にしてください");
            return;
          default:
            setMessage(
              "登録に失敗しました。しばらく時間をおいて再度お試しください"
            );
            return;
        }
      });
  };

  return (
    <>
      <Head>
        <title>Todoアプリ</title>
      </Head>
      <div className="container">
        <form className="" onSubmit={handleRegisterEmail}>
          <span className="pageTitle">REGISTER</span>
          <ul className="form">
            <li className="form-item">
              <label>Username</label>
              <input
                name="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </li>
            <li className="form-item">
              <label>Email Address</label>
              <input
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </li>
            <li className="form-item">
              <label>Password</label>
              <input
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </li>
          </ul>
          <button className="submitButton mail">REGISTER</button>
          <div className="login-items">
            <span className="pointer" onClick={() => setOpenModal(true)}>
              Forgot password?
            </span>
            <Link href="/">
              <a>Back to login</a>
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
}
