const form = document.querySelector("#todo-form");
const todoInput = document.querySelector("#todo");
const todoList = document.querySelector(".list-group");
const firstCardBody = document.querySelectorAll(".card-body")[0];
const secondCardBody = document.querySelectorAll(".card-body")[1];
const filter = document.querySelector("#filter");
const clearButton = document.querySelector("#clear-todos");
const clearDeletedTasksButton = document.querySelector("#clear-deleted-todos");
const deletedToDoList = document.querySelector(".deletedToDoListItem");
const clearAllFilteredTodos = document.querySelector("#clear-all-filtered-todos");
const notFoundFilterValue = document.querySelector(".notFoundFilterValue");

eventListeners();

function eventListeners() {
    form.addEventListener("submit", addTodo);
    document.addEventListener("DOMContentLoaded", loadAllTodosToUI);
    secondCardBody.addEventListener("click", deleteTodo);
    secondCardBody.addEventListener("click", deleteDeletedTodo);
    secondCardBody.addEventListener("click", undoItem);

    filter.addEventListener("keyup", filterTodos);
    clearAllFilteredTodos.addEventListener("click", clearAllFilteredTodosButton)

    clearDeletedTasksButton.addEventListener("click", deleteDeletedTasksButton)
    clearButton.addEventListener("click", clearAllTodos);
    document.addEventListener('click', function (event) {
        changeColor(event);
        editTodo(event);
        updateToDo(event);
    });
}

function clearAllTodos() {
    if (confirm("Tamamını kalıcı olarak silmek istediğinize emin misiniz?")) {
        todoList.innerHTML = "";
        let todos = getTodosFromStorage();
        let deletedTodos = getDeletedTodosFromStorage();
        todos.forEach(function (todo, index) {
            deletedTodos.push(todo);
        })
        localStorage.setItem("deletedTodos", JSON.stringify(deletedTodos));
        localStorage.removeItem("todos")
        loadAllTodosToUI();
    }
}

function clearButtonDisplay() {
    if (todoList.childElementCount !== 0) {
        clearButton.classList.add("d-inline-block")
        return
    }
    clearButton.classList.remove("d-inline-block")
    clearButton.classList.add("d-none")
}

function clearDeletedButtonDisplay() {
    if (deletedToDoList.childElementCount !== 0) {
        clearDeletedTasksButton.classList.add("d-inline-block")
        return
    }
    clearDeletedTasksButton.classList.remove("d-inline-block")
    clearDeletedTasksButton.classList.add("d-none")
}
function giveInfoWhenCurrentToDoEmpty(e) {
    const infoItem = document.createElement("p")
    if (e.childElementCount < 1) {
        infoItem.innerText = "Güncel To Do'nuzda bir To Do Bulunmuyor."
        const toDoHeader = document.querySelector("#toDoHeader")
        toDoHeader.appendChild(infoItem);
        return
    }
    const toDoHeader = document.querySelector("#toDoHeader")
    while (toDoHeader.firstChild) {
        toDoHeader.removeChild(toDoHeader.firstChild);
    }
}
function filterTodos(e) {
    const filterValue = e.target.value.trim().toLowerCase();
    const listItems = document.querySelectorAll(".list-group-item");
    const addedListItems = document.querySelectorAll(".list-group-item.addedTodos");
    let emptyState = true

    if (filter.value.trim().length > 2) {

        listItems.forEach(function (listItem) {
            const text = listItem.textContent.toLowerCase();
            if (text.indexOf(filterValue) === -1) {
                listItem.classList.remove("d-flex")
                listItem.classList.add("d-none");

                clearButton.classList.remove("d-inline-block")
                clearButton.classList.add("d-none")
                clearDeletedTasksButton.classList.remove("d-inline-block")
                clearDeletedTasksButton.classList.add("d-none")
                return
            }
            emptyState = false
            listItem.classList.add("d-flex", "filteredTodos");
            listItem.classList.remove("d-none");
        })

        if (emptyState) {
            notFoundFilterValue.classList.remove("d-none")
            clearAllFilteredTodos.classList.add("d-none")
            return
        } 
        notFoundFilterValue.classList.add("d-none")
        clearAllFilteredTodos.classList.remove("d-none");
        
        let emptyAddedList = false

        addedListItems.forEach(function (addedListItem) {
            const text = addedListItem.textContent.toLowerCase();
            if (text.indexOf(filterValue) === -1) {
                clearAllFilteredTodos.classList.add("d-none")
                notFoundFilterValue.classList.remove("d-none")
                return
            }
            emptyAddedList = true
        })
        if (emptyAddedList) {
            clearAllFilteredTodos.classList.remove("d-none")
            notFoundFilterValue.classList.add("d-none")
        }
        return
    }
    loadAllTodosToUI()
    notFoundFilterValue.classList.add("d-none")
    clearAllFilteredTodos.classList.add("d-none")
}
function clearAllFilteredTodosButton(e) {
    if (e.target.id === "clear-all-filtered-todos") {
        if (confirm("Tüm filtrelenmiş To Do'ları silmek istediğinize emin misiniz?")) {
            document.querySelectorAll(".filteredTodos").forEach(element => {
                deleteTodoFromStorage(element.textContent.trim())
            });
            filter.value = "";
            clearAllFilteredTodos.classList.add("d-none")
        }
    }
}

function deleteTodo(e) {
    if (e.target.className === "fa fa-remove") {
        if (confirm("Seçtiğiniz To Do'yu silmek istediğinize emin misiniz?")) {
            e.target.parentElement.parentElement.remove();
            deleteTodoFromStorage(e.target.closest(".list-group-item").innerText.trim())

            clearButtonDisplay();
            clearDeletedButtonDisplay();

            showAlert("success", "Todo başarıyla silindi")
        }
    }
}
function deleteDeletedTodo(e) {
    if (e.target.className === "fa fa-times") {
        if (confirm("Seçtiğiniz To Do'yu kalıcı olarak silmek istediğinize emin misiniz?")) {
            e.target.parentElement.parentElement.remove();
            deleteDeletedTodoFromStorage(e.target.closest(".list-group-item").innerText.trim())

            clearButtonDisplay();
            clearDeletedButtonDisplay();

            showAlert("success", "Todo başarıyla silindi")
        }
    }
}

function editTodo(e) {
    if (e.target.className.includes("fa fa-pencil")) {
        const wrapper = document.querySelector(".toDoListItemActionWrapper");
        const editInput = document.querySelector(".editToDoItemText");
        wrapper.classList.remove("d-none");
        const toDoListItem = e.target.closest(".list-group-item");
        const selectedToDoListInput = document.querySelector(".selectedToDoListItem")
        selectedToDoListInput.value = toDoListItem.getAttribute("data-id")
        editInput.value = toDoListItem.innerText.trim();
    }
}
function updateToDo(e) {
    if (e.target.className.includes("updateToDoListItem")) {
        const selectedToDoListInput = document.querySelector(".selectedToDoListItem");
        const toDoListItem = document.querySelector('.list-group-item[data-id="' + selectedToDoListInput.value + '"]');
        const editInput = document.querySelector(".editToDoItemText");
        const todoListArr = []

        toDoListItem.innerText = editInput.value;
        const wrapper = document.querySelector(".toDoListItemActionWrapper");
        wrapper.classList.add("d-none");
        const link = document.createElement("div");
        link.className = "delete-item";
        link.innerHTML = "<i class='fa fa-pencil mr-2' aria-hidden='true'></i> <i class = 'fa fa-remove'></i>";
        toDoListItem.appendChild(link);

        const todoLists = document.querySelectorAll(".list-group-item");
        todoLists.forEach(todo => todoListArr.push(todo.textContent.trim()))
        localStorage.setItem("todos", JSON.stringify(todoListArr));
    }
    if (e.target.className.includes("cancelToDoListItem")) {
        const wrapper = document.querySelector(".toDoListItemActionWrapper");
        wrapper.classList.add("d-none");
    }
}

function deleteTodoFromStorage(deletetodo) {
    let todos = getTodosFromStorage();

    todos.forEach(function (todo, index) {

        if (todo === deletetodo) {
            todos.splice(index, 1);
        }
    })
    localStorage.setItem("todos", JSON.stringify(todos));
    let deletedTodos = getDeletedTodosFromStorage();
    deletedTodos.push(deletetodo);
    localStorage.setItem("deletedTodos", JSON.stringify(deletedTodos));
    loadAllTodosToUI();
}
function deleteDeletedTodoFromStorage(deletedTodo) {
    let todos = getDeletedTodosFromStorage();

    todos.forEach(function (todo, index) {

        if (todo === deletedTodo) {
            todos.splice(index, 1);
        }
    })
    let deleteTodos = JSON.parse(localStorage.getItem("deletedTodos"))
    deleteTodos.forEach((deleteTodo, index) => {
        if (deletedTodo === deleteTodo) {
            deleteTodos.splice(index, 1);
        }
    })
    localStorage.setItem("deletedTodos", JSON.stringify(deleteTodos))
}

function loadAllTodosToUI() {
    let todos = getTodosFromStorage();
    let deletedTodos = getDeletedTodosFromStorage();

    const uiItems = document.querySelectorAll(".list-group-item")
    uiItems.forEach(function (uiItem, index) {
        uiItem.remove();
    })

    todos.forEach(function (todo, index) {
        addToDoToUI(todo, index);
    })
    deletedTodos.forEach(function (todo, index) {
        addDeletedToDoToUI(todo, index);
    })
    clearButtonDisplay();
    clearDeletedButtonDisplay();
    giveInfoWhenCurrentToDoEmpty(todoList);
}
function addTodo(e) {
    e.preventDefault();
    const newTodo = todoInput.value.trim();

    if (checkToDoErrors(newTodo)) {
        return
    }
    const listItem = document.querySelector(".list-group-item:last-child")
    let lastDataId;
    if (listItem) {
        lastDataId = listItem.getAttribute("data-id");
    }
    addToDoToUI(newTodo, lastDataId ? Number(lastDataId) + 1 : 0);
    addToDoToStorage(newTodo);
    clearButtonDisplay();
    clearDeletedButtonDisplay();
    showAlert("success", "Todo başarıyla eklendi.")
}
function checkToDoErrors(text) {
    let error = false;
    let todos = getTodosFromStorage();
    let todosStorage = getDeletedTodosFromStorage();
    const isAlreadyExistOnDeleted = todosStorage.findIndex(todo => todo === text);
    const isAlreadyExistOnCurrent = todos.findIndex(todo => todo === text);
    if (!text) {
        showAlert("danger", "Lütfen bir todo giriniz...");
        error = true;
    }
    if (isAlreadyExistOnCurrent >= 0) {
        showAlert("danger", "Girdiğiniz To Do zaten var.");
        error = true;
    }
    if (isAlreadyExistOnDeleted >= 0) {
        showAlert("danger", "Girdiğiniz To Do silinmişler arasında.");
        error = true;
    }
    return error
}

function getTodosFromStorage() {
    let todos;
    if (localStorage.getItem("todos") === null) {
        todos = [];
    }
    else {
        todos = JSON.parse(localStorage.getItem("todos"));
    }
    return todos;
}
function getDeletedTodosFromStorage() {
    let deletedTodos;
    if (localStorage.getItem("deletedTodos") === null) {
        deletedTodos = [];
    }
    else {
        deletedTodos = JSON.parse(localStorage.getItem("deletedTodos"));
    }
    return deletedTodos;
}

function addToDoToStorage(newTodo) {
    let todos = getTodosFromStorage();
    todos.push(newTodo);
    localStorage.setItem("todos", JSON.stringify(todos));
}

function addDeletedToDoToStorage(newTodo) {
    let deletedTodos = getDeletedTodosFromStorage();
    deletedTodos.push(newTodo);
    localStorage.setItem("deletedTodos", JSON.stringify(deletedTodos));
}

function showAlert(type, message) {
    const alert = document.createElement("div");
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    firstCardBody.appendChild(alert);

    setTimeout(function () {
        alert.remove()
    }, 2000)
}

function addToDoToUI(newTodo, index) {
    const listItem = document.createElement("li");
    listItem.className = ("list-group-item d-flex justify-content-between addedTodos");
    listItem.setAttribute("data-id", index);
    listItem.appendChild(document.createTextNode(newTodo));

    const link = document.createElement("div");
    link.className = "delete-item";
    link.innerHTML = "<i class='fa fa-pencil mr-2' aria-hidden='true'></i> <i class = 'fa fa-remove'></i>";

    listItem.appendChild(link);
    todoList.appendChild(listItem);
    todoInput.value = ""
    giveInfoWhenCurrentToDoEmpty(todoList);
}
function addDeletedToDoToUI(newTodo, index) {
    const listItem = document.createElement("li");
    listItem.className = ("list-group-item d-flex justify-content-between deletedTodos");
    listItem.setAttribute("data-id", index);
    listItem.appendChild(document.createTextNode(newTodo));

    const link = document.createElement("div");
    link.className = "recycle-item";
    link.innerHTML = "<i class='fa fa-undo mr-2' aria-hidden='true'></i> <i class='fa fa-times'></i>";

    listItem.appendChild(link);
    deletedToDoList.appendChild(listItem);
    todoInput.value = ""
}
function undoItem(e) {
    if (e.target.className === "fa fa-undo mr-2") {
        if (confirm("Seçtiğiniz To Do'yu geri döndürmek istediğinize emin misiniz?")) {
            e.target.parentElement.parentElement.remove();
            deleteDeletedTodoFromStorage(e.target.closest(".list-group-item").innerText.trim());
            addToDoToStorage(e.target.closest(".list-group-item").innerText.trim());
            loadAllTodosToUI();
        }
    }
}

function deleteDeletedTasksButton(e) {
    if (confirm("Tamamını kalıcı olarak silmek istediğinize emin misiniz?")) {
        if (e.target.id === "clear-deleted-todos") {
            deletedToDoList.innerHTML = "";
            localStorage.removeItem("deletedTodos");
            clearButtonDisplay();
            clearDeletedButtonDisplay();

            showAlert("success", "Todo başarıyla silindi")
        }
    }
}

function changeColor(e) {
    if (e.target && e.target.className.includes('addedTodos')) {
        if (e.target.className.includes("bg-secondary", "text-white")) {
            e.target.classList.remove("bg-secondary", "text-white")
            return
        }
        e.target.classList.add("bg-secondary", "text-white")
    }
};