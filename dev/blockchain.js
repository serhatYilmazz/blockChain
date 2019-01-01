const sha256 = require("sha256");
const currentNodeUrl = process.argv[3];
const uuid = require("uuid/v1");

function Blockchain() {
  this.chain = [];
  this.pendingTransactions = [];
  this.nodeAddress = uuid()
    .split("-")
    .join("");
  this.currentNodeUrl = currentNodeUrl;
  this.networkNodes = [];
  this.createNewBlock(0, "0", "0");
}

Blockchain.prototype.createNewBlock = function(nonce, previousBlockHash, hash) {
  newBlock = {
    index: this.chain.length + 1,
    timeStamp: Date.now(),
    transactions: this.pendingTransactions,
    nonce: nonce,
    hash: hash,
    previousBlockHash: previousBlockHash
  };

  this.chain.push(newBlock);
  this.pendingTransactions = [];

  return newBlock;
};

Blockchain.prototype.getLastBlock = function() {
  return this.chain[this.chain.length - 1];
};

Blockchain.prototype.createNewTransaction = function(amount, sender, receiver) {
  const newTransaction = {
    transactionId: uuid()
      .split("-")
      .join(""),
    amount: amount,
    sender: sender,
    receiver: receiver
  };

  return newTransaction;
};

Blockchain.prototype.addTransactionToPendingTransactions = function(
  transactionObj
) {
  this.pendingTransactions.push(transactionObj);
  return this.getLastBlock()["index"] + 1;
};

Blockchain.prototype.hashBlock = function(
  previousBlockHash,
  currentBlock,
  nonce
) {
  const dataAsString =
    "" + previousBlockHash + nonce.toString() + JSON.stringify(currentBlock);
  const hash = sha256(dataAsString);
  return hash;
};

Blockchain.prototype.proofOfWork = function(previousBlockHash, currentBlock) {
  let nonce = 0;
  let hash = this.hashBlock(previousBlockHash, currentBlock, nonce);
  while (hash.substring(0, 4) !== "0000") {
    nonce++;
    hash = this.hashBlock(previousBlockHash, currentBlock, nonce);
  }

  return nonce;
};

Blockchain.prototype.chainIsValid = function(blockchain) {
  let isChainValid = true;

  for (let i = 1; i < blockchain.length; i++) {
    const currentBlock = blockchain[i];
    const prevBlock = blockchain[i - 1];

    const blockHash = this.hashBlock(
      prevBlock.hash,
      { transactions: currentBlock.transactions, index: currentBlock.index },
      currentBlock.nonce
    );

    if (blockHash.substr(0, 4) !== "0000") {
      isChainValid = false;
    }

    if (currentBlock.previousBlockHash !== prevBlock.hash) {
      isChainValid = false;
    }
  }

  const genesisBlock = blockchain[0];
  const correctNonce = genesisBlock.nonce === 0;
  const correctPreviousHash = genesisBlock.previousBlockHash === "0";
  const correctHash = genesisBlock.hash === "0";
  const correctTransactions = genesisBlock.transactions.length === 0;

  if (
    !correctNonce ||
    !correctPreviousHash ||
    !correctHash ||
    !correctTransactions
  ) {
    isChainValid = false;
  }

  return isChainValid;
};

Blockchain.prototype.getBlock = function(blockHash) {
  let correctBlock = null;
  this.chain.forEach(block => {
    if (block.hash === blockHash) {
      correctBlock = block;
    }
  });

  return correctBlock;
};

Blockchain.prototype.getTransaction = function(transactionId) {
  let correctTransaction = null;
  let correctBlock = null;
  this.chain.forEach(block => {
    block.transactions.forEach(transaction => {
      if (transaction.transactionId === transactionId) {
        correctTransaction = transaction;
        correctBlock = block;
      }
    });
  });

  return { transaction: correctTransaction, block: correctBlock };
};

Blockchain.prototype.getAddressData = function(address) {
  const addressTransactions = [];
  this.chain.forEach(block => {
    block.transactions.forEach(transaction => {
      if (transaction.sender === address || transaction.receiver === address) {
        transaction["status"] = "Verified";
        addressTransactions.push(transaction);
      }
    });
  });

  this.pendingTransactions.forEach(transaction => {
    if (transaction.sender === address || transaction.receiver === address) {
      transaction["status"] = "Pending";
      addressTransactions.push(transaction);
    }
  });

  let balance = 0;
  addressTransactions.forEach(transaction => {
    if (transaction.receiver === address) {
      balance += transaction.amount;
    } else if (transaction.sender === address) {
      balance -= transaction.amount;
    }
  });
  return { addressTransactions: addressTransactions, addressBalance: balance };
};

module.exports = Blockchain;
