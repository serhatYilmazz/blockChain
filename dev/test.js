const Blockchain = require("./blockchain");

let bitcoin = new Blockchain();

const bc1 = {
  chain: [
    {
      index: 1,
      timeStamp: 1542144006070,
      transactions: [],
      nonce: 0,
      hash: "0",
      previousBlockHash: "0"
    },
    {
      index: 2,
      timeStamp: 1542144036608,
      transactions: [],
      nonce: 18140,
      hash: "0000b9135b054d1131392c9eb9d03b0111d4b516824a03c35639e12858912100",
      previousBlockHash: "0"
    },
    {
      index: 3,
      timeStamp: 1542144547435,
      transactions: [
        {
          transactionId: "f6902de0e78911e884c80f627da3f064",
          amount: 12.5,
          sender: "00",
          receiver: "e43f7560e78911e884c80f627da3f064"
        },
        {
          amount: 125,
          sender: "ds2413dadssfs",
          receiver: "depodas989y4g3298y"
        },
        {
          amount: 13,
          sender: "ds2413dadssfs",
          receiver: "depodas989y4g3298y"
        },
        {
          amount: 216,
          sender: "ds2413dadssfs",
          receiver: "depodas989y4g3298y"
        }
      ],
      nonce: 24801,
      hash: "00001708415a4a4250e0bd0c4ec9f13b0256cf41a036938bb4bba0c76d4f902b",
      previousBlockHash:
        "0000b9135b054d1131392c9eb9d03b0111d4b516824a03c35639e12858912100"
    },
    {
      index: 4,
      timeStamp: 1542144675314,
      transactions: [
        {
          transactionId: "26edcff0e78b11e884c80f627da3f064",
          amount: 12.5,
          sender: "00",
          receiver: "e43f7560e78911e884c80f627da3f064"
        },
        {
          amount: 3,
          sender: "ds2413dadssfs",
          receiver: "depodas989y4g3298y"
        },
        {
          amount: 5,
          sender: "ds2413dadssfs",
          receiver: "depodas989y4g3298y"
        },
        {
          amount: 53,
          sender: "ds2413dadssfs",
          receiver: "depodas989y4g3298y"
        },
        {
          amount: 101,
          sender: "ds2413dadssfs",
          receiver: "depodas989y4g3298y"
        }
      ],
      nonce: 174130,
      hash: "0000e92ced3985c3831e9d6d92887416147a141834ebe39f04fb09445908893b",
      previousBlockHash:
        "00001708415a4a4250e0bd0c4ec9f13b0256cf41a036938bb4bba0c76d4f902b"
    },
    {
      index: 5,
      timeStamp: 1542144691294,
      transactions: [
        {
          transactionId: "73295880e78b11e884c80f627da3f064",
          amount: 12.5,
          sender: "00",
          receiver: "e43f7560e78911e884c80f627da3f064"
        }
      ],
      nonce: 17218,
      hash: "0000ab014e940490100323502e349ab0e9fad7afdf358130b700ee3a1818e743",
      previousBlockHash:
        "0000e92ced3985c3831e9d6d92887416147a141834ebe39f04fb09445908893b"
    },
    {
      index: 6,
      timeStamp: 1542144693435,
      transactions: [
        {
          transactionId: "7cacf420e78b11e884c80f627da3f064",
          amount: 12.5,
          sender: "00",
          receiver: "e43f7560e78911e884c80f627da3f064"
        }
      ],
      nonce: 39675,
      hash: "0000a4fa595e4401e85c818ceff47c73848ab0d58985b605a306399ffff6594e",
      previousBlockHash:
        "0000ab014e940490100323502e349ab0e9fad7afdf358130b700ee3a1818e743"
    }
  ],
  pendingTransactions: [
    {
      transactionId: "7df37de0e78b11e884c80f627da3f064",
      amount: 12.5,
      sender: "00",
      receiver: "e43f7560e78911e884c80f627da3f064"
    }
  ],
  nodeAddress: "e43f7560e78911e884c80f627da3f064",
  currentNodeUrl: "http://localhost:3001",
  networkNodes: []
};

console.log("Valid: " + bitcoin.chainIsValid(bc1.chain));
