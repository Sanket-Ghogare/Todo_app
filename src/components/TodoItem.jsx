import React, { useState } from "react";

const TodoItem = ({ todo, onDelete, onUpdate, onToggleComplete }) => {
  const [editing, setEditing] = useState(false);
  const [newText, setNewText] = useState(todo.text);
  const [newStartTime, setNewStartTime] = useState(todo.startTime || "");
  const [newEndTime, setNewEndTime] = useState(todo.endTime || "");

  const handleUpdate = () => {
    // Validate time inputs if they exist
    if (newStartTime && newEndTime && newStartTime >= newEndTime) {
      alert("Start time must be before end time");
      return;
    }
    
    const updates = {
      text: newText,
      startTime: newStartTime,
      endTime: newEndTime
    };
    
    onUpdate(todo.id, updates);
    setEditing(false);
  };

  const handleCancel = () => {
    setNewText(todo.text);
    setNewStartTime(todo.startTime || "");
    setNewEndTime(todo.endTime || "");
    setEditing(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleUpdate();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const formatTime = (time) => {
    if (!time) return "";
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getTimeDisplay = () => {
    if (todo.startTime && todo.endTime) {
      return `${formatTime(todo.startTime)} - ${formatTime(todo.endTime)}`;
    }
    return "";
  };

  const bgColor = todo.user === "AP" ? "bg-blue-50 border-blue-200" : "bg-green-50 border-green-200";

  return (
    <div className={`group relative overflow-hidden rounded-xl border-2 ${bgColor} p-4 mb-3 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => onToggleComplete(todo.id, !todo.completed)}
            className="w-5 h-5 text-blue-600 rounded-md border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          />
        </div>
        
        <div className="flex-grow min-w-0">
          {editing ? (
            <div className="space-y-3">
              <input
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                autoFocus
                placeholder="Task description"
              />
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">🕐</span>
                <input
                  type="time"
                  value={newStartTime}
                  onChange={(e) => setNewStartTime(e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-500">to</span>
                <input
                  type="time"
                  value={newEndTime}
                  onChange={(e) => setNewEndTime(e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          ) : (
            <div>
              <p className={`font-medium text-gray-800 ${todo.completed ? "line-through text-gray-400" : ""} break-words`}>
                {todo.text}
              </p>
              
              {/* Time Display */}
              {getTimeDisplay() && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-purple-600">🕐</span>
                  <span className="text-sm font-medium text-purple-700 bg-purple-100 px-2 py-1 rounded-full">
                    {getTimeDisplay()}
                  </span>
                </div>
              )}
              
              <div className="flex items-center gap-2 mt-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  todo.user === "AP" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                }`}>
                  {todo.user === "AP" ? "Arru" : "Sanky"}
                </span>
                <span className="text-xs text-gray-500">
                  {todo.timestamp && new Date(todo.timestamp.toDate ? todo.timestamp.toDate() : todo.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex-shrink-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {editing ? (
            <>
              <button
                onClick={handleUpdate}
                className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors duration-200 text-sm font-medium"
                title="Save changes"
              >
                ✓
              </button>
              <button
                onClick={handleCancel}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200 text-sm font-medium"
                title="Cancel"
              >
                ✕
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditing(true)}
                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200 text-sm font-medium"
                title="Edit task"
              >
                ✏️
              </button>
              <button
                onClick={() => onDelete(todo.id)}
                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200 text-sm font-medium"
                title="Delete task"
              >
                🗑️
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TodoItem;