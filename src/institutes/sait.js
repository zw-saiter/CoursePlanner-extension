// Required: Use canonical institute codes as file names (e.g. sait.js, ubc.js)
(() => {
  const days = 'sunday,monday,tuesday,wednesday,thursday,friday,saturday'.split(',');

  function parseRow(tr) {

    const id = tr.querySelector('td[data-property=courseReferenceNumber]')?.textContent.trim(); // unique for each section
    const courseName = tr.querySelector('td[data-property=courseTitle]')?.textContent.trim();
    const courseAbbr = tr.querySelector('td[data-property=subject]')?.textContent.trim() + '-' +
      tr.querySelector('td[data-property=courseNumber]')?.textContent.trim();
    const sectionName = tr.querySelector('td[data-property=sequenceNumber]')?.textContent.trim();

    const seatsText = tr.querySelector('td[data-property=status]')?.textContent.trim();
    const mcSeats = seatsText.match(/(\d+).+?(\d+)/);
    const seats = { left: parseInt(mcSeats?.[1] || 0), capacity: parseInt(mcSeats?.[2] || 0) };

    const tdInstructors = tr.querySelector('td[data-property=instructor]');
    const instructors = Array.from(tdInstructors.querySelectorAll('a.email'), a => a.textContent.trim());

    const divSlots = tr.querySelectorAll('td[data-property=meetingTime] div.meeting');
    const slots = Array.from(divSlots, divSlot => {
      const slotText = divSlot.textContent; //Monday,TuesdaySMTWTFS11:00  AM - 12:00  PM Type: Class Building: Thomas Riley Building Room: TT236 Start Date: 06/08/2026 End Date: 06/12/2026
      const mcSlot = slotText.match(/(.+?)SMTWTFS(.+?)\sType:.+?\sRoom:\s*(\w+)/);
      if (mcSlot) {
        const b_e = mcSlot[2].split('-').map(hm => {
          const hm_ap = hm.trim().match(/(\d+:\d+)\s+(\w+)/); // ['11:00', 'am']
          if (!hm_ap) {
            return '';
          }
          else if (hm_ap[2].toLowerCase() == 'am') {
            const h_m = hm_ap[1].split(':');
            return (h_m[0] == '12' ? '00' : h_m[0].padStart(2, '0')) + h_m[1];
          }
          else { //pm
            const h_m = hm_ap[1].split(':');
            return (h_m[0] == '12' ? '12' : parseInt(h_m[0]) + 12) + h_m[1];
          }
        });
        const rooms = mcSlot[3].trim();
        const online = rooms.toLowerCase().includes('online');
        const slot = {
          days: mcSlot[1].toLowerCase().split(',').map(day => days.indexOf(day.trim())),
          beginHM: b_e[0],
          endHM: b_e[1],
          rooms: online ? 'ONLINE' : rooms,
          online: online
        };
        return slot;
      }
      else {
        const slot = {
          days: [],
          beginHM: '',
          endHM: '',
          rooms: '',
          online: false
        };
        return slot;
      }
    });

    // Do not change the schema of the following object
    return {
      id,
      courseName,
      courseAbbr,
      sectionName,
      seats,
      instructors,
      slots
    }
  }

  //Parse course data from the course page
  const trs = document.querySelectorAll('#table1 tbody tr');
  const sections = Array.from(trs, parseRow);
  return sections;

})();