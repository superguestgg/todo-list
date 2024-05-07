function createElement(tag, attributes, children, callbacks = []) {
	const element = document.createElement(tag);

	if (attributes) {
		Object.keys(attributes).forEach((key) => {
			element.setAttribute(key, attributes[key]);
		});
	}

	if (Array.isArray(children)) {
		children.forEach((child) => {
			if (typeof child === "string") {
				element.appendChild(document.createTextNode(child));
			} else if (child instanceof HTMLElement) {
				element.appendChild(child);
			}
		});
	} else if (typeof children === "string") {
		element.appendChild(document.createTextNode(children));
	} else if (children instanceof HTMLElement) {
		element.appendChild(children);
	}

	callbacks.forEach((callback) => {
		element.addEventListener(callback.type, callback.listener);
	});

	return element;
}

class Component {
	constructor() {}

	getDomNode() {
		this._domNode = this.render();
		return this._domNode;
	}

	update() {
		this._domNode.replaceWith(this.getDomNode());
	}
}

class TodoList extends Component {
	constructor(state) {
		super();
		this.state = {
			tasks: [{
					text: "Съесть яблоко",
					done: false
				},
				{
					text: "Погладить котика",
					done: false
				},
				{
					text: "Лечь спать",
					done: false
				},
			]
		};
	}

	render() {
		return createElement("div", {
			class: "todo-list"
		}, [
			createElement("h1", {}, "TODO List"),
			new AddTask(this.onAddTask.bind(this)).getDomNode(),
			createElement(
				"ul", {
					id: "tasks"
				},
				this.state.tasks.map((task) =>
					new Task(task,
						() => {
							const taskIndex = this.state.tasks.indexOf(task);
							this.state.tasks.splice(taskIndex, 1);
							this.update();
						}
					).getDomNode()
				)
			),
		]);
	}

	onAddTask(input) {
		this.state.tasks.push({
			text: input,
			done: false
		});
		this.update();
	}
}

class Task extends Component {
	constructor(task, onDeleteTask) {
		super();
		this.task = task;
		this.onDeleteTask = onDeleteTask;
		this.clicksCount = 0;
	}

	render() {
		return createElement("li", {
			class: this.task.done ? "completed" : ""
		}, [
			createElement(
				"input", {
					type: "checkbox",
					...(this.task.done && {
						checked: true
					})
				},
				null,
				[{
					type: "click",
					listener: () => {
						this.task.done = !this.task.done;
						this.update();
					},
				}, ]
			),
			createElement("label", {}, this.task.text),
			createElement(
				"button", {
					class: this.clicksCount === 1 ? "beforeRemove" : ""
				},
				"🗑️",
				[{
					type: "click",
					listener: () => {
						++this.clicksCount;
						if (this.clicksCount === 2) {
							this.onDeleteTask();
						}
						this.update();
					},
				}, ]
			),
		]);
	}
}

class AddTask extends Component {
	constructor(onAddTask) {
		super();
		this.onAddTask = onAddTask;
		this.input = "";
	}

	render() {
		return createElement("div", {
			class: "add-todo"
		}, [
			createElement(
				"input", {
					id: "new-todo",
					type: "text",
					placeholder: "Задание",
				},
				null,
				[{
					type: "input",
					listener: this.onAddInputChange.bind(this)
				}]
			),
			createElement("button", {
				id: "add-btn"
			}, "+", [{
				type: "click",
				listener: () => this.onAddTask(this.input)
			}, ]),
		]);
	}

	onAddInputChange(event) {
		this.input = event.target.value;
	}
}

document.addEventListener("DOMContentLoaded", () => {
	document.body.appendChild(new TodoList().getDomNode());
});