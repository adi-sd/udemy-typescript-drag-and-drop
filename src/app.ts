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

function autobind(_target: any, _methodName: string, descriptor: PropertyDescriptor): any {
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

// Types

enum ProjectStatus {
    Active,
    Finished,
}

type Listener<T> = (item: T[]) => void;

// Drag and Drop Interfaces

interface Draggable {
    dragStartHandler(event: DragEvent): void;
    dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
    dragOverHandler(event: DragEvent): void;
    dropHandler(event: DragEvent): void;
    dragLeaveHandler(event: DragEvent): void;
}

// Classes
class Project {
    public id: string;
    constructor(public title: string, public description: string, public people: number, public status: ProjectStatus) {
        this.id = Date.now().toString();
    }
}

class State<T> {
    protected listeners: Listener<T>[] = [];

    addListener(listenerFunction: Listener<T>) {
        this.listeners.push(listenerFunction);
    }
}

class ProjectState extends State<Project> {
    private projects: Project[] = [];
    private static instance: ProjectState;

    private constructor() {
        super();
    }

    static getInstance() {
        if (this.instance) {
            return this.instance;
        } else {
            this.instance = new ProjectState();
            return this.instance;
        }
    }

    addProject(title: string, description: string, numOfPeople: number) {
        const newProject = new Project(title, description, numOfPeople, ProjectStatus.Active);
        console.log("New Project Created - ", newProject);
        this.projects.push(newProject);
        this.updateListeners();
    }

    moveProject(projectId: string, newStatus: ProjectStatus) {
        const movedProject = this.projects.find((project) => project.id == projectId);
        if (movedProject && movedProject.status !== newStatus) {
            movedProject.status = newStatus;
            console.log("Moved Project With ID - ", movedProject.id);
            this.updateListeners();
        }
    }

    private updateListeners() {
        for (const listenerFunction of this.listeners) {
            listenerFunction(this.projects.slice());
        }
    }
}

const projectState = ProjectState.getInstance();

// Component Base Class

abstract class Component<T extends HTMLElement, U extends HTMLElement> {
    templateElement: HTMLTemplateElement;
    hostElement: T;
    element: U;

    constructor(templateId: string, hostElementId: string, insertAtStart: boolean, newElementId?: string) {
        this.templateElement = document.getElementById(templateId)! as HTMLTemplateElement;
        this.hostElement = document.getElementById(hostElementId)! as T;
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild as U;
        if (newElementId) {
            this.element.id = newElementId;
        }
        this.attach(insertAtStart);
    }

    private attach(insertAtStart: boolean) {
        this.hostElement.insertAdjacentElement(insertAtStart ? "afterbegin" : "beforeend", this.element);
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
            return `${this.project.people} people`;
        }
    }

    constructor(hostListId: string, project: Project) {
        super("single-project", hostListId, false, project.id);
        this.project = project;
        this.configure();
        this.renderContent();
    }

    configure(): void {
        this.element.addEventListener("dragstart", this.dragStartHandler.bind(this));
        this.element.addEventListener("dragend", this.dragEndHandler.bind(this));
    }

    renderContent(): void {
        this.element.querySelector("h2")!.textContent = this.project.title;
        this.element.querySelector("h3")!.textContent = this.persons + " assigned.";
        this.element.querySelector("p")!.textContent = this.project.description;
    }

    dragStartHandler(event: DragEvent): void {
        event.dataTransfer!.setData("text/plain", this.project.id);
        event.dataTransfer!.effectAllowed = "move";
    }

    dragEndHandler(_event: DragEvent): void {
        console.log("DragEnd");
    }
}

class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
    assignedProjects: Project[] = [];

    constructor(private type: "active" | "finished") {
        super("project-list", "app", false, `${type}-projects`);
        this.configure();
        this.renderContent();
    }

    configure(): void {
        this.element.addEventListener("dragover", this.dragOverHandler.bind(this));
        this.element.addEventListener("drop", this.dropHandler.bind(this));
        this.element.addEventListener("dragleave", this.dragLeaveHandler.bind(this));
        projectState.addListener((projects: Project[]) => {
            const relevantProject = projects.filter((project) => {
                if (this.type === "active") {
                    return project.status === ProjectStatus.Active;
                } else {
                    return project.status === ProjectStatus.Finished;
                }
            });
            this.assignedProjects = relevantProject;
            this.renderProjects();
        });
    }

    renderContent() {
        const listId = `${this.type}-projects-list`;
        this.element.querySelector("ul")!.id = listId;
        this.element.querySelector("h2")!.textContent = this.type.toUpperCase() + " PROJECTS";
    }

    private renderProjects() {
        const listElement = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
        listElement.innerHTML = "";
        for (const projectItem of this.assignedProjects) {
            new ProjectItem(this.element.querySelector("ul")!.id, projectItem);
        }
    }

    dragOverHandler(event: DragEvent): void {
        if (event.dataTransfer && event.dataTransfer.types[0] == "text/plain") {
            event.preventDefault();
            const listElement = this.element.querySelector("ul")!;
            listElement.classList.add("droppable");
        }
    }

    dropHandler(event: DragEvent): void {
        const projectId = event.dataTransfer!.getData("text/plain");
        console.log("Dropped Project With Id - ", projectId);
        projectState.moveProject(projectId, this.type === "active" ? ProjectStatus.Active : ProjectStatus.Finished);
    }

    dragLeaveHandler(_event: DragEvent): void {
        const listElement = this.element.querySelector("ul")!;
        listElement.classList.remove("droppable");
    }
}

class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor() {
        super("project-input", "app", true, "user-input");

        this.titleInputElement = this.element.querySelector("#title") as HTMLInputElement;
        this.descriptionInputElement = this.element.querySelector("#description") as HTMLInputElement;
        this.peopleInputElement = this.element.querySelector("#people") as HTMLInputElement;

        this.configure();
    }

    configure() {
        this.element.addEventListener("submit", this.submitHandler.bind(this));
    }

    renderContent(): void {}

    private gatherUserInput(): [string, string, number] | void {
        const inputTitle = this.titleInputElement.value;
        const inputDescription = this.descriptionInputElement.value;
        const inputPeople = parseInt(this.peopleInputElement.value);

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
            return [inputTitle, inputDescription, inputPeople];
        }
    }

    private clearInputs() {
        this.titleInputElement.value = "";
        this.descriptionInputElement.value = "";
        this.peopleInputElement.value = "";
    }

    private submitHandler(submitEvent: Event) {
        submitEvent.preventDefault();
        const userInput = this.gatherUserInput();
        if (Array.isArray(userInput)) {
            const [title, description, people] = userInput;
            projectState.addProject(title, description, people);
            this.clearInputs();
        }
    }
}

const projectInput = new ProjectInput();
const activeProjectList = new ProjectList("active");
const finishedProjectList = new ProjectList("finished");
