"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var App;
(function (App) {
    let ProjectStatus;
    (function (ProjectStatus) {
        ProjectStatus[ProjectStatus["Active"] = 0] = "Active";
        ProjectStatus[ProjectStatus["Finished"] = 1] = "Finished";
    })(ProjectStatus = App.ProjectStatus || (App.ProjectStatus = {}));
    class Project {
        constructor(id, title, description, people, status) {
            this.id = id;
            this.title = title;
            this.description = description;
            this.people = people;
            this.status = status;
        }
    }
    App.Project = Project;
})(App || (App = {}));
var App;
(function (App) {
    class State {
        constructor() {
            this.listeners = [];
        }
        addListener(listenerFn) {
            this.listeners.push(listenerFn);
        }
    }
    class ProjectState extends State {
        constructor() {
            super();
            this.projects = [];
        }
        static getInstance() {
            if (this.instance) {
                return this.instance;
            }
            this.instance = new ProjectState();
            return this.instance;
        }
        addProject(title, description, peopleCount) {
            const project = new App.Project(Math.random().toString(), title, description, peopleCount, App.ProjectStatus.Active);
            this.projects.push(project);
            this.updateListeners();
        }
        moveProject(pid, newStatus) {
            const project = this.projects.find((project) => project.id === pid);
            if (project && project.status !== newStatus) {
                project.status = newStatus;
                this.updateListeners();
            }
        }
        updateListeners() {
            for (const listenerFn of this.listeners) {
                listenerFn(this.projects.slice());
            }
        }
    }
    App.ProjectState = ProjectState;
    App.projectState = ProjectState.getInstance();
})(App || (App = {}));
var App;
(function (App) {
    function validate(obj) {
        let valid = true;
        let value;
        if ("required" in obj && obj.value) {
            valid = true;
        }
        if ("minLength" in obj) {
            value = obj.value;
            valid = valid && value.trim().length >= obj.minLength;
        }
        if ("maxLength" in obj) {
            value = obj.value;
            valid = valid && value.trim().length <= obj.maxLength;
        }
        if ("min" in obj) {
            value = obj.value;
            valid = valid && value >= obj.min;
        }
        if ("max" in obj) {
            value = obj.value;
            valid = valid && value <= obj.max;
        }
        return valid;
    }
    App.validate = validate;
})(App || (App = {}));
var App;
(function (App) {
    function Autobind(_, _2, descriptor) {
        const originalMethod = descriptor.value;
        const newDescriptor = {
            configurable: true,
            enumerable: false,
            get() {
                const boundFn = originalMethod.bind(this);
                return boundFn;
            },
        };
        return newDescriptor;
    }
    App.Autobind = Autobind;
})(App || (App = {}));
var App;
(function (App) {
    class Component {
        constructor(templateId, hostElementId, insertAtStart, newElementId) {
            this.templateElement = (document.getElementById(templateId));
            this.hostElement = document.getElementById(hostElementId);
            const importedNode = document.importNode(this.templateElement.content, true);
            this.element = importedNode.firstElementChild;
            if (newElementId) {
                this.element.id = newElementId;
            }
            this.attach(insertAtStart);
        }
        attach(insertAtStart) {
            this.hostElement.insertAdjacentElement(insertAtStart ? "afterbegin" : "beforeend", this.element);
        }
    }
    App.Component = Component;
})(App || (App = {}));
var App;
(function (App) {
    class ProjectItem extends App.Component {
        get persons() {
            if (this.project.people === 1) {
                return "1 person";
            }
            else {
                return `${this.project.people} persons`;
            }
        }
        constructor(hostId, project) {
            super("single-project", hostId, false, project.id);
            this.project = project;
            this.configure();
            this.renderContent();
        }
        dragStartHandler(event) {
            event.dataTransfer.setData("text/plain", this.project.id);
            event.dataTransfer.effectAllowed = "move";
        }
        dragEndHandler(_) {
            console.log("DragEnd");
        }
        configure() {
            this.element.addEventListener("dragstart", this.dragStartHandler);
            this.element.addEventListener("dragend", this.dragEndHandler);
        }
        renderContent() {
            this.element.querySelector("h2").textContent = this.project.title;
            this.element.querySelector("h3").textContent = this.persons + " assigned";
            this.element.querySelector("p").textContent = this.project.description;
        }
    }
    __decorate([
        App.Autobind
    ], ProjectItem.prototype, "dragStartHandler", null);
    __decorate([
        App.Autobind
    ], ProjectItem.prototype, "dragEndHandler", null);
    App.ProjectItem = ProjectItem;
})(App || (App = {}));
var App;
(function (App) {
    class ProjectList extends App.Component {
        constructor(type) {
            super("project-list", "app", false, `${type}-projects`);
            this.type = type;
            this.assignedProjects = [];
            this.configure();
            this.renderContent();
        }
        dragOverHandler(event) {
            if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
                event.preventDefault();
                const listElem = this.element.querySelector("ul");
                listElem.classList.add("droppable");
            }
        }
        dropHandler(event) {
            const pid = event.dataTransfer.getData("text/plain");
            App.projectState.moveProject(pid, this.type === "active" ? App.ProjectStatus.Active : App.ProjectStatus.Finished);
        }
        dragLeaveHandler(_4) {
            const listElem = this.element.querySelector("ul");
            listElem.classList.remove("droppable");
        }
        renderContent() {
            const listId = `${this.type}-project-list`;
            this.element.querySelector("ul").id = listId;
            this.element.querySelector("h2").textContent =
                this.type.toUpperCase() + " PROJECTS";
        }
        configure() {
            App.projectState.addListener((projects) => {
                const relevantProjects = projects.filter((project) => {
                    if (this.type === "active") {
                        return project.status === App.ProjectStatus.Active;
                    }
                    return project.status === App.ProjectStatus.Finished;
                });
                this.assignedProjects = relevantProjects;
                this.renderProjects();
            });
            this.element.addEventListener("dragover", this.dragOverHandler);
            this.element.addEventListener("drop", this.dropHandler);
            this.element.addEventListener("dragleave", this.dragLeaveHandler);
        }
        renderProjects() {
            const listElement = document.getElementById(`${this.type}-project-list`);
            listElement.innerHTML = "";
            for (const project of this.assignedProjects) {
                new App.ProjectItem(this.element.querySelector("ul").id, project);
            }
        }
    }
    __decorate([
        App.Autobind
    ], ProjectList.prototype, "dragOverHandler", null);
    __decorate([
        App.Autobind
    ], ProjectList.prototype, "dropHandler", null);
    __decorate([
        App.Autobind
    ], ProjectList.prototype, "dragLeaveHandler", null);
    App.ProjectList = ProjectList;
})(App || (App = {}));
var App;
(function (App) {
    class ProjectInput extends App.Component {
        constructor() {
            super("project-input", "app", true, "user-input");
            this.title = this.element.querySelector("#title");
            this.people = this.element.querySelector("#people");
            this.description = (this.element.querySelector("#description"));
            this.configure();
            this.renderContent();
        }
        renderContent() {
            this.hostElement.insertAdjacentElement("afterbegin", this.element);
        }
        configure() {
            this.element.addEventListener("submit", this.submitHandler);
        }
        gatherUserInput() {
            const titleValue = this.title.value;
            const descriptionValue = this.description.value;
            const peopleValue = this.people.value;
            if (App.validate({ value: titleValue, required: true, minLength: 5 }) &&
                App.validate({
                    value: descriptionValue,
                    required: true,
                    minLength: 5,
                }) &&
                App.validate({ value: peopleValue, required: true, min: 0, max: 10 })) {
                return [titleValue, descriptionValue, +peopleValue];
            }
            else {
                alert("invalid input, please try again.");
                return;
            }
        }
        submitHandler(event) {
            event.preventDefault();
            const userInput = this.gatherUserInput();
            if (Array.isArray(userInput)) {
                App.projectState.addProject(...userInput);
            }
        }
    }
    __decorate([
        App.Autobind
    ], ProjectInput.prototype, "submitHandler", null);
    App.ProjectInput = ProjectInput;
})(App || (App = {}));
var App;
(function (App) {
    new App.ProjectInput();
    new App.ProjectList("active");
    new App.ProjectList("finished");
})(App || (App = {}));
//# sourceMappingURL=bundle.js.map