/**
 * @typedef {Object} CourseSlot
 * @property {number[]} days
 * @property {string} beginHM
 * @property {string} endHM
 * @property {string} rooms
 * @property {boolean} online
 * 
 * @typedef {Object} CourseSection
 * @property {string} id
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
    const DAY_NAMES = 'sunday,monday,tuesday,wednesday,thursday,friday,saturday'.split(',');

    /**
     * Converts "11:00 AM" or "01:30 PM" to "1100" or "1330"
     * @param {string} timeStr 
     * @returns {string} HHmm
     */
    const convertTo24H = (timeStr) => {
        const match = timeStr.trim().match(/(\d+):(\d+)\s+(AM|PM)/i);
        if (!match) return "0000";

        let [_, hours, minutes, ampm] = match;
        let h = parseInt(hours);
        ampm = ampm.toUpperCase();

        if (ampm === 'PM' && h !== 12) h += 12;
        if (ampm === 'AM' && h === 12) h = 0;

        return h.toString().padStart(2, '0') + minutes.padStart(2, '0');
    };

    /**
     * @param {HTMLTableRowElement} tr 
     * @returns {CourseSection|null}
     */
    const parseRow = (tr) => {
        try {
            // 1. Basic Info using data attributes
            const id = tr.querySelector('td[data-property=courseReferenceNumber]')?.textContent.trim() || "";
            const courseName = tr.querySelector('td[data-property=courseTitle]')?.textContent.trim() || "Unknown";
            
            const subject = tr.querySelector('td[data-property=subject]')?.textContent.trim() || "";
            const courseNum = tr.querySelector('td[data-property=courseNumber]')?.textContent.trim() || "";
            const courseAbbr = `${subject}${courseNum}`;
            
            const sectionName = tr.querySelector('td[data-property=sequenceNumber]')?.textContent.trim() || "";

            // 2. Seats Parsing
            const seatsText = tr.querySelector('td[data-property=status]')?.textContent.trim() || "";
            const mcSeats = seatsText.match(/(\d+).+?(\d+)/);
            const seats = { 
                left: parseInt(mcSeats?.[1] || "0"), 
                capacity: parseInt(mcSeats?.[2] || "0") 
            };

            // 3. Instructors
            const tdInstructors = tr.querySelector('td[data-property=instructor]');
            const instructors = tdInstructors 
                ? Array.from(tdInstructors.querySelectorAll('a.email'), a => a.textContent.trim())
                : ["-"];

            // 4. Slots Parsing
            const divSlots = tr.querySelectorAll('td[data-property=meetingTime] div.meeting');
            const slots = Array.from(divSlots, divSlot => {
                const slotText = divSlot.textContent || "";
                // Regex to capture: Days, TimeRange, and Room
                const mcSlot = slotText.match(/(.+?)SMTWTFS(.+?)\sType:.+?\sRoom:\s*(\w+)/);
                
                if (mcSlot) {
                    const [_, daysStr, timeRange, roomRaw] = mcSlot;
                    
                    // Process Days
                    const activeDays = daysStr.toLowerCase()
                        .split(',')
                        .map(day => DAY_NAMES.indexOf(day.trim()))
                        .filter(idx => idx !== -1);

                    // Process Times
                    const [beginStr, endStr] = timeRange.split('-').map(s => s.trim());
                    
                    const isOnline = roomRaw.toLowerCase().includes('online');

                    return {
                        days: activeDays,
                        beginHM: convertTo24H(beginStr),
                        endHM: convertTo24H(endStr),
                        rooms: isOnline ? 'ONLINE' : roomRaw,
                        online: isOnline
                    };
                }

                // Default Empty Slot if match fails
                return { days: [], beginHM: '', endHM: '', rooms: '', online: false };
            });

            return {
                id,
                courseName,
                courseAbbr,
                sectionName,
                seats,
                instructors,
                slots
            };
        } catch (error) {
            console.error("Failed to parse row:", error);
            return null;
        }
    };

    const main = () => {
        const trs = document.querySelectorAll('#table1 tbody tr');
        const results = Array.from(trs, parseRow).filter(s => s !== null);
		//console.log(results);
		return results;
    };

    return main();
})();