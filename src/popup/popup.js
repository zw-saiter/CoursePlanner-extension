import * as util from "../assets/js/util.js";
import * as site from "../pages/ref/site.js";

const versionSpan = document.getElementById('spanVersion');
versionSpan.textContent = chrome.runtime.getManifest().version;

const settings = await util.storage.get('settings') || {};
const history = await util.storage.get('history') || [];
const temp = await util.storage.get('temp') || {};

const aHome = document.getElementById('aHome');
const aFavs = document.getElementById('aFavs');
const aSettings = document.getElementById('aSettings');
const aFeedback = document.getElementById('aFeedback');
const aTheme = document.getElementById('aTheme');

const divHome = document.getElementById('divHome');
const divFavs = document.getElementById('divFavs');
const divSettings = document.getElementById('divSettings');
const divFeedback = document.getElementById('divFeedback');

const aPages = document.querySelectorAll('[data-page]');
aPages.forEach(aPage => {
    aPage.addEventListener('click', (e) => {
        const page = aPage.dataset.page;
        if(page == 'divFavs' && !settings.showFavsOnPopup){
            settings.showFavsOnPopup = true;
            util.storage.set('settings', settings);
        }
        else if(page != 'divFavs' && settings.showFavsOnPopup){
            settings.showFavsOnPopup = false;
            util.storage.set('settings', settings);
        }
        aPages.forEach(a => {
            document.getElementById(a.dataset.page).classList.toggle('d-none', a.dataset.page !== page);
            const svg = a.querySelector('use');
            if(svg){
                const href = svg.getAttribute('href');
                if(a.dataset.page === page && !href.endsWith('-fill')){
                    svg.setAttribute('href', href+'-fill');
                }
                else if(a.dataset.page !== page && href.endsWith('-fill')){
                    svg.setAttribute('href', href.replace('-fill', ''));
                }
            }
        });
    });
});

aHome.addEventListener('click', (e) => {
});


// favorites
aFavs.addEventListener('click', (e) => {
    loadFavs();
});

const favsList = document.querySelector('.favs-list');
const loadFavs = async () => {
    favsList.innerHTML = '';
    const favs = await util.storage.get('favs') || [];
    if(favs.length > 0){
        const divItems = favs.sort((a,b) => b.time - a.time).map(fav => {   
            const divTitle = document.createElement('div');
            divTitle.className = 'fav-item-title border-bottom';
            divTitle.innerHTML = `
                <span class="fav-item-name"></span>
                <a class="fav-item-rename icon-xs" href="#" title="rename"><svg class="bi"><use href="#pencil"></use></svg></a>
                <a class="fav-item-remove icon-xs" href="#" title="remove"><svg class="bi"><use href="#x-lg"></use></svg></a>
            `;
            divTitle.querySelector('.fav-item-name').textContent = fav.name; // XSS safe
            
            const divTable = document.createElement('div');
            divTable.className = 'fav-item-table';
            divTable.appendChild(site.ShowPlan(fav));

            const divItem = document.createElement('div');
            divItem.className = 'fav-item';
            divItem.favid = fav.id;
            divItem.append(divTitle, divTable);
            return divItem;
        });
        favsList.append(...divItems);
    }
    else{
        favsList.innerHTML = 'No favorites yet.';
    }
}

if(settings.showFavsOnPopup){
    aFavs.click();
}
else{
    divHome.classList.remove('d-none');
}

document.querySelector('.favs-list').addEventListener('click', async (e) => {
    const a = e.target.closest('a');
    const favItem = a?.closest('.fav-item');
    if(!favItem) return;

    const id = favItem.favid;
    const favs = await util.storage.get('favs') || [];
    const item = favs.find(f => f.id == id);
    if(a.classList.contains('fav-item-rename')){
        const newName = prompt(chrome.i18n.getMessage("enterNewName"), item.name);
        if(newName){
            item.name = newName;
            util.storage.set('favs', favs);
            favItem.querySelector('.fav-item-name').textContent = newName;
        }
    }
    else if(a.classList.contains('fav-item-remove')){
        if(!confirm(chrome.i18n.getMessage("confirmRemoveFav"))) return;
        favs.splice(favs.indexOf(item), 1);
        util.storage.set('favs', favs);
        favItem.remove();
        if(favs.length == 0){
            favsList.innerHTML = 'No favorites yet.';
        }
    }
});


// settings
aSettings.addEventListener('click', (e) => {
});


// feedback
document.getElementById('txtFeedbackContent').value = temp.feedbackData || '';
document.getElementById('txtFeedbackContent').addEventListener("change", (e) => {
  temp.feedbackData = e.target.value;
  util.storage.set('temp', temp);
});
document.getElementById('chkFeedback').addEventListener('change', function() {
  document.getElementById('txtFeedbackEmail').disabled = !this.checked;
  document.getElementById('txtFeedbackEmail').classList.toggle('d-none', !this.checked);
});
document.getElementById('btnFeedbackSubmit').addEventListener('click', async (e) => {
  e.preventDefault();

  const form = document.querySelector('.feedback-form');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  setLoading(true);

  try {
    const content = document.getElementById('txtFeedbackContent').value;
    const email = document.getElementById('chkFeedback').checked ? document.getElementById('txtFeedbackEmail').value : null;

    const response = await chrome.runtime.sendMessage({
        type: 'SEND_FEEDBACK',
        payload: { content, email }
    });

    console.log(response);
    if (!response.success) {
        setError(response.error || 'Unknown error');
        return;
    }
    document.getElementById('txtFeedbackContent').value = '';
    document.getElementById('chkFeedback').checked = false;
    document.getElementById('txtFeedbackEmail').disabled = true;
    document.getElementById('txtFeedbackEmail').classList.add('d-none');
    temp.feedbackData = '';
    util.storage.set('temp', temp);
    showSuccess();
  } 
  catch (err) {
    setError("Failed to send. Please try again.");
  } 
  finally {
    setLoading(false);
  }
});
function setLoading(isLoading) {
  const btn = document.getElementById('btnFeedbackSubmit');
  const loading = document.getElementById('spanFeedbackLoading');
  const msg = document.getElementById('spanFeedbackError');

  loading.classList.toggle('d-none', !isLoading);
  msg.classList.toggle('d-none', isLoading);
  if(isLoading){
    btn.disabled = true;
  }
  else{
    setTimeout(() => {btn.disabled = false}, 500);
  }
}
function setError(info) {
  const msg = document.getElementById('spanFeedbackError');
  msg.classList.replace('text-secondary-emphasis','text-danger');
  msg.innerText = info;
}
function showSuccess() {
  const msg = document.getElementById('spanFeedbackError');
  msg.classList.replace('text-danger', 'text-secondary-emphasis');
  msg.innerText = 'Feedback sent successfully!';
  setTimeout(() => {
    msg.innerText = '';
  }, 1000);
}


// theme
const themes = ['dark', 'light', 'auto'];
const setTheme = (theme3, store=true) => {
    //theme3 = themes.includes(theme3) ? theme3 : 'dark';
    const theme = theme3 != 'auto' ? theme3 :
                (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-bs-theme', theme)
    
    aTheme.querySelector('use').setAttribute('href', `#${theme3}`);
    aTheme.setAttribute('title', theme3);

    if(store){
        settings.theme = theme3;
        util.storage.set('settings', settings);
    } 
}
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (settings.theme == 'auto') {
        setTheme('auto', false);
    }
})
aTheme.addEventListener('click', (e) => {
    const theme = themes[(themes.indexOf(settings.theme)+1)%themes.length];
    setTheme(theme, true);
});
setTheme(settings.theme || 'dark', !settings.theme);


// history
const historyContainer = document.querySelector('.history-container');
const historyList = document.querySelector('.history-list');
const sortHistory = (a,b) => {
    if(a.pinned && !b.pinned) return -1;
    if(!a.pinned && b.pinned) return 1;
    return b.time - a.time;
}
const loadHistory = () => {
    historyList.innerHTML = '';
    if(history.length > 0){
        historyContainer.classList.remove('d-none');
        // sort by pinned and time
        history.sort(sortHistory).forEach(hist => {   
            const div = document.createElement('div');
            div.className = 'history-item';
            div.dataset.id = hist.id;
            div.innerHTML = `
                <a class="history-item-pin icon-xs" href="#"><svg class="bi"><use href="#${hist.pinned ? 'pin-fill' : 'pin-angle'}"></use></svg></a>
                <a class="history-item-name link-normal" href="/pages/index.html?id=${hist.id}" target="_blank"></a>
                <a class="history-item-rename icon-xs" href="#" title="rename"><svg class="bi"><use href="#pencil"></use></svg></a>
                <a class="history-item-remove icon-xs" href="#" title="remove"><svg class="bi"><use href="#x-lg"></use></svg></a>
            `;
            div.querySelector('.history-item-name').textContent = hist.name; // XSS safe
            historyList.appendChild(div);
        });
    }
    else{
        historyContainer.classList.add('d-none');
    }
}
loadHistory();

document.getElementById('aHistClear').addEventListener('click', (e) => {
    if(!confirm(chrome.i18n.getMessage("confirmClearHistory"))) return;
    util.storage.remove('history');
    history.length = 0;
    historyList.innerHTML = '';
    historyContainer.classList.add('d-none');
});

document.querySelector('.history-list').addEventListener('click', (e) => {
    const a = e.target.closest('a');
    const historyItem = a?.closest('.history-item');
    if(!historyItem) return;

    const id = historyItem.dataset.id;
    const item = history.find(h => h.id == id);
    if(a.classList.contains('history-item-pin')){
        item.pinned = !item.pinned;
        item.time = Date.now(); // update time to make it the latest
        util.storage.set('history', history);
        if(item.pinned){
            historyList.prepend(historyItem);
            a.querySelector('use').setAttribute('href', '#pin-fill');
        }
        else{
            const firstUnpinned = historyList.querySelector('[href="#pin-angle"]')?.closest('.history-item');
            if(firstUnpinned){
                firstUnpinned.before(historyItem);
            }
            else{
                historyList.append(historyItem);
            }
            a.querySelector('use').setAttribute('href', '#pin-angle');
        }
    }
    else if(a.classList.contains('history-item-rename')){
        const newName = prompt(chrome.i18n.getMessage("enterNewName"), item.name);
        if(newName){
            item.name = newName;
            util.storage.set('history', history);
            historyItem.querySelector('.history-item-name').textContent = newName;
        }
    }
    else if(a.classList.contains('history-item-remove')){
        history.splice(history.indexOf(item), 1);
        util.storage.set('history', history);
        historyItem.remove();
        if(history.length == 0){
            historyContainer.classList.add('d-none');
        }
    }
});


// extract sections
import {insts,findInstByUrl} from "../institutes/_all.js";

document.getElementById('aInstsFooter').textContent = insts.length; // include the example institute
document.querySelector('.inst-list').append(...insts.map(inst => {
    const li = document.createElement('li');

    if(inst.homepage){
        const a = document.createElement('a');
        a.className = 'link-normal';
        a.href = inst.homepage;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = inst.name;
        li.appendChild(a);
    }
    else{
        li.textContent = inst.name;
    }

    return li;
}));

const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
const inst = findInstByUrl(tab.url)?.code;

let sections = [];
if (!inst) {
    document.getElementById('divInfoNotSupported').classList.remove('d-none');
}
else {
    const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: [`/institutes/${inst}.js`]
    });
    console.log(results);
    sections = results[0].result || [];
    if(!sections.length) {
        document.getElementById('divInfoNotFound').classList.remove('d-none');
    }
    else{
        const info = document.querySelector('#divInfoFound .info');
        info.textContent = info.textContent.replace('$1', new Set(sections.map(s => s.courseAbbr)).size).replace('$2', sections.length);
        document.getElementById('divInfoFound').classList.remove('d-none');
    }
}

document.getElementById('aOpenPlanner').addEventListener('click', async (e) => {
    // if these courses are already in the history, update it because info might have been changed
    const courseAbbrs = [...new Set(sections.map(s => s.courseAbbr))].sort().join(',');
    //const existingHist = history.find(h => h.sections.map(s => s.courseAbbr).sort().join(',') === courseAbbrs);
    const existingHist = history.find(h => h.name === courseAbbrs); // compare by courseAbbrs only since sections might be different due to info update, and user might want to keep the old one as a separate history
    let id;
    if(existingHist){
        id = existingHist.id;
        existingHist.time = Date.now();
        existingHist.sections = sections;
    }
    else{
        id = Date.now();
        history.push({
            id: id,
            time: id,
            name: courseAbbrs,
            sections
        });
        if(history.length > (settings.historyLimit || util.config.historyLimit)){
            history.sort(sortHistory).pop();
        }
    }
    await util.storage.set('history', history);
    chrome.tabs.create({ url: `/pages/index.html?id=${id}&rt=1` });  // rt=1 means realtime result instead of history, no warning on index page
});