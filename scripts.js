const Modal = {
  open() {
    document.querySelector(".modal-overlay").classList.add("active");
  },
  close() {
    document.querySelector(".modal-overlay").classList.remove("active");
  }
}

const Balance = {
  incomes() {
    let totalIncomes = 0;
    Transaction.all.forEach(transaction => {
      if (transaction.amount > 0) {
        totalIncomes += transaction.amount;
      }
    })
    return totalIncomes;
  },

  expenses() {
    let totalExpenses = 0;
    Transaction.all.forEach(transaction => {
      if (transaction.amount < 0) {
        totalExpenses += transaction.amount;
      }
    })

    return totalExpenses;
  },

  total() {
    return Balance.incomes() + Balance.expenses();
  }
}

const Transaction = {
  all: [
    {
      id: 1,
      description: "Luz",
      amount: -10000,
      date: "23/01/2021"
    },
    {
      id: 2,
      description: "Criação website",
      amount: 500000,
      date: "23/01/2021"
    },
    {
      id: 3,
      description: "Aluguel",
      amount: -100000,
      date: "23/01/2021"
    }
  ],

  add(transaction) {
    Transaction.all.push(transaction);
    App.reload();
  },

  remove(id) {
    const index  = Transaction.all.findIndex(transaction => transaction.id == id);
    Transaction.all.splice(index, 1);
    App.reload();
  }
}

const DOM = {
  transactionsContainer: document.querySelector("#transactions-table tbody"),
  
  addTransaction(transaction) {
    const transactionRow = document.createElement("tr");
    transactionRow.innerHTML = DOM.innerHTMLTransaction(transaction);
    DOM.transactionsContainer.appendChild(transactionRow);
  },

  innerHTMLTransaction(transaction) {
    let cssClass = "" 
    if(transaction.amount < 0) {
      cssClass = "expense"
    }
    
    if(transaction.amount > 0) {
      cssClass = "income"
    };

    return (` 
      <td class="description">${transaction.description}</td>
      <td class=${cssClass}>${Utils.formatCurrency(transaction.amount)}</td>
      <td class="date">${transaction.date}</td>
      <td class="actions">
        <img 
          src="./assets/minus.svg" 
          alt="Excluir transação" 
          title="Excluir transação"
          onClick="Transaction.remove(${transaction.id})"
        >
      </td>
    `)
  },

  updateBalance() {
    document.querySelector("#incomes").innerHTML = Utils.formatCurrency(Balance.incomes());
    document.querySelector("#expenses").innerHTML = Utils.formatCurrency(Balance.expenses());
    document.querySelector("#total").innerHTML = Utils.formatCurrency(Balance.total());
  },

  clearTransactions() {
    DOM.transactionsContainer.innerHTML = "";
  }
}

const Utils = {
  formatCurrency(value) {
    const signal = Number(value) < 0 ? "-" : "";
    value = String(value).replace(/\D/g, "");
    value = Number(value) / 100;
    value = Number(value).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    })
    
    return  signal + value;
  },

  formatAmount(value) {
    return Number(value) * 100;
  },

  formatDate(date) {
    const splittedDate = date.split("-");
    const year = splittedDate[0];
    const month = splittedDate[1];
    const day = splittedDate[2];

    return `${day}/${month}/${year}`;
  }
}

const Form = {
  description: document.querySelector("input#description"),
  amount: document.querySelector("input#amount"),
  date: document.querySelector("input#date"),

  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value,
    }
  },

  validateFields() {
    const {description, amount, date} = Form.getValues();
    if (
      description.trim() === "" || 
      amount.trim() === "" || 
      date.trim() == "") {
        throw new Error("Por favor, preencha todos os campos do formulário!");
      }
  },

  formatValues() {
    let {description, amount, date} = Form.getValues();

    description = description.trim();
    amount = Utils.formatAmount(amount);
    date = Utils.formatDate(date);

    return {description, amount, date};

  },

  clearFields() {
    Form.description.value = "";
    Form.amount.value = "";
    Form.date.value = "";
  },

  submit(event) {
    event.preventDefault();

    try {
      Form.validateFields();
      const transaction = Form.formatValues();
      Transaction.add(transaction);
      Form.clearFields();
      Modal.close();
    } catch (error) {
      alert(error.message);
    }
  }
}

const App = {
  init() {
    Transaction.all.forEach(DOM.addTransaction);
    DOM.updateBalance();
  },

  reload() {
    DOM.clearTransactions();
    App.init();
  }
}

App.init();

