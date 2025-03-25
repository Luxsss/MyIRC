import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../../socketClient';

export default function Login() {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();


  function handleLogin() {
    socket.emit("username", username);
    sessionStorage.setItem("username", username)
    navigate("/chat");
  }

  return (
    <div className="h-screen w-screen flex justify-center items-center py-10 bg-gray-200">
      <div className="bg-zinc-400 rounded p-8">
        <h1 className="text-3xl pb-8 flex justify-center">Login</h1>
        <form className="my-4 flex justify-center" onSubmit={(e) => { handleLogin(); }}>
          <input required value={username} onChange={(e) => setUsername(e.target.value)} className="p-2 border rounded mr-2" placeholder="Choose your username"/>
          <button type="submit" className="bg-white hover:bg-zinc-300 rounded-md border-2 border-white px-4 py-2">Connect to chat</button>
        </form>
      </div>
    </div>
  );
}
