// 1. Escuta o clique na notificação ANTES de fechar
self.addEventListener('notificationclick', function(event) {
  
  // Verifica se o que foi clicado foi um dos nossos botões
  if (event.action === 'btn-curtir' || event.action === 'btn-favoritar') {
    
    // Tenta pegar o ID da frase (que enviamos no campo "data" no Apps Script)
    let idDaFrase = "desconhecido";
    if (event.notification.data && event.notification.data.id_frase) {
      idDaFrase = event.notification.data.id_frase;
    }

    // A URL da sua API do Apps Script (COLE AQUI A URL QUE VOCÊ GEROU NO PASSO 2)
    const urlAPI = "https://script.google.com/macros/s/AKfycbyFU2mgIQCCZrHR8FVKNg-xJnGxqehou41Zrc3cSFDhFArMPVNxj3oXlzPcPteOvRwK/exec" 
                   + "?acao=" + event.action 
                   + "&idFrase=" + idDaFrase;
    
    // Faz um disparo silencioso (fetch) para a sua planilha
    // O 'no-cors' garante que o navegador faça o disparo invisível sem erros de segurança
    event.waitUntil(
      fetch(urlAPI, { mode: 'no-cors' })
    );
  }
});

// 2. Só depois, carrega o motor original do OneSignal
importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");
