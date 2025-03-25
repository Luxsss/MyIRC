const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const e = require("express");
const app = express();

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  connectionStateRecovery: {},
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  },
});

let allUsers = [];
let allUsersRoom = [];
let allRooms = [];

io.on('connection', socket => {
  console.log('User connected :', socket.id)

  socket.on("username", (arg)=>{
    socket.username = arg
    allUsers.push({username: socket.username, id: socket.id})
  })

  socket.on("back", (arg) => {
    io.emit("joinChat", [socket.username + " has join the chat "])
    io.emit("displayUser", allUsers)
    io.emit("displayRooms", allRooms)
  })

  socket.on("backJoin", (arg) => {
    io.to(arg).emit("joinChatRoom", [socket.username + " has join the chat "])
    io.to(arg).emit("displayUsersRoom", allUsersRoom)
  })

  socket.on('message', (msg) => {
    if (msg.startsWith("/")) {
      let diff = msg.split(" ");
      switch (diff[0]) {
        case '/nick':
          let ancientUsername = socket.username
          socket.username = msg.replace("/nick ", "");
          if ((socket.username).trim() != "") {
            allUsers.forEach(function callback(user, index) {
              if (user.username == ancientUsername) {
                user.username = socket.username
              }
            });
            socket.emit("newUsername", socket.username)
            io.emit("newUsernameChat", [ancientUsername + " has become -> "  + socket.username ])
            io.emit("newUsernameChatRoom", [ancientUsername + " has become -> "  + socket.username ])
          }
          break;
        case '/list':
          let arrRooms = []
          const rooms = Array.from(io.sockets.adapter.rooms.keys());
          const sids = Array.from(io.sockets.adapter.sids.keys());
          rooms.forEach(room => {
            let isUserRoom = false;

            sids.forEach(sid => {
              if (room === sid) {
                isUserRoom = true;
              }
            });

            if (!isUserRoom) {
              arrRooms.push(room)
            }
            console.log(arrRooms);
          });
          break;
        case '/create':
          let roomCreate = msg.replace("/create ","");
          let msgRoom = socket.username + " has created the room '" + roomCreate + "' ";
          if (roomCreate.trim() != "") {
            if (allRooms.length === 0) {
              allRooms.push({name: roomCreate, id: socket.id});
              io.emit("createRoomChat", [msgRoom])
              io.emit("createRoomChatRoom", [msgRoom])
            }else{
              let roomTrue = true

              allRooms.forEach(room => {
                if (room.name == roomCreate) {
                  roomTrue = false;
                }
              })

              if (roomTrue === true) {
                allRooms.push({name: roomCreate, id: socket.id})
                io.emit("createRoomChat", [msgRoom])
                io.emit("createRoomChatRoom", [msgRoom])
              }
            }
            io.emit("displayRooms", allRooms)
            socket.join(roomCreate);
          }
          break;
        case '/delete':
          let deleteRoom = msg.replace("/delete ","");
          let msgRoomDelete = socket.username + " has deleted the room '" + deleteRoom + "' ";
          let newRoom = []

          allRooms.forEach(room => {
            if (room.id != socket.id) {
              newRoom.push({name: room.name, id: room.id})
            }else {
              io.emit("deleteRoomChat", [msgRoomDelete])
              io.emit("deleteRoomChatRoom", [msgRoomDelete])
            }
          });

          allRooms = newRoom;
          io.emit("displayRooms", allRooms)
          socket.leave(deleteRoom);
          break;
        case '/join':
          let roomJoin = msg.replace("/join ","");
          socket.actualRoom = roomJoin
          let roomExist = false;
          allRooms.forEach(room => {
            if (room.name == roomJoin) {
              roomExist = true
            }
          })

          if (roomExist == true) {
            socket.join(roomJoin);
            let usersRoom = Array.from(io.sockets.adapter.rooms.get(roomJoin));
            allUsersRoom = []

            usersRoom.forEach(userRoom => {
              let userTrue = true;
              allUsers.forEach(user => {
                if (userRoom === user.id) {
                  allUsersRoom.push(user.username);
                }
              })
            })

            socket.emit("joinRoom", roomJoin);
          }
          break;
        case '/leave':
          let roomLeave = msg.replace("/leave ","");
          socket.leave(roomLeave);
          break;
        case '/users':
          socket.emit("displayUser", allUsers)
          break;
        case '/msg':
          let userUsername = diff[1]
          let messageToUser = msg.replace("/msg " + userUsername + " ", "")
          let userId;
          allUsers.forEach(function callback(user, index) {
            if (user.username == userUsername) {
              userId = user.id
            }
          });
          socket.to(userId).emit("private_message", [socket.username + " has whisper to you ",  messageToUser]);
          socket.to(userId).emit("private_message_room", [socket.username + " has whisper to you ",  messageToUser]);
          console.log(userId)
          console.log(userUsername)
          console.log(messageToUser)
          break;
        default:

          break;
      }
    }else {
      if (msg.trim() != "") {
        io.emit('messageAll', [socket.username, msg])
      }
    }
  });

  socket.on('messageRoom', (msg) => {
    if (msg[1].startsWith("/")) {
      let diff = msg[1].split(" ");
      switch (diff[0]) {
        case '/nick':
          let ancientUsername = socket.username
          socket.username = msg[1].replace("/nick ", "");
          allUsers.forEach(function callback(user, index) {
            if (user.username == ancientUsername) {
              user.username = socket.username
            }
          });
          socket.emit("newUsernameRoom", socket.username)
          io.emit("newUsernameChat", [ancientUsername + " has become -> "  + socket.username ])
          socket.emit("newUsernameChatRoom", [ancientUsername + " has become -> "  + socket.username ])
          break;
        case '/list':
          let arrRooms = []
          const rooms = Array.from(io.sockets.adapter.rooms.keys());
          const sids = Array.from(io.sockets.adapter.sids.keys());
          rooms.forEach(room => {
            let isUserRoom = false;

            sids.forEach(sid => {
              if (room === sid) {
                isUserRoom = true;
              }
            });

            if (!isUserRoom) {
              arrRooms.push(room)
            }
            console.log(arrRooms);
          });
          break;
          case '/create':
          let roomCreate = msg[1].replace("/create ","");
          if (roomCreate.trim() != "") {
            let msgRoom = socket.username + " has created the room '" + roomCreate + "' ";
            io.emit("createRoomChatRoom", [msgRoom])
            io.emit("createRoomChat", [msgRoom])
            socket.join(roomCreate);
          }
          break;
        case '/delete':
          let deleteRoom = msg[1].replace("/delete ","");
          let msgRoomDelete = socket.username + " has deleted the room '" + deleteRoom + "' ";
          io.emit("deleteRoomChatRoom", [msgRoomDelete])
          io.emit("deleteRoomChat", [msgRoomDelete])
          socket.leave(deleteRoom);
          break;
        case '/join':
          let roomJoin = msg[1].replace("/join ","");
          socket.join(roomJoin);
          socket.emit("joinRoom", roomJoin);
          break;
          case '/leave':
            let roomLeave = msg[1].replace("/leave ","");
            let newUserRoom = []


            allUsersRoom.forEach(user => {
              if (user != socket.username) {
                newUserRoom.push(user)
              }
            })

            allUsersRoom = newUserRoom;

            if (allUsersRoom.length === 0) {
              let newRoomDisplay = []
              setTimeout(() => {
                console.log(allRooms)
                allRooms.forEach(room => {
                  if (room.name == roomLeave) {
                    newRoomDisplay.push({name: room.name, id: room.id})
                  }
                })
                console.log(newRoomDisplay);
                allRooms = newRoomDisplay;
                io.emit("displayRooms", allRooms)
                socket.leave(roomLeave);
              }, 10000);

            }else {
              socket.leave(roomLeave);
            }

            io.emit("leaveRoomChat", newUserRoom);
            socket.emit("leaveRoom", "");
            break;
        case '/users':
          console.log(socket.actualRoom);
          users = Array.from(io.sockets.adapter.rooms.get(socket.actualRoom));
          console.log(users)
          break;
        case '/msg':
          let userUsername = diff[1]
          let messageToUser = msg[1].replace("/msg " + userUsername + " ", "")
          let userId;
          allUsers.forEach(function callback(user, index) {
            if (user.username == userUsername) {
              userId = user.id
            }
          });
          socket.to(userId).emit("private_message", [socket.username + " has whisper to you ",  messageToUser]);
          socket.to(userId).emit("private_message_room", [socket.username + " has whisper to you ",  messageToUser]);
          break;
        default:

          break;
      }
    }else {
      io.to(msg[0]).emit("messageRoomAll", [socket.username, msg[1]]);
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected : ', socket.id)

    const newAllUSer = [];

    allUsers.forEach(user => {
      if(user.id == socket.id){
        console.log(user.username)
      }else{
        newAllUSer.push({username: user.username, id: user.id})
      }
    })

    allUsers = newAllUSer;

    io.emit("displayUser", allUsers)
  })

})

server.listen(4242, () => {
  console.log("listening on *:4242");
});
