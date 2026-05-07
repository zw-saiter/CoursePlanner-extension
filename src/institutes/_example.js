// This is a example for extracting course data from an institute's course registration page.
// Required: Use canonical institute codes as file names (e.g. sait.js, ubc.js)


/**
 * @typedef {Object} CourseSlot
 * @property {number[]} days - Array of day indices (0:Sun, 1:Mon...6:Sat)
 * @property {string} beginHM - HHmm format
 * @property {string} endHM - HHmm format
 * @property {string} rooms - Room name or 'ONLINE'
 * @property {boolean} online - Is the slot online
 * 
 * @typedef {Object} CourseSection
 * @property {number} id
 * @property {string} courseName
 * @property {string} courseAbbr
 * @property {string} sectionName
 * @property {Object} seats
 * @property {number} seats.left
 * @property {number} seats.capacity
 * @property {string[]} instructors
 * @property {CourseSlot[]} slots
 */

(() => {
    /**
     * Parses a single table row into a CourseSection object
     * @param {HTMLTableRowElement} tr 
     * @param {number} idx 
     * @returns {CourseSection|null}
     */
    const parseRow = (tr, idx) => {
        try {
            const tds = tr.querySelectorAll(":scope > td");
            // Filter out non-course rows (e.g., headers or empty rows)
            if (tds.length < 4) return null;

            // 1. Extract Course and Section names
            const rawName = tds[0]?.textContent || "";
            const nameParts = rawName.split('-').map(s => s.trim());
            const courseName = nameParts[0] || "Unknown Course";
            const sectionName = nameParts[1] || "Unknown Section";

            // 2. Extract Seats information
            const seatsContainer = tds[3].querySelector('.my-seats');
            const seatsTitle = seatsContainer?.title || "";
            const matchSeats = seatsTitle.match(/(\d+).+?(\d+)/);
            const seats = {
                left: parseInt(matchSeats?.[1] || "0"),
                capacity: parseInt(matchSeats?.[2] || "0")
            };

            // 3. Extract Instructor(s)
            const instructors = [tds[1]?.textContent?.trim() || "Staff"];

            // 4. Extract Schedule Slots
            const divSlots = tds[2].querySelectorAll('div.my-slot');
            const slots = Array.from(divSlots, (divSlot) => {
                // Parse days
                const divDays = divSlot.querySelectorAll('div.my-slot-week > div');
                const days = Array.from(divDays, (div, index) => 
                    div.classList.length > 0 ? index : -1
                ).filter(index => index !== -1);

                // Parse time and room
                const infoText = divSlot.querySelector('div.my-slot-info')?.textContent || "";
                const infoParts = infoText.split(' ').filter(s => s.trim() !== "");
                
                const timePart = infoParts[0] || "0000-0000";
                const roomPart = infoParts[1] || "TBA";
                
                const [beginHM, endHM] = timePart.split('-');
                const isOnline = roomPart.toLowerCase().includes('online');

                return {
                    days,
                    beginHM: beginHM || "0000",
                    endHM: endHM || "0000",
                    rooms: isOnline ? 'ONLINE' : roomPart,
                    online: isOnline
                };
            });

            // Return standardized object
            return {
                id: idx,
                courseName,
                courseAbbr: courseName, // Matching your original logic
                sectionName,
                seats,
                instructors,
                slots
            };
        } catch (error) {
            console.error(`Row ${idx} parsing failed:`, error);
            return null;
        }
    };

    /**
     * Main entry point for the parser
     */
    const main = () => {
        const TABLE_SELECTOR = "#table-sessions tbody tr";
        const trs = document.querySelectorAll(TABLE_SELECTOR);
        
        if (!trs.length) {
            console.warn("Parser: No course rows found.");
            return [];
        }

        return Array.from(trs, (tr, idx) => parseRow(tr, idx))
                    .filter(section => section !== null);
    };

    return main();
})();