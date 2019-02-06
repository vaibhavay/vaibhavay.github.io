

var budgetController =(function(){

	var Expenses = function(id,description,value){

		this.id = id;
		this.description=description;
		this.value=value;
		this.percentage=-1;

	};

	Expenses.prototype.calcPercentage=function(totalIncome){		//We created a prototype because by this, all the expenses created will inherit the percentage by prototype chain.
		
		if(totalIncome>0){
			this.percentage=Math.round((this.value/totalIncome)*100);
		}else{
			this.percentage=-1;
		}


	}

	Expenses.prototype.getPercentage=function(){
		return this.percentage;
	}

	var Income = function(id,description,value){

		this.id = id;
		this.description=description;
		this.value=value;
	};	


	var data ={
		allItems : {
			expense :[],			//expense is the name that will be returned by the getInput.itype .
			income :[]				// same as above
		},
		totalItem : {
			expense:0,
			income:0
		},
		budget:0


	};

	var calculateTotal =function(type){
		var sum=0 ;
		data.allItems[type].forEach(function(curr){
			sum += parseFloat(curr.value);
		});
		data.totalItem[type]=sum;
		
	};
	
	return {
		addItem : function(type, des, val){
			var newItem , ID;				//ID keeps the index number
			//Creating new ID
			if(data.allItems[type].length>0){
				ID = data.allItems[type][data.allItems[type].length-1].id+1;
			}else{
				ID = 0;
			}
			console.log(ID);

			//Creating new item 
			if(type==='expense'){
				newItem = new Expenses(ID,des,val);
			}else if(type==='income'){
				newItem = new Income(ID,des,val);
			}

			//Pushing item into data structure.

			data.allItems[type].push(newItem);
		//	console.log(data.totalItem.income);
			return newItem ;

		},
		
		calculateBudget : function(){
			calculateTotal('expense');
			calculateTotal('income');
			data.budget=data.totalItem.income - data.totalItem.expense;
			console.log(data.budget);
			return data.budget;


		},

		deleteItem : function(type,id){
			var ids , index;

			// Supppose we have deleted a few items before then the resulting all item array will be of type 
			//[1,3,5,6,8,9]
			//So we can't just go by id , bcs the 3rd id is actually at 2nd index 
			//To do this first we need to create the array of existing ids which is done as :
			ids= data.allItems[type].map(function(current){
				return current.id;
			}); 				//this will creat array of existing ids like ids =[1,3,5,6,8,9]

			index = ids.indexOf(id);	//For extracting the current index of the id to be removed

			if(index!==-1){
				data.allItems[type].splice(index,1);

			}


		},

		calculatePercentages:function(){
			data.allItems.expense.forEach(function(curr){

				curr.calcPercentage(data.totalItem.income);
			});
		},

		getPercentages:function(curr){
			var allPerc =[]; 
			data.allItems.expense.forEach(function(curr){	//Used map func. and not forEach bcs , map func. returns values and stores into variable.
				
				allPerc.push(curr.getPercentage());
			});
			//console.log(allPerc[0]);
			return allPerc;
		},

		getData : function(){
			return {
				budget : data.budget,
				totalExp: data.totalItem.expense,
				totalInc : data.totalItem.income
			};
		}
	};


})();



var UIController = (function(){
	

	var DOM ={
		inputType:'.add__type',
		inputDescription: '.add__description',
		inputValue : '.add__value',
		inputBtn   : '.add__btn',
		incomeContainer:'.income__list',
		expenseContainer:'.expenses__list',
		budgetValue :'.budget__value',
		expenseValue:'.budget__expenses--value',
		incomeValue :'.budget__income--value',
		listContainer:'.container',		//This is "Event Delegation" , according to which we work on the highest parent class.
		expensesPercLabel: '.item__percentage',
		//expensesPercLabelTotal:'.budget__expenses'
		expensesPercLabelTotal:'.budget__expenses--percentage',
		dateLabel : '.budget__title--month'
	};

	var formatNumber=function(num , type){
		var numSplit ,int,dec;

		 /*
            + or - before number
            exactly 2 decimal points
            comma separating the thousands

            2310.4567 -> + 2,310.46
            2000 -> + 2,000.00
            */

		num=Math.abs(num);
		num=num.toFixed(2);

		numSplit=num.split('.');

		int=numSplit[0];
		dec=numSplit[1];

		if(int.length>3){
			int=int.substr(0,int.length-3)+','+int.substr(int.length-3,3);//input 23510, output 23,510
		}

		return (type==='expense'? '-':'+')+' '+int+'.'+dec;

	};
	
	var nodeListForEach=function(list,callback){
		for(var i=0;i<list.length;i++){
			callback(list[i],i);
		}
	};
	
	

	
	return {
		getInput: function(){
			console.log(document.querySelector(DOM.inputType).value);
			return {
				itype	   :document.querySelector(DOM.inputType).value,
				idescription:document.querySelector(DOM.inputDescription).value,
				ivalue      :document.querySelector(DOM.inputValue).value
			};
		},

		getDOM :function(){
			return DOM;
		},

		addItemList:function(object,type){			//Adding element to HTML by using addAdjacent method (search online)
			var html,newHtml,element;

			if(type==='income'){
				element=DOM.incomeContainer;				//Container of the html code required in add adjacent method
				//Now adding the Increment section HTML code with placeholders(here in btw %%) so that later can be replaced using string functions
				html = '<div class="item clearfix" id="income-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
			}else if(type==='expense'){
				element=DOM.expenseContainer;

				html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">%percentage%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
			}

			//Replacing the position holders with values
			newHtml = html.replace('%description%',object.description);
			newHtml = newHtml.replace('%id%',object.id);
			
			newHtml = newHtml.replace('%value%',object.value);

			//Applying the addAdjacent Method

			document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);

		},

		updateBudget:function(obj){
			var type ;

			obj.budget >0 ? type='income':type='expense';

			document.querySelector(DOM.budgetValue).textContent=formatNumber(obj.budget,type);
			document.querySelector(DOM.expenseValue).textContent=formatNumber(obj.totalExp,'expense');
			document.querySelector(DOM.incomeValue).textContent=formatNumber(obj.totalInc,'income');


		},

		displayPercentage:function(percentage){
			var fields = document.querySelectorAll(DOM.expensesPercLabel);
			var totalPerc = DOM.expensesPercLabelTotal;

			var alter =function(){
				function getSum(total,num){
					return total+num;
				}
			//	if(percentage.length>0){	
					var sum = percentage.reduce(getSum);
			//	}
				document.querySelector(totalPerc).textContent=sum+'%'
			}

			if(percentage.length>0){		
				alter();
			}


			nodeListForEach(fields,function(current,index){
				//console.log(index);
				if(percentage.length > -1){
					current.textContent = percentage[index]+'%';
				}else{
					current.textContent='---';
				}
			});
		},

		clearFields :function(){
			var fields, fieldsArray;

			//Using the querySelectorAll function . It returns a list.
			fields = document.querySelectorAll(DOM.inputDescription + ',' + DOM.inputValue);

			//Converting the list into array such that operation can be performed easily .

			fieldsArray= Array.prototype.slice.call(fields);

			//Using the forEach function to clear the fields.(we can also use a for loop to traverse the array instead).
			//The fieldsArray =[inputDescription,inputValue]

			fieldsArray.forEach(function(current,index,value){
				current.value="";

			//Method to put the cursor back to the description field after clearing.

			fieldsArray[0].focus();
			});



		},

		deleteItem:function(item){
			var e1= document.getElementById(item);
			e1.parentNode.removeChild(e1);
		},

		displayMonth :function(){
			var now ;
			var n=months =['January','Febuary','March','April','May','June','July','August','September','October','November','December'];
			now= new Date(); 	//Inbuilt function for system date and time 
			var year = now.getFullYear();
			var month = now.getMonth();
			document.querySelector(DOM.dateLabel).textContent=months[month]+' '+year; 
		},

		changedType:function(){
			var fields=document.querySelectorAll(
				DOM.inputType+','+DOM.inputDescription+','+DOM.inputValue+','+DOM.inputBtn
				);

			nodeListForEach(fields,function(curr){
				curr.classList.toggle('red-focus');
			});

			//document.querySelector(DOM.inputBtn).classList.toggle('red');
		}
	};

	


})(); 



var controller = (function(budgetCtrl,UICtrl){



	var setupEventListener = function(){
		var DOM = UICtrl.getDOM();

		document.querySelector(DOM.inputBtn).addEventListener('click',addNewItem);

		document.addEventListener('keypress',function(event){
			if(event.keyCode === 13){
				addNewItem();
			
			}
		});

		
		document.querySelector(DOM.listContainer).addEventListener('click',deleteItem);	//Event Delegation
		document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changedType);//For Changing to red outline for expense
		}
	
	var updatePercentage = function(){

		//1.Calculate Percentage
		budgetCtrl.calculatePercentages();
		

		//2.Update budget.
		var percentage=budgetCtrl.getPercentages();
		console.log(percentage);

		//3.Update UI
		UICtrl.displayPercentage(percentage);
	
	}


	var addNewItem = function(){

		var input , newItem,data;
		
		//1.Get the field input data from UI
		input =UICtrl.getInput();


		//2.Add item to the budget controller.
		if(input.idescription!=="" && !isNaN(input.ivalue) && input.ivalue>0){

			newItem=budgetCtrl.addItem(input.itype,input.idescription,input.ivalue);
		//3.Add item to the list in UI
			UICtrl.addItemList(newItem,input.itype);
			console.log("Entry Done !!!");
		}

		//4. Clear the fields
		UICtrl.clearFields();

		//5.Calculate Budget.
		budgetCtrl.calculateBudget();

		//6.Display Budget and Data.
		data = budgetCtrl.getData();
		UICtrl.updateBudget(data);

		//7.Update Percentage
		updatePercentage();



	}
	
	var deleteItem = function(event){
		console.log(event);
		var itemID , splitItem,type,id,data ;

		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;	//This is hard bound to the DOM created in HTML.We are traversing from the button<i> to the main class.s
		console.log(itemID);
		if(itemID){
			splitItem=itemID.split("-");		//The item id is in form "expense-2", so we need to extract both the type and the id to pin point the element we need to delete.
			type=splitItem[0];
			console.log(type);
			id=parseInt(splitItem[1]);	
			console.log(id);
			
			//Delete Item from budget
			budgetCtrl.deleteItem(type,id);
			
			//Delete item from UI
			UICtrl.deleteItem(itemID);
			
			//Update budget 
			budgetCtrl.calculateBudget();
			data=budgetCtrl.getData();
			UICtrl.updateBudget(data);

			//Update Percentage
			updatePercentage();
			
		}

	}
	



	return {

		init:function(){
			UICtrl.displayMonth();
			console.log("Application Started");
			setupEventListener();
			
			


		}
	};


})(budgetController,UIController);


controller.init();

