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
    },
    cardBalance: function(card){
        var result = '';
        if(card.balance)
        {
            result += 'Balance: ' + card.balance.value + ' ' + card.balance.currency + '\n\r';
        }   
        if(card.outstandingAmount)
        {
            result += 'Oustanding ammount: ' + card.outstandingAmount.value + ' ' + card.outstandingAmount.currency + '\n\r';
        }
        if(card.limit)
        {
            result += 'Limit: ' + card.limit.value + ' ' + card.limit.currency + '\n\r';
        }      
        if(result=='')
        {
            result = 'Sorry no data availaible.';
        }
        return result;
    }
};

