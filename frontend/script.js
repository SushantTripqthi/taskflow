'use strict';

//  APIs 

const API_BASE_URL = 'http://127.0.0.1:8000';
const TASKS_ENDPOINT = `${API_BASE_URL}/tasks/`;
const PROJECTS_ENDPOINT = `${API_BASE_URL}/projects/`;
const USERS_ENDPOINT = `${API_BASE_URL}/users/`;
const QUICK_ADD_ENDPOINT = `${API_BASE_URL}/tasks/quick-add`;
const SEARCH_ENDPOINT = `${API_BASE_URL}/tasks/search`;
const TASK_CACHE_KEY = 'taskflow_tasks';

//    APPLICATION STATE

const state = {
    tasks: [],
    projects: [],
    users: [],
    editingTaskId: null,
    modalMode: null
};

//    HELPER

const $ = (id) => document.getElementById(id);

//    DOM ELEMENTS

const dom = {
    sidebar: $('sidebar'),
    menuButton: $('menuButton'),

    connectionStatus: $('connectionStatus'),
    sideStatus: $('sideStatus'),
    sideDot: $('sideDot'),
    topDot: $('topDot'),

    pageTitle: $('pageTitle'),
    pageSubtitle: $('pageSubtitle'),

    taskForm: $('taskForm'),
    taskFormHeading: $('taskFormHeading'),
    taskTitle: $('taskTitle'),
    taskDescription: $('taskDescription'),
    taskPriority: $('taskPriority'),
    taskDueDate: $('taskDueDate'),
    taskProject: $('taskProject'),
    titleError: $('titleError'),
    taskSubmit: $('taskSubmit'),
    cancelEdit: $('cancelEdit'),
    taskMessage: $('taskMessage'),

    taskTableBody: $('taskTableBody'),
    allTaskTableBody: $('allTaskTableBody'),

    emptyTaskState: $('emptyTaskState'),
    allTaskEmpty: $('allTaskEmpty'),

    taskStatus: $('taskStatus'),
    allTaskStatus: $('allTaskStatus'),

    searchInput: $('searchInput'),
    sortSelect: $('sortSelect'),
    applyFilters: $('applyFilters'),
    refreshTasks: $('refreshTasks'),
    refreshAllTasks: $('refreshAllTasks'),

    dashboardQuickForm: $('dashboardQuickForm'),
    dashboardQuickText: $('dashboardQuickText'),
    dashboardQuickProject: $('dashboardQuickProject'),
    dashboardQuickMessage: $('dashboardQuickMessage'),

    quickPageForm: $('quickPageForm'),
    quickPageText: $('quickPageText'),
    quickPageProject: $('quickPageProject'),
    quickPageMessage: $('quickPageMessage'),

    projectTableBody: $('projectTableBody'),
    projectStatus: $('projectStatus'),
    emptyProjectState: $('emptyProjectState'),

    userTableBody: $('userTableBody'),
    userStatus: $('userStatus'),
    emptyUserState: $('emptyUserState'),

    // Dashboard statistics 

    totalTasks: $('totalTasks'),
    lowTasks: $('lowTasks'),
    mediumTasks: $('mediumTasks'),
    highTasks: $('highTasks'),

    /* Statistics cards */

    statTotal: $('statTotal'),
    statLow: $('statLow'),
    statMedium: $('statMedium'),
    statHigh: $('statHigh'),

    projectCount: null,

    /* Modal */

    modalBackdrop: $('modalBackdrop'),
    modalTitle: $('modalTitle'),
    modalSubtitle: $('modalSubtitle'),
    modalFields: $('modalFields'),
    modalMessage: $('modalMessage'),
    modalForm: $('modalForm'),
    modalSave: $('modalSave'),
    modalClose: $('modalClose'),
    modalCancel: $('modalCancel'),
    toast: $('toast')
};

//    INITIALIZATION

document.addEventListener(
    'DOMContentLoaded',
    initializeApplication
);


async function initializeApplication() {
    registerEventListeners();
    loadCachedTasks();
    renderTasks(state.tasks);
    updateStatistics();
    await Promise.all([
        loadTasks(),
        loadProjects(),
        loadUsers()
    ]);
}

//    EVENT LISTENER

function registerEventListeners() {
    dom.menuButton.addEventListener(
        'click',
        toggleSidebar
    );
    document
        .querySelectorAll('.nav-item')
        .forEach((button) => {

            button.addEventListener(
                'click',
                () => showPage(button.dataset.page)
            );

        });

    $('dashboardAddTask').addEventListener(
        'click',
        focusTaskForm
    );

    $('tasksAddTask').addEventListener(
        'click',
        focusTaskForm
    );

    $('dashboardAddProject').addEventListener(
        'click',
        () => openProjectModal()
    );

    $('projectsAddProject').addEventListener(
        'click',
        () => openProjectModal()
    );

    $('usersAddUser').addEventListener(
        'click',
        () => openUserModal()
    );

    dom.taskForm.addEventListener(
        'submit',
        handleTaskSubmit
    );

    dom.cancelEdit.addEventListener(
        'click',
        cancelEdit
    );

    dom.taskTitle.addEventListener(
        'input',
        validateTitleLive
    );

    dom.refreshTasks.addEventListener(
        'click',
        loadTasks
    );

    dom.refreshAllTasks.addEventListener(
        'click',
        loadTasks
    );

    dom.applyFilters.addEventListener(
        'click',
        applyTaskFilters
    );

    dom.searchInput.addEventListener(
        'keydown',
        (event) => {

            if (event.key === 'Enter') {

                event.preventDefault();

                applyTaskFilters();
            }

        }
    );

    dom.dashboardQuickForm.addEventListener(
        'submit',
        (event) => {

            handleQuickAdd(
                event,
                dom.dashboardQuickText,
                dom.dashboardQuickProject,
                dom.dashboardQuickMessage
            );

        }
    );

    dom.quickPageForm.addEventListener(
        'submit',
        (event) => {

            handleQuickAdd(
                event,
                dom.quickPageText,
                dom.quickPageProject,
                dom.quickPageMessage
            );

        }
    );

    $('refreshProjects').addEventListener(
        'click',
        loadProjects
    );

    $('refreshUsers').addEventListener(
        'click',
        loadUsers
    );

    dom.modalForm.addEventListener(
        'submit',
        saveModal
    );

    dom.modalClose.addEventListener(
        'click',
        closeModal
    );

    dom.modalCancel.addEventListener(
        'click',
        closeModal
    );


    dom.modalBackdrop.addEventListener(
        'click',
        (event) => {

            if (event.target === dom.modalBackdrop) {
                closeModal();
            }

        }
    );
}

//    SIDEBAR

function toggleSidebar() {

    dom.sidebar.classList.toggle('open');
}

/* =========================================================
   PAGE NAVIGATION
   ========================================================= */

function showPage(pageId) {

    document
        .querySelectorAll('.page')
        .forEach((page) => {

            page.classList.remove('active');

        });


    document
        .querySelectorAll('.nav-item')
        .forEach((button) => {

            button.classList.remove('active');

        });


    const page = $(pageId);

    const navButton =
        document.querySelector(
            `.nav-item[data-page="${pageId}"]`
        );


    if (!page || !navButton) {
        return;
    }

    page.classList.add('active');

    navButton.classList.add('active');


    dom.pageTitle.textContent =
        page.dataset.title || 'TaskFlow';


    dom.pageSubtitle.textContent =
        page.dataset.subtitle || '';


    dom.sidebar.classList.remove('open');
}

/* =========================================================
   FOCUS TASK FORM
   ========================================================= */

function focusTaskForm() {

    showPage('dashboard');

    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });


    window.setTimeout(
        () => dom.taskTitle.focus(),
        250
    );
}

/* =========================================================
   LOAD TASKS
   ========================================================= */

async function loadTasks() {

    setTaskStatus('Loading tasks...');


    try {

        const response =
            await fetch(TASKS_ENDPOINT);


        if (!response.ok) {

            throw new Error(
                await getApiErrorMessage(response)
            );

        }


        const data =
            await response.json();


        state.tasks =
            Array.isArray(data)
                ? data
                : [];


        saveCachedTasks();

        renderTasks(state.tasks);

        updateStatistics();

        setConnectionStatus(true);

        setTaskStatus(
            `${state.tasks.length} task(s) loaded`
        );


    } catch (error) {

        console.error(
            'Task loading error:',
            error
        );


        setConnectionStatus(false);

        renderTasks(state.tasks);

        updateStatistics();


        setTaskStatus(
            state.tasks.length
                ? 'Showing cached tasks. Backend unavailable.'
                : 'Unable to connect to backend.'
        );


        showToast(
            'Unable to connect to the TaskFlow backend.',
            'error'
        );
    }
}


/* =========================================================
   LOAD PROJECTS
   ========================================================= */

async function loadProjects() {

    try {

        const response =
            await fetch(PROJECTS_ENDPOINT);


        if (!response.ok) {

            throw new Error(
                await getApiErrorMessage(response)
            );

        }


        const data =
            await response.json();


        state.projects =
            Array.isArray(data)
                ? data
                : [];


        renderProjects();

        populateProjectSelects();


        dom.projectStatus.textContent =
            `${state.projects.length} project(s) loaded`;


    } catch (error) {

        console.error(
            'Project loading error:',
            error
        );


        dom.projectStatus.textContent =
            'Unable to load projects.';
    }
}


/* =========================================================
   LOAD USERS
   ========================================================= */

async function loadUsers() {

    try {

        const response =
            await fetch(USERS_ENDPOINT);


        if (!response.ok) {

            throw new Error(
                await getApiErrorMessage(response)
            );

        }


        const data =
            await response.json();


        state.users =
            Array.isArray(data)
                ? data
                : [];


        renderUsers();


        dom.userStatus.textContent =
            `${state.users.length} user(s) loaded`;


        populateProjectSelects();


    } catch (error) {

        console.error(
            'User loading error:',
            error
        );


        dom.userStatus.textContent =
            'Unable to load users.';
    }
}

/* =========================================================
   CACHE
   ========================================================= */

function loadCachedTasks() {

    try {

        const cached =
            localStorage.getItem(
                TASK_CACHE_KEY
            );


        if (!cached) {
            return;
        }


        const parsed =
            JSON.parse(cached);


        if (Array.isArray(parsed)) {

            state.tasks = parsed;

        }


    } catch (error) {

        console.error(
            'Cache read error:',
            error
        );


        state.tasks = [];
    }
}

function saveCachedTasks() {

    try {

        localStorage.setItem(
            TASK_CACHE_KEY,
            JSON.stringify(state.tasks)
        );


    } catch (error) {

        console.error(
            'Cache write error:',
            error
        );
    }
}

/* =========================================================
   RENDER TASKS
   ========================================================= */

function renderTasks(taskRecords) {

    renderTaskTable(
        dom.taskTableBody,
        taskRecords
    );


    renderTaskTable(
        dom.allTaskTableBody,
        taskRecords
    );


    dom.emptyTaskState.hidden =
        taskRecords.length !== 0;


    dom.allTaskEmpty.hidden =
        taskRecords.length !== 0;
}

function renderTaskTable(
    tableBody,
    taskRecords
) {

    tableBody.replaceChildren();


    taskRecords.forEach((task) => {

        const row =
            document.createElement('tr');


        appendCell(
            row,
            task.id
        );


        appendCell(
            row,
            task.title || 'Untitled task'
        );


        appendCell(
            row,
            task.description || '—'
        );


        appendPriorityCell(
            row,
            task.priority
        );


        appendCell(
            row,
            task.due_date || '—'
        );


        appendCell(
            row,
            projectDisplay(task.project_id)
        );


        appendTaskActions(
            row,
            task
        );


        tableBody.appendChild(row);

    });
}

/* =========================================================
   TABLE CELL
   ========================================================= */

function appendCell(row, value) {

    const cell =
        document.createElement('td');


    cell.textContent =
        value === null ||
            value === undefined ||
            value === ''
            ? '—'
            : String(value);


    row.appendChild(cell);
}

/* =========================================================
   PRIORITY CELL
   ========================================================= */

function appendPriorityCell(
    row,
    rawPriority
) {

    const cell =
        document.createElement('td');


    const badge =
        document.createElement('span');


    const value =
        getPriorityValue(rawPriority);


    badge.className =
        `badge ${value}`;


    badge.textContent =
        value || 'medium';


    cell.appendChild(badge);

    row.appendChild(cell);
}

/* =========================================================
   TASK ACTIONS
   ========================================================= */

function appendTaskActions(
    row,
    task
) {

    const cell =
        document.createElement('td');


    const wrapper =
        document.createElement('div');


    wrapper.className =
        'row-actions';


    const editButton =
        document.createElement('button');


    editButton.type = 'button';

    editButton.className =
        'icon-button';

    editButton.textContent =
        'Edit';


    editButton.addEventListener(
        'click',
        () => startEditTask(task)
    );

    const deleteButton =
        document.createElement('button');


    deleteButton.type = 'button';

    deleteButton.className =
        'icon-button delete';

    deleteButton.textContent =
        'Delete';


    deleteButton.addEventListener(
        'click',
        () => deleteTask(task.id)
    );

    wrapper.appendChild(editButton);

    wrapper.appendChild(deleteButton);

    cell.appendChild(wrapper);

    row.appendChild(cell);
}

/* =========================================================
   RENDER PROJECTS
   ========================================================= */

function renderProjects() {

    dom.projectTableBody.replaceChildren();


    state.projects.forEach((project) => {

        const row =
            document.createElement('tr');


        appendCell(
            row,
            project.id
        );


        appendCell(
            row,
            project.name
        );


        appendCell(
            row,
            project.description || '—'
        );


        appendCell(
            row,
            userDisplay(project.owner_id)
        );


        const cell =
            document.createElement('td');


        const wrapper =
            document.createElement('div');


        wrapper.className =
            'row-actions';


        const viewButton =
            document.createElement('button');


        viewButton.type = 'button';

        viewButton.className =
            'icon-button';

        viewButton.textContent =
            'View';


        viewButton.addEventListener(
            'click',
            () => showProjectDetails(project)
        );


        const deleteButton =
            document.createElement('button');


        deleteButton.type = 'button';

        deleteButton.className =
            'icon-button delete';

        deleteButton.textContent =
            'Delete';


        deleteButton.addEventListener(
            'click',
            () => deleteProject(project.id)
        );


        wrapper.appendChild(viewButton);

        wrapper.appendChild(deleteButton);

        cell.appendChild(wrapper);

        row.appendChild(cell);

        dom.projectTableBody.appendChild(row);

    });


    dom.emptyProjectState.hidden =
        state.projects.length !== 0;
}


/* =========================================================
   RENDER USERS
   ========================================================= */

function renderUsers() {

    dom.userTableBody.replaceChildren();


    state.users.forEach((user) => {

        const row =
            document.createElement('tr');


        appendCell(
            row,
            user.id
        );


        appendCell(
            row,
            user.name
        );


        appendCell(
            row,
            user.email
        );


        const cell =
            document.createElement('td');


        const wrapper =
            document.createElement('div');


        wrapper.className =
            'row-actions';


        const viewButton =
            document.createElement('button');


        viewButton.type = 'button';

        viewButton.className =
            'icon-button';

        viewButton.textContent =
            'View';


        viewButton.addEventListener(
            'click',
            () => showUserDetails(user)
        );


        const deleteButton =
            document.createElement('button');


        deleteButton.type = 'button';

        deleteButton.className =
            'icon-button delete';

        deleteButton.textContent =
            'Delete';


        deleteButton.addEventListener(
            'click',
            () => deleteUser(user.id)
        );


        wrapper.appendChild(viewButton);

        wrapper.appendChild(deleteButton);

        cell.appendChild(wrapper);

        row.appendChild(cell);

        dom.userTableBody.appendChild(row);

    });


    dom.emptyUserState.hidden =
        state.users.length !== 0;
}

/* =========================================================
   PROJECT SELECTS
   ========================================================= */

function populateProjectSelects() {

    const selects = [
        dom.taskProject,
        dom.dashboardQuickProject,
        dom.quickPageProject
    ];


    selects.forEach((select) => {

        if (!select) {
            return;
        }


        const selected =
            select.value;


        select.replaceChildren();


        const placeholder =
            document.createElement('option');


        placeholder.value = '';

        placeholder.textContent =
            'Select project';


        select.appendChild(
            placeholder
        );


        state.projects.forEach((project) => {

            const option =
                document.createElement('option');


            option.value =
                String(project.id);


            option.textContent =
                `${project.name} (ID ${project.id})`;


            select.appendChild(option);

        });


        if (
            selected &&
            state.projects.some(
                (project) =>
                    String(project.id) === selected
            )
        ) {

            select.value =
                selected;
        }

    });
}

/* =========================================================
   IMPORTANT:
   TASK STATISTICS
   ========================================================= */

function updateStatistics() {

    const counts = {
        low: 0,
        medium: 0,
        high: 0
    };


    state.tasks.forEach((task) => {

        const priority =
            getPriorityValue(task.priority);


        if (priority === 'low') {

            counts.low++;

        } else if (priority === 'medium') {

            counts.medium++;

        } else if (priority === 'high') {

            counts.high++;

        }

    });


    /* Dashboard cards */

    if (dom.totalTasks) {

        dom.totalTasks.textContent =
            String(state.tasks.length);

    }


    if (dom.lowTasks) {

        dom.lowTasks.textContent =
            String(counts.low);

    }


    if (dom.mediumTasks) {

        dom.mediumTasks.textContent =
            String(counts.medium);

    }


    if (dom.highTasks) {

        dom.highTasks.textContent =
            String(counts.high);

    }


    /* Statistics cards */

    if (dom.statTotal) {

        dom.statTotal.textContent =
            String(state.tasks.length);

    }


    if (dom.statLow) {

        dom.statLow.textContent =
            String(counts.low);

    }


    if (dom.statMedium) {

        dom.statMedium.textContent =
            String(counts.medium);

    }


    if (dom.statHigh) {

        dom.statHigh.textContent =
            String(counts.high);

    }
}


/* =========================================================
   IMPORTANT:
   PRIORITY NORMALIZATION
   ========================================================= */

function getPriorityValue(priority) {

    /*
       Backend may return:

       "low"
       "LOW"
       "Low"
       "low priority"

       OR

       {
           "value": "LOW"
       }

       OR

       {
           "name": "HIGH"
       }
    */


    if (
        priority &&
        typeof priority === 'object'
    ) {

        priority =
            priority.value ??
            priority.name ??
            priority.label ??
            '';
    }


    const value =
        String(priority ?? '')
            .trim()
            .toLowerCase();


    if (value.includes('low')) {

        return 'low';
    }


    if (value.includes('medium')) {

        return 'medium';
    }


    if (value.includes('high')) {

        return 'high';
    }


    return '';
}


/* =========================================================
   PROJECT DISPLAY
   ========================================================= */

function projectDisplay(id) {

    const project =
        state.projects.find(
            (item) =>
                Number(item.id) === Number(id)
        );


    return project
        ? project.name
        : (id ? `Project ${id}` : '—');
}


/* =========================================================
   USER DISPLAY
   ========================================================= */

function userDisplay(id) {

    const user =
        state.users.find(
            (item) =>
                Number(item.id) === Number(id)
        );


    return user
        ? user.name
        : (id ? `User ${id}` : '—');
}


/* =========================================================
   CREATE / UPDATE TASK
   ========================================================= */

async function handleTaskSubmit(event) {

    event.preventDefault();

    clearTaskMessage();


    if (!validateTaskTitle()) {

        dom.taskTitle.focus();

        return;
    }


    const projectId =
        Number(dom.taskProject.value);


    if (!projectId || projectId < 1) {

        setMessage(
            dom.taskMessage,
            'Please select a valid project.',
            'error'
        );


        dom.taskProject.focus();

        return;
    }


    const payload = {

        title:
            dom.taskTitle.value.trim(),

        description:
            dom.taskDescription.value.trim(),

        priority:
            dom.taskPriority.value,

        due_date:
            dom.taskDueDate.value.trim() || null,

        project_id:
            projectId
    };


    dom.taskSubmit.disabled = true;


    try {

        if (
            state.editingTaskId === null
        ) {

            await createTask(payload);

        } else {

            await updateTask(
                state.editingTaskId,
                payload
            );
        }


    } finally {

        dom.taskSubmit.disabled = false;

    }
}


/* =========================================================
   CREATE TASK
   ========================================================= */

async function createTask(payload) {

    try {

        const response =
            await fetch(
                TASKS_ENDPOINT,
                {
                    method: 'POST',

                    headers: {
                        'Content-Type':
                            'application/json'
                    },

                    body:
                        JSON.stringify(payload)
                }
            );


        if (!response.ok) {

            throw new Error(
                await getApiErrorMessage(response)
            );

        }


        const createdTask =
            await response.json();


        state.tasks.push(
            createdTask
        );


        saveCachedTasks();

        renderTasks(
            state.tasks
        );


        updateStatistics();


        resetTaskForm();


        setMessage(
            dom.taskMessage,
            'Task created successfully.',
            'success'
        );


        setTaskStatus(
            `${state.tasks.length} task(s) loaded`
        );


        setConnectionStatus(true);


    } catch (error) {

        console.error(
            'Create task error:',
            error
        );


        setMessage(
            dom.taskMessage,
            error.message ||
            'Unable to create task.',
            'error'
        );
    }
}


/* =========================================================
   EDIT TASK
   ========================================================= */

function startEditTask(task) {

    state.editingTaskId =
        task.id;


    dom.taskFormHeading.textContent =
        'Edit Task';


    dom.taskTitle.value =
        task.title || '';


    dom.taskDescription.value =
        task.description || '';


    dom.taskPriority.value =
        getPriorityValue(task.priority);


    dom.taskDueDate.value =
        task.due_date || '';


    dom.taskProject.value =
        task.project_id
            ? String(task.project_id)
            : '';


    dom.taskSubmit.textContent =
        'Update Task';


    dom.cancelEdit.hidden =
        false;


    setMessage(
        dom.taskMessage,
        `Editing task ${task.id}.`,
        'info'
    );


    focusTaskForm();
}


/* =========================================================
   UPDATE TASK
   ========================================================= */

async function updateTask(
    taskId,
    payload
) {

    try {

        const response =
            await fetch(
                `${TASKS_ENDPOINT}${taskId}`,
                {
                    method: 'PUT',

                    headers: {
                        'Content-Type':
                            'application/json'
                    },

                    body:
                        JSON.stringify(payload)
                }
            );


        if (!response.ok) {

            throw new Error(
                await getApiErrorMessage(response)
            );

        }


        const updatedTask =
            await response.json();


        const index =
            state.tasks.findIndex(
                (task) =>
                    Number(task.id) ===
                    Number(taskId)
            );


        if (index !== -1) {

            state.tasks[index] =
                updatedTask;

        }


        saveCachedTasks();

        renderTasks(
            state.tasks
        );


        updateStatistics();

        resetTaskForm();


        setMessage(
            dom.taskMessage,
            'Task updated successfully.',
            'success'
        );


    } catch (error) {

        console.error(
            'Update task error:',
            error
        );


        setMessage(
            dom.taskMessage,
            error.message ||
            'Unable to update task.',
            'error'
        );
    }
}


/* =========================================================
   CANCEL EDIT
   ========================================================= */

function cancelEdit() {

    resetTaskForm();


    setMessage(
        dom.taskMessage,
        'Edit cancelled.',
        'info'
    );
}


/* =========================================================
   RESET TASK FORM
   ========================================================= */

function resetTaskForm() {

    state.editingTaskId = null;


    dom.taskForm.reset();


    dom.taskPriority.value =
        'medium';


    dom.taskFormHeading.textContent =
        'Add New Task';


    dom.taskSubmit.textContent =
        'Add Task';


    dom.cancelEdit.hidden =
        true;


    dom.titleError.textContent =
        '';
}


/* =========================================================
   DELETE TASK
   ========================================================= */

async function deleteTask(taskId) {

    if (
        !window.confirm(
            `Delete task ${taskId}?`
        )
    ) {

        return;
    }


    try {

        const response =
            await fetch(
                `${TASKS_ENDPOINT}${taskId}`,
                {
                    method: 'DELETE'
                }
            );


        if (!response.ok) {

            throw new Error(
                await getApiErrorMessage(response)
            );

        }


        state.tasks =
            state.tasks.filter(
                (task) =>
                    Number(task.id) !==
                    Number(taskId)
            );


        saveCachedTasks();

        renderTasks(
            state.tasks
        );


        updateStatistics();


        setTaskStatus(
            `${state.tasks.length} task(s) loaded`
        );


        showToast(
            'Task deleted successfully.',
            'success'
        );


    } catch (error) {

        console.error(
            'Delete task error:',
            error
        );


        showToast(
            error.message ||
            'Unable to delete task.',
            'error'
        );
    }
}


/* =========================================================
   SEARCH AND SORT
   ========================================================= */

async function applyTaskFilters() {

    const title =
        dom.searchInput.value.trim();


    const sort =
        dom.sortSelect.value;


    if (title) {

        const selectedAlgorithm =
            document.querySelector(
                'input[name="searchAlgorithm"]:checked'
            );


        const algorithm =
            selectedAlgorithm
                ? selectedAlgorithm.value
                : 'linear';


        await searchTasks(
            title,
            algorithm
        );


        return;
    }


    if (sort) {

        await sortTasks(sort);

        return;
    }


    renderTasks(
        state.tasks
    );


    setTaskStatus(
        `${state.tasks.length} task(s) loaded`
    );
}


/* =========================================================
   SEARCH TASK
   ========================================================= */

async function searchTasks(
    title,
    algorithm
) {

    try {

        const url =
            `${SEARCH_ENDPOINT}?title=${encodeURIComponent(title)}&algo=${encodeURIComponent(algorithm)}`;


        const response =
            await fetch(url);


        if (response.status === 404) {

            renderTasks([]);

            setTaskStatus(
                'No matching task found.'
            );


            return;
        }


        if (!response.ok) {

            throw new Error(
                await getApiErrorMessage(response)
            );

        }


        const result =
            await response.json();


        const records =
            Array.isArray(result)
                ? result
                : [result];


        renderTasks(records);


        setTaskStatus(
            `Search completed using ${algorithm} search.`
        );


    } catch (error) {

        console.error(
            'Search error:',
            error
        );


        showToast(
            error.message ||
            'Unable to search tasks.',
            'error'
        );
    }
}


/* =========================================================
   SORT TASKS
   ========================================================= */

async function sortTasks(sort) {

    try {

        const response =
            await fetch(
                `${TASKS_ENDPOINT}?sort=${encodeURIComponent(sort)}`
            );


        if (!response.ok) {

            throw new Error(
                await getApiErrorMessage(response)
            );

        }


        const sortedTasks =
            await response.json();


        const records =
            Array.isArray(sortedTasks)
                ? sortedTasks
                : [];


        renderTasks(records);


        setTaskStatus(
            `Tasks sorted by ${sort}.`
        );


    } catch (error) {

        console.error(
            'Sort error:',
            error
        );


        showToast(
            error.message ||
            'Unable to sort tasks.',
            'error'
        );
    }
}


/* =========================================================
   QUICK ADD
   ========================================================= */

async function handleQuickAdd(
    event,
    textElement,
    projectElement,
    messageElement
) {

    event.preventDefault();

    clearMessage(messageElement);


    const description =
        textElement.value.trim();


    const projectId =
        Number(projectElement.value);


    if (!description) {

        setMessage(
            messageElement,
            'Please enter a task description.',
            'error'
        );


        textElement.focus();

        return;
    }


    if (!projectId || projectId < 1) {

        setMessage(
            messageElement,
            'Please select a valid project.',
            'error'
        );


        projectElement.focus();

        return;
    }


    const submitButton =
        event.submitter;


    if (submitButton) {

        submitButton.disabled = true;

    }


    try {

        const response =
            await fetch(
                QUICK_ADD_ENDPOINT,
                {
                    method: 'POST',

                    headers: {
                        'Content-Type':
                            'application/json'
                    },

                    body:
                        JSON.stringify({
                            description,
                            project_id:
                                projectId
                        })
                }
            );


        if (!response.ok) {

            throw new Error(
                await getApiErrorMessage(response)
            );

        }


        const createdTask =
            await response.json();


        state.tasks.push(
            createdTask
        );


        saveCachedTasks();

        renderTasks(
            state.tasks
        );


        updateStatistics();


        event.target.reset();


        setMessage(
            messageElement,
            'Task created successfully using Quick Add.',
            'success'
        );


        showToast(
            'Quick Add created a new task.',
            'success'
        );


    } catch (error) {

        console.error(
            'Quick Add error:',
            error
        );


        setMessage(
            messageElement,
            error.message ||
            'Unable to create Quick Add task.',
            'error'
        );


    } finally {

        if (submitButton) {

            submitButton.disabled =
                false;
        }
    }
}


/* =========================================================
   USER MODAL
   ========================================================= */

function openUserModal() {

    state.modalMode =
        'user';


    dom.modalTitle.textContent =
        'Add User';


    dom.modalSubtitle.textContent =
        'Create a user that can own projects.';


    buildUserModalFields();


    openModal();
}


/* =========================================================
   PROJECT MODAL
   ========================================================= */

function openProjectModal() {

    if (state.users.length === 0) {

        showToast(
            'Create a user before creating a project.',
            'error'
        );


        return;
    }


    state.modalMode =
        'project';


    dom.modalTitle.textContent =
        'Add Project';


    dom.modalSubtitle.textContent =
        'Create a project and assign an existing user as owner.';


    buildProjectModalFields();


    openModal();
}


/* =========================================================
   USER MODAL FIELDS
   ========================================================= */

function buildUserModalFields() {

    dom.modalFields.replaceChildren();


    appendModalField(
        'Name',
        'text',
        'modalUserName',
        'Enter name',
        {
            minLength: 2,
            maxLength: 100
        }
    );


    appendModalField(
        'Email',
        'email',
        'modalUserEmail',
        'Enter email'
    );
}


/* =========================================================
   PROJECT MODAL FIELDS
   ========================================================= */

function buildProjectModalFields() {

    dom.modalFields.replaceChildren();


    appendModalField(
        'Project Name',
        'text',
        'modalProjectName',
        'Enter project name',
        {
            minLength: 2,
            maxLength: 100
        }
    );


    const descriptionLabel =
        document.createElement('label');


    descriptionLabel.textContent =
        'Description';


    const description =
        document.createElement('textarea');


    description.id =
        'modalProjectDescription';


    description.rows =
        4;


    description.placeholder =
        'Enter project description';


    descriptionLabel.appendChild(
        description
    );


    dom.modalFields.appendChild(
        descriptionLabel
    );


    const ownerLabel =
        document.createElement('label');


    ownerLabel.textContent =
        'Owner';


    const owner =
        document.createElement('select');


    owner.id =
        'modalProjectOwner';


    owner.required =
        true;


    const placeholder =
        document.createElement('option');


    placeholder.value =
        '';


    placeholder.textContent =
        'Select owner';


    owner.appendChild(
        placeholder
    );


    state.users.forEach((user) => {

        const option =
            document.createElement('option');


        option.value =
            String(user.id);


        option.textContent =
            `${user.name} (ID ${user.id})`;


        owner.appendChild(option);

    });


    ownerLabel.appendChild(owner);

    dom.modalFields.appendChild(
        ownerLabel
    );
}


/* =========================================================
   APPEND MODAL FIELD
   ========================================================= */

function appendModalField(
    labelText,
    type,
    id,
    placeholder,
    constraints = {}
) {

    const label =
        document.createElement('label');


    label.textContent =
        labelText;


    const input =
        document.createElement('input');


    input.type =
        type;


    input.id =
        id;


    input.placeholder =
        placeholder;


    input.required =
        true;


    if (constraints.minLength) {

        input.minLength =
            constraints.minLength;
    }


    if (constraints.maxLength) {

        input.maxLength =
            constraints.maxLength;
    }


    label.appendChild(input);


    dom.modalFields.appendChild(
        label
    );
}


/* =========================================================
   OPEN MODAL
   ========================================================= */

function openModal() {

    clearMessage(
        dom.modalMessage
    );


    dom.modalBackdrop.hidden =
        false;


    const firstInput =
        dom.modalFields.querySelector(
            'input, textarea, select'
        );


    if (firstInput) {

        window.setTimeout(
            () => firstInput.focus(),
            50
        );
    }
}


/* =========================================================
   CLOSE MODAL
   ========================================================= */

function closeModal() {

    dom.modalBackdrop.hidden =
        true;


    dom.modalFields.replaceChildren();


    clearMessage(
        dom.modalMessage
    );


    state.modalMode =
        null;
}


/* =========================================================
   SAVE MODAL
   ========================================================= */

async function saveModal(event) {

    event.preventDefault();


    clearMessage(
        dom.modalMessage
    );


    dom.modalSave.disabled =
        true;


    try {

        let endpoint;

        let payload;


        if (
            state.modalMode ===
            'user'
        ) {

            const name =
                $('modalUserName')
                    .value
                    .trim();


            const email =
                $('modalUserEmail')
                    .value
                    .trim();


            if (
                name.length < 2 ||
                name.length > 100
            ) {

                throw new Error(
                    'Name must contain 2 to 100 characters.'
                );
            }


            if (
                !email ||
                !email.includes('@')
            ) {

                throw new Error(
                    'Please enter a valid email address.'
                );
            }


            endpoint =
                USERS_ENDPOINT;


            payload = {
                name,
                email
            };


        } else if (
            state.modalMode ===
            'project'
        ) {

            const name =
                $('modalProjectName')
                    .value
                    .trim();


            const description =
                $('modalProjectDescription')
                    .value
                    .trim() || null;


            const ownerId =
                Number(
                    $('modalProjectOwner').value
                );


            if (
                name.length < 2 ||
                name.length > 100
            ) {

                throw new Error(
                    'Project name must contain 2 to 100 characters.'
                );
            }


            if (
                !ownerId ||
                ownerId < 1
            ) {

                throw new Error(
                    'Please select an owner.'
                );
            }


            endpoint =
                PROJECTS_ENDPOINT;


            payload = {
                name,
                description,
                owner_id:
                    ownerId
            };


        } else {

            return;
        }


        const response =
            await fetch(
                endpoint,
                {
                    method: 'POST',

                    headers: {
                        'Content-Type':
                            'application/json'
                    },

                    body:
                        JSON.stringify(payload)
                }
            );


        if (!response.ok) {

            throw new Error(
                await getApiErrorMessage(response)
            );

        }


        const created =
            await response.json();


        const createdMode =
            state.modalMode;


        closeModal();


        if (
            createdMode ===
            'user'
        ) {

            state.users.push(
                created
            );


            renderUsers();

            populateProjectSelects();


            dom.userStatus.textContent =
                `${state.users.length} user(s) loaded`;


            showToast(
                'User created successfully.',
                'success'
            );


        } else {

            state.projects.push(
                created
            );


            renderProjects();

            populateProjectSelects();


            dom.projectStatus.textContent =
                `${state.projects.length} project(s) loaded`;


            showToast(
                'Project created successfully.',
                'success'
            );
        }


    } catch (error) {

        console.error(
            'Modal save error:',
            error
        );


        setMessage(
            dom.modalMessage,
            error.message ||
            'Unable to save record.',
            'error'
        );


    } finally {

        dom.modalSave.disabled =
            false;
    }
}



   //DELETE PROJECT
   

async function deleteProject(projectId) {

    if (
        !window.confirm(
            `Delete project ${projectId}?`
        )
    ) {

        return;
    }


    try {

        const response =
            await fetch(
                `${PROJECTS_ENDPOINT}${projectId}`,
                {
                    method: 'DELETE'
                }
            );


        if (!response.ok) {

            throw new Error(
                await getApiErrorMessage(response)
            );

        }


        await loadProjects();
        await loadTasks();


        showToast(
            'Project deleted successfully.',
            'success'
        );


    } catch (error) {

        console.error(
            'Delete project error:',
            error
        );


        showToast(
            error.message ||
            'Unable to delete project.',
            'error'
        );
    }
}


/* =========================================================
   DELETE USER
   ========================================================= */

async function deleteUser(userId) {

    if (
        !window.confirm(
            `Delete user ${userId}?`
        )
    ) {

        return;
    }


    try {

        const response =
            await fetch(
                `${USERS_ENDPOINT}${userId}`,
                {
                    method: 'DELETE'
                }
            );


        if (!response.ok) {

            throw new Error(
                await getApiErrorMessage(response)
            );

        }


        await loadUsers();

        await loadProjects();


        showToast(
            'User deleted successfully.',
            'success'
        );


    } catch (error) {

        console.error(
            'Delete user error:',
            error
        );


        showToast(
            error.message ||
            'Unable to delete user.',
            'error'
        );
    }
}


/* =========================================================
   DETAILS
   ========================================================= */

function showProjectDetails(project) {

    window.alert(
        `Project ${project.id}\n\n` +
        `Name: ${project.name}\n` +
        `Description: ${project.description || '—'}\n` +
        `Owner: ${userDisplay(project.owner_id)}`
    );
}


function showUserDetails(user) {

    window.alert(
        `User ${user.id}\n\n` +
        `Name: ${user.name}\n` +
        `Email: ${user.email}`
    );
}


/* =========================================================
   VALIDATION
   ========================================================= */

function validateTaskTitle() {

    const title =
        dom.taskTitle.value.trim();


    if (title.length < 2) {

        dom.titleError.textContent =
            'Task title must contain at least 2 characters.';


        return false;
    }


    if (title.length > 200) {

        dom.titleError.textContent =
            'Task title cannot exceed 200 characters.';


        return false;
    }


    dom.titleError.textContent =
        '';


    return true;
}


function validateTitleLive() {

    if (
        dom.taskTitle.value.trim()
    ) {

        validateTaskTitle();

    } else {

        dom.titleError.textContent =
            '';
    }
}


/* =========================================================
   MESSAGES
   ========================================================= */

function setMessage(
    element,
    message,
    type
) {

    element.textContent =
        message;


    element.className =
        `form-message ${type || ''}`.trim();
}


function clearMessage(element) {

    element.textContent =
        '';


    element.className =
        'form-message';
}


function clearTaskMessage() {

    clearMessage(
        dom.taskMessage
    );
}


/* =========================================================
   STATUS
   ========================================================= */

function setTaskStatus(message) {

    if (dom.taskStatus) {

        dom.taskStatus.textContent =
            message;
    }


    if (dom.allTaskStatus) {

        dom.allTaskStatus.textContent =
            message;
    }
}


/* =========================================================
   CONNECTION STATUS
   ========================================================= */

function setConnectionStatus(
    connected
) {

    const text =
        connected
            ? 'Backend: Connected'
            : 'Backend: Offline';


    if (dom.connectionStatus) {

        dom.connectionStatus.textContent =
            text;
    }


    if (dom.sideStatus) {

        dom.sideStatus.textContent =
            connected
                ? 'Backend connected'
                : 'Backend offline';
    }


    if (dom.topDot) {

        dom.topDot.style.background =
            connected
                ? '#1c9a57'
                : '#d94343';
    }


    if (dom.sideDot) {

        dom.sideDot.style.background =
            connected
                ? '#1c9a57'
                : '#d94343';
    }
}


/* =========================================================
   API ERROR
   ========================================================= */

async function getApiErrorMessage(
    response
) {

    try {

        const data =
            await response.json();


        if (data.detail) {

            if (
                Array.isArray(
                    data.detail
                )
            ) {

                return data.detail
                    .map(
                        (item) =>
                            item.msg ||
                            'Validation error.'
                    )
                    .join(', ');
            }


            return String(
                data.detail
            );
        }


    } catch (error) {

        console.error(
            'API error parsing failed:',
            error
        );
    }


    return `Request failed with HTTP ${response.status}.`;
}


/* =========================================================
   TOAST
   ========================================================= */

let toastTimer = null;


function showToast(
    message,
    type = ''
) {

    if (!dom.toast) {
        return;
    }


    dom.toast.textContent =
        message;


    dom.toast.className =
        `toast show ${type}`.trim();


    window.clearTimeout(
        toastTimer
    );


    toastTimer =
        window.setTimeout(
            () => {

                dom.toast.className =
                    'toast';

            },
            3000
        );
}