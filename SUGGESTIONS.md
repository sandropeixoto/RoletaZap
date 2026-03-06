# Sugestões de Melhorias - RoletaZap

Como Arquiteto de Software, identifiquei as seguintes oportunidades para escalar o produto:

### 1. Segurança e Integridade
- **JWT para IDs**: Em vez de passar o telefone puro na URL (`?u=55...`), utilizar um token assinado (JWT) para evitar que usuários tentem IDs aleatórios ou "brute-force" para ganhar múltiplos prêmios.
- **Rate Limiting**: Implementar `express-rate-limit` no backend para evitar disparos excessivos de bots.

### 2. Infraestrutura (GCP)
- **Firebase Auth**: Adicionar autenticação anônima do Firebase para vincular o sorteio a uma sessão real de dispositivo, aumentando a segurança contra fraudes.
- **Cloud Run**: Configurar o `Dockerfile` para deploy no Cloud Run, aproveitando o escalonamento automático e o modelo "pay-per-use".

### 3. Engajamento e UX
- **Integração WhatsApp API**: Automatizar o envio do cupom via WhatsApp assim que o cliente ganhar, garantindo que ele não perca o código.
- **Sons e Feedback Háptico**: Adicionar sons de "clique" durante o giro da roleta e vibração (se suportado pelo mobile) para aumentar a imersão.
- **Countdown**: Se o ID já girou, mostrar uma contagem regressiva para a "próxima temporada" de prêmios.

### 4. Admin Pro
- **Gráficos de Conversão**: Adicionar um gráfico no Dashboard mostrando prêmios distribuídos vs. prêmios resgatados.
- **Editor de Prêmios**: Permitir que o admin mude os nomes e pesos dos prêmios via interface, sem precisar alterar o código.
