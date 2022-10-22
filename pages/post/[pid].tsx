import { useEffect, useState } from "react";
import { handleLogout, useUser } from "../../lib/auth";
import { useRecoilState } from "recoil";
import { newTitleState, editIdState, newDetailState } from "../../lib/atoms";
import { useRouter } from "next/router";
import { db } from "../../lib/firebase";
import {
  doc,
  updateDoc
} from "firebase/firestore";

export default function TodoEdit() {
  const [editId, setEditId] = useRecoilState(editIdState);
  const [newTitle, setNewTitle] = useRecoilState(newTitleState);
  const [newDetail, setNewDetail] = useRecoilState(newDetailState);
  const [userName, setUserName] = useState<any>(null);

  const router = useRouter();
  const user = useUser();

  // getDisplayName(ユーザー名)を表示
  // Nullが変えるとエラーになるので、ログインしていない時はsetUserNameを空にする
  useEffect(() => {
    user !== null ? setUserName(user.displayName) : setUserName("");
  }, [user]);

  const handleCloseEditForm = () => {
    setEditId("");
    router.push("/TodoApp");
  };
  // タイトル編集を保存の元コード
  // const handleEditTodo = () => {
  //   const newArray = todos.map((todo: any) =>
  //     todo.id === editId ? { ...todo, title: newTitle } : todo
  //   );
  //   setTodos(newArray);
  //   setNewTitle("");
  //   handleCloseEditForm();
  // };

  // タイトル編集を保存
  const handleEditTodo = async () => {
    const todoDocumentRef = doc(db, "todos", editId);
    await updateDoc(todoDocumentRef, { title: newTitle, detail: newDetail });
    setNewTitle("");
    setNewDetail("");
    handleCloseEditForm();
  };

  // ここからJSX
  return (
    <>
      <div className="container">
        <div className="header">
          <span className="header-logo">TODO</span>
          <div className="header-right">
            <span className="name">{userName}</span>
            <button className="common-button" onClick={handleLogout}>
              Log Out
            </button>
          </div>
        </div>
        <ul className="form todoApp">
          <li className="form-item">
            <label>タイトル編集</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              autoFocus={true}
            />
          </li>
          <li className="form-item">
            <label>詳細編集</label>
            <textarea
              value={newDetail}
              onChange={(e: any) => setNewDetail(e.target.value)}
            ></textarea>
          </li>
          <div className="filteringButtonArea save">
            <button className="filteringButton" onClick={handleEditTodo}>
              編集を保存
            </button>
            <button className="filteringButton" onClick={handleCloseEditForm}>
              キャンセル
            </button>
          </div>
        </ul>
      </div>
    </>
  );
}
