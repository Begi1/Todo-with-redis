const api = "http://localhost:3000";

window.onload = function() {
    fetch(api + "/gettodo")
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
            Object.keys(data).forEach(key => {
                const todo = data[key];
                createTodos(todo.key, todo.value);
            });
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
    });
};

function createTodos(todoText, descriptionText) {
    const todos = document.getElementById('todos');

    let cont = document.createElement('div');
    cont.setAttribute('class', 'todoCont');
    todos.appendChild(cont);

    let todo = document.createElement('h1');
    todo.textContent = todoText;
    cont.appendChild(todo);

    let description = document.createElement('p');
    description.textContent = descriptionText;
    cont.appendChild(description);

    let edit = document.createElement('button');
    edit.setAttribute('class', 'editBtn')
    edit.textContent = "Edit";
    cont.appendChild(edit);
    edit.addEventListener('click', () => {
        openEditTodo(todoText, descriptionText)
    })

    let del = document.createElement('button');
    del.setAttribute('class', 'deleteBtn')
    del.textContent = "Delete";
    cont.appendChild(del);
    del.addEventListener('click', () => {
        deleteTodo(todoText)
    })

}

function addTodo() {
    const todo = document.getElementById('todo');
    const description = document.getElementById('description');

    if (!todo.value.trim() || !description.value.trim()) {
        alert('Please fill out both fields.');
        return;
    }

    const data = {
        todo: todo.value,
        description: description.value
    };

    fetch(api + "/addtodo", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            response.json().then(errorData => alert(errorData.error))
            throw new Error('Network response was not ok');
        }
        return response.json()
    })
    .then(data => {
        console.log('Success:', data);
        todo.value = '';
        description.value = '';
    })
    .catch(error => {
        console.error('Error:', error);
    });

    
}

function deleteTodo (key) {
    fetch(api + '/deletetodo/' + key, {
        method: 'DELETE',
      })
        .then(response => {
          if (response.ok) {
            console.log('Resource deleted');
          } else {
            console.log(api + '/' + key)
            console.log('Failed to delete resource');
          }
        })
        .catch(error => console.error('Error:', error));
}

function editTodo (todo, description) {
    const editTodo = document.getElementById('editTodo')
    const editDescription = document.getElementById('editDescription')

    const data = {
        todo: editTodo.value,
        description: editDescription.value
      }; 
      console.log(data)
    fetch(api + "/changetodo/" + todo, {
        method: 'PUT', 
        headers: {
        'Content-Type': 'application/json' 
        },
        body: JSON.stringify(data) 
    })
        .then(response => response.json())
        .then(data => {
        console.log('Success:', data); 
        })
        .catch(error => {
        console.error('Error:', error); 
    });

    editTodo.value = ''
    editDescription.value = ''
    editTodoClose()
}

function openEditTodo (todo, description) {
    const edit = document.getElementById('edit')
    const editBack = document.getElementById('editBack')
    const editBtn = document.getElementById('editBtn')
    const editTodoElement = document.getElementById('editTodo')
    const editDescription = document.getElementById('editDescription')

    editTodoElement.value = todo
    editDescription.value = description

    edit.style.display = 'flex'
    editBack.style.display = 'block'
    
    editBtn.addEventListener('click', () => {
        editTodo(todo, description)
    })
}

function editTodoClose () {
    const edit = document.getElementById('edit')
    const editBack = document.getElementById('editBack')
    const editTodo = document.getElementById('editTodo')
    const editDescription = document.getElementById('editDescription')

    editTodo.value = ''
    editDescription.value = ''

    edit.style.display = 'none'
    editBack.style.display = 'none'

}