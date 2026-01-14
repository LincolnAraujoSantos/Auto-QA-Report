// ATENÇÃO: Substitua pela URL que você copiou do Google Apps Script
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxjlwng2BoBO596y-BrhgVhHyrdq51WVv8rh0sVv3Rf71-LAT8y2omQYmqKQ7gGEEWD/exec";

document.addEventListener('DOMContentLoaded', function() {
  const qaInput = document.getElementById('qa');
  
  // Carregar nome do QA salvo no storage do navegador
  chrome.storage.local.get(['qaName'], function(result) {
    if (result.qaName) {
      qaInput.value = result.qaName;
    }
  });

  // Botão Save (QA)
  document.getElementById('save').addEventListener('click', () => {
    const name = qaInput.value.trim();
    if (name) {
      chrome.storage.local.set({qaName: name}, () => {
        alert('QA Name saved!');
      });
    } else {
      alert('Please enter a username.');
    }
  });

  // Botão Clear (QA)
  document.getElementById('clear').addEventListener('click', () => {
    qaInput.value = '';
    chrome.storage.local.remove(['qaName']);
  });

  // Botão Cancel
  document.getElementById('cancel').addEventListener('click', () => {
    window.close(); // Fecha o popup
  });

  // Botão Report (Envio principal)
  document.getElementById('report').addEventListener('click', async () => {
    const category = document.getElementById('category').value;
    const sub = document.getElementById('sub').value;
    const status = document.getElementById('status').value;
    const qa = document.getElementById('qa').value;

    // Validação de campos obrigatórios
    if (!category || !sub || !status || !qa) {
      alert('Please fill all mandatory fields (*)');
      return;
    }

    // Obter URL da aba ativa e tratar
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    let rawUrl = tab.url;
    
    // Regex para limpar a URL conforme regra: desconsiderar após 5º número após o hífen
    // Ex: .../WSC20200006-27398?filter=45952 -> .../WSC20200006-27398
    let ticketUrl = rawUrl.split('?')[0]; 

    // Gerar data formato americano yy/mm/dd
    const now = new Date();
    const formattedDate = now.toISOString().split('T')[0].replace(/-/g, '/');

    const data = {
      ticketUrl: ticketUrl,
      category: category,
      sub: sub,
      status: status,
      publisherError: document.getElementById('publisherError').value,
      pendingCustomer: document.getElementById('pendingCustomer').value,
      reason: document.getElementById('reasonForAdjustment').value,
      date: formattedDate,
      qa: qa,
      comments: document.getElementById('comments').value
    };

    // Mudar texto do botão para indicar processamento
    const btnReport = document.getElementById('report');
    btnReport.disabled = true;
    btnReport.innerText = "Sending...";

    try {
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // Necessário para Google Apps Script
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      alert('Report sent successfully!');
      window.close();
    } catch (error) {
      console.error(error);
      alert('Error sending report. Check console.');
      btnReport.disabled = false;
      btnReport.innerText = "Report";
    }
  });
});