import { Project, ProjectStatus } from "../models/projects.js";
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
        const project = new Project(Math.random().toString(), title, description, peopleCount, ProjectStatus.Active);
        this.projects.push(project);
        this.updateListeners();
    }
    moveProject(pid, newStatus) {
        const project = this.projects.find(project => project.id === pid);
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
export const projectState = ProjectState.getInstance();
//# sourceMappingURL=project-state.js.map