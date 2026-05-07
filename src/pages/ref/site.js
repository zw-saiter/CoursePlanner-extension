let StartHour = 8;
let EndHour = 22;

function updateBeginEnd(sections) {
    let minHM = '0800';
    let maxHM = '1800';
    for (const section of sections) {
        for (const slot of section.slots) {
            if (slot.beginHM != '' && slot.beginHM < minHM) {
                minHM = slot.beginHM;
            }
            if (slot.endHM != '' && slot.endHM > maxHM) {
                maxHM = slot.endHM;
            }
        }
    }
    StartHour = Math.floor(minHM / 100);
    EndHour = Math.ceil(maxHM / 100);
}
function ShowPlan(plan, iPlan) {
    const days = ['Time', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const divCalendar = document.createElement('div');
    divCalendar.className = 'col calendar-container';
    divCalendar.innerHTML = `
        <div class="calendar-title d-none">Combination #1: 2 days on campus</div>
        <div class="calendar-wrap">
            <table class="table table-sm small table-bordered calendar-table">
                <thead class="">
                    <tr>
                        ${days.map(day => `<th scope="col">${day}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                </tbody>
            </table>
        </div>
`;

    if (iPlan != undefined) {
        divCalendar.id = "calendar-container-" + iPlan;
        const divTitle = divCalendar.querySelector('.calendar-title');
        divTitle.classList.remove('d-none');
        divTitle.innerHTML = `#${iPlan + 1}. campus days: <b>${plan.campusDays}</b><a href="#this" class="my-fav"></a>`;
        divTitle.querySelector('.my-fav').plan = plan;
    }
    else{
        updateBeginEnd(plan.sections);
    }
    
    const table = divCalendar.querySelector('table');
    const tbody = table.children[1];

    for (let hr = StartHour; hr < EndHour; hr++) {
        const hrText = hr < 12 ? `${hr}am` : `${(hr == 12 ? hr : hr - 12)}pm`;
        const tr1 = document.createElement('tr');
        tr1.classList.add('my-half');
        tr1.innerHTML = '<td></td>'.repeat(days.length);
        tr1.children[0].innerHTML = hrText;
        tbody.appendChild(tr1);
        const tr2 = document.createElement('tr');
        tr2.classList.add('my-half');
        tr2.innerHTML = '<td></td>'.repeat(days.length);
        tr2.children[0].innerHTML = '&#160;'; // empty char to keep height
        tbody.appendChild(tr2);
    }

    plan.sections.forEach((section, iSection) => {
        section.slots.forEach(slot => {
            for (const day of slot.days) {
                const slotBegin = parseInt(slot.beginHM.substr(0,2)) + parseInt(slot.beginHM.substr(2))/60.0;
                const slotEnd = parseInt(slot.endHM.substr(0,2)) + parseInt(slot.endHM.substr(2))/60.0; 
                const slotDur = slotEnd - slotBegin;
                const tr = tbody.children[parseInt((slotBegin - StartHour) * 2)];
                //const td = tr.children[day + 1];//col-0 is the row header
                const td = tr.children[day];//row header removed
                const div = td.appendChild(document.createElement('div'));
                div.style.height = `calc(${(slotDur * 200).toFixed()}% + ${(slotDur * 2).toFixed()}px)`; // add border width
                div.classList.add('my-course', 'my-course-' + (iSection + 1));
                if (slot.online) {
                    div.classList.add('my-course-online');
                }
                //div.appendChild(document.createElement('p')).innerHTML = slot.beginHM + '-' + slot.endHM;
                div.appendChild(document.createElement('p')).innerHTML = section.courseAbbr;
                div.appendChild(document.createElement('p')).innerHTML = section.sectionName;
                div.appendChild(document.createElement('p')).innerHTML = slot.rooms;
            }
        })
    })

    //根据 oncampus/online 设置th样式
    const trHead = table.children[0].children[0];
    const allSlots = plan.sections.flatMap(section => section.slots);
    for (let day = 0; day < days.length; day++) {
        if (allSlots.some(slot => slot.days.includes(day) && !slot.online)) {
            trHead.children[day].classList.add('my-week-cls');
        }
        else if (allSlots.some(slot => slot.days.includes(day) && slot.online)) {
            trHead.children[day].classList.add('my-week-os');
        }
    }
    return divCalendar;
}
function copyLink(a) {
    navigator.clipboard.writeText(a.previousElementSibling.href);
    const old = a.innerHTML;
    a.innerHTML = old + '&check;'
    a.classList.add('text-success');
    setTimeout(() => { a.innerHTML = old; a.classList.remove('text-success') }, 1000);
}

export { updateBeginEnd, ShowPlan, copyLink };