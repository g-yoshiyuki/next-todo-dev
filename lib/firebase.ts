import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// .envに設定した環境変数を読み込む
// firebaseに登録したアプリ情報を読み込み初期化する
import { initializeApp } from "firebase/app";

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);

// appはfirebaseに登録したアプリ。アプリに登録されている認証情報をgetする
// 一度ログインするとfirebaseのUsersに情報が保管されている
export const auth = getAuth(app);
export const db = getFirestore(app);