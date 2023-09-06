interface Draggable {
  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent): void;

}

interface DragTarget {
  dragOverHandler(event: DragEvent): void;
  dropHandler(event: DragEvent): void;
  dragLeaveHandler(event: DragEvent): void;
}

enum ProjectStatus {
  Active,
  Finished,
}

class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}

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

const projectState = ProjectState.getInstance();

interface Validable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

function Autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const newDescriptor: PropertyDescriptor = {
    configurable: true,
    enumerable: false,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    },
  };

  return newDescriptor;
}

abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U;

  constructor(
    templateId: string,
    hostElementId: string,
    insertAtStart: boolean,
    newElementId?: string
  ) {
    this.templateElement = <HTMLTemplateElement>(
      document.getElementById(templateId)!
    );
    this.hostElement = <T> document.getElementById(hostElementId)!;
    const importedNode = document.importNode(
      this.templateElement.content,
      true
    )!;
    this.element = <U>importedNode.firstElementChild;

    if (newElementId) {
      this.element.id = newElementId;
    }

    this.attach(insertAtStart);
  }

  private attach(insertAtStart: boolean) {
    this.hostElement.insertAdjacentElement(
      insertAtStart ? "afterbegin" : "beforeend",
      this.element
    );
  }

  abstract configure(): void;
  abstract renderContent(): void;
}

class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {
  private project: Project;

  get persons() {
    if (this.project.people === 1) {
      return "1 person";
    } else {
      return `${this.project.people} persons`;
    }
  }

  constructor(hostId: string, project: Project) {
    super("single-project", hostId, false, project.id);
    this.project = project;

    this.configure();
    this.renderContent();
  }

  @Autobind
  dragStartHandler(event: DragEvent): void {
    event.dataTransfer!.setData("text/plain", this.project.id);
    event.dataTransfer!.effectAllowed = "move";
  }

  @Autobind
  dragEndHandler(_: DragEvent): void {
    console.log("DragEnd");
  }

  configure(): void {
    this.element.addEventListener("dragstart", this.dragStartHandler);
    this.element.addEventListener("dragend", this.dragEndHandler);
  }
  renderContent(): void {
    this.element.querySelector("h2")!.textContent = this.project.title;
    this.element.querySelector("h3")!.textContent = this.persons + " assigned";
    this.element.querySelector("p")!.textContent = this.project.description;
  }
}


class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
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

class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  title: HTMLInputElement;
  description: HTMLInputElement;
  people: HTMLInputElement;

  constructor() {
    super("project-input", "app", true, "user-input");
    this.title = <HTMLInputElement>this.element.querySelector("#title");
    this.people = <HTMLInputElement>this.element.querySelector("#people")!;
    this.description = <HTMLInputElement>(
      this.element.querySelector("#description")!
    );

    this.configure();
    this.renderContent();
  }

  renderContent() {
    this.hostElement.insertAdjacentElement("afterbegin", this.element);
  }

  configure() {
    this.element.addEventListener("submit", this.submitHandler);
  }

  private validate<T extends Validable>(obj: T): boolean {
    let valid = true;
    let value: number | string;
    if ("required" in obj && obj.value) {
      valid = true;
    }
    if ("minLength" in obj) {
      value = obj.value as string;
      valid = valid && value.trim().length >= obj.minLength!;
    }
    if ("maxLength" in obj) {
      value = obj.value as string;
      valid = valid && value.trim().length <= obj.maxLength!;
    }
    if ("min" in obj) {
      value = obj.value as number;
      valid = valid && value >= obj.min!;
    }
    if ("max" in obj) {
      value = obj.value as number;
      valid = valid && value <= obj.max!;
    }
    return valid;
  }

  private gatherUserInput(): [string, string, number] | void {
    const titleValue = this.title.value;
    const descriptionValue = this.description.value;
    const peopleValue = this.people.value;

    if (
      this.validate({ value: titleValue, required: true, minLength: 5 }) &&
      this.validate({
        value: descriptionValue,
        required: true,
        minLength: 5,
      }) &&
      this.validate({ value: peopleValue, required: true, min: 0, max: 10 })
    ) {
      return [titleValue, descriptionValue, +peopleValue];
    } else {
      alert("invalid input, please try again.");
      return;
    }
  }

  @Autobind
  private submitHandler(event: Event) {
    event.preventDefault();

    const userInput = this.gatherUserInput();
    if (Array.isArray(userInput)) {
      projectState.addProject(...userInput);
    }
  }
}

// Actually use the stuff defined above
const input = new ProjectInput();
const activeProjectList = new ProjectList("active");
const finishedProjectList = new ProjectList("finished");
