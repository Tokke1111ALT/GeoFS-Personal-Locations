# GeoFS - Personal Locations Saver

A userscript for GeoFS that lets you save your favorite flying spots and teleport back instantly – always spawning 10 feet above ground with zero speed.

## Description

This script adds a new **"Personal"** tab to the GeoFS location menu where you can store and return to your favorite spots. You can manually save your current aircraft position with a custom name. When teleporting back, the script ensures you spawn exactly **10 feet above the saved spot**.

All data is stored locally using localStorage – no external servers or tracking involved.

## Features

- Adds a new **Personal** collapsible tab to the GeoFS UI
- Adds a Save button next to the search bar
- Save your current aircraft location with a custom name
- Always spawns 10 feet above  level
- Delete saved locations safely with confirmation: "Are you sure?"
- Data is stored in localStorage (persists after reload)

## How It Works

- Gets your current position via geofs.aircraft.instance.llaLocation
- Gets heading from geofs.animation.values.heading360
- Overrides geofs.flyTo() to ensure:
  - Aircraft starts at altitude + 10
- Saves everything under key "personalLocations" in localStorage

## Installation

### Step 1: Install a Userscript Manager  
Try one of these browser extensions:
- [Tampermonkey](https://www.tampermonkey.net/ )
- [Violentmonkey](https://violentmonkey.github.io/ )

### Step 2: Add the Script  
1. Open the userscript extension
2. Create a new script or import from URL
3. Paste or link to your hosted .user.js file:

### Step 3: Use It in GeoFS  
1. Go to [GeoFS](https://geo-fs.com/geofs.php )
2. Fly to a location you want to save
3. Click the location button
4. Click the **Save** button next to the search bar
5. Enter a name for the location
6. The location appears under the **Personal** tab
7. Click it anytime to teleport back, always +10ft

## Delete a Saved Location

Each saved item has an **x icon** behind the name.  
Clicking it shows:

> **Are you sure?**

Only after confirming will it be removed permanently from both the list and localStorage.

## Author

Tokke_1111  

## Contributing

Want to improve or expand this script?

- Fork the repo
- Make your changes
- Submit a pull request

All contributions are welcome!

## License

MIT – see LICENSE for details.

## Feedback & Issues

If you find bugs or have ideas for improvement, feel free to open an issue on GitHub or reach out via:

- Discord: Tokke_1111
- GitHub: Tokke_1111ALT 

Happy flying and safe landings!
