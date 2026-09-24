self.addEventListener('notificationclick', function(event) {
  // Se o utilizador clicou em ALGUM botão (ação não é vazia)
  if (event.action) {
    // 1. Pára o OneSignal imediatamente e fecha a notificação
    event.stopImmediatePropagation();
    event.preventDefault();
    event.notification.close();

    // 2. Busca o ID da frase sem causar erros
    let idDaFrase = "vazio";
    try {
      if (event.notification.data && event.notification.data.id_frase) {
        idDaFrase = event.notification.data.id_frase;
      }
    } catch(e) {}

    // 3. Monta a URL e faz o disparo invisível
    // COLE A SUA URL NA LINHA ABAIXO (mantenha as aspas)
    const urlAPI = "https://script.google.com/macros/s/AKfycbyFU2mgIQCCZrHR8FVKNg-xJnGxqehou41Zrc3cSFDhFArMPVNxj3oXlzPcPteOvRwK/exec"; 
    const linkFinal = urlAPI + "?acao=" + event.action + "&idFrase=" + idDaFrase;
    
    event.waitUntil( fetch(linkFinal, { mode: 'no-cors' }) );
  }
});

// Importa o motor original no fim
importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");
