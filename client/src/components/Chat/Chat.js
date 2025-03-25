import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../../socketClient";

const Chat = () => {
  const [username, setUsername] = useState(sessionStorage.getItem("username"));
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [allMessages, setAllMessages] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allRooms, setAllRooms] = useState([]);

  useEffect(() => {
    if (username == null || socket.connected === false) {
      sessionStorage.removeItem("username");
      navigate("/");
    } else {
      socket.emit("back");
    }
  }, []);

  socket.on("joinChat", (arg) => {
    setAllMessages([
      ...allMessages,
      { type: "joinChat", message: arg, fromMe: false },
    ]);
  });

  socket.on("newUsername", (arg) => {
    setUsername(arg);
  });

  socket.on("newUsernameChat", (arg) => {
    setAllMessages([
      ...allMessages,
      { type: "modifyUser", message: arg, fromMe: false },
    ]);
  });

  socket.on("messageAll", (arg) => {
    setAllMessages([
      ...allMessages,
      { type: "allMessages", message: arg, fromMe: arg[0] === username },
    ]);
  });

  socket.on("private_message", (arg) => {
    setAllMessages([
      ...allMessages,
      { type: "allMessages", message: arg, fromMe: false },
    ]);
  })

  socket.on("joinRoom", (arg) => {
    sessionStorage.setItem("room", arg)
    navigate("/room")
  })

  socket.on("displayUser", (arg) => {
    console.log(arg);
    setAllUsers(arg)
  })

  socket.on("createRoomChat", (arg) => {
    setAllMessages([
      ...allMessages,
      { type: "createRoom", message: arg, fromMe: false },
    ]);
  });

  socket.on("deleteRoomChat", (arg) => {
    setAllMessages([
      ...allMessages,
      { type: "deleteRoom", message: arg, fromMe: false },
    ]);
  });

  socket.on("displayRooms", (arg) => {
    setAllRooms(arg)
  })

  function handleSendMessage(){
    socket.emit("message", message);
    setMessage('')
  }

  function changeUsername(){
    let nickname = prompt("Please enter your new nickname", "");
    if (nickname != null) {
      socket.emit("message", "/nick " + nickname);
      setMessage('')
    }
  }

  function sendMessagePrivate(user){
    let message = prompt("Please enter your message ", "");
    if (message != null) {
      socket.emit("message", "/msg " + user + " " + message);
      setMessage('')
    }
  }

  function enterRoom(room){
    socket.emit("message", "/join " + room);
    setMessage('')
  }

  function createRoom(){
    let message = prompt("Please enter your room ", "");
    if (message != null) {
      socket.emit("message", "/create " + message);
      setMessage('')
    }
  }

  function handleLogout() {
    sessionStorage.removeItem("username");
    socket.disconnect();
    navigate("/");
  }

  return (
    <div>

      {/* partie gauche */}
      <div className="grid grid-cols-5 grid-rows-1 gap-3">
        <div className="h-full flex flex-col items-center mt-16 mx-3  bg-gray-100 h-3/4 p-4 border border border-gray-400 break-all">
          <h1 className="text-2xl mb-4">Channels:</h1>
          <button onClick={createRoom}> Create room here </button>
          <div>
            {allRooms.map((room, index) => (
              <div key={index}>
                <button onClick={() => enterRoom(room.name)}>{room.name}</button>
              </div>
            ))}
          </div>
        </div>
        {/* partie gauche */}

        {/* partie du millieu */}
        <div className="col-span-3">
          <div className='flex justify-around'>
            <div>
              <button onClick={changeUsername}> Username: {username} </button>
            </div>
            <div>
              <button onClick={handleLogout}>Logout</button>
            </div>
          </div>
          <div className='flex flex-col h-full justify-center items-center bg-gray-100 m-10 h-3/4 p-4'>
            <h1 className='text-2xl mb-4'>Home Chatroom</h1>
            <div className='h-full w-full bg-white'>
              {allMessages.map((msg, index) => (
                <div key={index} className={`flex m-5 ${msg.type === "joinChat" ? 'bg-white text-red-500 justify-center ' : ''} ${msg.type === "createRoom" ? 'bg-white text-green-500 justify-center ' : ''} ${msg.type === "deleteRoom" ? 'bg-white text-indigo-500 justify-center ' : ''} ${msg.type === "modifyUser" ? 'bg-white text-yellow-500 justify-center ' : ''} ${msg.fromMe ? " bg-orange-300 justify-end text-black p-2 rounded-lg max-w-x" : " bg-gray-300 text-black p-2 justify-start rounded-lg max-w-x"}`}>
                  {msg.message[0]} : {msg.message[1]}
                </div>
              ))}
            </div>
            <form className='flex items-center m-5 w-3/4' onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}>
              <input className='border p-2 w-full' type='text' value={message} onChange={(e) => setMessage(e.target.value)} placeholder='Type your message here ... ' />
              <button type='submit' className='bg-blue-300 hover:bg-blue-500 text-white p-2 rounded mx-4'>Send</button>
            </form>
          </div>
        </div>
        {/* partie du millieu */}

        {/* parite droite */}
        <div className="col-start-5">
        <div className="h-full flex flex-col items-center bg-gray-100 h-3/4 p-4 mt-16 mx-3 border border border-gray-400 break-all">
          <h1 className="text-2xl mb-4">Users connected:</h1>
          <div>
            {allUsers.map((user, index) => (
              <div key={index}>
                {user.username === username ?
                  user.username + "( Me )"
                  :
                  <button onClick={()=>sendMessagePrivate(user.username)}>{user.username}</button>
                }
              </div>
            ))}
          </div>
        </div>
        </div>
        {/* partie droite */}

      </div>
    </div>
  );
};

export default Chat;
