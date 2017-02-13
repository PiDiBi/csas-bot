
module.exports = [
  {
    out: "Hello"
  },
  {
    in: "Hello... I'm a CSAS bank bot."
  },
  {    
    in: "Select (1. Accounts or 2. Cards)",
    out: "help"
  },
  {
    in: "Select (1. Accounts or 2. Cards)",
    out : "1"
  },
  {
    in: /^(Select your account)/i,
    out : "1"
  },
  {
    in: "What do you want to do? Type 'accounts' to return to account selection or 'home' (1. Show balance or 2. Show history)",
    out : "1"
  },
  {
    in: "159.965.600,00 CZK"
  },
  {
    in: "What do you want to do? Type 'accounts' to return to account selection or 'home' (1. Show balance or 2. Show history)"
  }
]