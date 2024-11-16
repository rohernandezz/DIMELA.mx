function filterByServiceAND(activeTags) {
    const allCards = document.querySelectorAll('.tarjeta-regular');
    allCards.forEach(card => {
        const servicios = JSON.parse(card.getAttribute('data-servicios'));
        const matchesAllTags = activeTags.every(tag => servicios.includes(tag));

        if (matchesAllTags || activeTags.length === 0) {
            card.style.display = 'block';
            card.style.opacity = 1;
        } else {
            card.style.display = 'none';
        }
    });
}

document.querySelectorAll('.tagServicioFiltrar').forEach(tag => {
    tag.addEventListener('click', function() {
        this.classList.toggle('active');

        const activeTags = Array.from(document.querySelectorAll('.tagServicioFiltrar.active'))
            .map(t => t.getAttribute('data-servicio'));

        filterByServiceAND(activeTags);
    });
});

window.addEventListener('load', () => {
    filterByServiceAND([]);
});
