
        class Task {
            constructor(text, id) {
                this.id = id;  // Использование приватного свойства
                this.text = text;
                this.mainText = '';
                this.isDone = false;
            }
        
            
        }

        let dataService = {
            tasks: [],

            get allTasks() {
                return this.tasks;
            },

            get notCompletedTasks() {
                return this.tasks.filter(task => task.isDone == false);
            },

            add(task) {
                task.id = this.tasks.length + 1;
                this.tasks.push(task);
                this.save();
            },

            save() {
                localStorage.setItem("tasks", JSON.stringify(this.tasks));
            },

            open() {
                this.tasks = JSON.parse(localStorage.getItem("tasks")) || [];
            },
            
            delete(task){
                let index = this.tasks.indexOf(task);
                this.tasks.splice(index, 1);
                this.save();
            },
            saveText(task){
                let index = this.tasks.indexOf(task);
                this.tasks.splice(index, 1);
                this.save();
            }
        }

        class TasksListView {
            element;
            dataService;

            constructor(element) {
                this.element = element;
                dataService = dataService;
            }

            #drawList(tasksElements) {
                this.element.innerHTML = "";

                tasksElements.forEach(taskElement => {
                    taskElement.createIn(this.element);
                });
            }

            drawAll() {
                let taskElements = [];
                let tasks = dataService.allTasks;
                if (tasks.length == 0) return;

                tasks.forEach(task => {
                    taskElements.push(new TaskView(task))
                });
                this.#drawList(taskElements);
            }

            drawNotCompleted() {
                let taskElements = [];
                let tasks = dataService.notCompletedTasks;
                if (tasks.length == 0) return;

                tasks.forEach(task => {
                    taskElements.push(new TaskView(task))
                });
                this.#drawList(taskElements);
            }
        }

        class TaskView {
            constructor(task) {
                this.task = task;
                this.div = null;
                this.id = task.id;
            }

            createIn(element) {
                
               
                
                this.div = document.createElement("div");
                this.div.classList.add("task");
                this.div.addEventListener('dragenter', dragEnter);
                this.div.addEventListener('dragleave', dragLeave);
                this.div.addEventListener('dragover', dragOver);
                this.div.addEventListener('drop', dropEl);

                let div1 = document.createElement("div");
                div1.classList.add("fill");
                div1.addEventListener('dragstart', dragStart);
                div1.addEventListener('dragend', dragEnd);
                div1.draggable = true;

                let input = document.createElement("input");
                input.addEventListener("click", this.changeState.bind(this));
                input.type = "checkbox";

                let input2 = document.createElement("textarea");
                input2.addEventListener("input", this.changeText.bind(this));
                
                input2.maxLength = 120;
                input2.rows = 4;
                input2.placeholder='Add your own notes';
                input2.value = this.task.mainText;
                let p = document.createElement("p");
                
                p.innerText = this.task.text;
                
                

                let button = document.createElement('button');
                button.addEventListener("click", this.deleteTask.bind(this));
                button.textContent = 'Delete';
                this.div.append(div1);
                div1.append(input);
                div1.append(p);
                div1.append(input2);
                div1.append(button);

                if (this.task.isDone) {
                    this.div.classList.add("completed");
                    input.checked = true;
                }
                element.prepend(this.div);
            }

            changeState(element) {
                this.task.isDone = !this.task.isDone;
                dataService.save();
                this.div.classList.toggle("completed");
            }

            changeText(){
                let input = this.div.querySelector('textarea').value;
                this.task.mainText = input;
                dataService.save();
            }

            deleteTask(){
                dataService.delete(this.task);
                this.div.remove();
            }

           


        }

        let taskNameInput = document.querySelector("#task-name-input");
        let addTaskButton = document.querySelector("#add-task-btn");
        let startMessage = document.querySelector("#start-message");
        let showAllButton = document.querySelector("#show-all-btn");
        let showNotCompletedButton = document.querySelector("#show-not-completed-btn");
        let taskList = document.querySelector(".task-list");

        dataService.open();
        let tasksListView = new TasksListView(taskList);

        addTaskButton.addEventListener("click", addTaskHandler);
        showAllButton.addEventListener("click", showAllHandler);
        showNotCompletedButton.addEventListener("click", showNotCompletedHandler);

        window.addEventListener("load", function () {
            tasksListView.drawAll();
        });

        taskNameInput.addEventListener("keydown", function (e) {
            if (e.code == "Enter") addTaskHandler();
        })

        function addTaskHandler() {
            if (taskNameInput.value) {
                if (!startMessage.hidden) startMessage.hidden = true;

                let newTask = new Task(taskNameInput.value);
                dataService.add(newTask);
                tasksListView.drawAll();

                taskNameInput.value = "";
            } else {
                alert("Enter task name");
            }
        }

        function showAllHandler() {
            tasksListView.drawAll();
        }

        function showNotCompletedHandler() {
            tasksListView.drawNotCompleted();
        }
 


let currentDraggedElement = null;
// let fill = document.querySelectorAll('.fill');
// let empties = document.querySelectorAll('.task');

// fill.forEach(element => {
//     element.addEventListener('dragstart', dragStart);
//     element.addEventListener('dragend', dragEnd);
// });


// for (const empty of empties) {
//     empty.addEventListener('dragenter', dragEnter);
//     empty.addEventListener('dragleave', dragLeave);
//     empty.addEventListener('dragover', dragOver);
//     empty.addEventListener('drop', dropEl);
// }
function dragStart(){
    this.classList.add('hold');
    currentDraggedElement = this; // Сохраняем ссылку на перетаскиваемый элемент
}

function dragEnd(){
    this.classList.remove('hold');
    currentDraggedElement = null; // Очищаем ссылку после завершения перетаскивания
}

function dragEnter(e){
    e.preventDefault();
    this.classList.add('hovered');
}

function dragLeave(){
    this.classList.remove('hovered');
}

function dragOver(e){
    e.preventDefault(); 
}
function dropEl(e){
    e.preventDefault();
    this.classList.remove('hovered');

    
    if (currentDraggedElement && this !== currentDraggedElement.parentElement) {
        // Ссылка на целевой контейнер, в котором уже может находиться элемент
        let targetContainer = this;
        let targetId = this.id;
        console.log(targetId);
        
        let sourceContainer = currentDraggedElement.parentElement;
        


        
        // Проверка, есть ли уже элемент в целевом контейнере
        let targetElement = targetContainer.querySelector('.fill');

        // Если в целевом контейнере уже есть элемент, меняем их местами
        if (targetElement) {
            sourceContainer.appendChild(targetElement);
            targetContainer.appendChild(currentDraggedElement);
        } else {
            // Если целевой контейнер пуст, просто перемещаем элемент туда
            targetContainer.appendChild(currentDraggedElement);
        }
    }
}
