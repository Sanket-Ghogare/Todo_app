import React from "react";
import TodoList from "./components/TodoList";
import "./App.css";

function App() {
  return (
    <div className="min-h-screen bg-amber-100 m-0 p-0">
    <div className="max-w-7xl mx-auto p-1">
      <TodoList />
    </div>
  </div>
  );
}

export default App;
