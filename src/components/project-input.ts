import { Autobind } from "../decorators/autobind.js";
import { projectState } from "../state/project-state.js";
import { validate } from "../util/validation.js";
import { Component } from "./base-component.js";

export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
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

  private gatherUserInput(): [string, string, number] | void {
    const titleValue = this.title.value;
    const descriptionValue = this.description.value;
    const peopleValue = this.people.value;

    if (
      validate({ value: titleValue, required: true, minLength: 5 }) &&
      validate({
        value: descriptionValue,
        required: true,
        minLength: 5,
      }) &&
      validate({ value: peopleValue, required: true, min: 0, max: 10 })
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
