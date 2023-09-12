import { Project, ProjectStatus } from "../models/projects";

type Listener<T> = (items: T[]) => void;

class State<T> {
  protected listeners: Listener<T>[] = [];

  addListener(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn);
  }
}

class ProjectState extends State<Project>{
  private projects: Project[] = [];
  private static instance: ProjectState;

  private constructor() {
    super();
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }

  addProject(title: string, description: string, peopleCount: number) {
    const project = new Project(
      Math.random().toString(),
      title,
      description,
      peopleCount,
      ProjectStatus.Active
    );
    this.projects.push(project);
    this.updateListeners();
  }

  moveProject(pid: string, newStatus: ProjectStatus) {
    const project = this.projects.find(project => project.id === pid);
    if (project && project.status !== newStatus) {
      project.status = newStatus;
      this.updateListeners();
    }
  }

  private updateListeners() {
    for (const listenerFn of this.listeners) {
      listenerFn(this.projects.slice());
    }
  }
}

export const projectState = ProjectState.getInstance();
