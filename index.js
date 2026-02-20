Hooks.once('init', () => {
    console.log('Foundry AC | Initializing Foundry AC Module');
});

Hooks.on('renderActorSheet', (app, html, data) => {
    // Only Gamemasters can see this
    if (!game.user.isGM) return;

    const actor = app.actor;
    // Attempt to extract Armour Class from common data structures
    const ac = actor.system?.attributes?.ac?.value ?? actor.system?.ac?.value ?? actor.system?.ac;

    if (ac !== undefined) {
        const acHtml = `<div class="foundry-ac-display" style="flex: 0; white-space: nowrap; margin-left: 10px; font-weight: bold; color: #ff0000;">
            <i class="fas fa-shield-alt"></i> AC: ${ac}
        </div>`;
        
        // Find the title element in the window header and append the AC display
        const headerTitle = html[0].querySelector('.window-header .window-title');
        if (headerTitle) {
            const div = document.createElement('div');
            div.innerHTML = acHtml;
            headerTitle.after(div.firstChild);
        }
    }
});

console.log('Foundry AC | Module script loaded');
