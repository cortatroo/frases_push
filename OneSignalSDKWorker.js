self.addEventListener('notificationclick', function(event) {
  // Verifica se o clique foi num dos nossos botões (Curtir ou Favoritar)
  if (event.action === 'btn-curtir' || event.action === 'btn-favoritar') {
    
    // 1. OBRIGATÓRIO: Impede que o OneSignal abra a página web
    event.stopImmediatePropagation();
    
    // 2. OBRIGATÓRIO: Fecha a notificação da tela do telemóvel
    event.notification.close();
    
    // 3. Tenta encontrar o ID da frase (O OneSignal esconde os dados em locais diferentes dependendo da versão)
    let idDaFrase = "desconhecido";
    const nData = event.notification.data;
    if (nData) {
      if (nData.id_frase) idDaFrase = nData.id_frase;
      else if (nData.additionalData && nData.additionalData.id_frase) idDaFrase = nData.additionalData.id_frase;
      else if (nData.data && nData.data.id_frase) idDaFrase = nData.data.id_frase;
    }

    // 4. Faz a chamada invisível para a sua API do Google Sheets
    // IMPORTANTE: Cole abaixo a sua URL que termina com /exec
    const urlAPI = "https://script.google.com/macros/s/AKfycbyFU2mgIQCCZrHR8FVKNg-xJnGxqehou41Zrc3cSFDhFArMPVNxj3oXlzPcPteOvRwK/exec" 
                   + "?acao=" + event.action 
                   + "&idFrase=" + idDaFrase;
    
    // O fetch em modo 'no-cors' faz o disparo silencioso sem bloquear por questões de segurança
    event.waitUntil(
      fetch(urlAPI, { mode: 'no-cors' })
    );
  }
});

// Carrega o motor original do OneSignal só DEPOIS das nossas regras
importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");
