// ==========================
// = LAYOUT EVENTS BEHAVIOR =
// ==========================
// onLoaded  - occurs when layout file was successfully loaded
// onReady - occurs after data successfully loaded and all elements drawn
// NOTE:
//  1. make sence store a layout data in memory and not load it every time
//     when user open NewTab page.
//  2. method {add} has to be part of a layout object. it will give 
//     a flexibility for adding items. for instance we can go through every
//     page and ask for an available space and if it exists scroll to it.
//  3. items can be packed into groups. only one lavel available.
//  4. size of an item rectingle resizable
//  5. ???
// ==========================