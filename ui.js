/**
 * Number.prototype.format(n, x, s, c)
 * 
 * @param integer n: length of decimal
 * @param integer x: length of whole part
 * @param mixed   s: sections delimiter
 * @param mixed   c: decimal delimiter
 */
Number.prototype.format = function(n, x, s, c) {
    var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')',
        num = this.toFixed(Math.max(0, ~~n));

    return (c ? num.replace('.', c) : num).replace(new RegExp(re, 'g'), '$&' + (s || ','));
};
// UI formatting
module.exports = {
  
    cardDetail: function(card)
    {
        var result = "";
        result += 'Owner: ' + card.owner + '\n\r';
        result += 'Number: ' + card.number + '\n\r';
        result += 'Expire: ' + card.expiryDate + '\n\r';
        result += 'Type: ' + card.productI18N + '\n\r';
        result += 'Credit Card: ' + card.creditCard + '\n\r';
        return result;
    },
    accountNumber: function(account)
    {
        return account.accountno.number + '/' + account.accountno.bankCode + " - " + account.productI18N
    },
    transactionDetail: function(transaction)
    {
        return transaction.amount.value.format(2, 3, '.', ',') + " " + transaction.amount.currency  + " - " + transaction.description + "\n\r";
    },
    cardBalance: function(card){
        var result = '';
        if(card.balance)
        {
            result += 'Balance: ' + card.balance.value.format(2, 3, '.', ',') + ' ' + card.balance.currency + '\n\r';
        }   
        if(card.outstandingAmount)
        {
            result += 'Oustanding ammount: ' + card.outstandingAmount.value.format(2, 3, '.', ',') + ' ' + card.outstandingAmount.currency + '\n\r';
        }
        if(card.limit)
        {
            result += 'Limit: ' + card.limit.value.format(2, 3, '.', ',') + ' ' + card.limit.currency + '\n\r';
        }      
        if(result=='')
        {
            result = 'Sorry no data availaible.';
        }
        return result;
    },
    accountBalance(account){
        return account.balance.value.format(2, 3, '.', ',') + " " + account.balance.currency
    }
};

