class Task {
    constructor(text) {
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
        this.tasks.push(task);
        this.save();
    },

    save() {
        localStorage.setItem("tasks", JSON.stringify(this.tasks));
    },

    open() {
        this.tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    },
    
    delete(task) {
        let index = this.tasks.indexOf(task);
        this.tasks.splice(index, 1);
        this.save();
    },

    moveTask(oldIndex, newIndex) {
        if (newIndex >= this.tasks.length) {
            let k = newIndex - this.tasks.length + 1;
            while (k--) {
                this.tasks.push(undefined);
            }
        }
        this.tasks.splice(newIndex, 0, this.tasks.splice(oldIndex, 1)[0]);
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
    }

    createIn(element) {
        this.div = document.createElement("div");
        this.div.classList.add("task");
        this.div.draggable = true;
        this.div.addEventListener('dragstart', dragStart);
        this.div.addEventListener('dragend', dragEnd);
        this.div.addEventListener('dragenter', dragEnter);
        this.div.addEventListener('dragleave', dragLeave);
        this.div.addEventListener('dragover', dragOver);
        this.div.addEventListener('drop', dropEl);

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
        this.div.append(input);
        this.div.append(p);
        this.div.append(input2);
        this.div.append(button);

        if (this.task.isDone) {
            this.div.classList.add("completed");
            input.checked = true;
        }
        element.append(this.div);
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
let currentDraggedElementIndex = null;

function dragStart(e) {
    this.classList.add('hold');
    currentDraggedElement = this; // Сохраняем ссылку на перетаскиваемый элемент
    currentDraggedElementIndex = Array.from(this.parentElement.children).indexOf(this);
    setTimeout(() => (this.classList.add('invisible')), 0);
}

function dragEnd() {
    this.classList.remove('hold', 'invisible');
    currentDraggedElement = null; // Очищаем ссылку после завершения перетаскивания
    currentDraggedElementIndex = null;
}

function dragEnter(e) {
    e.preventDefault();
    this.classList.add('hovered');
}

function dragLeave() {
    this.classList.remove('hovered');
}

function dragOver(e) {
    e.preventDefault(); 
}

function dropEl(e) {
    e.preventDefault();
    this.classList.remove('hovered');

    if (currentDraggedElement && this !== currentDraggedElement) {
        let targetIndex = Array.from(this.parentElement.children).indexOf(this);

        if (targetIndex !== -1 && currentDraggedElementIndex !== -1) {
            dataService.moveTask(currentDraggedElementIndex, targetIndex);
            tasksListView.drawAll();  // Redraw the task list to reflect the new order
        }
    }
}
