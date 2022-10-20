import { useEffect, useState } from "react";
import { handleLogout, useUser } from "../lib/auth";
import { useRouter } from "next/router";
import { useRecoilState } from "recoil";
import {
  todoListState,
  newTitleState,
  newDetailState,
  editIdState,
  usernameState,
} from "../lib/atoms";

import { db } from "../lib/firebase";
import {
  doc,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  where,
  getDocs,
  query,
  onSnapshot,
} from "firebase/firestore";

export default function TodoApp() {
  const [todos, setTodos] = useRecoilState(todoListState);
  const [todoTitle, setTodoTitle] = useState<any>("");
  const [todoDetail, setTodoDetail] = useState<any>("");
  const [todoId, setTodoId] = useState<any>(todos.length + 1);
  const [editId, setEditId] = useRecoilState(editIdState);
  const [newTitle, setNewTitle] = useRecoilState(newTitleState);
  const [newDetail, setNewDetail] = useRecoilState(newDetailState);
  const [filter, setFilter] = useState<any>("selected");
  const [filteredTodos, setFilteredTodos] = useState<any>([]);
  const [deadline, setDeadline] = useState<any>("なし");
  const [username, setUsername] = useRecoilState<any>(usernameState);
  const router = useRouter();
  const user = useUser();

  const StatusOptions = [
    { value: "notStarted", text: "未着手" },
    { value: "inProgress", text: "作業中" },
    { value: "done", text: "完了" },
  ];

  // getDisplayName(ユーザー名)を表示
  // Register.tsxからメールパスワード登録を行うと、userはnullにならないが、
  // updateProfileで更新したユーザー名の反映が間に合わず、nullになってしまう。
  // 下記はGoogle認証でログインしたときにユーザー名を表示させるためのコード。
  useEffect(() => {
    user !== null && user.displayName !== null && setUsername(user.displayName);
  }, [user]);

  // ※コード変更後は、データベースに入力値を送ってから
  // onSnapshotによってローカルのuseStateに値を反映させる流れになっている

  // todo作成の元コード
  // const handleAddTodo = () => {
  //   setTodos([
  //     {
  //       id: todoId,
  //       title: todoTitle,
  //       status: "notStarted",
  //       deadline: deadline,
  //     },
  //     ...todos,
  //   ]);
  //   setTodoId(todoId + 1);
  //   setTodoTitle("");
  //   setDeadline("なし");
  // };

  // ここから追記コード
  // ログインしたユーザーが作成したtodoのみを表示
  const userByTodos = todos.filter((todo: any) => todo.username === username);
  // todo作成
  const handleAddTodo = () => {
    addDoc(collection(db, "todos"), {
      id: todoId,
      title: todoTitle,
      detail: todoDetail,
      status: "notStarted",
      deadline: deadline,
      username: user!.displayName,
    });
    setTodoId(todoId + 1);
    setTodoTitle("");
    setTodoDetail("");
    setDeadline("なし");
  };
  // todo削除
  // 引数のidは削除ボタンを押したときに取得するtodo.id。
  // クエリーの検索条件をwhereで指定
  // dbから削除することで、下記のuseEffectでsetTodosに新しいデータが格納される。さらにtodoが変更されることでuseEffectのfilteringTodosが走り、新しくフィルタリングされたtodoが表示される。
  const deleteTodo = async (id: any) => {
    const todoCollectionRef = collection(db, "todos");
    const q = query(todoCollectionRef, where("id", "==", id));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (document) => {
      const todoDocumentRef = doc(db, "todos", document.id);
      await deleteDoc(todoDocumentRef);
    });
  };
  // ステータス変更
  const handleStatusChange = async (id: string, e: any) => {
    const newStatus = e.target.value;
    const todoCollectionRef = collection(db, "todos");
    const q = query(todoCollectionRef, where("id", "==", id));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (document) => {
      const todoDocumentRef = doc(db, "todos", document.id);
      await updateDoc(todoDocumentRef, { status: newStatus });
    });
  };
  // 期限変更
  const deadlineChange = async (id: string, e: any) => {
    const newDeadline = e.target.value;
    const todoCollectionRef = collection(db, "todos");
    const q = query(todoCollectionRef, where("id", "==", id));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (document) => {
      const todoDocumentRef = doc(db, "todos", document.id);
      await updateDoc(todoDocumentRef, { deadline: newDeadline });
    });
  };

  useEffect(() => {
    const q = query(collection(db, "todos"));
    // onSnapshotでデータベース(store)に変化があるたびにリアルタイムに実行する
    const unSub = onSnapshot(q, (snapshot) => {
      setTodos(
        // snapshot.docsで、postsの中にあるドキュメントをすべて取得
        snapshot.docs.map((doc) => ({
          id: doc.data().id,
          title: doc.data().title,
          detail: doc.data().detail,
          status: doc.data().status,
          deadline: doc.data().deadline,
          username: doc.data().username,
        }))
      );
    });
    // クリーンアップ関数
    return () => {
      unSub();
    };
  }, []);
  // ここまで追記コード

  const handleOpenEditForm = (todo: any) => {
    setEditId(todo.id);
    setNewTitle(todo.title);
    setNewDetail(todo.detail);
    // router.push("/TodoEdit");
    router.push(`/post/${todo.id}`);
  };

  // ステータス変更の元コード
  // const handleStatusChange = (targetTodo: any, e: any) => {
  //   const newArray = todos.map((todo: any) =>
  //     todo.id === targetTodo.id ? { ...todo, status: e.target.value } : todo
  //   );
  //   setTodos(newArray);
  // };

  // 期限変更の元コード
  // const deadlineChange = (targetTodo: any, e: any) => {
  //   const newArray = todos.map((todo: any) =>
  //     todo.id === targetTodo.id ? { ...todo, deadline: e.target.value } : todo
  //   );
  //   setTodos(newArray);
  // };

  // ソート関数は、useStateをそのまま変更することができない。
  // Array.fromを使って、配列のクローンを作成する。
  const deadlineSort = () => {
    var cloneTodos = Array.from(filteredTodos);
    const sortArray = cloneTodos.sort(
      (a: any, b: any) => Date.parse(a.deadline) - Date.parse(b.deadline)
    );
    setFilteredTodos(sortArray);
  };

  useEffect(() => {
    // const userByTodos = todos.filter((todo: any) => todo.username ===userName)
    const filteringTodos = () => {
      const selectedStatus = ["notStarted", "inProgress", "done"];
      // 引数に指定した要素が配列内に含まれていればtrueを返す
      switch (filter) {
        case "selected":
          setFilteredTodos(
            userByTodos.filter((todo: any) =>
              selectedStatus.includes(todo.status)
            )
          );
          break;
        case "all":
          setFilteredTodos(
            userByTodos.filter((todo: any) =>
              selectedStatus.includes(todo.status)
            )
          );
          break;
        case "notStarted":
          setFilteredTodos(
            userByTodos.filter((todo: any) => todo.status === "notStarted")
          );
          break;
        case "inProgress":
          setFilteredTodos(
            userByTodos.filter((todo: any) => todo.status === "inProgress")
          );
          break;
        case "done":
          setFilteredTodos(
            userByTodos.filter((todo: any) => todo.status === "done")
          );
          break;
        default:
          setFilteredTodos(userByTodos);
      }
    };
    filteringTodos();
  }, [filter, todos]);
  return (
    <>
      <div className="container">
        <div>
          <div className="header">
            <span className="header-logo">TODO</span>
            <div className="header-right">
              <span className="name">{username}</span>
              <button className="common-button" onClick={handleLogout}>
                Log Out
              </button>
            </div>
          </div>
          <ul className="form todoApp">
            <li className="form-item">
              <label>タイトル</label>
              <input
                type="text"
                value={todoTitle}
                onChange={(e: any) => setTodoTitle(e.target.value)}
              />
            </li>
            <li className="form-item">
              <label>詳細</label>
              <textarea
                value={todoDetail}
                onChange={(e: any) => setTodoDetail(e.target.value)}
              ></textarea>
            </li>
            <li className="form-item">
              <label>期限を指定する</label>
              <input
                className=""
                type="date"
                name="deadline"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              ></input>
            </li>
          </ul>
          <button className="addButton" onClick={handleAddTodo}>
            作　成
          </button>

          {/* ///////////絞り込みエリア/////////////// */}
          <div className="filteringButtonArea">
            <select
              className="filteringButton status"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="selected" disabled>
                進捗で絞り込む
              </option>
              <option value="all">すべて</option>
              <option value="notStarted">未着手</option>
              <option value="inProgress">作業中</option>
              <option value="done">完了</option>
            </select>
            <button
              className="filteringButton sort"
              onClick={() => deadlineSort()}
            >
              期限で並び替え
            </button>
          </div>
        </div>
        {/* 絞り込み結果表示エリア */}
        {userByTodos.length === 0 && (
          <p className="no-task">※登録されたタスクはありません</p>
        )}
        <ul className="filteredTodoArea">
          {filteredTodos.map((todo: any) => (
            <li key={todo.id}>
              <div className="filteredTodo">
                <span className="filteredTodo_title">{todo.title}</span>
                <span className="filteredTodo_deadline">
                  期限：{todo.deadline}
                </span>
              </div>

              {/* ステータス変更 */}
              <div className="filteredTodoEdit l-common-button">
                <select
                  className="common-button"
                  value={todo.status}
                  onChange={(e) => handleStatusChange(todo.id, e)}
                >
                  {StatusOptions.map((StatusOption: any) => (
                    <option key={StatusOption} value={StatusOption.value}>
                      {StatusOption.text}
                    </option>
                  ))}
                </select>
                {/* 期限変更 */}
                <input
                  className="common-button"
                  type="date"
                  value="期限変更"
                  onChange={(e) => deadlineChange(todo.id, e)}
                ></input>
                <button
                  className="common-button"
                  onClick={() => handleOpenEditForm(todo)}
                >
                  内容編集
                </button>
                <button
                  className="common-button"
                  // onClick={() =>
                  //   setTodos(todos.filter((todoItem: any) => todoItem !== todo))
                  // }
                  onClick={() => deleteTodo(todo.id)}
                >
                  削除
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
