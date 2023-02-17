import { Firebase } from "../../services/firebase.js";

const Modal = {
  open(transaction) {
    document.querySelector(".modal-overlay").classList.add("active");
    Form.description.focus();

    Form.amount.onkeydown = (e) => {
      let { amount } = Form.getValues();

      const isNumber = !Number.isNaN(Number(e.key));
      const isFunctionKey =
        e.key == "Escape" ||
        e.key == "Tab" ||
        e.key == "Control" ||
        e.key == "Alt" ||
        e.key == "Shift" ||
        e.key == "Enter" ||
        e.key == "Backspace";

      if (isFunctionKey) {
        return;
      }

      e.preventDefault();

      if (!isNumber) {
        return;
      }

      amount =
        String(amount).substring(0, e.target.selectionStart) +
        e.key +
        String(amount).substring(e.target.selectionEnd, amount.length);

      if (amount.length <= 2) {
        Form.amount.value = amount;
      } else {
        const intValue = Number(amount.replace(/\D/g, ""));
        const decimalValue = intValue / 100;
        Form.amount.value = String(decimalValue.toFixed(2)).replace(".", ",");
      }
    };

    Form.amount.onblur = () => {
      let { amount } = Form.getValues();
      amount = String(amount).replace(/\D/g, "");
      Form.amount.value = Utils.formatCurrency(amount);
    };

    Form.amount.onfocus = (e) => {
      Form.amount.value = Form.amount.value.replace("R$", "").trim();
      Form.amount.select();
    };

    if (transaction) {
      Form.setValues(transaction);
      let { amount } = Form.getValues();
      amount = String(amount).replace(/\D/g, "");
      Form.amount.value = Utils.formatCurrency(amount);
    } else {
      Form.clearFields();
    }
  },
  close() {
    document.querySelector(".modal-overlay").classList.remove("active");
  },
};

const Storage = {
  get() {
    return JSON.parse(localStorage.getItem("dev.finance:transactions")) || [];
  },

  set(transactions) {
    localStorage.setItem(
      "dev.finance:transactions",
      JSON.stringify(transactions)
    );
  },
};

const Balance = {
  incomes() {
    let totalIncomes = 0;
    Transaction.all.forEach((transaction) => {
      if (transaction.amount > 0) {
        totalIncomes += transaction.amount;
      }
    });
    return totalIncomes;
  },

  expenses() {
    let totalExpenses = 0;
    Transaction.all.forEach((transaction) => {
      if (transaction.amount < 0) {
        totalExpenses += transaction.amount;
      }
    });

    return totalExpenses;
  },

  total() {
    return Balance.incomes() + Balance.expenses();
  },
};

const Transaction = {
  all: Storage.get(),

  save(transaction) {
    if (transaction.id) {
      Firebase.updateTransaction(transaction);
    } else {
      Firebase.addTransaction(transaction);
    }

    Home.reload();
  },

  remove(transaction) {
    Firebase.removeTransaction(transaction);
    Home.reload();
  },

  changeCheck(transaction, checked) {
    Firebase.changeTransactionCheck(transaction, checked);
  },

  copyFromLastMonth() {
    const now = new Date();
    const lastMonthDate = Utils.subtractMonth(now);
    const lastMonth = String(lastMonthDate.getMonth() + 1).padStart(2, "0");
    const lastYear = String(lastMonthDate.getFullYear());
    const lastMonthOption = lastYear + lastMonth;
    Firebase.onTransactionsChange(lastMonthOption, (transactions) => {
      transactions.forEach((transaction) => {
        if (!transaction.use_on_next_month) {
          return;
        }
        transaction.id = null;
        transaction.checked = false;

        let transactionDate = new Date(
          Utils.formatDateForInput(transaction.date)
        );

        transactionDate = Utils.addMonth(transactionDate);
        transaction.date = Utils.formatDateForDisplay(
          transactionDate.toISOString().split("T")[0]
        );
        Transaction.save(transaction);
      });
    });
  },
};

const Form = {
  id: null,
  description: document.querySelector("input#description"),
  type: document.querySelector("select#type"),
  amount: document.querySelector("input#amount"),
  date: document.querySelector("input#date"),
  use_on_next_month: document.querySelector("input#next-month"),

  getValues() {
    return {
      id: Form.id,
      description: Form.description.value,
      type: Form.type.value,
      amount: Form.amount.value,
      date: Form.date.value,
      use_on_next_month: Form.use_on_next_month.checked,
    };
  },

  setValues(values) {
    let type = "";
    if (values.amount < 0) {
      type = "DESPESA";
      values.amount = values.amount * -1;
    } else {
      type = "RECEITA";
    }

    Form.id = values.id;
    Form.description.value = values.description;
    Form.type.value = type;
    Form.amount.value = values.amount;
    Form.date.value = Utils.formatDateForInput(values.date);
    Form.use_on_next_month.checked = values.use_on_next_month;
  },

  validateFields() {
    const { type, description, amount, date } = Form.getValues();
    if (
      description.trim() === "" ||
      type.trim() === "" ||
      amount.trim() === "" ||
      date.trim() == ""
    ) {
      throw new Error("Por favor, preencha todos os campos do formulário!");
    }
  },

  formatValues() {
    let { description, type, amount, date, ...rest } = Form.getValues();
    amount = Utils.formatDecimal(amount);

    description = description.trim();
    amount = Utils.formatAmount(type == "DESPESA" ? `-${amount}` : amount);
    date = Utils.formatDateForDisplay(date);

    return { description, amount, date, ...rest };
  },

  clearFields() {
    Form.id = null;
    Form.description.value = "";
    Form.type.value = "";
    Form.amount.value = "";
    Form.date.value = "";
    Form.use_on_next_month.checked = false;
  },

  submit(event) {
    event.preventDefault();

    try {
      Form.validateFields();
      const transaction = Form.formatValues();
      Transaction.save(transaction);
      Form.clearFields();
      Modal.close();
    } catch (error) {
      alert(error.message);
    }
  },
};

const UserInfo = {
  listener(event) {
    const avatarInfo = document.querySelector(".avatar-info");
    const avatarImg = document.querySelector(".avatar img");

    if (
      !avatarInfo ||
      avatarInfo.contains(event.target) ||
      avatarImg.contains(event.target)
    ) {
      return;
    }

    UserInfo.close();
  },
  open() {
    const avatarInfo = document.querySelector(".avatar-info");
    avatarInfo.classList.add("active");

    document.addEventListener("click", UserInfo.listener);
  },
  close() {
    document.querySelector(".avatar-info").classList.remove("active");
    document.removeEventListener("click", UserInfo.listener);
  },
  toggle() {
    !document.querySelector(".avatar-info").classList.contains("active")
      ? UserInfo.open()
      : UserInfo.close();
  },
};

const Home = {
  Modal,
  Storage,
  Balance,
  Transaction,
  Form,
  UserInfo,
  Months: {
    inputSelect: document.getElementById("select-month"),
    monthList: [],
  },
  DOM: {
    transactionsContainer: document.querySelector("#transactions-table tbody"),

    addTransaction(transaction) {
      const transactionRow = document.createElement("tr");
      transactionRow.innerHTML = Home.DOM.innerHTMLTransaction(transaction);
      transactionRow
        .querySelector(".actions #delete")
        .addEventListener("click", () => Transaction.remove(transaction));
      transactionRow
        .querySelector(".actions #edit")
        .addEventListener("click", () => Modal.open(transaction));
      const checkboxElement = transactionRow.querySelector(".check input");
      checkboxElement.checked = transaction.checked;
      checkboxElement.addEventListener("change", (e) => {
        Transaction.changeCheck(transaction, e.target.checked);
      });
      Home.DOM.transactionsContainer.appendChild(transactionRow);
    },

    innerHTMLTransaction(transaction) {
      let cssClass = "";
      if (transaction.amount < 0) {
        cssClass = "expense";
      }

      if (transaction.amount > 0) {
        cssClass = "income";
      }

      return ` 
      <td class="check">
        <input type="checkbox"></input>
      </td>
      <td class="description">${transaction.description}</td>
      <td class=${cssClass}>${Utils.formatCurrency(transaction.amount)}</td>
      <td class="date">${transaction.date}</td>
      <td class="actions">
        <img 
          id="edit"
          src="/assets/edit.svg" 
          alt="Editar transação" 
          title="Editar transação"
        >
        
        <img
          id="delete"
          src="/assets/minus.svg" 
          alt="Excluir transação" 
          title="Excluir transação"
        >
      </td>
    `;
    },

    updateBalance() {
      document.querySelector("#incomes").innerHTML = Utils.formatCurrency(
        Balance.incomes()
      );
      document.querySelector("#expenses").innerHTML = Utils.formatCurrency(
        Balance.expenses()
      );
      document.querySelector("#total").innerHTML = Utils.formatCurrency(
        Balance.total()
      );
    },

    clearTransactions() {
      Home.DOM.transactionsContainer.innerHTML = "";
    },

    updateUser(user) {
      const avatarName = document.querySelector(".avatar-info > span.name");
      const avatarEmail = document.querySelector(".avatar-info > span.email");
      const avatarImg = document.getElementById("avatar-img");
      const logoutButton = document.getElementById("logout-link");

      if (avatarImg) {
        avatarImg.src = user.photoURL;
        avatarImg.style.visibility = "visible";
        avatarImg.addEventListener("click", () => {
          Home.UserInfo.toggle(Firebase.auth);
        });
      }

      if (avatarName) {
        avatarName.innerText = user.displayName;
      }

      if (avatarEmail) {
        avatarEmail.innerText = user.email;
      }

      if (logoutButton) {
        logoutButton.addEventListener("click", () => {
          Firebase.signOut(Firebase.auth);
        });
      }
    },

    updateMonthOptions() {
      const now = new Date();
      const currentMonth = String(now.getMonth() + 1).padStart(2, "0");
      const currentYear = String(now.getFullYear());
      const currentMonthOption = currentYear + currentMonth;

      if (!Home.Months.monthList.includes(currentMonthOption)) {
        Home.Months.monthList.push(currentMonthOption);
        Transaction.copyFromLastMonth();
      }

      Home.Months.inputSelect.innerHTML = Home.DOM.innerHTMLMonthOptions(
        Home.Months.monthList
      );

      Home.Months.inputSelect.value = currentMonthOption;
      Home.Months.inputSelect.onchange();
    },

    innerHTMLMonthOptions(options) {
      return options?.map(
        (option) =>
          `<option value=${option}>${option.substring(4)}/${option.substring(
            0,
            4
          )}</option>`
      );
    },
  },

  init() {
    document
      .getElementById("new-transaction")
      .addEventListener("click", () => Modal.open());
    document
      .getElementById("close-modal")
      .addEventListener("click", Modal.close);
    document
      .getElementById("add-transaction-form")
      .addEventListener("submit", Form.submit);

    Home.Months.inputSelect.onchange = () => {
      const value = Home.Months.inputSelect.value;
      const selectedMonth = value.substring(4);
      const selectedYear = value.substring(0, 4);
      const lastDayOfMonth = new Date(
        Number(selectedYear),
        Number(selectedMonth),
        0
      ).getDate();

      Home.Form.date.min = `${selectedYear}-${selectedMonth}-01`;
      Home.Form.date.max = `${selectedYear}-${selectedMonth}-${lastDayOfMonth}`;

      Firebase.onTransactionsChange(value, (transactions) => {
        Home.Transaction.all = transactions;
        Home.reload();
      });
    };

    Firebase.getMonthList().then((months) => {
      Home.Months.monthList = months;
      Home.DOM.updateMonthOptions();
    });
  },

  reload() {
    Home.DOM.clearTransactions();
    Transaction.all.forEach(Home.DOM.addTransaction);
    Home.DOM.updateBalance();
  },
};

const Utils = {
  formatCurrency(value) {
    const signal = Number(value) < 0 ? "-" : "";
    value = String(value).replace(/\D/g, "");
    value = Number(value) / 100;
    value = Number(value).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    return signal + value;
  },

  formatDecimal(value) {
    value = String(value).replace(/\D/g, "");
    value = Number(value) / 100;
    return value;
  },

  formatAmount(value) {
    value = Number(value) * 100;
    return Math.round(value);
  },

  formatDateForDisplay(date) {
    const splittedDate = date.split("-");
    const year = splittedDate[0];
    const month = splittedDate[1];
    const day = splittedDate[2];

    return `${day}/${month}/${year}`;
  },

  formatDateForInput(date) {
    const splittedDate = date.split("/");
    const year = splittedDate[2];
    const month = splittedDate[1];
    const day = splittedDate[0];

    return `${year}-${month}-${day}`;
  },

  subtractMonth(date) {
    if (!(date instanceof Date)) {
      throw new Error("[subtractMonth] Invalid date format.");
    }

    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let day = date.getUTCDate();

    if (month === 1) {
      month = 12;
      year--;
    } else {
      month--;
    }

    month = String(month).padStart(2, "0");
    day = String(day).padStart(2, "0");

    return new Date(`${year}-${month}-${day}`);
  },

  addMonth(date) {
    if (!(date instanceof Date)) {
      throw new Error("[addMonth] Invalid date format.");
    }

    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let day = date.getUTCDate();

    if (month === 12) {
      month = 1;
      year++;
    } else {
      month++;
    }
    month = String(month).padStart(2, "0");
    day = String(day).padStart(2, "0");

    return new Date(`${year}-${month}-${day}`);
  },
};

const Auth = {
  init() {
    document.getElementById("sign-button").addEventListener("click", () => {
      Firebase.signInWithGoogle();
    });
  },
};

const App = {
  init() {
    const currentYearElement = document.querySelector(".current-year");

    if (currentYearElement) {
      currentYearElement.innerHTML = new Date().getFullYear();
    }

    window.addEventListener("load", () => {
      window.unsubscribe = Firebase.onAuthStateChanged(
        Firebase.auth,
        async (authUser) => {
          if (authUser) {
            Firebase.user = authUser;
            Firebase.getMessagingToken();
            Home.DOM.updateUser(authUser);
            if (window.location.href.includes("/pages/Home")) {
              Home.init();
            } else {
              window.location.replace("/pages/Home");
            }
          } else {
            Firebase.user = null;
            if (window.location.href.includes("/pages/Auth")) {
              Auth.init();
            } else {
              window.location.replace("/pages/Auth");
            }
          }
        }
      );
    });

    window.addEventListener("unload", () => {
      window.unsubscribe();
    });
  },
};

App.init();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/sw.js")
    .then((serviceWorker) => {
      console.info("Service Worker registered: ", serviceWorker);
    })
    .catch((error) => {
      console.error("Error registering the Service Worker: " + error);
    });
}
