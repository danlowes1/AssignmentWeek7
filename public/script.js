
// let tasks = [];

const addTaskEl = document.getElementById("add-task");
const taskInputEl = document.querySelector(".task-input");
const taskTableBodyEl = document.querySelector(".task-table tbody");
const dateHeaderEl = document.getElementById('sort-header-date');
const taskHeaderEl = document.getElementById('sort-header-task');



taskInputEl.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        onClickAddButton();
    }
});


document.addEventListener("DOMContentLoaded", () => {
    addTaskEl.addEventListener("click", onClickAddButton); 
    taskInputEl.focus()
	fetchData(); // Call fetchData when the page loads
});

const onClickAddButton = async () => {

    const CreatedOn = new Date().toISOString().slice(0, 19).replace('T', ' ') // date and time format
    const newData = { text:  taskInputEl.value, CreatedOn: CreatedOn }; 
 
    try {
    const response = await fetch("/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData),
    });

    if (response.ok) {
        taskInputEl.value = "";
        fetchData();
    }
    } catch (error) {
        console.error("Error adding data:", error);
    }
};


const deleteDataItem = async (itemId) => {
    try {
    const response = await fetch(`/data/${itemId}`, {
        method: "DELETE",
    });

    if (response.ok) {
        fetchData();
    }
    } catch (error) {
        console.error(`Error deleting item ${itemId}:`, error);
    }
};



const SaveDataItem = async (itemId, updatedData) => {

    // const newText = { text:  taskInputEl.value }; 
    try {
    const response = await fetch(`/data/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
        });
    if (response.ok) {
        // fetchData();
    }
    } catch (error) {
        console.error("Error adding data:", error);
    }
};

const fetchData = async () => {   
	const row = document.createElement('tr'); 
	try {
		const response = await fetch("/data");
		const data = await response.json();
		//* dataList.innerHTML = ""; // Clear the list before rendering
		taskTableBodyEl.innerHTML = '';
		data.forEach((item) => {
			const row = document.createElement('tr');
            row.dataset.id = item.id; // crucial for identifying the item later
            row.innerHTML = 
				`<td>
					<span class="task-text">${item.text}</span>
					<input type="text" class="editable-task" value="${item.text}" style="display: none;">
				</td>
				<td>${item.CreatedOn}</td>
				<td class="task-actions">
				<button class="task-btn" data-action="undo" style="display: none;">
					Undo
				</button>
				<button class="task-btn" data-action="edit" >
					Edit
				</button>
				<button class="task-btn" data-action="delete">
					Delete
				</button>
				</td>
			`;           
			taskTableBodyEl.appendChild(row);
		});
	} catch (error) {
		console.error("Error fetching data:", error);
	}
}

    //                 <td ID="ItemId" style="display: none;>${item.id}</td>   

taskTableBodyEl.addEventListener("click", function (e) {
    const actionButton = e.target.closest(".task-btn");

    if (!actionButton) return; // check if button with .task-btn was clicked

    const action = actionButton.dataset.action; // Get current action from data-action attribute 

    const row = e.target.closest("tr"); // find closest ancestor <tr> element (on same table row (check?)) to clicked element
    const taskId = row.dataset.id; // get task ID from data-id attribte of row
    // ////// const task = tasks.find(t => t.id === taskId); // Find correspponding task object in tasks array with taskID
    const input = row.querySelector(".editable-task");

    if (action === "edit") {
        // First reset any other records in 'edit' mode and undo
        const otherSaveButtons = taskTableBodyEl.querySelectorAll('[data-action="save"]'); // CHANGE
        otherSaveButtons.forEach(btn => {
            const otherRow = btn.closest("tr");
            const spanOther = otherRow.querySelector(".task-text");
            const inputOther = otherRow.querySelector(".editable-task");
            const undoBtnOther = otherRow.querySelector('[data-action="undo"]');
            // Revert to non-edit mode
            spanOther.style.display = "inline";
            inputOther.style.display = "none";
            inputOther.value = spanOther.textContent;
            btn.dataset.action = "edit";
            btn.textContent = "Edit";           
            undoBtnOther.style.display = "none"; 
            
        })

        const span = row.querySelector(".task-text");
        // const input = row.querySelector(".editable-task");
        const undoBtn = row.querySelector('[data-action="undo"]');

        // hide/display boxes
        span.style.display = "none";
        input.style.display = "inline";
        // Change button to "Save" mode
        actionButton.dataset.action = "save"; 
        actionButton.textContent = 'Save';
        // Unhide Undo button
        undoBtn.style.display = "inline";  

        input.focus();
    } else if (action === "save") {
        console.log("save clicked")
 
        const input = row.querySelector(".editable-task");
        const newText = input.value.trim();
        console.log(taskId)
        console.log(newText)
        SaveDataItem (taskId, newText);
        // if (newText) {
        //     task.text = newText;
        // }

        // Change button back to Edit 
        actionButton.dataset.action = "edit";
        actionButton.textContent = 'Edit';
        // fetchData();

    } else if (action === "delete") {

        // const confirmDelete = window.confirm( `Delete this task?\n\n"${item.text}"`);
        const confirmDelete = window.confirm("Delete this task?");
        if (confirmDelete) {
            
            deleteDataItem(taskId);
            // fetchData();
        }
    } else if (action === "undo") {
        const span = row.querySelector(".task-text");
        const input = row.querySelector(".editable-task");
        const editBtn = row.querySelector('[data-action="save"]');
        // hide/display boxes
        span.style.display = "inline";
        input.style.display = "none";
        editBtn.dataset.action = "edit";
        editBtn.textContent = "Edit";
        actionButton.style.display = "none";
        // reset the content of the input box
        input.value = span.textContent;
    }

});

// show message function nicked off the internet
function showMessage(text) {
    const msg = document.getElementById("message");
    msg.textContent = text;
    msg.classList.remove("hidden");

    // Automatically hide after 3 seconds
    setTimeout(() => {
        msg.classList.add("hidden");
    }, 3000);
}

