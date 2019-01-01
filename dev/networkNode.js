const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const uuid = require("uuid/v1");
const port = process.argv[2];
const rp = require("request-promise");
const Blockchain = require("./blockchain");

const bitcoin = new Blockchain();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/blockchain", (req, res) => {
  res.send(bitcoin);
});

app.post("/transaction", (req, res) => {
  const newTransaction = req.body;
  const blockIndex = bitcoin.addTransactionToPendingTransactions(
    newTransaction
  );
  res.json({ note: `Transaction will be added in block ${blockIndex}` });
});

app.post("/transaction/broadcast", (req, res) => {
  const newTransaction = bitcoin.createNewTransaction(
    req.body.amount,
    req.body.sender,
    req.body.receiver
  );
  bitcoin.addTransactionToPendingTransactions(newTransaction);
  let requestPromises = [];
  bitcoin.networkNodes.forEach(networkNode => {
    const requestOption = {
      uri: networkNode + "/transaction",
      method: "POST",
      body: newTransaction,
      json: true
    };

    requestPromises.push(rp(requestOption));
  });

  Promise.all(requestPromises).then(data => {
    res.json({ note: `Transaction created and broadcasted successfully.` });
  });
});

app.get("/mine", (req, res) => {
  let previousBlockHash = bitcoin.getLastBlock()["hash"];
  let currentBlock = {
    transactions: bitcoin.pendingTransactions,
    index: bitcoin.getLastBlock()["index"] + 1
  };

  let nonce = bitcoin.proofOfWork(previousBlockHash, currentBlock);
  let hash = bitcoin.hashBlock(previousBlockHash, currentBlock, nonce);

  const newBlock = bitcoin.createNewBlock(nonce, previousBlockHash, hash);

  let requestPromises = [];
  bitcoin.networkNodes.forEach(networkNode => {
    const requestOption = {
      uri: networkNode + "/receive-new-block",
      method: "POST",
      body: { newBlock: newBlock },
      json: true
    };

    requestPromises.push(rp(requestOption));
  });

  Promise.all(requestPromises)
    .then(data => {
      const transactionOption = {
        uri: bitcoin.currentNodeUrl + "/transaction/broadcast",
        method: "POST",
        body: { amount: 12.5, sender: "00", receiver: bitcoin.nodeAddress },
        json: true
      };

      return rp(transactionOption);
    })
    .then(data => {
      res.json({
        note: `A new block creation is successful with index ${
          bitcoin.getLastBlock()["index"]
        }`,
        block: newBlock
      });
    });
});

app.post("/receive-new-block", (req, res) => {
  const newBlock = req.body.newBlock;
  const lastBlock = bitcoin.getLastBlock();
  const correctHash = lastBlock.hash === newBlock.previousBlockHash;
  const correctIndex = newBlock.index === lastBlock.index + 1;

  if (correctHash && correctIndex) {
    bitcoin.chain.push(newBlock);
    bitcoin.pendingTransactions = [];
    res.json({ note: `New block received and accepted`, newBlock: newBlock });
  } else {
    res.json({ note: `New block is rejected`, newBlock: newBlock });
  }
});

app.post("/register-and-boradcast-node", (req, res) => {
  const newNodeUrl = req.body.newNodeUrl;
  if (
    bitcoin.networkNodes.indexOf(newNodeUrl) === -1 &&
    newNodeUrl !== bitcoin.currentNodeUrl
  ) {
    bitcoin.networkNodes.push(newNodeUrl);
  }
  const registerNodesPromises = [];
  bitcoin.networkNodes.forEach(networkNodeUrl => {
    const requestOptions = {
      uri: networkNodeUrl + "/register-node",
      method: "POST",
      body: { newNodeUrl: newNodeUrl },
      json: true
    };

    registerNodesPromises.push(rp(requestOptions));
  });

  Promise.all(registerNodesPromises)
    .then(data => {
      const bulkRegisterOptions = {
        uri: newNodeUrl + "/register-nodes-bulk",
        method: "POST",
        body: {
          allNetworkNodes: [...bitcoin.networkNodes, bitcoin.currentNodeUrl]
        },
        json: true
      };
      return rp(bulkRegisterOptions);
    })
    .then(data => {
      res.json({
        note: `New Node registered with network successfuly and ${
          bitcoin.networkNodes
        }`
      });
    });
});

app.post("/register-node", (req, res) => {
  const newNodeUrl = req.body.newNodeUrl;

  // Not exist newtworkNodes && Not current node add itself
  if (
    bitcoin.networkNodes.indexOf(newNodeUrl) === -1 &&
    bitcoin.currentNodeUrl !== newNodeUrl
  ) {
    bitcoin.networkNodes.push(newNodeUrl);
    res.json({
      note: `New node registered successfully in node ${bitcoin.currentNodeUrl}`
    });
  } else {
    res.json({ note: `New node can't be registered ` });
  }
});

app.post("/register-nodes-bulk", (req, res) => {
  const allNetworkNodes = req.body.allNetworkNodes;
  allNetworkNodes.forEach(networkNodeUrl => {
    if (
      networkNodeUrl !== bitcoin.currentNodeUrl &&
      bitcoin.networkNodes.indexOf(networkNodeUrl) === -1
    )
      bitcoin.networkNodes.push(networkNodeUrl);
  });

  res.json({ note: `Bulk registration successful` });
});

app.get("/consensus", (req, res) => {
  let requestPromises = [];
  bitcoin.networkNodes.forEach(networkNode => {
    const requestOptions = {
      uri: networkNode + "/blockchain",
      method: "GET",
      json: true
    };

    requestPromises.push(rp(requestOptions));
  });

  Promise.all(requestPromises).then(blockchains => {
    let currentChainLength = bitcoin.chain.length;
    let maxChainLength = currentChainLength;
    let newLongestChain = null;
    let newPendingTransactions = null;

    blockchains.forEach(blockchain => {
      if (blockchain.chain.length > maxChainLength) {
        maxChainLength = blockchain.chain.length;
        newLongestChain = blockchain.chain;
        newPendingTransactions = blockchain.pendingTransactions;
      }
    });

    if (
      !newLongestChain ||
      (newLongestChain && !bitcoin.chainIsValid(newLongestChain))
    ) {
      res.json({
        note: "Current chain has not been replaced",
        chain: bitcoin.chain
      });
    } else if (newLongestChain && bitcoin.chainIsValid(newLongestChain)) {
      bitcoin.chain = newLongestChain;
      bitcoin.pendingTransactions = newPendingTransactions;
      res.json({ note: "This chain has been replaced.", chain: bitcoin.chain });
    }
  });
});

app.get("/block/:blockHash", (req, res) => {
  const blockHash = req.params.blockHash;
  const block = bitcoin.getBlock(blockHash);
  res.json({ block: block });
});

app.get("/transaction/:transactionId", (req, res) => {
  const transactionId = req.params.transactionId;
  const transactionData = bitcoin.getTransaction(transactionId);
  res.json({
    transaction: transactionData.transaction,
    block: transactionData.block
  });
});

app.get("/address/:address", (req, res) => {
  const address = req.params.address;
  const addressData = bitcoin.getAddressData(address);
  res.json({ addressData: addressData });
});

app.get("/block-explorer", (req, res) => {
  res.sendFile("./block-explorer/index.html", { root: __dirname });
});

app.get("/*", (req, res) => {
  res.send("Error Page");
});

app.listen(port, () => {
  console.log(`Listening port ${port}`);
});
