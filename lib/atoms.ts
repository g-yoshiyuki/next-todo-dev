// ※以下のコードはatomを定義しているだけ。
// 値を使う場合は、useRecoilState,useRecoilValue, useSetRecoilStateを使用する。

import { atom } from "recoil";
import { UserState } from "./auth";
// 値の永続化ライブラリ
import { recoilPersist } from "recoil-persist";

const { persistAtom } = recoilPersist({
  key: "recoil-persist",
  storage: typeof window === "undefined" ? undefined : sessionStorage,
});

// ※effects_UNSTABLE: [persistAtom]
// 値を永続化させるために必要な記述

// 認証するユーザを保持する
// ユーザがログインしている場合は User, ログインしていない場合は null
export const userState = atom<UserState>({
  key: "userState",
  default: null,
  // stateの値が変更されたときにstateを使用しているコンポーネントに適切に通知する
  dangerouslyAllowMutability: true,
  effects_UNSTABLE: [persistAtom],
});

// todoステート
// 値の永続化はできるが、ユーザーとの紐付けはできない
export const todoListState = atom({
  key: "todos",
  default: [],
  effects_UNSTABLE: [persistAtom],
});

export const newTitleState = atom({
  key: "newTitle",
  default: "",
});

export const newDetailState = atom({
  key: "newDetail",
  default: "",
});

export const editIdState = atom({
  key: "editId",
  default: "",
});

export const usernameState = atom({
  key: "username",
  default: "",
});

