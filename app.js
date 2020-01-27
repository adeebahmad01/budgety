let income = `<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="icon ion-ios-close-circle-outline"></i></button></div></div></div>`
let expense = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">%percentage%%</div><div class="item__delete"><button class="item__delete--btn"><i class="icon ion-ios-close-circle-outline"></i></button></div></div></div>';

//******************************************************?
//******************************************************!
//*!Budget CONTROLLER
//*******************************************************
//******************************************************todo
var budgetController = (function() {
  class Expense {
    constructor(id, description, value) {
      this.id = id;
      this.description = description;
      this.value = value;
      this.percentage = -1;
    }
    calcPercentages(totalIncome) {
      if (totalIncome > 0) {
        this.percentage = Math.round((this.value / totalIncome) * 100);
      }
      else {
        this.percentage = -1;
      }
    }
    getPercentages() {
      return this.percentage;
    }
  }
  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };
  calculateTotal = function(type) {
    var sum = 0;
    data.allItems[type].forEach(function(cur) {
      sum += cur.value;
    });
    data.totals[type] = sum;
  };
  var data = JSON.parse(localStorage.getItem('budget')) || {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };
  return {
    addItem: function(type, des, val) {
      var newItem, ID;
      //ID = last ID +1
      //Create new id
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }
      //Create new item based on inc or exp type

      if (type === "exp") {
        newItem = new Expense(ID, des, val);
      } else if (type === "inc") {
        newItem = new Income(ID, des, val);
      }
      //Push it into our Data Structure
      data.allItems[type].push(newItem);
      //Return the New Element
      return newItem;
    },
    deleteItem: function(type, id) {
      var ids, index;
      ids = data.allItems[type].map(function(current) {
        return current.id;
      });
      index = ids.indexOf(id);
      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },
    calculateBudget: function() {
      //Calculate total inxome and expenses
      calculateTotal("inc");
      calculateTotal("exp");
      //Calculate the budget: inc - exp
      data.budget = data.totals.inc - data.totals.exp;
      //Calculate the percentage of inc that we spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },
    calculatePercentages: function() {
      data.allItems.exp.forEach(function(cur) {
        cur.calcPercentages(data.totals.inc);
      });
    },
    getPercentages: function() {
      var allPercentages = data.allItems.exp.map(function(cur) {
        return cur.getPercentages();
      });
      return allPercentages;
    },
    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      };
    },
    data
  };
})();
//******************************************************?
//******************************************************!
//!UI CONTROLLER
//*******************************************************
//******************************************************todo
var UIController = (function() {
  var DOMStrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputButton: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expensesLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    expensesPercLabel: ".item__percentage",
    dateLabel: ".budget__title--month"
  };
  var formatNumber = function(num, type) {
    var numSplit, int, dec;
    /*
   + or - before the number
   exactily to decimal points
   comma spacing the thousand
   */
    num = Math.abs(num);
    num = num.toFixed(2);
    numSplit = num.split(".");
    int = numSplit[0];
    if (int.length > 3) {
      int =
        int.substr(0, int.length - 3) +
        "," +
        int.substr(int.length - 3, int.length);
      if (int.length > 7) {
        int =
          int.substr(0, int.length - 7) +
          "," +
          int.substr(int.length - 7, int.length);
        if (int.length > 11) {
          int =
            int.substr(0, int.length - 11) +
            "," +
            int.substr(int.length - 11, int.length);
        }
      }
    }
    dec = numSplit[1];
    return (type === "exp" ? (sign = "-") : (sign = "+")) + int + "." + dec;
  };
  var nodeListForEach = function(list, callback) {
    for (let i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };
  
  return {
    getInput: function() {
      return {
        type: document.querySelector(DOMStrings.inputType).value, //Will be Either INC or EXP
        description: document.querySelector(DOMStrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
      };
    },
    addListItem: function(obj, type) {
      let html, newHtml, element;
      //Create html string with placeholder text
      if (type === "inc") {
        element = DOMStrings.incomeContainer;
        html = income;
      } else if (type === "exp") {
        element = DOMStrings.expensesContainer;
        html = expense;
      }
      //Replace the placeHolder text with some actual data
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));
      //Insert the HTML into DOM
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },
    deleteListItem: function(seletorID) {
      var el = document.getElementById(seletorID);
      el.parentNode.removeChild(el);
    },
    clearFields: function() {
      var fields, fieldsArr;

      fields = document.querySelectorAll(
        DOMStrings.inputDescription + ", " + DOMStrings.inputValue
      );

      fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach(function(current, index, array) {
        current.value = "";
      });
      fieldsArr[0].focus();
    },
    displayBudget: function(obj) {
      var type;
      obj.budget > 0 ? (type = "inc") : (type = "exp");
      document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(
        obj.budget,
        type
      );
      document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(
        obj.totalInc,
        "inc"
      );
      document.querySelector(
        DOMStrings.expensesLabel
      ).textContent = formatNumber(obj.totalExp, "exp");
      if (obj.percentage > 0) {
        document.querySelector(DOMStrings.percentageLabel).textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(DOMStrings.percentageLabel).textContent = "---";
      }
    },
    displayPercentages: function(percentages) {
      var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);

      nodeListForEach(fields, function(current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + "%";
        } else {
          current.textContent = "---";
        }
      });
    },
    displayMonth: function() {
      var now, year, month;
      now = new Date();
      months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
      year = now.getFullYear();
      month = now.getMonth();
      document.querySelector(DOMStrings.dateLabel).textContent =
        months[month] + " " + year;
    },
    changedType: function() {
      var fields = document.querySelectorAll(
        DOMStrings.inputType +
          "," +
          DOMStrings.inputDescription +
          "," +
          DOMStrings.inputValue
      );

      nodeListForEach(fields, function(cur) {
        cur.classList.toggle("red-focus");
      });

      document.querySelector(DOMStrings.inputButton).classList.toggle("red");
    },
    getDOMStrings: function() {
      return DOMStrings;
    },formatNumber
  };
})();
//******************************************************?
//******************************************************!
//!GLOBAL CONTROLLER
// *******************************************************
// ******************************************************todo
var controller = (function(budgetCtrl, UICtrl) {
  var data = budgetCtrl.data.allItems;
  const displayOnLoad = (type)=>{
    data[type].forEach(el=>{
      let html,element,newHtml;
      if(type === "inc"){
        element = UICtrl.getDOMStrings().incomeContainer
        html = income;
        newHtml = html
      };
      if(type === "exp"){
        element = UICtrl.getDOMStrings().expensesContainer
        html = expense;
        newHtml = html.replace('%percentage%', el.percentage)
      };
      
      newHtml = newHtml.replace(`%id%`, el.id)
      newHtml = newHtml.replace(`%description%`, el.description)
      newHtml = newHtml.replace(`%value%`, UICtrl.formatNumber(el.value, type))
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
      let dataTotals = budgetCtrl.getBudget();
      UICtrl.displayBudget(dataTotals)
    })
  }
  var setupEventListeners = function() {
    var DOM = UICtrl.getDOMStrings();
    document.querySelector(DOM.inputButton).addEventListener("click", ctrlAddItem);
    document.addEventListener("keypress", (e)=> {
      if (e.which === 13) {
        ctrlAddItem();
      }
    });
    document.querySelector(DOM.container).addEventListener("click", ctrlDeleteItem);
    document.querySelector(DOM.inputType).addEventListener("change", UICtrl.changedType);
  };
  var updateBudget = function() {
    // 1. Calculate the budget
    budgetCtrl.calculateBudget();
    // 2. Return the Budget
    var budget = budgetCtrl.getBudget();
    // 3. Display the budget on the UI
    UICtrl.displayBudget(budget);
  };
  var updatePercentages = function() {
    // 1. Calculate the Percentage
    budgetCtrl.calculatePercentages();
    // 2. Read percentage from Budget Controller
    var percentages = budgetCtrl.getPercentages();
    // 3. Display the percentage on the UI
    UICtrl.displayPercentages(percentages);
  };
  var ctrlAddItem = function() {
    var input, newItem;
    // 1. Get the field input data
    input = UICtrl.getInput();
    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      // 2. Add the item to the budget controller
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);

      // 3. Add the item to the UI
      UICtrl.addListItem(newItem, input.type);
      // 4. Clear The Fields
      UICtrl.clearFields();
      // 5. Calculate and update budget
      updateBudget();
      // 6. Calculate and Update Percentages
      updatePercentages();
      localStorage.setItem('budget', JSON.stringify(budgetCtrl.data))
    }
  };
  var ctrlDeleteItem = function(e) {
    var itemID, splitID, type, ID;
    itemID = e.target.parentNode.parentNode.parentNode.parentNode.id;
    if (itemID) {
      splitID = itemID.split("-");
      type = splitID[0];
      ID = parseInt(splitID[1]);
      // 1. Delete the item from the data structure
      budgetCtrl.deleteItem(type, ID);
      // 2. Delete the item from UI
      UICtrl.deleteListItem(itemID);
      // 3. Update and show the new budget
      updateBudget();
      // 4. Calculate and Update Percentages
      updatePercentages();
      localStorage.setItem('budget', JSON.stringify(budgetCtrl.data))
    }
  };
  return {
    init: function() {
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });
      UICtrl.displayMonth();
      setupEventListeners();
      displayOnLoad('inc')
      displayOnLoad('exp')
    }
  };
})(budgetController, UIController);
controller.init();