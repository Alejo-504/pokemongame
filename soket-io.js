const rest = require("./apiRestComunation.js");
const moment = require("moment");

//importar de la carpeta config/general.json
//const generalconfig = require("./general.json");

let socket_connected = [];
let socket_inactive = [];
class OpenSockets {
  constructor(server) {
    const socketio = require("socket.io");
    this.io = socketio(server);
    this.connection();
  }
  connection() {
    this.io.on("connection", (socket) => {
      console.log(`user connected`);

      this.disconnect(socket);
      this.chatMessage(socket);
      this.joinRoom(socket);
      this.moveSprite(socket);
      this.changeMap(socket);
      this.clock_server = this.clock(1000, socket);
      this.statusChange(socket);
    });
  }
  statusChange(socket) {
    socket.on("status:change", (data) => {
      //enviar a todos los usuarios de la sala menos al que envio el evento
      let keyUpdate = socket_connected.findIndex((obj) => {
        return obj.id == data.socket;
      });

      if (socket_connected[keyUpdate]) {
        socket_connected[keyUpdate].status = data.status;

        socket.to(socket_connected[keyUpdate].ROOM).emit("status:change", data);
      }
    });
  }
  joinRoom(socket) {
    socket.on("join:room", (data) => {
      console.log(data.username + " se unio a '" + data.room.title + "'");
      let findUsername = socket_connected.findIndex((obj) => {
        return obj.username == data.username;
      });
      if (
        findUsername != -1 &&
        socket.id != socket_connected[findUsername].id
      ) {
        //desconectar este socket
        this.io.to(socket.id).emit("user:duplicate", data.username);
        socket.disconnect();
        return;
      }
      const newRoom = data.room.title + "-" + data.map;
      if (findUsername != -1) {
        const oldRoom = socket_connected[findUsername].ROOM;
        socket.broadcast.to(oldRoom).emit("leave:user", data.username);
        socket.leave(oldRoom);
        socket.join(newRoom);

        socket_connected[findUsername] = {
          id: socket.id,
          username: data.username,
          room: data.room,
          ID_USER: data.ID_USER,
          token: data.token,
          map: data.map,
          ROOM: newRoom,
          sprite: data.sprite,
        };
      } else {
        socket.join(newRoom);
        socket_connected.push({
          id: socket.id,
          username: data.username,
          room: data.room,
          ID_USER: data.ID_USER,
          token: data.token,
          map: data.map,
          ROOM: newRoom,
          sprite: data.sprite,
        });
      }
      //busca en socket_conneted todos los usuarios en la misma sala de data.room.title
      this.io.emit("rooms:detail", socket_connected);
      socket.broadcast.to(newRoom).emit("join:user", data.username);
      this.io.to(socket.id).emit("clock", moment());
    });
  }
  sendPositionToApiRest(key) {
    //enviar a apiRest
    let user = socket_connected[key];
    if (user.token && user.position && user.ID_USER) {
      rest.updateDataUser(
        { "data.position": user.position },
        user.token,
        user.ID_USER
      );
    }
  }
  disconnect(socket) {
    socket.on("disconnect", (data) => {
      let keyDisconnect = socket_connected.findIndex((obj) => {
        return obj.id == socket.id;
      });

      if (keyDisconnect != -1) {
        this.io
          .to(socket_connected[keyDisconnect].ROOM)
          .emit("disconnect:user", socket_connected[keyDisconnect]);

        //buscarlo en socket_inactive
        let keyInactive = socket_inactive.findIndex((obj) => {
          return obj.id == socket.id;
        });
        if (keyInactive != -1) {
          socket_inactive.splice(keyInactive, 1);
        }

        console.log(`user disconnected`);
        this.sendPositionToApiRest(keyDisconnect);
        socket_connected.splice(keyDisconnect, 1);
        this.io.emit("rooms:detail", socket_connected);
      }
    });
  }
  chatMessage(socket) {
    socket.on("chat:message", (data) => {
      //buscar este usuario en socket_connected
      let key = socket_connected.findIndex((obj) => {
        return obj.id == data.socket;
      });

      this.io.to(socket_connected[key].ROOM).emit("chat:message", data);
    });
  }
  changeMap(socket) {
    socket.on("change:map", (data) => {
      let user = socket_connected.findIndex((obj) => {
        return obj.id == data.socket;
      });
      if (user != -1) {
        socket_connected[user].map = data.map;
        //salir de la sala antigua
        let oldRoom = socket_connected[user].ROOM;
        // socket.broadcast.to(oldRoom).emit("leave:user", data.username);
        //update ROOM
        socket.leave(oldRoom);
        socket_connected[user].ROOM = data.room.title + "-" + data.map;
        //unit a la nueva sala
        socket.join(socket_connected[user].ROOM);
        //socket.to(socket_connected[user].ROOM).emit("join", data);
        //update hora

        this.io.emit("rooms:detail", socket_connected);
      }
    });
  }
  moveSprite(socket) {
    socket.on("update:sprite", (data) => {
      //enviar a todos los usuarios de la sala menos al que envio el evento

      let keyUpdate = socket_connected.findIndex((obj) => {
        return obj.id == data.socket;
      });

      if (socket_connected[keyUpdate]) {
        //iterar las propiedades del objeto data y agrgar todos sus valores dentro del socket_cnnected[keyUpdate]

        socket_connected[keyUpdate] = {
          ...socket_connected[keyUpdate],
          ...data,
        };

        socket.to(socket_connected[keyUpdate].ROOM).emit("update:sprite", data);
      }
    });
  }
  clock(time, socket, fn = null) {
    return setInterval(() => {
      //enviar fecha y hora a todos los usuarios
      let now = moment();
      this.io.emit("clock", now);
      if (fn) {
        fn(now);
      }
    }, time);
  }
  detectInactivity(inactiveMinutesForDisconnect) {
    //enviar fecha y hora a todos los usuarios
    for (let i = 0; i < socket_connected.length; i++) {
      if (socket_connected.status) {
        //guardar el socket.id y la hora actual
        if (socket_connected[i].status == "offline") {
          //buscar si existe en socket inactive
          let key = socket_inactive.findIndex((obj) => {
            return obj.id == socket_connected[i].id;
          });
          if (key == -1) {
            if (socket_inactive.minutes >= inactiveMinutesForDisconnect) {
              //desconectar el socket
              this.io(socket_connected[i].id).disconnect();
            } else {
              socket_inactive.push({
                id: socket_connected[i].id,
                minutes: 1,
              });
            }
          } else {
            socket_inactive[key].minutes += 1;
          }
        }
      }
    }
  }
}
module.exports = OpenSockets;
