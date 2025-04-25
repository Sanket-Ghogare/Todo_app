import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  updateDoc,
  doc,
  query,
  orderBy
} from "firebase/firestore";
import { db } from "../firebase";
import TodoItem from "./TodoItem";

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState("");
  const [user, setUser] = useState("A"); // default user

  useEffect(() => {
    const q = query(collection(db, "todos"), orderBy("timestamp", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const todoList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTodos(todoList);
    });

    return () => unsub();
  }, []);

  const addTodo = async () => {
    if (task.trim() === "") return;
    await addDoc(collection(db, "todos"), {
      text: task,
      completed: false,
      user: user,
      timestamp: new Date(),
    });
    setTask("");
  };

  const deleteTodo = async (id) => {
    await deleteDoc(doc(db, "todos", id));
  };

  const updateTodo = async (id, newText) => {
    await updateDoc(doc(db, "todos", id), { text: newText });
  };

  const toggleComplete = async (id, value) => {
    await updateDoc(doc(db, "todos", id), { completed: value });
  };

  const completedTodos = todos.filter((t) => t.completed);
  const incompleteTodos = todos.filter((t) => !t.completed);

  return (
    <div className="max-w-6xl mx-auto mt-10 p-5 bg-white rounded-lg shadow">
      <h1 className="text-2xl mb-4 text-center font-semibold">Daily Task Updates</h1>

      <div className="flex gap-2 mb-4 items-center">
        <input
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="Add a task"
          className="flex-grow p-2 border rounded"
        />
        <select value={user} onChange={(e) => setUser(e.target.value)} className="border p-2 rounded">
          <option value="AP">Akku</option>
          <option value="SG">Sanky</option>
        </select>
        <button
          onClick={addTodo}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">📝 All Tasks</h2>
          {todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onDelete={deleteTodo}
              onUpdate={updateTodo}
              onToggleComplete={toggleComplete}
            />
          ))}
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">✅ Completed</h2>
          {completedTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onDelete={deleteTodo}
              onUpdate={updateTodo}
              onToggleComplete={toggleComplete}
            />
          ))}
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">⏳ Incomplete</h2>
          {incompleteTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onDelete={deleteTodo}
              onUpdate={updateTodo}
              onToggleComplete={toggleComplete}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TodoList;
