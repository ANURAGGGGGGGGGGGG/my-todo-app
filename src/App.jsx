import { useState, useEffect } from 'react';

const EmptyState = () => (
  <div className="text-center py-4">
    <svg
      width="150"
      height="150"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="text-muted mb-3"
    >
      <path d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2" />
      <path d="M16 4.5v13a2 2 0 01-2 2h-5.5" />
      <path d="M8 10.25h0" />
      <path d="M8 13.25h0" />
      <path d="M8 16.25h0" />
      <path d="M16 2.5h-4a.5.5 0 00-.5.5v4a.5.5 0 00.5.5h4a.5.5 0 00.5-.5V3a.5.5 0 00-.5-.5z" />
    </svg>
    <h5 className="text-muted fs-5">No tasks found. Add one above!</h5>
  </div>
);

const DeleteModal = ({ show, onConfirm, onCancel }) => (
  <div className={`modal fade ${show ? 'show d-block' : ''}`} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Confirm Delete</h5>
          <button type="button" className="btn-close" onClick={onCancel}></button>
        </div>
        <div className="modal-body">
          Are you sure you want to delete this task?
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button type="button" className="btn btn-danger" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  </div>
);

export default function ToDoList() {
  const [tasks, setTasks] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [editId, setEditId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const MAX_CHARACTERS = 100;

  useEffect(() => {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) setTasks(JSON.parse(storedTasks));
  }, []);

  useEffect(() => {
    setIsSaving(true);
    const timeout = setTimeout(() => {
      localStorage.setItem('tasks', JSON.stringify(tasks));
      setIsSaving(false);
    }, 300);
    return () => clearTimeout(timeout);
  }, [tasks]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        document.getElementById('main-input').focus();
      }
    };
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') addTask();
  };

  const addTask = () => {
    if (inputValue.trim() && inputValue.length <= MAX_CHARACTERS) {
      setTasks([...tasks, {
        id: Date.now(),
        text: inputValue.trim(),
        completed: false
      }]);
      setInputValue('');
    }
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
    if (editId === id) setEditId(null);
  };

  const toggleComplete = (id) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const startEdit = (id, text) => {
    setEditId(id);
    setEditValue(text);
  };

  const saveEdit = () => {
    if (editValue.trim()) {
      setTasks(tasks.map(task =>
        task.id === editId ? { ...task, text: editValue } : task
      ));
      setEditId(null);
      setEditValue('');
    }
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditValue('');
  };

  const requestDelete = (id) => {
    setTaskToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    deleteTask(taskToDelete);
    setShowDeleteModal(false);
    setTaskToDelete(null);
  };

  return (
    <div className="container min-vh-100 d-flex align-items-center justify-content-center px-3">
      <div className="row justify-content-center w-100">
        <div className="col-12 col-sm-10 col-md-8 col-lg-6">
          <div className="card shadow-lg border-0">
            <div className="card-header bg-primary text-white p-3 position-relative">
              <h1 className="text-center mb-0 display-6 fw-bold">To-Do List</h1>
              {isSaving && (
                <div className="position-absolute end-0 top-50 translate-middle-y me-3">
                  <div className="spinner-border spinner-border-sm text-light" role="status">
                    <span className="visually-hidden">Saving...</span>
                  </div>
                </div>
              )}
            </div>

            <div className="card-body p-3">
              <div className="mb-4">
                <div className="input-group input-group-lg">
                  <input
                    id="main-input"
                    type="text"
                    className="form-control form-control-lg"
                    placeholder="Add a new task..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value.slice(0, MAX_CHARACTERS))}
                    onKeyDown={handleKeyDown}
                    maxLength={MAX_CHARACTERS}
                  />
                  <button
                    className="btn btn-primary px-3 px-sm-4 text-nowrap"
                    onClick={addTask}
                    disabled={!inputValue.trim()}
                  >
                    Add Task
                  </button>
                </div>
                <div className={`mt-2 text-end ${inputValue.length > MAX_CHARACTERS - 20 ? 'text-warning' : 'text-muted'}`}>
                  {inputValue.length}/{MAX_CHARACTERS}
                </div>
              </div>

              <ul className="list-group">
                {tasks.length === 0 ? (
                  <EmptyState />
                ) : (
                  tasks.map(task => (
                    <li
                      key={task.id}
                      className="list-group-item d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2 py-2 px-3"
                    >
                      {editId === task.id ? (
                        <div className="input-group w-100">
                          <input
                            type="text"
                            className="form-control form-control-lg"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            autoFocus
                          />
                          <div className="d-flex gap-2 mt-2 mt-sm-0 w-100 w-sm-auto">
                            <button
                              className="btn btn-success flex-grow-1 flex-sm-grow-0"
                              onClick={saveEdit}
                            >
                              Save
                            </button>
                            <button
                              className="btn btn-secondary flex-grow-1 flex-sm-grow-0"
                              onClick={cancelEdit}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="d-flex align-items-center gap-2 w-100">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              style={{ width: '1.3em', height: '1.3em' }}
                              checked={task.completed}
                              onChange={() => toggleComplete(task.id)}
                            />
                            <span
                              className={`fs-5 ${task.completed ? 'text-muted text-decoration-line-through' : ''}`}
                              style={{ wordBreak: 'break-word' }}
                            >
                              {task.text}
                            </span>
                          </div>
                          <div className="d-flex gap-2 w-100 w-sm-auto justify-content-end">
                            <button
                              className="btn btn-outline-secondary btn-sm flex-grow-1 flex-sm-grow-0"
                              onClick={() => startEdit(task.id, task.text)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-outline-danger btn-sm flex-grow-1 flex-sm-grow-0"
                              onClick={() => requestDelete(task.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </li>
                  ))
                )}
              </ul>

              {tasks.length > 0 && (
                <div className="mt-3 text-muted text-center">
                  <span className="badge bg-primary me-2 mb-2 fs-6">
                    {tasks.filter(t => !t.completed).length} Remaining
                  </span>
                  <span className="badge bg-success me-2 fs-6">
                    {tasks.filter(t => t.completed).length} Completed
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <DeleteModal
        show={showDeleteModal}
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}