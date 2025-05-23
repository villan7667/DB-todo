//villan@7667
document.addEventListener("DOMContentLoaded", () => {
  // Auto-hide alerts after 5 seconds
  const alertMessage = document.getElementById("alert-message")
  if (alertMessage) {
    setTimeout(() => {
      alertMessage.style.opacity = "0"
      setTimeout(() => {
        alertMessage.style.display = "none"
      }, 300)
    }, 5000)

    // Close alert button
    const closeAlertBtn = alertMessage.querySelector(".close-alert")
    if (closeAlertBtn) {
      closeAlertBtn.addEventListener("click", () => {
        alertMessage.style.opacity = "0"
        setTimeout(() => {
          alertMessage.style.display = "none"
        }, 300)
      })
    }
  }

  // Form validation
  const addTaskForm = document.querySelector(".input-section")
  if (addTaskForm) {
    addTaskForm.addEventListener("submit", (e) => {
      const taskInput = document.getElementById("taskInput")
      if (!taskInput.value.trim()) {
        e.preventDefault()

        // Create temporary alert
        const tempAlert = document.createElement("div")
        tempAlert.className = "alert alert-error"
        tempAlert.innerHTML = `
          <p>Task title cannot be empty!</p>
          <button class="close-alert"><i class="fas fa-times"></i></button>
        `

        // Insert after form
        addTaskForm.insertAdjacentElement("afterend", tempAlert)

        // Add close functionality
        const closeBtn = tempAlert.querySelector(".close-alert")
        closeBtn.addEventListener("click", () => {
          tempAlert.style.opacity = "0"
          setTimeout(() => {
            tempAlert.remove()
          }, 300)
        })

        // Auto remove after 5 seconds
        setTimeout(() => {
          tempAlert.style.opacity = "0"
          setTimeout(() => {
            tempAlert.remove()
          }, 300)
        }, 5000)

        // Focus input
        taskInput.focus()
      }
    })
  }

  // Toggle task completion with AJAX
  const checkboxes = document.querySelectorAll(".task-checkbox")
  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      const taskId = this.getAttribute("data-id")
      const taskItem = this.closest(".task-item")
      const taskTitle = taskItem.querySelector(".task-title")
      const tasksList = document.querySelector(".tasks-list")

      // Update counters
      const totalCountElement = document.querySelector(".total-count")
      const completedCountElement = document.querySelector(".completed-count")

      // Optimistic UI update
      if (this.checked) {
        taskItem.classList.add("completed")
        taskTitle.classList.add("completed-text")

        // Move completed task to bottom with animation
        setTimeout(() => {
          taskItem.style.transform = "translateX(100%)"
          taskItem.style.opacity = "0"

          setTimeout(() => {
            tasksList.appendChild(taskItem)
            taskItem.style.transform = "translateX(0)"
            taskItem.style.opacity = "1"
          }, 300)
        }, 100)

        // Update completed count
        if (completedCountElement) {
          const currentCompleted = Number.parseInt(completedCountElement.textContent.split(" ")[0])
          completedCountElement.textContent = `${currentCompleted + 1} completed`
        }
      } else {
        taskItem.classList.remove("completed")
        taskTitle.classList.remove("completed-text")

        // Move incomplete task to top with animation
        setTimeout(() => {
          taskItem.style.transform = "translateX(-100%)"
          taskItem.style.opacity = "0"

          setTimeout(() => {
            // Find the first completed task or append to beginning
            const firstCompletedTask = tasksList.querySelector(".task-item.completed")
            if (firstCompletedTask) {
              tasksList.insertBefore(taskItem, firstCompletedTask)
            } else {
              tasksList.insertBefore(taskItem, tasksList.firstChild)
            }
            taskItem.style.transform = "translateX(0)"
            taskItem.style.opacity = "1"
          }, 300)
        }, 100)

        // Update completed count
        if (completedCountElement) {
          const currentCompleted = Number.parseInt(completedCountElement.textContent.split(" ")[0])
          completedCountElement.textContent = `${Math.max(0, currentCompleted - 1)} completed`
        }
      }

      // Send AJAX request
      fetch("/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `taskId=${taskId}`,
      })
        .then((response) => response.json())
        .then((data) => {
          if (!data.success) {
            // Revert UI if request failed
            this.checked = !this.checked
            if (this.checked) {
              taskItem.classList.add("completed")
              taskTitle.classList.add("completed-text")

              // Revert completed count
              if (completedCountElement) {
                const currentCompleted = Number.parseInt(completedCountElement.textContent.split(" ")[0])
                completedCountElement.textContent = `${currentCompleted + 1} completed`
              }
            } else {
              taskItem.classList.remove("completed")
              taskTitle.classList.remove("completed-text")

              // Revert completed count
              if (completedCountElement) {
                const currentCompleted = Number.parseInt(completedCountElement.textContent.split(" ")[0])
                completedCountElement.textContent = `${Math.max(0, currentCompleted - 1)} completed`
              }
            }
          }
        })
        .catch((error) => {
          console.error("Error:", error)
          // Revert UI on error
          this.checked = !this.checked
          if (this.checked) {
            taskItem.classList.add("completed")
            taskTitle.classList.add("completed-text")
          } else {
            taskItem.classList.remove("completed")
            taskTitle.classList.remove("completed-text")
          }
        })
    })
  })

  // Edit form functionality
  window.showEditForm = (taskId) => {
    // Hide any open edit forms first
    document.querySelectorAll(".edit-form").forEach((form) => {
      form.classList.remove("active")
    })

    // Show the selected edit form
    const editForm = document.getElementById(`edit-form-${taskId}`)
    if (editForm) {
      editForm.classList.add("active")

      // Focus the input field
      const input = editForm.querySelector(".edit-input")
      if (input) {
        input.focus()
        // Place cursor at the end
        const length = input.value.length
        input.setSelectionRange(length, length)
      }
    }
  }

  window.hideEditForm = (taskId) => {
    const editForm = document.getElementById(`edit-form-${taskId}`)
    if (editForm) {
      editForm.classList.remove("active")
    }
  }

  // Add button hover effect
  const addButton = document.querySelector(".add-btn")
  if (addButton) {
    addButton.addEventListener("mouseenter", () => {
      addButton.style.transform = "translateY(-2px)"
    })

    addButton.addEventListener("mouseleave", () => {
      addButton.style.transform = "translateY(0)"
    })
  }

  // Task item hover effects
  const taskItems = document.querySelectorAll(".task-item")
  taskItems.forEach((item) => {
    item.addEventListener("mouseenter", () => {
      if (!item.classList.contains("completed")) {
        item.style.transform = "translateY(-2px)"
      }
    })

    item.addEventListener("mouseleave", () => {
      item.style.transform = "translateY(0)"
    })
  })

  // Add ripple effect to buttons
  const buttons = document.querySelectorAll("button")
  buttons.forEach((button) => {
    button.addEventListener("click", function (e) {
      const x = e.clientX - e.target.getBoundingClientRect().left
      const y = e.clientY - e.target.getBoundingClientRect().top

      const ripple = document.createElement("span")
      ripple.style.left = `${x}px`
      ripple.style.top = `${y}px`
      ripple.className = "ripple"

      this.appendChild(ripple)

      setTimeout(() => {
        ripple.remove()
      }, 600)
    })
  })
})

// Add ripple effect styles
const style = document.createElement("style")
style.textContent = `
  button {
    position: relative;
    overflow: hidden;
  }
  
  .ripple {
    position: absolute;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    transform: scale(0);
    animation: ripple 0.6s linear;
    pointer-events: none;
  }
  
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
`
document.head.appendChild(style)
