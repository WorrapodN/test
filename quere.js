const fs = require("fs");
const modbus = require("modbus-stream");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const port = 1113;

let data = [];
let day = new Date();
let date = day.getDate();
let mounth = day.getMonth() + 1;
let year = day.getFullYear();
let hours = day.getHours();
let min = day.getMinutes();
let sec = day.getSeconds();
if (date < 10) {
  date = "0" + date;
}

if (mounth < 10) {
  mounth = "0" + mounth;
}
if (hours < 10) {
  hours = "0" + hours;
}
if (min < 10) {
  min = "0" + min;
}
if (sec < 10) {
  sec = "0" + sec;
}
let stamp = year + "-" + mounth + "-" + date;
let time = hours + ":" + min + ":" + sec;

function gettime() {
  let day = new Date();
  date = day.getDate();
  year = day.getFullYear();
  hours = day.getHours();
  min = day.getMinutes();
  sec = day.getSeconds();
  mounth = day.getMonth() + 1;
  if (date < 10) {
    date = "0" + date;
  }

  if (mounth < 10) {
    mounth = "0" + mounth;
  }
  if (hours < 10) {
    hours = "0" + hours;
  }
  if (min < 10) {
    min = "0" + min;
  }
  if (sec < 10) {
    sec = "0" + sec;
  }
  stamp = year + "-" + mounth + "-" + date;
  time = hours + ":" + min + ":" + sec;
  // return stamp, time;
  console.log(time);
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post("/", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);

  //console.log(req.headers)
  res.type("application/json");
  quere(req);
  gettime();
  //   var json = JSON.stringify(obj);
  // console.log(val);
  res.send(data);
});
app.listen(port, () => console.log("server running at port", port));

modbus.serial.connect(
  // "/dev/ttyUSB0",
  "COM4",
  // "COM3",
  //   "/dev/ttyUSB0",
  {
    debug: "automaton-2454",
    baudRate: 9600,
    dataBits: 8,
    stopBits: 1,
    parity: "none",
  },
  (err, connection) => {
    var conn = connection;
    setInterval(() => {
      if (conn) {
        use(conn);
      } else {
        console.log("Error");
        data.shift();
        throw err;
      }
    }, 200);
  }
);

function use(conn) {
  if (data.length !== 0 && typeof data[0].quantity !== undefined) {
    naddress = data[0].address;
    nquantity = data[0].quantity;
    nslaveid = data[0].slaveid;
    nval = data[0].value;
    let funcCode = data[0].status;
    console.log("Code ", funcCode);
    if (funcCode == 1) {
      readCoils(conn, naddress, nquantity, nslaveid);
      // console.log(typeof testary[0].quantity);
    } else if (funcCode == 2) {
      console.log("readDiscrete");
      // readHolding(data);
    } else if (funcCode == 3) {
      readHolding(conn, naddress, nquantity, nslaveid);
    } else if (funcCode == 4) {
      readInput(conn, naddress, nquantity, nslaveid);
    } else if (funcCode == 5) {
      writeCoil(conn, naddress, nval, nslaveid);
    } else if (funcCode == 6) {
      writeRegister(conn, naddress, nval, nslaveid);
    }
  } else {
    console.log("QUERE IS NULL");
  }
}

async function quere(req) {
  let obj = req.body;
  let id = parseInt(obj.id);
  status = parseInt(obj.status);
  address = parseInt(obj.address);
  slaveid = parseInt(obj.slaveid);
  quantity = parseInt(obj.quantity);

  let val = parseInt(obj.val);
  let ary = {
    id: id,
    status: status,
    address: address,
    slaveid: slaveid,
    quantity: quantity,
    value: val,
  };
  await ary;
  data.push(ary);

  // if (data.length !== 0) {

  //   await naddress;
  //   await nslaveid;
  //   await nquantity;
  //   await nval;
  // }
}

async function readCoils(conn, address, quantity, slaveid) {
  // console.log(data[0].addres, data[0].slaveid, data[0].quantity);
  // address = data[0].address;
  // slaveid = data[0].slaveid;
  // quantity = data[0].quantity;
  // val = data[0].val;
  conn.readCoils(
    { address: address, quantity: quantity, extra: { slaveId: slaveid } },
    (err, obj) => {
      if (obj) {
        conf = obj.pdu;
        console.log(conf[2]);
        data.shift();
      } else {
        console.log(1);
        console.log(err);
        data.shift();
        throw err;
      }
    }
  );
}
async function readHolding(conn, address, quantity, slaveid) {
  // console.log(data[0].quantity);
  // address = data[0].address;
  // slaveid = data[0].slaveid;
  // quantity = data[0].quantity;
  // val = data[0].val;
  conn.readHoldingRegisters(
    { address: address, quantity: quantity, extra: { slaveId: slaveid } },
    (err, obj) => {
      if (obj) {
        limit = obj.pdu[3];
        console.log(limit);
        data.shift();
        // data = {
        //   data: {
        //     setting: limit,
        //   },
        // };
      } else {
        console.log(2);
        console.log(err);
        data.shift();
        throw err;
      }
    }
  );
}
async function readInput(conn, address, quantity, slaveid) {
  // console.log(
  //   "This?? " + data[0].address,
  //   data[0].slaveId,
  //   data[0].quantity,
  //   data[0].value
  // );
  // console.log("This " + address, quantity, slaveid);
  conn.readInputRegisters(
    { address: address, quantity: quantity, extra: { slaveId: slaveid } },
    (err, obj) => {
      if (obj) {
        now = obj.pdu[3];
        console.log(now);
        data.shift();
      } else {
        console.log(3);
        console.log(err);
        data.shift();
        throw err;
      }
    }
  );
}
async function writeCoil(conn, address, val, slaveid) {
  // address = data[0].address;
  // slaveid = data[0].slaveid;
  // quantity = data[0].quantity;
  // val = data[0].val;
  conn.writeSingleCoil(
    {
      address: address,
      value: val,
      extra: { slaveId: slaveid },
    },
    (err, obj) => {
      if (obj) {
        data.shift();
      } else {
        console.log(4);
        console.log(err);
        data.shift();
        throw err;
      }
    }
  );
}

async function writeRegister(conn, address, val, slaveid) {
  // console.log(data[0].val);
  // address = data[0].address;
  // slaveid = data[0].slaveid;
  // quantity = data[0].quantity;
  // val = data[0].val;
  let value = val;
  let num = parseInt(value);
  let hext = num.toString(16);
  const regex = /[ก-ฮ || 0-9|| a-z || A-Z]/g;
  const found = hext.match(regex);
  // console.log(found);
  if (num < 16) {
    num = ["0x00", "0x0" + found[0]];
  } else if (num >= 16 && num < 256) {
    num = ["0x00", "0x" + found[0] + found[1]];
  } else if (num >= 256 && num < 4095) {
    num = ["0x0" + found[0] + "", "0x" + found[1] + found[2]];
  } else if (num >= 4095 && num < 65536) {
    num = ["0x" + found[0] + found[1] + "", "0x" + found[2] + found[3]];
  }
  // console.log(num);
  let buffer = Buffer.from(num);
  conn.writeSingleRegister(
    {
      address: address,
      value: buffer,
      extra: { slaveId: slaveid },
    },
    (err, obj) => {
      if (obj) {
        data.shift();
      } else {
        console.log(5);
        console.log(err);
        data.shift();

        throw err;
      }
    }
  );
}
