import React, { useEffect, useState } from "react";
import TodoItem from "./TodoItem";

// Uncomment and ensure these imports match your Firebase setup
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  updateDoc,
  doc,
  query,
  orderBy,
  where
} from "firebase/firestore";
import { db } from "../firebase"; // Make sure this path is correct

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState("");
  const [user, setUser] = useState("SG");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showDateDropdown, setShowDateDropdown] = useState(false);

  // Firebase useEffect - with fallback for missing index
  useEffect(() => {
    // Try with orderBy first (requires index)
    const qWithOrder = query(
      collection(db, "todos"),
      where("date", "==", selectedDate),
      orderBy("timestamp", "desc")
    );
    
    // Fallback query without orderBy (no index required)
    const qSimple = query(
      collection(db, "todos"),
      where("date", "==", selectedDate)
    );
    
    const unsub = onSnapshot(qWithOrder, (snapshot) => {
      const todoList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      // Sort manually if needed
      todoList.sort((a, b) => {
        const aTime = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
        const bTime = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
        return bTime - aTime;
      });
      setTodos(todoList);
    }, (error) => {
      console.log("Index not available, using simple query:", error);
      // Fallback to simple query if index doesn't exist
      const fallbackUnsub = onSnapshot(qSimple, (snapshot) => {
        const todoList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        // Sort manually by timestamp
        todoList.sort((a, b) => {
          const aTime = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
          const bTime = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
          return bTime - aTime;
        });
        setTodos(todoList);
      });
      return () => fallbackUnsub();
    });

    return () => unsub();
  }, [selectedDate]);

  // Generate last 7 days and next 7 days
  const generateDateOptions = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = -7; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  const dateOptions = generateDateOptions();

  const formatDate = (date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatDateLong = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Filter todos by selected date
  const filteredTodos = todos.filter(todo => todo.date === selectedDate);
  const completedTodos = filteredTodos.filter(todo => todo.completed);
  const incompleteTodos = filteredTodos.filter(todo => !todo.completed);

  const addTodo = async () => {
    if (task.trim() === "") return;
    
    // Validate time inputs
    if (!startTime || !endTime) {
      alert("Please select both start and end times");
      return;
    }
    
    if (startTime >= endTime) {
      alert("Start time must be before end time");
      return;
    }
    
    try {
      await addDoc(collection(db, "todos"), {
        text: task,
        completed: false,
        user: user,
        timestamp: new Date(),
        date: selectedDate,
        startTime: startTime,
        endTime: endTime
      });
      setTask("");
      setStartTime("");
      setEndTime("");
    } catch (error) {
      console.error("Error adding todo: ", error);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await deleteDoc(doc(db, "todos", id));
    } catch (error) {
      console.error("Error deleting todo: ", error);
    }
  };

  const updateTodo = async (id, updates) => {
    try {
      await updateDoc(doc(db, "todos", id), updates);
    } catch (error) {
      console.error("Error updating todo: ", error);
    }
  };

  const toggleComplete = async (id, value) => {
    try {
      await updateDoc(doc(db, "todos", id), { completed: value });
    } catch (error) {
      console.error("Error toggling todo: ", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Daily Task Updates!</h1>

        </div>

        {/* Date Selector */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-blue-600 text-2xl">📅</span>
              <h2 className="text-xl font-semibold text-gray-800">
                {formatDateLong(selectedDate)}
              </h2>
            </div>
            
            <div className="relative">
              <button
                onClick={() => setShowDateDropdown(!showDateDropdown)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Change Date
                <span className={`transition-transform duration-200 ${showDateDropdown ? 'rotate-180' : ''}`}>▼</span>
              </button>
              
              {showDateDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-10 max-h-60 overflow-y-auto">
                  {dateOptions.map((date) => (
                    <button
                      key={date.toISOString()}
                      onClick={() => {
                        setSelectedDate(date.toISOString().split('T')[0]);
                        setShowDateDropdown(false);
                      }}
                      className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors duration-200 ${
                        selectedDate === date.toISOString().split('T')[0] ? 'bg-blue-50 text-blue-600' : ''
                      }`}
                    >
                      {formatDate(date)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add Task Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-grow">
                <input
                  type="text"
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="What needs to be done today?"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div className="flex gap-3">
                <select 
                  value={user} 
                  onChange={(e) => setUser(e.target.value)} 
                  className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="AP">Arru</option>
                  <option value="SG">Sanky</option>
                </select>
              </div>
            </div>
            
            {/* Time Selection Row */}
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex items-center gap-3">
                <span className="text-gray-600 font-medium">🕐 Time:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>
              
              <button
                onClick={addTodo}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <span className="text-lg">➕</span>
                Add Task
              </button>
            </div>
          </div>
        </div>

        {/* Tasks Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* All Tasks */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <h3 className="text-lg font-semibold text-gray-800">All Tasks</h3>
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm font-medium">
                {filteredTodos.length}
              </span>
            </div>
            <div className="space-y-3">
              {filteredTodos.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <span className="text-5xl opacity-50 block mb-2">📅</span>
                  <p>No tasks for this date</p>
                </div>
              ) : (
                filteredTodos.map((todo) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onDelete={deleteTodo}
                    onUpdate={updateTodo}
                    onToggleComplete={toggleComplete}
                  />
                ))
              )}
            </div>
          </div>

          {/* Completed Tasks */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <h3 className="text-lg font-semibold text-gray-800">Completed</h3>
              <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-sm font-medium">
                {completedTodos.length}
              </span>
            </div>
            <div className="space-y-3">
              {completedTodos.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <span className="text-5xl opacity-50 block mb-2">✅</span>
                  <p>No completed tasks</p>
                </div>
              ) : (
                completedTodos.map((todo) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onDelete={deleteTodo}
                    onUpdate={updateTodo}
                    onToggleComplete={toggleComplete}
                  />
                ))
              )}
            </div>
          </div>

          {/* Incomplete Tasks */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
              <h3 className="text-lg font-semibold text-gray-800">Pending</h3>
              <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-sm font-medium">
                {incompleteTodos.length}
              </span>
            </div>
            <div className="space-y-3">
              {incompleteTodos.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <span className="text-5xl opacity-50 block mb-2">🎉</span>
                  <p>All tasks completed!</p>
                </div>
              ) : (
                incompleteTodos.map((todo) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onDelete={deleteTodo}
                    onUpdate={updateTodo}
                    onToggleComplete={toggleComplete}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodoList;