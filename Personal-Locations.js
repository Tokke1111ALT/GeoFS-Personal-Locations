// ==UserScript==
// @name         GeoFS - Personal Locations Saver
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Adds a Personal saved location list to GeoFS.
// @author       Tokke_1111
// @match        https://www.geo-fs.com/geofs.php*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=geo-fs.com
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Wait until DOM is fully loaded
    function onDOMReady() {

        // Find the location search form
        const form = document.querySelector(".geofs-locationForm.geofs-stopMousePropagation.geofs-stopKeyupPropagation");
        if (!form) return console.error("Form not found");

        // Create Save button
        const saveBtn = document.createElement("button");
        saveBtn.type = "button";
        saveBtn.className = "mdl-button mdl-js-button mdl-button--raised mdl-button--accent";
        saveBtn.style.marginLeft = "10px";
        saveBtn.textContent = "Save";

        // Append Save button to the form
        form.appendChild(saveBtn);

        // Find the main location list where we'll add our new tab
        const locationList = document.querySelector(".geofs-list.geofs-toggle-panel.geofs-location-list.geofs-visible");
        if (!locationList) return console.error("Location list not found");

        // Create the "Personal" collapsible item
        const personalLi = document.createElement("li");
        personalLi.className = "geofs-list-collapsible-item";
        personalLi.textContent = "Personal";

        // Create inner <ul> for saved locations
        const collapsibleUl = document.createElement("ul");
        collapsibleUl.className = "geofs-collapsible";

        // Add the empty list to the Personal tab
        personalLi.appendChild(collapsibleUl);
        locationList.appendChild(personalLi);

        // Get current aircraft location
        function getCurrentLocation() {
            if (!window.geofs || !window.geofs.aircraft || !window.geofs.aircraft.instance) return null;

            const [lat, lon, alt] = window.geofs.aircraft.instance.llaLocation || [0, 0, 0];
            const heading = window.geofs.animation.values.heading360 || 0;

            if (isNaN(lat) || isNaN(lon)) return null;

            return { lat, lon, alt, heading };
        }

        // Load previously saved locations from localStorage
        function loadSavedLocations() {
            const saved = JSON.parse(localStorage.getItem("personalLocations")) || [];
            saved.forEach(loc => {
                const li = document.createElement("li");
                li.setAttribute("data-location", `geofs.flyTo([${loc.lat}, ${loc.lon}, ${loc.alt + 10}, ${loc.heading}, true]);`);
                li.textContent = loc.name;
                addDeleteButton(li, loc.name);
                collapsibleUl.appendChild(li);
            });
        }

        // Add ❌ delete button to each item
        function addDeleteButton(listItem, name) {
            const delBtn = document.createElement("span");
            delBtn.textContent = " ❌";
            delBtn.title = "Delete";
            delBtn.style.cursor = "pointer";
            delBtn.style.color = "red";
            delBtn.style.marginLeft = "10px";
            delBtn.style.fontSize = "16px";

            delBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                if (confirm("Are you sure?")) {
                    removeSavedLocation(name);
                    collapsibleUl.removeChild(listItem);
                }
            });

            listItem.appendChild(delBtn);
        }

        // Save current location when Save button is clicked
        saveBtn.addEventListener("click", () => {
            const location = getCurrentLocation();
            if (!location) {
                alert("Could not get current location.");
                return;
            }

            const name = prompt("Enter a name for this location:");
            if (!name) return;

            const saved = JSON.parse(localStorage.getItem("personalLocations")) || [];

            if (saved.some(loc => loc.name === name)) {
                alert("A location with that name already exists.");
                return;
            }

            const newLoc = { name, ...location };
            saved.push(newLoc);
            localStorage.setItem("personalLocations", JSON.stringify(saved));

            const li = document.createElement("li");
            li.setAttribute("data-location", `geofs.flyTo([${location.lat}, ${location.lon}, ${location.alt + 10}, ${location.heading}, true]);`);
            li.textContent = name;
            addDeleteButton(li, name);
            collapsibleUl.appendChild(li);
            alert(`Location "${name}" saved!`);
        });

        // Remove a location from localStorage
        function removeSavedLocation(name) {
            let saved = JSON.parse(localStorage.getItem("personalLocations")) || [];
            saved = saved.filter(loc => loc.name !== name);
            localStorage.setItem("personalLocations", JSON.stringify(saved));
        }

        // Override geofs.flyTo to always start 10ft above and stop movement
        const originalFlyTo = window.geofs.flyTo;
        window.geofs.flyTo = function (coords) {
            if (!Array.isArray(coords) || coords.length < 4) return originalFlyTo(coords);

            let [lat, lon, alt, heading, absolute] = coords;
            alt += 10; // Always start 10ft higher to avoid stuck in ground

            originalFlyTo([lat, lon, alt, heading, absolute]);

            setTimeout(() => {
                if (window.geofs && window.geofs.aircraft && window.geofs.aircraft.instance) {
                    window.geofs.aircraft.instance.speed = 0;
                    window.geofs.aircraft.instance.rigidBody.linearVelocity.setZero();
                }
            }, 500);
        };

        // Load saved locations on startup
        loadSavedLocations();
    }

    // Wait for DOM to be ready before modifying elements
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", onDOMReady);
    } else {
        setTimeout(onDOMReady, 1000); // Small delay to ensure page is ready
    }
})();
