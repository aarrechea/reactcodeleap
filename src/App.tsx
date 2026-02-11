import './App.css'
import Login from './components/authentication/Login'
import PostPage from './components/post/PostPage'
import Register from './components/authentication/Register'
import ProtectedRoute from './components/routing/ProtectedRoute'
import { Routes, Route } from 'react-router-dom'


function App() {
  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Login />} />
      <Route path="/post" element={<ProtectedRoute><PostPage /></ProtectedRoute>} />
    </Routes>
  )
}

export default App
