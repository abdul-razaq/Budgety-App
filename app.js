// The module that handles our budget data
// BUDGET CONTROLLER MODULE
let budgetController = (function() {
  // In the module pattern, we have to return an object containing a method that we want to expose to the public.
  // The Expense constructor function or class
  class Expense {
    constructor(id, description, value) {
      this.id = id;
      this.description = description;
      this.value = value;
      this.percentage = -1;
    }
    // We can add our prototype methods here
    // method on each of the expense object in our array that calculates the percentage it eats from the total income i.e expense/income = result%;
    calcPercentage(totalIncome) {
      if (totalIncome > 0) {
        this.percentage = Math.round((this.value / totalIncome) * 100);
      } else {
        this.percentage = -1;
      }
    }

    getPercentage() {
      // retrieve the percentage from the object and retrieve it
      return this.percentage;
    }
  }

  // The Expense constructor function or class
  class Income {
    constructor(id, description, value) {
      this.id = id;
      this.description = description;
      this.value = value;
    }
  }

  // calculate total
  let calculateTotal = function(type) {
    let sum = 0;
    data.allItems[type].forEach(currentItem => {
      sum += currentItem.value;
    });
    data.totals[type] = sum;
  };

  // All instance of our expense and income object should go into one big data structure
  let data = {
    allItems: {
      exp: [],
      inc: [],
    },
    totals: {
      exp: 0,
      inc: 0,
    },
    budget: 0,
    percentage: -1,
  };

  // Public method that allows other modules to add a new item into our data structure
  return {
    // All our public methods live here
    addItem: function(type, des, val) {
      let newItem, ID;
      // Create new ID based on the last item in either inc or exp array
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }
      // Create new item based on 'inc' or 'exp' type
      if (type === 'exp') {
        newItem = new Expense(ID, des, val);
      } else if (type === 'inc') {
        newItem = new Income(ID, des, val);
      }
      // Add the newItem received to our data structure
      data.allItems[type].push(newItem);
      // return the newItem so that the other modules can get to use it
      return newItem;
    },

    deleteItem: function(type, id) {
      let ids, index;
      ids = data.allItems[type].map(current => {
        return current.id;
      });

      index = ids.indexOf(id);

      // Delete the item from the array
      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget: function() {
      // calculate the sum of all incomes and expenses
      calculateTotal('exp');
      calculateTotal('inc');
      // calculate the budget, which is the income minus the expenses
      data.budget = data.totals.inc - data.totals.exp;
      // calculate the percentage of income that we spent
      // calculate the percentage only if there is an INCOME Value available
      if (data.totals.inc > 0) {
        // percentage of the income spent is the expenses divided by the income
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        // If the income value does not exist, set the percentage value to appear that it doesn't exist
        data.percentage = -1;
      }
    },

    calculatePercentages: function() {
      data.allItems.exp.forEach(currentItem => {
        currentItem.calcPercentage(data.totals.inc);
      });
    },

    getPercentages: function() {
      let allPercentages = data.allItems.exp.map(currentItem => {
        return currentItem.getPercentage();
      });
      return allPercentages;
    },

    getBudget: function() {
      return {
        budget: data.budget,
        totalIncome: data.totals.inc,
        totalExpenses: data.totals.exp,
        percentage: data.percentage,
      };
    },

    testing: function() {
      console.log(data);
    },
  };
})();

// The module that handles our UI
// UI CONTROLLER MODULE
let UIController = (function() {
  // Object that keeps all the DOM Strings from our user interface
  let DOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputButton: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercLabel: '.item__percentage',
    dateLabel: '.budget__title--month',
  };
  // Method to get the user inputs and because we will be using this function in other controllers, it can't be a private function but instead it's going to be a public method, so it has to be in the object that the IIFE will return.

  // Format the values in the UI
  let formatNumber = function(num, type) {
    let numSplit, int, dec;

    num = Math.abs(num);
    num = num.toFixed(2);

    // split the numbers to get the integer and decimal parts
    numSplit = num.split('.');

    int = numSplit[0];
    // separate the thousand values with comma
    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
    }
    dec = numSplit[1];

    return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
  };

  // Writing our own forEach loop for looping over a nodelist returned as a result of calling querySelectorAll
  let nodeListForEach = function(list, callback) {
    for (let i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  return {
    // Our method for returning all of the 3 inputs that we have in our user interface
    getInput: function() {
      // read the data from the user interface
      return {
        // Grab the type of the select element
        type: document.querySelector(DOMstrings.inputType).value, // Value will be either 'inc' or 'exp' as specified in the 'option' html tag of the select element as <select> works differently from input
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
      };
    },
    // Add list item to the User Interface
    addListItem: function(obj, type) {
      // Create html string with placeholder text
      let html, newHtml, element;
      if (type === 'inc') {
        element = DOMstrings.incomeContainer;

        html = `<div class="item clearfix" id="inc-%id%">
        <div class="item__description">%description%</div>
        <div class="right clearfix">
            <div class="item__value">%value%</div>
            <div class="item__delete">
                <button class="item__delete--btn"><i class="fa fa-cancel"></i></button>
            </div>
        </div>
    </div>`;
      } else if (type === 'exp') {
        element = DOMstrings.expensesContainer;

        html = `<div class="item clearfix" id="exp-%id%">
        <div class="item__description">%description%</div>
        <div class="right clearfix">
            <div class="item__value">%value%</div>
            <div class="item__percentage">21%</div>
            <div class="item__delete">
                <button class="item__delete--btn"><i class="fa fa-delete"></i></button>
            </div>
        </div>
    </div>`;
      }

      // Replace the placeholder text with some actual data received from the created object
      newHtml = html.replace('%id', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

      // Insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },
    deleteListItem: function(selectorID) {
      let el = document.getElementById(selectorID);

      el.parentNode.removeChild(el);
    },
    clearFields: function() {
      // Clear the input fields after we have collected our input values
      let fields, fieldsArray;
      fields = document.querySelectorAll(
        DOMstrings.inputDescription + ', ' + DOMstrings.inputValue
      );

      fieldsArray = Array.prototype.slice.call(fields);
      // We can now loop through this array
      fieldsArray.forEach((current, index, array) => {
        current.value = '';
      });
      // Set the cursor or focus back to the description field
      fieldsArray[0].focus();
    },
    displayBudget: function(obj) {
      let type;
      obj.budget > 0 ? (type = 'inc') : (type = 'exp');
      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(
        obj.budget,
        type
      );
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(
        obj.totalIncome,
        'inc'
      );
      document.querySelector(
        DOMstrings.expensesLabel
      ).textContent = formatNumber(obj.totalExpenses, 'exp');

      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent =
          obj.percentage + '%';
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = '---';
      }
    },

    displayPercentages: function(percentages) {
      // Display the percentages in the UI
      let fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

      nodeListForEach(fields, function(current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + '%';
        } else {
          current.textContent = '---';
        }
      });
    },

    displayMonth: function() {
      let now, months, month, year;

      now = new Date();

      months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'Jun',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];
      month = now.getMonth();

      year = now.getFullYear();
      document.querySelector(DOMstrings.dateLabel).textContent =
        months[month] + ' ' + year;
    },

    changedType: function() {
      let fields = document.querySelectorAll(
        DOMstrings.inputType +
          ', ' +
          DOMstrings.inputDescription +
          ', ' +
          DOMstrings.inputValue
      );

      nodeListForEach(fields, function(currentItem) {
        currentItem.classList.toggle('red-focus');
      });

      document.querySelector(DOMstrings.inputButton).classList.toggle('red');
    },
    // Expose the DOMstrings object so that other controller modules can have access to this object
    getDOMstrings: function() {
      // Expose the DOMstrings to the public interface
      return DOMstrings;
    },
  };
})();

// The module that acts as the bridge between the 2 other modules above
// THE GLOBAL APP CONTROLLER MODULE
let controller = (function(budgetCtrl, UICtrl) {
  // Initialization function to house all event listeners
  let setupEventListener = function() {
    // Get the DOMstrings exposed by the UIController module
    let DOM = UICtrl.getDOMstrings();
    // Setup the event listener for our submit button

    // Because we are repeating the same code on both the mouse click and keyboard event listener callbacks, to avoid repeating ourselves, we have to define a custom function and then use this function in both event handlers.
    document
      .querySelector(DOM.inputButton)
      .addEventListener('click', ctrlAddItem);

    // But what happens when the user hits the 'Enter' key instead of clicking on the button, we need to add a separate event listener to handle the 'keypress' event
    document.addEventListener('keypress', function(event) {
      if (event.keyCode === 13 || event.which === 13) {
        // call the ctrlAddItem custom function
        ctrlAddItem();
      }
    });

    // listen on the container element for our income and expenses button for event delegation
    document
      .querySelector(DOM.container)
      .addEventListener('click', ctrlDeleteItem);

    // Add event listener to the dropdown for the income and expenses
    document
      .querySelector(DOM.inputType)
      .addEventListener('change', UICtrl.changedType);
  };

  // Function to calculate and update the budget
  let updateBudget = function() {
    // 1. Calculate the budget
    budgetCtrl.calculateBudget();
    // 2. Return the budget
    let budget = budgetCtrl.getBudget();
    // 3. Display the budget on the User Interface
    UICtrl.displayBudget(budget);
  };

  let updatePercentages = function() {
    // 1. Calculate percentages
    budgetCtrl.calculatePercentages();
    // 2. Read percentages from the budget controller
    let percentages = budgetCtrl.getPercentages();
    // 3. Update the UI with the new percentages
    UICtrl.displayPercentages(percentages);
  };

  // The Controller Add Item function to avoid repeating ourselves
  let ctrlAddItem = function() {
    // What to do when the user hits the submit button
    let input, newItem;
    // TODO LIST
    // 1. As soon as someone hits the button, we first need to get the filled input data
    // Grab the returned input data from the UI Controller
    input = UICtrl.getInput();
    // Make sure there are some data in the description and value fields before we start processing them
    if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
      // 2. Add the item to the budget controller
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);

      // 3. Add the new item to the User Interface]
      UICtrl.addListItem(newItem, input.type);
      // 4. Clear the fields
      UICtrl.clearFields();
      // 5. Calculate and update budget
      updateBudget();
      // 6. Calculate and update the percentages
      updatePercentages();
    }
  };

  // The ctrlDeleteItem function that gets called when someone clicks anywhere on the container of our income and expenses button for event delegation
  let ctrlDeleteItem = function(event) {
    let itemID, splitID, ID;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);
      // 1. Delete the item from the data structure
      budgetCtrl.deleteItem(type, ID);
      // 2. Delete the item from the User Interface
      UICtrl.deleteListItem(itemID);
      // 3. Update and show the new budget
      updateBudget();
    }
  };

  return {
    init: function() {
      console.log('Application has started.');
      // display our current month
      UICtrl.displayMonth();
      // Reset everything to 0 when initialization starts
      UICtrl.displayBudget({
        budget: 0,
        totalIncome: 0,
        totalExpenses: 0,
        percentage: -1,
      });
      setupEventListener();
    },
  };
})(budgetController, UIController);

// Initialize our initialization function
controller.init();
