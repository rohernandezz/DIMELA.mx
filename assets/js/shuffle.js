document.addEventListener("DOMContentLoaded", function() {
    const container = document.querySelector('.card-container'); // Use querySelector to select by class
    const items = Array.from(container.children);

    // Shuffle the items array
    items.sort(() => Math.random() - 0.5);

    // Clear the container
    container.innerHTML = '';

    // Append shuffled items back to the container
    items.forEach(item => container.appendChild(item));
});