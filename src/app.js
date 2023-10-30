// Validation
function validate(validatableInput) {
    var isValid = true;
    var inputValue = validatableInput.value;
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
function autobind(target, methodName, descriptor) {
    var originalMethod = descriptor.value;
    var adjustedDescriptor = {
        configurable: true,
        get: function () {
            var boundFn = originalMethod.bind(this);
            return boundFn;
        },
    };
    return adjustedDescriptor;
}
// Classes
var ProjectInput = /** @class */ (function () {
    function ProjectInput() {
        this.templateElement = document.getElementById("project-input");
        this.hostElement = document.getElementById("app");
        var importedNode = document.importNode(this.templateElement.content, true);
        this.formElement = importedNode.firstElementChild;
        this.formElement.id = "user-input";
        this.titleInputElement = this.formElement.querySelector("#title");
        this.descriptionInputElement = this.formElement.querySelector("#description");
        this.peopleInputElement = this.formElement.querySelector("#people");
        this.configure();
        this.attach();
    }
    ProjectInput.prototype.gatherUserInput = function () {
        var inputTitle = this.titleInputElement.value;
        var inputDescription = this.descriptionInputElement.value;
        var inputPeople = this.peopleInputElement.value;
        var titleValidatable = {
            value: inputTitle,
            required: true,
        };
        var descriptionValidatable = {
            value: inputDescription,
            required: true,
            minLength: 5,
        };
        var peopleValidatable = {
            value: inputPeople,
            required: true,
            min: 1,
            max: 5,
        };
        if (!validate(titleValidatable) || !validate(descriptionValidatable) || !validate(peopleValidatable)) {
            alert("Invalid input, please try again!");
            return;
        }
        else {
            return [inputTitle, inputDescription, +inputPeople];
        }
    };
    ProjectInput.prototype.clearInputs = function () {
        this.titleInputElement.value = "";
        this.descriptionInputElement.value = "";
        this.peopleInputElement.value = "";
    };
    ProjectInput.prototype.attach = function () {
        this.hostElement.insertAdjacentElement("afterbegin", this.formElement);
    };
    ProjectInput.prototype.configure = function () {
        this.formElement.addEventListener("submit", this.submitHandler.bind(this));
    };
    ProjectInput.prototype.submitHandler = function (submitEvent) {
        submitEvent.preventDefault();
        var userInput = this.gatherUserInput();
        if (Array.isArray(userInput)) {
            var title = userInput[0], description = userInput[1], people = userInput[2];
            console.log(title, description, people);
            this.clearInputs();
        }
    };
    return ProjectInput;
}());
var projectInput = new ProjectInput();
