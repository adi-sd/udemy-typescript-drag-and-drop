// Validation

interface Validatable {
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
}

function validate(validatableInput: Validatable): boolean {
    let isValid = true;
    const inputValue = validatableInput.value;
    if (validatableInput.required) {
        isValid = isValid && inputValue.toString().trim().length !== 0;
    }
    if (typeof inputValue === "string") {
        if (validatableInput.minLength != null) {
            isValid = isValid && inputValue.length >= validatableInput.minLength;
        }
        if (validatableInput.maxLength != null) {
            isValid = isValid && inputValue.length <= validatableInput.maxLength;
        }
    }

    if (typeof inputValue === "number") {
        if (validatableInput.min != null) {
            isValid = isValid && inputValue >= validatableInput.min;
        }
        if (validatableInput.max != null) {
            isValid = isValid && inputValue <= validatableInput.max;
        }
    }

    return isValid;
}

// Decorators

function autobind(target: any, methodName: string, descriptor: PropertyDescriptor): any {
    const originalMethod = descriptor.value;
    const adjustedDescriptor: PropertyDescriptor = {
        configurable: true,
        get() {
            const boundFn = originalMethod.bind(this);
            return boundFn;
        },
    };
    return adjustedDescriptor;
}

// Classes

class ProjectInput {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    formElement: HTMLFormElement;
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor() {
        this.templateElement = document.getElementById("project-input")! as HTMLTemplateElement;
        this.hostElement = document.getElementById("app")! as HTMLDivElement;

        const importedNode = document.importNode(this.templateElement.content, true);
        this.formElement = importedNode.firstElementChild as HTMLFormElement;
        this.formElement.id = "user-input";

        this.titleInputElement = this.formElement.querySelector("#title") as HTMLInputElement;
        this.descriptionInputElement = this.formElement.querySelector("#description") as HTMLInputElement;
        this.peopleInputElement = this.formElement.querySelector("#people") as HTMLInputElement;

        this.configure();
        this.attach();
    }

    private gatherUserInput(): [string, string, number] | void {
        const inputTitle = this.titleInputElement.value;
        const inputDescription = this.descriptionInputElement.value;
        const inputPeople = this.peopleInputElement.value;

        const titleValidatable: Validatable = {
            value: inputTitle,
            required: true,
        };
        const descriptionValidatable: Validatable = {
            value: inputDescription,
            required: true,
            minLength: 5,
        };
        const peopleValidatable: Validatable = {
            value: inputPeople,
            required: true,
            min: 1,
            max: 5,
        };

        if (!validate(titleValidatable) || !validate(descriptionValidatable) || !validate(peopleValidatable)) {
            alert("Invalid input, please try again!");
            return;
        } else {
            return [inputTitle, inputDescription, +inputPeople];
        }
    }

    private clearInputs() {
        this.titleInputElement.value = "";
        this.descriptionInputElement.value = "";
        this.peopleInputElement.value = "";
    }

    private attach() {
        this.hostElement.insertAdjacentElement("afterbegin", this.formElement);
    }

    private configure() {
        this.formElement.addEventListener("submit", this.submitHandler.bind(this));
    }

    private submitHandler(submitEvent: Event) {
        submitEvent.preventDefault();
        const userInput = this.gatherUserInput();
        if (Array.isArray(userInput)) {
            const [title, description, people] = userInput;
            console.log(title, description, people);
            this.clearInputs();
        }
    }
}

const projectInput = new ProjectInput();
