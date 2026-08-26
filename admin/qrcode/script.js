/* =====================================================================
OLD CODE BACKUP: OLD QR GENERATOR JS
To restore old code: remove/comment the new code below, then uncomment this block.
=====================================================================
// const params = new URLSearchParams(location.search);
let qr_cards = '';
let qr_body;
let startIndex;
let endIndex;
let qrPage = '';
let pageIndex;
let qrNumber;
let qrIds = [];
function onButtonClick() {
  let start = document.getElementById('pageStart').value;
  let end = document.getElementById('pageEnd').value;
  console.log('start', start);
  console.log('end', end);
  if (!start || !end) {
    alert('Invalid entry');
    return;
  }
  if (start == 0 || end == 0) {
    alert('Invalid entry');
    return;
  }
  qr_body = document.getElementById('body');
  startIndex = start;
  endIndex = end;
  pageIndex = startIndex;
  qrNumber = 100 + (startIndex * 9 - 9);
  qrIds = [];
  qrPage='';
  createPage();
}
function createPage() {
  for (let i = startIndex; i <= endIndex; i++) {
    qrPage = qrPage + `<div id="qrpage-${i}" class="a4-page">${i}</div>`;
  }
  //qrPage = qrPage + `<p class="print-hide"> <button onclick="window.print()">Download/Print</button> </p>`;
  qr_body.innerHTML = qrPage;
  addQrCards();
}
function addQrCards() {
  let qrStartIndex = (startIndex - 1) * 9 + 1;
  let qrEndIndex = endIndex * 9;
  console.log('qrStartIndex', qrStartIndex);
  console.log('qrEndIndex', qrEndIndex);
  for (let i = qrStartIndex; i <= qrEndIndex; i++) {
    qrNumber++;
    const randomString = Math.random().toString(36).substring(2, 20);
    let qID = randomString + qrNumber;
    qrIds.push(qID);
    //console.log(qID);
    let qrId = 'http://api.safetycode.in/safetycode/' + qID;
    qr_cards =
      qr_cards +
      `<div class="card-container"> <div class="image-holder"> <img src="./qrcodebg.jpg" alt=""> </div> <div class="card-content"> <div class="qr-code" id="qrcode-${i}" qr-id="${qrId}"></div> </div> </div>`;
    if (i % 9 == 0) {
      setQrCards(pageIndex, i, qr_cards);
      pageIndex++;
    }
  }
  //console.log('qrIds', qrIds);
   console.log('qrIds', qrIds);
  // let url= 'http://localhost:1323/safetycode/generate';
  let url = 'http://api.safetycode.in/safetycode/generate';
  // debugger;
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ qrIds: qrIds }),
  })
    .then((response) => response.json(console.log('Response:', response)))
    .then((data) => {
      console.log('Success:', data);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  this.saveCodes(qrIds);
}

function saveCodes(codes) {
  if (localStorage.getItem('qrid')) {
    let existingIds = JSON.parse(localStorage.getItem('qrid'));
    //console.log('existingIds', existingIds);
    existingIds = existingIds.concat(codes);
    //console.log('existingIds222', existingIds);
    let newIds = JSON.stringify(existingIds);
    localStorage.setItem('qrid', newIds);
  } else {
    let ids = JSON.stringify(codes);
    localStorage.setItem('qrid', ids);
  }
}

function setQrCards(page, index, cards) {
  let p = document.getElementById('qrpage-' + page);
  p.innerHTML = cards;
  qr_cards = '';
  setQrCodes(index - 8, index);
}

function setQrCodes(start, end) {
  for (let j = start; j <= end; j++) {
    let elem = document.getElementById('qrcode-' + j);
    if (!elem) {
      continue;
    }
    let qrIdValue = elem.getAttribute('qr-id');
    if (!qrIdValue) {
      continue;
    }
    new QRCode(elem, qrIdValue);
  }
}

========================= END OLD CODE BACKUP ========================= */
var qrBody = document.getElementById("body");
var emptyState = document.getElementById("emptyState");
var pageCountEl = document.getElementById("pageCount");
var codeCountEl = document.getElementById("codeCount");
var saveStatusEl = document.getElementById("saveStatus");
var createBtn = document.getElementById("createBtn");
var saveBtn = document.getElementById("saveBtn");
var batchTable = document.getElementById("batchTable");
var activeBatchEl = document.getElementById("activeBatch");
var authForm = document.getElementById("qrLoginForm");
var authStatusEl = document.getElementById("authStatus");
var logoutBtn = document.getElementById("qrLogoutBtn");
var API_BASE = window.SAFETY_API_BASE || "https://safetycode-api-2026.vercel.app";
var generatedIds = [];
var isSaved = false;
var currentBatchId = "";
var currentBatchName = "";

setupAdminAuth();
loadSavedBatches();

function onButtonClick(event) {
  if (event) {
    event.preventDefault();
  }

  /*
  OLD: Frontend random QR generation was allowed here.
  This is disabled because QR IDs will now be imported/saved in the database
  first, then loaded from the dashboard/print screen.
  */
  setStatus("Frontend QR generation is disabled. Load saved database batches to print.", "error");
  return;

  if (!hasAdminToken()) {
    setStatus("Super admin login required before generating QR codes.", "error");
    return;
  }

  var start = Number(document.getElementById("pageStart").value);
  var end = Number(document.getElementById("pageEnd").value);

  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end < 1) {
    setStatus("Please enter valid page numbers.", "error");
    return;
  }

  if (end < start) {
    setStatus("End page must be greater than or equal to start page.", "error");
    return;
  }

  createBtn.disabled = true;
  setStatus("Generating QR codes...", "");

  generatedIds = createQrIds(start, end);
  renderQrSheets(generatedIds);
  isSaved = false;
  currentBatchId = "";
  currentBatchName = "";
  activeBatchEl.innerText = "Unsaved batch";
  saveBtn.disabled = false;
  createBtn.disabled = false;
  setStatus("QR codes generated. Click Save to store them in database.", "");
}

function createQrIds(startIndex, endIndex) {
  var qrNumber = 100 + (startIndex * 9 - 9);
  var ids = [];

  for (var page = startIndex; page <= endIndex; page++) {
    for (var slot = 0; slot < 9; slot++) {
      qrNumber++;
      ids.push(createQrId(qrNumber));
    }
  }

  return ids;
}

function renderQrSheets(ids) {
  var pageHtml = "";
  var totalPages = Math.ceil(ids.length / 9);

  for (var page = 1; page <= totalPages; page++) {
    pageHtml += '<div id="qrpage-' + page + '" class="a4-page"></div>';
  }

  qrBody.innerHTML = pageHtml;

  ids.forEach(function (id, index) {
    var page = Math.floor(index / 9) + 1;
    var slot = (index % 9) + 1;
    var pageElem = document.getElementById("qrpage-" + page);
    if (pageElem) {
      pageElem.innerHTML += createCardHtml(id, page, slot);
    }
  });

  ids.forEach(function (id) {
    var elem = document.getElementById("qrcode-" + id);
    if (elem) {
      renderQrCode(elem, id);
    }
  });

  emptyState.style.display = "none";
  pageCountEl.innerText = totalPages;
  codeCountEl.innerText = ids.length;
}

function renderQrCode(elem, id) {
  var qrUrl = API_BASE + "/safetycode/" + id;

  new QRCode(elem, {
    text: qrUrl,
    width: 112,
    height: 112,
    correctLevel: QRCode.CorrectLevel.H
  });
}

async function loadSavedBatches() {
  if (!hasAdminToken()) {
    renderBatchTable([]);
    setStatus("Login as super admin to load saved batches.", "error");
    return;
  }

  setStatus("Loading saved batches...", "");

  var url = API_BASE + "/safetycode/qrcode-batches";

  try {
    var response = await apiFetch(url);
    var data = await response.json();
    var batches = Array.isArray(data.batches) ? data.batches.filter(function (batch) {
      return !batch.printed;
    }) : [];

    if (!response.ok || !batches.length) {
      renderBatchTable([]);
      setStatus("No unprinted database batches found.", "error");
      return;
    }

    renderBatchTable(batches);
    setStatus("Loaded " + batches.length + " saved batches. Choose one batch to print.", "success");
  } catch (error) {
    renderBatchTable([]);
    setStatus("Could not load batches. Check localhost:1337.", "error");
  }
}

function renderBatchTable(batches) {
  if (!batches.length) {
    batchTable.innerHTML = '<tr><td colspan="5">No saved batches yet.</td></tr>';
    return;
  }

  batchTable.innerHTML = batches.map(function (batch) {
    var printedText = batch.printed ? "Printed" : "Not printed";
    var printedClass = batch.printed ? "print-pill done" : "print-pill";
    var savedDate = formatDateTime(batch.lastSavedAt || batch.createdAt);
    var printedDate = batch.printedAt ? formatDateTime(batch.printedAt) : "-";

    return [
      "<tr>",
      "<td><strong>" + escapeHtml(batch.batchName || batch.batchId) + "</strong><br><small>" + escapeHtml(batch.batchId) + "</small></td>",
      "<td>" + batch.total + "</td>",
      "<td>" + savedDate + "</td>",
      "<td><span class=\"" + printedClass + "\">" + printedText + "</span><br><small>" + printedDate + "</small></td>",
      "<td><button type=\"button\" onclick=\"loadBatch('" + encodeURIComponent(batch.batchId) + "')\">Load</button></td>",
      "</tr>"
    ].join("");
  }).join("");
}

async function loadBatch(encodedBatchId) {
  if (!hasAdminToken()) {
    setStatus("Super admin login required to load a batch.", "error");
    return;
  }

  var batchId = decodeURIComponent(encodedBatchId);
  setStatus("Loading selected batch...", "");

  var url = API_BASE + "/safetycode/qrcode-batches/" + encodeURIComponent(batchId) + "?limit=500";

  try {
    var response = await apiFetch(url);
    var data = await response.json();
    var ids = Array.isArray(data.qrIds) ? data.qrIds : [];

    if (!response.ok || !ids.length) {
      setStatus("This batch has no QR IDs.", "error");
      return;
    }

    generatedIds = ids;
    isSaved = true;
    currentBatchId = batchId;
    currentBatchName = batchId;
    saveBtn.disabled = true;
    activeBatchEl.innerText = "Loaded: " + batchId;
    renderQrSheets(generatedIds);
    setStatus("Loaded " + generatedIds.length + " QR IDs from selected batch. Click Print.", "success");
  } catch (error) {
    setStatus("Could not load selected batch. Check localhost:1337.", "error");
  }
}

function createQrId(qrNumber) {
  var randomString = Math.random().toString(36).substring(2, 14);
  return randomString + qrNumber;
}

function createCardHtml(qId, page, slot) {
  return [
    '<article class="card-container">',
    '<div class="image-holder"><img src="./qrcodebg.jpg" alt=""></div>',
    '<div class="card-content"><div class="qr-code" id="qrcode-' + qId + '"></div></div>',
    '<div class="code-label">P' + page + "-" + slot + " / " + qId + "</div>",
    '</article>'
  ].join("");
}

async function saveGeneratedIds(ids) {
  if (!hasAdminToken()) {
    setStatus("Super admin login required before saving QR codes.", "error");
    return;
  }

  if (!ids.length) {
    setStatus("Generate QR codes before saving.", "error");
    return;
  }

  if (isSaved) {
    setStatus("These QR IDs are already saved.", "success");
    return;
  }

  saveBtn.disabled = true;
  setStatus("Saving QR IDs to database...", "");

  var batchId = "batch-" + Date.now();
  var batchName = "Batch " + formatDateTime(new Date()) + " (" + ids.length + " codes)";
  var url = API_BASE + "/safetycode/generate";

  try {
    var response = await apiFetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        qrIds: ids,
        batchId: batchId,
        batchName: batchName,
        batchCode: batchId.replace("batch-", "")
      })
    });
    var data = await response.json();

    if (!response.ok) {
      setStatus(data.message || "QR IDs could not be saved.", "error");
      saveBtn.disabled = false;
      return;
    }

    saveCodes(ids);
    isSaved = true;
    currentBatchId = data.batch && data.batch.batchId ? data.batch.batchId : batchId;
    currentBatchName = data.batch && data.batch.batchName ? data.batch.batchName : batchName;
    activeBatchEl.innerText = "Saved: " + currentBatchName;
    setStatus("Saved " + (data.created || 0) + " new QR IDs. Already exists: " + (data.alreadyExists || 0) + ".", "success");
    loadSavedBatches();
  } catch (error) {
    saveBtn.disabled = false;
    setStatus("Backend save failed. Check localhost:1337 and try Save again.", "error");
  }
}

function saveCurrentCodes() {
  saveGeneratedIds(generatedIds);
}

function saveCodes(codes) {
  var existingIds = [];
  if (localStorage.getItem("qrid")) {
    try {
      existingIds = JSON.parse(localStorage.getItem("qrid")) || [];
    } catch (error) {
      existingIds = [];
    }
  }

  localStorage.setItem("qrid", JSON.stringify(existingIds.concat(codes)));
}

async function printCodes() {
  if (!hasAdminToken()) {
    setStatus("Super admin login required before printing QR codes.", "error");
    return;
  }

  if (!generatedIds.length || !currentBatchId) {
    setStatus("Database se batch load karke print karein.", "error");
    return;
  }

  var copies = window.prompt("Kitni copies print karni hain?", "1");
  copies = Number(copies);
  if (!Number.isInteger(copies) || copies < 1) {
    setStatus("Valid print quantity enter karein.", "error");
    return;
  }

  window.print();
  await markCurrentBatchPrinted(copies);
  clearCodes();
  setStatus("Batch printed and removed from the unprinted list.", "success");
}

async function markCurrentBatchPrinted(copies) {
  if (!currentBatchId) {
    return;
  }

  var url = API_BASE + "/safetycode/qrcode-batches/" + encodeURIComponent(currentBatchId) + "/printed";

  try {
    await apiFetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ copies: copies || 1 })
    });
    loadSavedBatches();
  } catch (error) {
    setStatus("Print opened, but printed status could not be updated.", "error");
  }
}

function clearCodes() {
  generatedIds = [];
  isSaved = false;
  currentBatchId = "";
  currentBatchName = "";
  qrBody.innerHTML = "";
  emptyState.style.display = "grid";
  pageCountEl.innerText = "0";
  codeCountEl.innerText = "0";
  saveBtn.disabled = true;
  activeBatchEl.innerText = "No batch loaded";
  setStatus("Ready", "");
}

function setupAdminAuth() {
  updateAuthStatus();

  if (authForm) {
    authForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      setAuthStatus("Logging in...", "");

      try {
        var response = await fetch(API_BASE + "/api/auth/signin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: document.getElementById("adminUsername").value.trim(),
            password: document.getElementById("adminPassword").value
          })
        });
        var data = await response.json();

        if (!response.ok || !data.token) {
          setAuthStatus(data.message || "Login failed.", "error");
          return;
        }

        if (!data.user || String(data.user.type || "").toUpperCase() !== "SUPER_ADMIN") {
          localStorage.removeItem("qrAdminToken");
          setAuthStatus("Only super admin can use QR generator.", "error");
          return;
        }

        localStorage.setItem("qrAdminToken", data.token);
        setAuthStatus("Super admin logged in.", "success");
        loadSavedBatches();
      } catch (error) {
        setAuthStatus("Backend login failed.", "error");
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      localStorage.removeItem("qrAdminToken");
      updateAuthStatus();
      renderBatchTable([]);
      setStatus("Login as super admin to continue.", "error");
    });
  }
}

function hasAdminToken() {
  return !!localStorage.getItem("qrAdminToken");
}

function apiFetch(url, options) {
  var fetchOptions = options || {};
  fetchOptions.headers = fetchOptions.headers || {};
  fetchOptions.headers.token = localStorage.getItem("qrAdminToken") || "";
  return fetch(url, fetchOptions);
}

function updateAuthStatus() {
  if (hasAdminToken()) {
    setAuthStatus("Super admin logged in.", "success");
  } else {
    setAuthStatus("Login required", "error");
  }
}

function setAuthStatus(message, type) {
  if (!authStatusEl) {
    return;
  }
  authStatusEl.innerText = message;
  authStatusEl.className = type || "";
}

function setStatus(message, type) {
  saveStatusEl.innerText = message;
  saveStatusEl.className = "status-card wide";
  if (type) {
    saveStatusEl.classList.add(type);
  }
}

function formatDateTime(dateValue) {
  if (!dateValue) {
    return "-";
  }

  var d = new Date(dateValue);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
