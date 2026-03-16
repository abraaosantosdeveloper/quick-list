const STORAGE_KEY = "quicklist_tasks";
const DEFAULT_TASK_NAMES = [
    "Pão de forma",
    "Café preto",
    "Suco de laranja",
    "Bolacha",
];

const listContainer = document.getElementById("list-container");
const addInput = document.getElementById("add-item");
const addButton = document.getElementById("add-btn");
const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toast-message");
const toastClose = document.getElementById("toast-close");

let toastTimeoutId;

let tasks = loadTasks();
renderTasks();

addButton.addEventListener("click", handleAddTask); 
toastClose.addEventListener("click", hideToast);
addInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        handleAddTask();
    }
});

listContainer.addEventListener("click", (event) => {
    const actionTarget = event.target.closest("[data-action]");
    if (!actionTarget) return;

    const action = actionTarget.dataset.action;
    const listItem = actionTarget.closest(".list-item");
    if (!listItem) return;

    const taskId = Number(listItem.dataset.id);

    if (action === "toggle") {
        toggleTaskStatus(taskId);
        return;
    }

    if (action === "delete") {
        deleteTask(taskId);
    }
});

function loadTasks() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw === null) {
            const seededTasks = createDefaultTasks();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(seededTasks));
            return seededTasks;
        }

        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];

        // Keep only valid objects in the expected schema.
        return parsed.filter((item) => (
            item &&
            typeof item.id === "number" &&
            typeof item.nome === "string" &&
            typeof item.status === "boolean"
        ));
    } catch (error) {
        return [];
    }
}

function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function createDefaultTasks() {
    const baseId = Date.now();

    return DEFAULT_TASK_NAMES.map((nome, index) => ({
        id: baseId + index,
        nome,
        status: false,
    }));
}

function handleAddTask() {
    const nome = addInput.value.trim();
    if (!nome) return;

    const task = {
        id: Date.now(),
        nome,
        status: false,
    };

    tasks.push(task);
    saveTasks();
    renderTasks();
    showToast("success", "Nova tarefa adicionada");
    addInput.value = "";
    const isMobile = window.matchMedia("(pointer: coarse)").matches;
    if (isMobile) {
        addInput.blur();
    } else {
        addInput.focus();
    }
}

function toggleTaskStatus(taskId) {
    tasks = tasks.map((task) => {
        if (task.id !== taskId) return task;
        return { ...task, status: !task.status };
    });

    saveTasks();
    renderTasks();
}

function deleteTask(taskId) {
    tasks = tasks.filter((task) => task.id !== taskId);
    saveTasks();
    renderTasks();
    showToast("error", "O item foi removido da lista");
}

function renderTasks() {
    if (!tasks.length) {
        listContainer.innerHTML = "";
        return;
    }

    listContainer.innerHTML = tasks.map(createTaskMarkup).join("");
}

function createTaskMarkup(task) {
    const completedClass = task.status ? " completed" : "";
    const checkboxClass = task.status ? "checkbox" : "checkbox hidden";
    const escapedName = escapeHtml(task.nome);

    return `
        <div class="list-item${completedClass}" data-id="${task.id}">
            <button class="checkbox-envelope" data-action="toggle" aria-label="Concluir tarefa" type="button">
                <span class="${checkboxClass}"></span>
            </button>
            <span class="item-name">${escapedName}</span>
            <button class="trash-icon-envelope" data-action="delete" aria-label="Remover tarefa" type="button">
                <img src="img/trash.svg" alt="">
            </button>
        </div>
    `;
}

function showToast(type, message) {
    clearTimeout(toastTimeoutId);

    toast.classList.remove("success", "error", "show");
    toast.classList.add(type);
    toastMessage.textContent = message;

    requestAnimationFrame(() => {
        toast.classList.add("show");
    });

    toastTimeoutId = setTimeout(hideToast, 2600);
}

function hideToast() {
    toast.classList.remove("show");
}

function escapeHtml(value) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
