/// <reference path="base-component.ts" />
/// <reference path="../decorators/autobind.ts" />
/// <reference path="../models/project.ts" />
/// <reference path="../models/drag-drop.ts" />

namespace App {
  export class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
    type: string;
    assignedProjects: Project[];
  
    constructor(type: "active" | "finished") {
      super("project-list", "app", false, `${type}-projects`);
      this.type = type;
      this.assignedProjects = [];
  
      this.configure();
      this.renderContent();
    }
  
    @Autobind
    dragOverHandler(event: DragEvent): void {
      if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
        event.preventDefault();
        const listElem = this.element.querySelector("ul")!;
        listElem.classList.add("droppable");
      }
      }
  
    @Autobind
    dropHandler(event: DragEvent): void {
      const pid = event.dataTransfer!.getData("text/plain");
      projectState.moveProject(pid, this.type === "active" ? ProjectStatus.Active : ProjectStatus.Finished);
    }
  
    @Autobind
    dragLeaveHandler(_4: DragEvent): void {
      const listElem = this.element.querySelector("ul")!;
      listElem.classList.remove("droppable");
    }
  
    renderContent() {
      const listId = `${this.type}-project-list`;
      this.element.querySelector("ul")!.id = listId;
      this.element.querySelector("h2")!.textContent =
        this.type.toUpperCase() + " PROJECTS";
    }
  
    configure() {
      projectState.addListener((projects: Project[]) => {
        const relevantProjects = projects.filter((project) => {
          if (this.type === "active") {
            return project.status === ProjectStatus.Active;
          }
          return project.status === ProjectStatus.Finished;
        });
        this.assignedProjects = relevantProjects;
        this.renderProjects();
      });
  
      this.element.addEventListener("dragover", this.dragOverHandler);
      this.element.addEventListener("drop", this.dropHandler);
      this.element.addEventListener("dragleave", this.dragLeaveHandler);
    }
  
    private renderProjects() {
      const listElement = document.getElementById(
        `${this.type}-project-list`
      )! as HTMLUListElement;
      listElement.innerHTML = "";
      for (const project of this.assignedProjects) {
        new ProjectItem(this.element.querySelector("ul")!.id, project);
      }
    }
  }
}
