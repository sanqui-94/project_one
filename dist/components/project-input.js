var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autobind } from "../decorators/autobind.js";
import { projectState } from "../state/project-state.js";
import { validate } from "../util/validation.js";
import { Component } from "./base-component.js";
export class ProjectInput extends Component {
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
        if (validate({ value: titleValue, required: true, minLength: 5 }) &&
            validate({
                value: descriptionValue,
                required: true,
                minLength: 5,
            }) &&
            validate({ value: peopleValue, required: true, min: 0, max: 10 })) {
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
            projectState.addProject(...userInput);
        }
    }
}
__decorate([
    Autobind
], ProjectInput.prototype, "submitHandler", null);
//# sourceMappingURL=project-input.js.map