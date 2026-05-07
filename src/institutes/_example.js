// This is a example for extracting course data from an institute's course registration page.
// Required: Use canonical institute codes as file names (e.g. sait.js, ubc.js)
(() => {
    function parseRow(tr, idx) {
        const tds = tr.querySelectorAll(":scope > td");
        if(tds.length < 4){ // filter out rows that are not course sections
            return null;
        }
        const courseName = tds[0].textContent.split('-')[0].trim();
        const courseAbbr = courseName;
        const sectionName = tds[0].textContent.split('-')[1].trim();

        const instructors = [tds[1].textContent.trim()];

        const seatsText = tds[3].querySelector('.my-seats').title.trim();
        const mcSeats = seatsText.match(/(\d+).+?(\d+)/);
        const seats = { left: parseInt(mcSeats?.[1] || 0), capacity: parseInt(mcSeats?.[2] || 0) };

        const divSlots = tds[2].querySelectorAll('div.my-slot');
        const slots = Array.from(divSlots, divSlot => {
            const divDays = divSlot.querySelectorAll('div.my-slot-week > div')
            const days = Array.from(divDays, (div, index) => div.classList.length > 0 ? index : -1).filter(index => index !== -1);
            const time_room = divSlot.querySelector('div.my-slot-info').textContent.split(' ');
            const b_e = time_room[0].split('-');
            const rooms = time_room[1].trim();
            const online = rooms.toLowerCase().includes('online');
            const slot = {
                days: days,         //array of day indices (0 for Sunday, 1 for Monday, ..., 6 for Saturday)
                beginHM: b_e[0],    //HHmm 24-hour format
                endHM: b_e[1],      //HHmm 24-hour format
                rooms: online ? 'ONLINE' : rooms,
                online: online
            };
            return slot;
        });

        // Required: Do not change the schema of the following object
        return {
            id: idx,  // unique for each section
            courseName,
            courseAbbr,
            sectionName,
            seats,
            instructors,
            slots
        }
    }

    //Parse course data from the course page
    const trs = document.querySelectorAll("#table-sessions tbody tr");
    const sections = Array.from(trs, parseRow).filter(section => section!=null); // filter out rows that are not course sections (e.g. header rows)
    return sections;

})();