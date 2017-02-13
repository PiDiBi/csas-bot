var nock = require('nock');

function setup() {
  var accounts = '/my/accounts?size=&page=&sort=&order=&type=';
  nock('https://api.csas.cz/sandbox/webapi/api/v3/netbanking')
    .get(accounts) //
    .reply(200,{      

        "pageNumber": 0,

        "pageCount": 1,

        "pageSize": 11,

        "accounts": [

            {

            "id": "0F17D14DA53909C0D2C07401FC064930DF7227AA",

            "accountno": {

                "number": "4256383226",

                "bankCode": "0800",

                "countryCode": "CZ",

                "cz-iban": "CZ6408000000004256383226",

                "cz-bic": "GIBACZPX"

            },

            "balance": {

                "value": 159965600,

                "precision": 2,

                "currency": "CZK"

            },

            "product": "15",

            "productI18N": "Hypotéka České spořitelny",

            "type": "LOAN",

            "subtype": "MORTGAGE",

            "loan": {

                "interestRateToDate": "2017-11-30",

                "loanAmount": {

                "value": 200000000,

                "precision": 2,

                "currency": "CZK"

                },

                "maturityDate": "2030-06-30",

                "remainingLoanAmount": {

                "value": 0,

                "precision": 2,

                "currency": "CZK"

                },

                "drawdownToDate": "2012-12-31",

                "drawdownAmount": {

                "value": 200000000,

                "precision": 2,

                "currency": "CZK"

                },

                "outstandingDebt": {

                "value": 200000000,

                "precision": 2,

                "currency": "CZK"

                },

                "installmentFrequency": "MONTHLY",

                "installmentDay": 30,

                "nextRateDate": "2016-04-30",

                "nextRateAmount": {

                "value": 953200,

                "precision": 2,

                "currency": "CZK"

                },

                "cz-lumpsumRepayment": {

                "value": 160465600,

                "precision": 2,

                "currency": "CZK"

                }

            },

            "debitInterestRate": 2.54,

            "flags": [

                "owner",

                "electronicStatementAllowed",

                "accountQueryAllowed",

                "standingOrderNotAllowed"

            ],

            "description": "Tonda Paleček"

            },

            {

            "id": "379D31D37AB29700EBCD95384275EEC6CEC3F49D",

            "accountno": {

                "number": "7891227752",

                "bankCode": "0800",

                "countryCode": "CZ",

                "cz-iban": "CZ2108000000007891227752",

                "cz-bic": "GIBACZPX"

            },

            "balance": {

                "value": 1100000,

                "precision": 2,

                "currency": "CZK"

            },

            "product": "61",

            "productI18N": "Spoření České spořitelny",

            "type": "SAVING",

            "subtype": "SAVING_CS",

            "saving": {

                "interestRateOverLimit": 0.01,

                "interestRateLimit": {

                "value": 2000000,

                "precision": 2,

                "currency": "CZK"

                },

                "savingGoal": "HOLIDAYS",

                "targetAmount": {

                "value": 3000000,

                "precision": 2,

                "currency": "CZK",

                "agreedMonthlySavings": {

                    "value": 100000,

                    "precision": 2,

                    "currency": "CZK"

                }

                },

                "nextProlongation": "2016-04-30T00:00:00+02:00"

            },

            "disposable": {

                "value": 1100000,

                "precision": 2,

                "currency": "CZK"

            },

            "creditInterestRate": 0.4,

            "flags": [

                "owner",

                "electronicStatementAllowed",

                "accountQueryAllowed",

                "ownTransferAllowed",

                "domesticTransferAllowed",

                "standingOrderNotAllowed"

            ],

            "description": "Tonda Paleček",

            "alias": "Spoření na dovolenou"

            },

            {

            "id": "2F942D3D0357CBCFE5723EA5A715BD81C56B19A0",

            "accountno": {

                "number": "333331",

                "bankCode": "0800",

                "countryCode": "CZ",

                "cz-iban": "CZ7508000000000000333331",

                "cz-bic": "GIBACZPX"

            },

            "balance": {

                "value": 6000000,

                "precision": 2,

                "currency": "CZK"

            },

            "product": "59",

            "productI18N": "Dětská vkladní knížka",

            "type": "SAVING",

            "subtype": "CHILDREN_PASSBOOK",

            "saving": {

                "interestRateOverLimit": 0.01,

                "interestRateLimit": {

                "value": 25000001,

                "precision": 2,

                "currency": "CZK"

                }

            },

            "disposable": {

                "value": 6000000,

                "precision": 2,

                "currency": "CZK"

            },

            "creditInterestRate": 1,

            "flags": [

                "owner",

                "accountQueryAllowed",

                "standingOrderNotAllowed"

            ],

            "description": "Tonda Paleček",

            "alias": "Tonda Paleček"

            },

            {

            "id": "340E3C55EC7701E89C369131140CDEE92E949524",

            "accountno": {

                "number": "1899761215",

                "bankCode": "0800",

                "countryCode": "CZ",

                "cz-iban": "CZ1708000000001899761215",

                "cz-bic": "GIBACZPX"

            },

            "balance": {

                "value": 183350,

                "precision": 2,

                "currency": "EUR"

            },

            "product": "4",

            "productI18N": "Vkladový účet",

            "type": "SAVING",

            "subtype": "DEPOSIT_ACCOUNT",

            "saving": {

                "minimumBalance": {

                "value": 30000,

                "precision": 2,

                "currency": "EUR"

                },

                "ownTransferMaximum": {

                "value": 45838,

                "precision": 2,

                "currency": "EUR"

                },

                "nextProlongation": "2016-04-22T00:00:00+02:00"

            },

            "disposable": {

                "value": 183350,

                "precision": 2,

                "currency": "EUR"

            },

            "creditInterestRate": 0.01,

            "flags": [

                "owner",

                "electronicStatementAllowed",

                "accountQueryAllowed",

                "ownTransferAllowed",

                "domesticTransferAllowed",

                "standingOrderNotAllowed"

            ],

            "description": "Tonda Paleček",

            "alias": "Tonda Paleček"

            },

            {

            "id": "FC5D67544BB795F831DAC1DC167DD72BD85A9233",

            "accountno": {

                "number": "5842793097",

                "bankCode": "0800",

                "countryCode": "CZ",

                "cz-iban": "CZ3208000000005842793097",

                "cz-bic": "GIBACZPX"

            },

            "balance": {

                "value": 1600000,

                "precision": 2,

                "currency": "CZK"

            },

            "product": "10",

            "productI18N": "Úvěrový účet",

            "type": "LOAN",

            "subtype": "LOAN_ACCOUNT",

            "loan": {

                "loanAmount": {

                "value": 2000000,

                "precision": 2,

                "currency": "CZK"

                },

                "remainingLoanAmount": {

                "value": 0,

                "precision": 2,

                "currency": "CZK"

                },

                "drawdownToDate": "2015-02-19",

                "drawdownAmount": {

                "value": 2000000,

                "precision": 2,

                "currency": "CZK"

                },

                "outstandingDebt": {

                "value": 1600000,

                "precision": 2,

                "currency": "CZK"

                },

                "installmentFrequency": "MONTHLY",

                "installmentDay": 20,

                "nextRateDate": "2016-06-20",

                "nextRateAmount": {

                "value": 71300,

                "precision": 2,

                "currency": "CZK"

                },

                "cz-lumpsumRepayment": {

                "value": 1741923,

                "precision": 2,

                "currency": "CZK"

                }

            },

            "debitInterestRate": 16.9,

            "penaltyInterestRate": 7.05,

            "flags": [

                "owner",

                "electronicStatementAllowed",

                "accountQueryAllowed",

                "standingOrderNotAllowed"

            ],

            "description": "Tonda Paleček"

            },

            {

            "id": "DEBCD8673D9A3F3EF3EFE4B799053FD49D2FF59F",

            "accountno": {

                "number": "782553098",

                "bankCode": "0800",

                "countryCode": "CZ",

                "cz-iban": "CZ4108000000000782553098",

                "cz-bic": "GIBACZPX"

            },

            "balance": {

                "value": 6250000,

                "precision": 2,

                "currency": "CZK"

            },

            "product": "4",

            "productI18N": "Vkladový účet",

            "type": "SAVING",

            "subtype": "DEPOSIT_ACCOUNT",

            "saving": {

                "interestRateLimit": {

                "value": 10000000,

                "precision": 2,

                "currency": "CZK"

                },

                "minimumBalance": {

                "value": 500000,

                "precision": 2,

                "currency": "CZK"

                },

                "ownTransferMaximum": {

                "value": 1562500,

                "precision": 2,

                "currency": "CZK"

                },

                "nextProlongation": "2017-01-20T00:00:00+01:00"

            },

            "disposable": {

                "value": 6250000,

                "precision": 2,

                "currency": "CZK"

            },

            "creditInterestRate": 0.3,

            "flags": [

                "owner",

                "electronicStatementAllowed",

                "accountQueryAllowed",

                "ownTransferAllowed",

                "domesticTransferAllowed",

                "standingOrderNotAllowed"

            ],

            "description": "Tonda Paleček"

            },

            {

            "id": "28CF94197C3AFF3E9F8781778FBB714A7027A973",

            "accountno": {

                "number": "5999991112",

                "bankCode": "0800",

                "countryCode": "CZ",

                "cz-iban": "CZ8008000000005999991112",

                "cz-bic": "GIBACZPX"

            },

            "balance": {

                "value": 3370782,

                "precision": 2,

                "currency": "CZK"

            },

            "product": "74",

            "productI18N": "Peníze na klik",

            "type": "LOAN",

            "subtype": "REVOLVING_LOAN",

            "loan": {

                "loanAmount": {

                "value": 5000000,

                "precision": 2,

                "currency": "CZK"

                },

                "remainingLoanAmount": {

                "value": 1629218,

                "precision": 2,

                "currency": "CZK"

                },

                "drawdownToDate": "2100-01-01",

                "drawdownAmount": {

                "value": 3800000,

                "precision": 2,

                "currency": "CZK"

                },

                "outstandingDebt": {

                "value": 3370782,

                "precision": 2,

                "currency": "CZK"

                },

                "installmentFrequency": "MONTHLY",

                "installmentDay": 15,

                "nextRateDate": "2016-07-15",

                "nextRateAmount": {

                "value": 250000,

                "precision": 2,

                "currency": "CZK"

                },

                "cz-lumpsumRepayment": {

                "value": 3500536,

                "precision": 2,

                "currency": "CZK"

                }

            },

            "debitInterestRate": 16.9,

            "penaltyInterestRate": 7.05,

            "ownTransferReceivers": [

                {

                "id": "AA195E7DB499B4D9F48D46C208625FF53F2245F7",

                "accountno": {

                    "number": "259459101",

                    "bankCode": "0800",

                    "countryCode": "CZ",

                    "cz-iban": "CZ1208000000000259459101",

                    "cz-bic": "GIBACZPX"

                }

                }

            ],

            "flags": [

                "owner",

                "electronicStatementAllowed",

                "accountQueryAllowed",

                "standingOrderNotAllowed"

            ],

            "description": "Tonda Paleček"

            },

            {

            "id": "21A69B24DADDEAEBF06CAD93A7298B1CFC686DF7",

            "accountno": {

                "number": "1054-9512378227",

                "bankCode": "0800",

                "countryCode": "CZ",

                "cz-iban": "CZ1608000010549512378227",

                "cz-bic": "GIBACZPX"

            },

            "balance": {

                "value": 89500,

                "precision": 2,

                "currency": "EUR"

            },

            "product": "8",

            "productI18N": "Cizoměnový účet",

            "type": "CURRENT",

            "subtype": "FOREIGN_ACCOUNT",

            "disposable": {

                "value": 89500,

                "precision": 2,

                "currency": "EUR"

            },

            "flags": [

                "owner",

                "electronicStatementAllowed",

                "accountQueryAllowed",

                "ownTransferAllowed",

                "domesticTransferAllowed",

                "urgentTransferAllowed",

                "standingOrderNotAllowed"

            ],

            "description": "Tonda Paleček",

            "alias": "Cizoměnový účet"

            },

            {

            "id": "AA195E7DB499B4D9F48D46C208625FF53F2245F7",

            "accountno": {

                "number": "259459101",

                "bankCode": "0800",

                "countryCode": "CZ",

                "cz-iban": "CZ1208000000000259459101",

                "cz-bic": "GIBACZPX"

            },

            "balance": {

                "value": 4892300,

                "precision": 2,

                "currency": "CZK"

            },

            "product": "49",

            "productI18N": "Osobní účet ČS II",

            "type": "CURRENT",

            "subtype": "GIRO_ACCOUNT",

            "disposable": {

                "value": 6892300,

                "precision": 2,

                "currency": "CZK"

            },

            "subaccounts": [

                {

                "id": "7022A158F0FB17EC810C15F111141F9C68A41922",

                "accountno": {

                    "number": "123325454",

                    "bankCode": "0800",

                    "countryCode": "CZ",

                    "cz-iban": "CZ9108000000000123325454",

                    "cz-bic": "GIBACZPX"

                },

                "balance": {

                    "value": 200000,

                    "precision": 2,

                    "currency": "CZK"

                },

                "product": "52",

                "productI18N": "Peníze stranou",

                "type": "SAVING",

                "subtype": "SAVING_ACCOUNT",

                "creditInterestRate": 0.01

                }

            ],

            "flags": [

                "owner",

                "electronicStatementAllowed",

                "accountQueryAllowed",

                "directDebitAllowed",

                "sipoDirectDebitAllowed",

                "ownTransferAllowed",

                "domesticTransferAllowed",

                "urgentTransferAllowed"

            ],

            "description": "Tonda Paleček"

            }

        ]

    })
    // .get(model + encodeURIComponent('help'))
    // .reply(200, {
    //   "query": "help",
    //   "intents": [
    //     {
    //       "intent": "builtin.intent.none"
    //     }
    //   ],
    //   "entities": []
    // })
   ;
}

module.exports = {
  setup
};