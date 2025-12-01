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
    //https://surkshacode.com/safetycode/
    let qrId = 'http://api.safetycode.in/safetycode/' + qID;
    // let qrId = 'http://localhost:1323/safetycode/' + qID;
    qr_cards =
      qr_cards +
      `<div class="card-container"> <div class="image-holder"> <img src="./qrcodebg.jpg" alt=""> </div> <div class="card-content"> <div class="qr-code" id="qrcode-${i}" qr-id="${qrId}"></div> </div> </div>`;
    if (i % 9 == 0) {
      setQrCards(pageIndex, i, qr_cards);
      pageIndex++;
    }
  }
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
  // Save the QR codes to localStorage

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
