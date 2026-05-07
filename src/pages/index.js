import * as util from "../assets/js/util.js";
import * as site from './ref/site.js';

const urlParams = new URLSearchParams(window.location.search);
if(!urlParams.get('rt')){
    document.getElementById('warnHistory').classList.remove('d-none');
}

document.addEventListener('click', async (e) => {
    if (e.target.closest('.btn-close[data-bs-dismiss="alert"]')) {
        e.target.closest('.alert').remove();
    }

    const aFav = e.target.closest('.my-fav');
    if(aFav){
        const favClick = aFav.plan;
        const favs = await util.storage.get('favs') || [];
        const idx = favs.findIndex(f => f.id === favClick.id);
        if (aFav.classList.contains('my-fav-1')) {  // currently in favs, switch to not favs
            if(idx >= 0){
                favs.splice(idx, 1);
                await util.storage.set('favs', favs);
            }
            aFav.classList.remove('my-fav-1');
        } else {
            if(idx>=0){
                favs[idx].time = Date.now();
                favs[idx].sections = favClick.sections;
            }
            else{
                favClick.name = favClick.id;
                favClick.time = Date.now();
                favs.push(favClick);
            }
            await util.storage.set('favs', favs);
            aFav.classList.add('my-fav-1');
        }
    }
});

/******************************************************* */

const weekDays = 'SMTWTFS';
let allPrograms = [];
let allCourses = [];
let miLastIndex = -1;
let allSections = [];
let sections;

document.getElementById('chkAllSections').addEventListener('change', onCheckAll);
document.getElementById('btnRemoveAllSections').addEventListener('click', onRemoveAll);
document.getElementById('btnCombine').addEventListener('click', onCombine);
document.getElementById('rbtnLessCampusDays').addEventListener('click', onSort);
document.getElementById('rbtnLessClassDays').addEventListener('click', onSort);

document.addEventListener('DOMContentLoaded', async () => {

    const table = document.getElementById('table-sections');
    const tbody = table.children[1];
    let tr = document.createElement('tr');
    let td = document.createElement('td');
    td.colSpan = 6;
    td.innerHTML = 'Searching...';
    tr.appendChild(td);
    tbody.replaceChildren(tr);
    document.getElementById('chkAllSections').checked = false;
    clearCombinations();
    document.querySelector('#btnCombine').disabled = true;

    const id = urlParams.get('id');
    if (!id) {
        td.innerHTML = 'No data to show!';
        return;
    }
    const res = await chrome.storage.local.get('history').then(r => r.history.find(h => h.id == id));
    console.log(res);
    if (!res || !res.sections || res.sections.length == 0) {
        td.innerHTML = 'No Courses Extracted';
        return;
    }

    allSections = res.sections;

    let lastCourseAbbr = '';
    let courseIndex = 0;
    for (const section of allSections) {
        tr = document.createElement('tr');
        tr.setAttribute('data-id', section.id);
        tr.classList.add('list-group-item-action');
        if (section.courseAbbr != lastCourseAbbr) {
            courseIndex++;
            lastCourseAbbr = section.courseAbbr;
        }
        tr.classList.add('course-row-' + courseIndex);

        // td = tr.appendChild(document.createElement('td'));
        // td.classList.add('d-none', 'd-xl-table-cell');
        // td.innerHTML = section.courseName;

        td = tr.appendChild(document.createElement('td'));
        td.innerHTML = section.courseAbbr + '-' + section.sectionName;

        td = tr.appendChild(document.createElement('td'));
        td.innerHTML = section.instructors.join('<br>');

        td = tr.appendChild(document.createElement('td'));
        td.classList.add('my-slots');

        let hasSlot = false;
        for (const slot of section.slots) {
            const divSlot = document.createElement('div');
            divSlot.classList.add('my-slot');

            const divWeek = document.createElement('div');
            divWeek.classList.add('my-slot-week');
            for (const d in weekDays) {
                const divDay = document.createElement('div');
                divDay.innerHTML = weekDays[d];
                if (slot.days.indexOf(parseInt(d)) >= 0) {
                    divDay.classList.add(slot.online ? 'my-week-os' : 'my-week-cls');
                }
                divWeek.appendChild(divDay);
            }
            divSlot.appendChild(divWeek);

            const p = document.createElement('p');
            p.classList.add('d-sm-none', 'my-slot-br');
            divSlot.appendChild(p);

            const divInfo = document.createElement('div');
            divInfo.classList.add('my-slot-info');
            divInfo.innerHTML = `${slot.beginHM}-${slot.endHM} ${slot.rooms}`;
            divSlot.appendChild(divInfo);

            td.appendChild(divSlot);

            hasSlot = hasSlot || slot.beginHM;
        }

        td = tr.appendChild(document.createElement('td'));
        const avaliableSeats = section.seats.left;
        const lvl = avaliableSeats <= 0 ? 'bg-danger' : (avaliableSeats <= 5 ? 'bg-warning' : 'bg-success bg-opacity-75');
        td.innerHTML = `<div class="my-seats ${lvl}" title="${avaliableSeats} of ${section.seats.capacity} avaliable">${avaliableSeats}</div>`;

        td = tr.appendChild(document.createElement('td'));
        td.innerHTML = `<input type="checkbox" class="form-check-input" value="${section.id}" ${(hasSlot && avaliableSeats > 0) ? 'checked' : ''} />`;

        td = tr.appendChild(document.createElement('td'));
        td.innerHTML = '<button type="button" class="btn-close" title="Remove"></button>';
        td.addEventListener('click', onRemoveSection);

        tbody.appendChild(tr);
    }
    if (allSections.length == 0) {
        tbody.firstElementChild.firstElementChild.innerHTML = 'No data found!';
    }
    else {
        tbody.firstElementChild.firstElementChild.remove();
        document.querySelector('#btnCombine').disabled = false;

        //onCombine();
    }
});


/******************************************************* */
let plans = [];

function onCheckAll(e) {
    const chk = e.currentTarget;
    document.querySelectorAll('#table-sections tbody input[type="checkbox"]').forEach(c => {
        c.checked = chk.checked;
    });
}
function onRemoveAll(e) {
    const btn = e.currentTarget;
    document.querySelector('#table-sections tbody').innerHTML = '';
    document.querySelector('#btnCombine').disabled = true;
    allSections.length = 0;
}
function onRemoveSection(e) {
    const btn = e.currentTarget;
    const tr = btn.closest('tr');
    const idx = allSections.findIndex(s => s.id == tr.dataset.id);
    allSections.splice(idx,1);
    tr.remove();
}

const maxToShow = 100;
let cntToShow = maxToShow;
function onCombine() {
    const divPlans = document.getElementById('divPlans');
    divPlans.innerHTML = 'loading...';

    const checkedSections = Array.from(
            document.querySelectorAll('#table-sections tbody input[type="checkbox"]:checked'),
            c => allSections.find(s => s.id == c.value)
        ).filter(s => s && s.slots.some(sl => sl.beginHM));    //skip slots with no time
    if (checkedSections.length == 0) {
        divPlans.innerHTML = 'Please select courses to combine.';
        return;
    }

    site.updateBeginEnd(checkedSections);

    sectionList.length = 0;
    var courses = [...new Set(checkedSections.map(s => s.courseAbbr))];//.Distinct();
    for(const course of courses)
    {
        sectionList.push(checkedSections.filter(s => s.courseAbbr == course));
    }
    plans.length = 0;
    FindValidCombinations(0, []);

    document.getElementById('resultTitle').innerHTML = 'Combinations: ' + plans.length;

    if (plans.length <= maxToShow + 20) {
        cntToShow = plans.length;
    }
    else {
        cntToShow = maxToShow;
    }
    const divFootInfo = document.querySelector('#divFootInfo');
    if (cntToShow < plans.length) {
        divFootInfo.textContent  = `Showing only the top ${cntToShow} conbinations.`;
        divFootInfo.classList.remove('d-none');
    }
    else {
        divFootInfo.classList.add('d-none');
    }

    if (cntToShow < 9) {
        divPlans.classList.remove('row-cols-xxl-3');
    }
    else {
        divPlans.classList.add('row-cols-xxl-3');
    }

    onSort();
    document.getElementById('resultTitle').scrollIntoView();
}

const sectionList = [];
function FindValidCombinations(index, currentCombination)
{
    if (index == sectionList.length) {
        const classDays = new Set();
        const campusDays = new Set();
        for (const section of currentCombination) {
            for (const slot of section.slots) {
                slot.days.forEach(d => classDays.add(d));
                if (!slot.online) {
                    slot.days.forEach(d=>campusDays.add(d));
                }
            }
        }
        plans.push({ 
            id: currentCombination.map(s => `${s.courseAbbr}#${s.sectionName}`).join(','),
            sections: Array.from(currentCombination), 
            campusDays: campusDays.size, 
            classDays: classDays.size 
        });
        return;
    }

    for(const section of sectionList[index])
    {
        // 检查当前section是否与已选择的sections不冲突
        let canAdd = true;
        for(const selected of currentCombination)
        {
            if (IsConflict(section, selected)) {
                canAdd = false;
                break;
            }
        }

        if (canAdd) {
            currentCombination.push(section);
            FindValidCombinations(index + 1, currentCombination);
            currentCombination.pop(); // 回溯
        }
    }
}
function IsConflict(section, selected){
    for (const slot of section.slots) {
        for (const slot2 of selected.slots) {
            if (IsIntersect(slot, slot2)) {
                return true;
            }
        }
    }
    return false;
}
function IsIntersect(slot, slot2)
{
    for(const day2 of slot2.days)
    {
        if (slot.days.includes(day2) && slot2.beginHM < slot.endHM && slot2.endHM > slot.beginHM) {
            return true;
        }
    }
    return false;
}


/******************************************************* */
const sorts = {
    LessCampusDays: (a, b) => (a.campusDays - b.campusDays)*10 + (a.classDays - b.classDays),
    LessClassDays: (a, b) => (a.classDays - b.classDays)*10 + (a.campusDays - b.campusDays)
}
function getSort() {
    const rbtns = document.getElementsByName('rbtnSort').values();
    for (const rbtn of rbtns) {
        if (rbtn.checked) {
            return rbtn.value;
        }
    }
}
function onSort(e){
    if(!plans){
        return;
    }

    const rbtn = e?.currentTarget;
    const divPlans = document.getElementById('divPlans');
    divPlans.replaceChildren();
    const sort = rbtn ? rbtn.value : getSort();
    const plansToShow = (sort ? plans.sort(sorts[sort]) : plans).slice(0, cntToShow);
    divPlans.append(...plansToShow.map(site.ShowPlan));
}


function clearCombinations() {
    document.getElementById('divPlans').innerHTML = '';
    document.getElementById('resultTitle').innerHTML = 'Combinations: ';
    document.querySelector('#divFootInfo').classList.add('d-none');
}