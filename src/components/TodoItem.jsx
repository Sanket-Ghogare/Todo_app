import React, { useState } from "react";

const TodoItem = ({ todo, onDelete, onUpdate, onToggleComplete }) => {
  const [editing, setEditing] = useState(false);
  const [newText, setNewText] = useState(todo.text);

  const handleUpdate = () => {
    onUpdate(todo.id, newText);
    setEditing(false);
  };

  const bgColor =
    todo.user === "AP"
      ? "bg-blue-100"
      : todo.user === "SG"
      ? "bg-green-100"
      : "bg-white";

  return (
    <div className={`flex justify-between items-center p-3 rounded shadow mb-2 ${bgColor}`}>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggleComplete(todo.id, !todo.completed)}
        />
        {editing ? (
          <input
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            className="border p-1 rounded"
          />
        ) : (
            <span className={`${todo.completed ? "line-through text-gray-400" : ""} break-words max-w-xs`}>
            {todo.text}
          </span>
          
        )}
        <span className="text-xs text-gray-500 ml-2">({todo.user})</span>
      </div>
      <div className="flex gap-2">
        {editing ? (
          <button onClick={handleUpdate} className="text-green-500">Save</button>
        ) : (
          <button onClick={() => setEditing(true)} className="text-blue-500">Edit</button>
        )}
        <button onClick={() => onDelete(todo.id)} className="text-red-500">Delete</button>
      </div>
    </div>
  );
};

export default TodoItem;
