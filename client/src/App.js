import {Routes, Route} from "react-router-dom";
import Login from "./components/Login/Login.js";
import Chat from "./components/Chat/Chat.js"
import Room from "./components/Room/Room.js"
import ModifyUsername from "./components/ModifyUsername/ModifyUsername.js";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/room" element={<Room />} />
      <Route path="/ModifyUsername" element={< ModifyUsername/>} />
    </Routes>

  );
}

export default App
