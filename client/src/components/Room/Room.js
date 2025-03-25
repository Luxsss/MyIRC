import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../../socketClient";

const Chat = () => {
  const [username, setUsername] = useState(sessionStorage.getItem("username"));
  const [room, setRoom] = useState(sessionStorage.getItem("room"));
  const [messageRoom, setMessageRoom] = useState('');
  const [allMessagesRoom, setAllMessagesRoom] = useState([]);
  const [allUsersRoom, setAllUsersRoom] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (username == null || socket.connected === false) {
      sessionStorage.removeItem("username");
      navigate("/");
    }else{
      socket.emit("backJoin", room)
    }
  }, []);

  socket.on("newUsernameRoom", (arg) => {
    setUsername(arg);
  });

  socket.on("newUsernameChatRoom", (arg) => {
    setAllMessagesRoom([
      ...allMessagesRoom,
      { type: "modifyUser", message: arg, fromMe: false },
    ]);
  });

  socket.on("joinChatRoom", (arg) => {
    setAllMessagesRoom([
      ...allMessagesRoom,
      { type: "joinChat", message: arg, fromMe: false },
    ]);
  })

  socket.on("messageRoomAll", (arg) => {
    setAllMessagesRoom([...allMessagesRoom, { type: "allMessages", message: arg, fromMe: arg[0] === username }]);
  });

  socket.on("private_message_room", (arg) => {
    setAllMessagesRoom([
      ...allMessagesRoom,
      { type: "allMessages", message: arg, fromMe: false },
    ]);
  })

  socket.on("createRoomChat", (arg) => {
    setAllMessagesRoom([
      ...allMessagesRoom,
      { type: "createRoom", message: arg, fromMe: false },
    ]);
  });

  socket.on("deleteRoomChatRoom", (arg) => {
    setAllMessagesRoom([
      ...allMessagesRoom,
      { type: "deleteRoom", message: arg, fromMe: false },
    ]);
  })

  socket.on("displayUsersRoom", (arg) => {
    setAllUsersRoom(arg)
  })

  socket.on("leaveRoomChat", (arg) => {
    setAllUsersRoom(arg)
  })

  socket.on("leaveRoom", (arg) => {
    navigate("/chat")
  })

  function handleSendMessageRoom() {
    socket.emit("messageRoom", [room, messageRoom]);
    setMessageRoom('');
  }

  function goBack() {
    socket.emit("messageRoom", [room, "/leave"]);
    setMessageRoom('');
  }

  function handleLogout() {
    sessionStorage.removeItem("username");
    socket.disconnect();
    navigate("/");
  }

  return (
    <div>
        <button onClick={goBack}>Go back Home - </button>
      <div className="grid grid-cols-5 grid-rows-1 gap-3">
        <div className="h-full flex flex-col items-center mt-16 mx-3 bg-gray-100 h-3/4 p-4 border border-gray-400 break-all">
          <div>
          </div>
        </div>

        {/* partie du milieu */}
        <div className="col-span-3">
          <div className='flex justify-around'>
            <div>
              Username: {username}
            </div>
            <div>
              <button onClick={handleLogout}>Logout</button>
            </div>
          </div>
          <div className='flex flex-col h-full justify-center items-center bg-gray-100 m-10 h-3/4 p-4'>
            <h1 className='text-2xl mb-4'>{room}</h1>
            <div className='h-full w-full bg-white overflow-y-auto'>
              {allMessagesRoom.map((msg, index) => (
                <div key={index} className={`flex m-5 ${msg.type === "joinChat" ? 'bg-white text-red-500 justify-center ' : ''} ${msg.type === "createRoom" ? 'bg-white text-green-500 justify-center ' : ''} ${msg.type === "deleteRoom" ? 'bg-white text-indigo-500 justify-center ' : ''} ${msg.type === "modifyUser" ? 'bg-white text-yellow-500 justify-center ' : ''} ${msg.fromMe ? " bg-orange-300 justify-end text-black p-2 rounded-lg max-w-x" : " bg-gray-300 text-black p-2 justify-start rounded-lg max-w-x"}`}>
                  {msg.message[0]} : {msg.message[1]}
                </div>
              ))}
            </div>
            <form className='flex items-center m-5 w-3/4' onSubmit={(e) => { e.preventDefault(); handleSendMessageRoom(); }}>
              <input className='border p-2 w-full' type='text' value={messageRoom} onChange={(e) => setMessageRoom(e.target.value)} placeholder='Type your message here ... ' />
              <button type='submit' className='bg-blue-300 hover:bg-blue-500 text-white p-2 rounded mx-4'>Send</button>
            </form>
          </div>
        </div>
        {/* partie du milieu */}

        {/* partie droite */}
        <div className="col-start-5">
          <div className="h-full flex flex-col items-center bg-gray-100 h-3/4 p-4 mt-16 mx-3 border border-gray-400 break-all">
            <h1 className="text-2xl mb-4">Users on {room} :</h1>
            <div>
              {allUsersRoom.map((user, index) => (
                <div key={index}>
                  {user}
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
