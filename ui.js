// UI formatting
module.exports = {
  
    cardDetail: function(card)
    {
        
    },
    accountNumber: function(account)
    {
        return account.accountno.number + '/' + account.accountno.bankCode + " - " + account.productI18N
    },
    transactionDetail: function(transaction)
    {
        return transaction.amount.value + " " + transaction.amount.currency  + " - " + transaction.description + "\n\r";
    }
};

