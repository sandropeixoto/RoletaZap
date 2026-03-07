# Design System Master - Distribuidora Tancredi

Este documento define os padrões visuais e de layout para manter a integridade luxuosa da roleta.

## 🎨 Paleta de Cores (Cores Reais)

| Elemento | Variável CSS | Hex Code | Descrição |
| :--- | :--- | :--- | :--- |
| **Café Profundo** | `--coffee-deep` | `#1A0F0A` | Fundo principal e textos escuros. |
| **Café Torrado** | `--coffee-dark` | `#2C1B12` | Tons médios da roleta e modais. |
| **Ouro Real** | `--gold` | `#D4AF37` | Títulos, bordas e detalhes premium. |
| **Ouro Brilhante** | `--gold-bright` | `#F9F295` | Brilhos, destaques e texto do botão. |
| **Creme** | `--cream` | `#FDF5E6` | Textos secundários e fundos claros. |
| **Sucesso (WhatsApp)**| - | `#25D366` | Fundo do botão de compartilhar. |

## 📐 Layout & Espaçamento

- **Padding Superior**: 15px (Otimizado para mobile).
- **Largura Máxima (Container)**: 480px.
- **Roleta**: 320px de diâmetro.
- **Transição de Giro**: 5 segundos com curva `cubic-bezier(0.1, 0, 0.1, 1)` para efeito dramático.

## ✍️ Tipografia

- **Principal**: `Playfair Display` (Serifada Luxuosa).
- **Secundária**: `Courier New` ou Monospace (Apenas para Códigos de Cupom e Tickets).
- **Tamanho Título**: 28px.
- **Tamanho Subtítulo**: 13px.

## 🛠️ Regras de Integridade

1. **Sorteio**: Sempre realizado no servidor para evitar fraudes.
2. **Ticket Único**: ID Alfanumérico de 6 caracteres gerado via crypto no backend.
3. **Compartilhamento**: Deve ser gerado via `html2canvas` para preservar o design exato do ticket.
4. **Anti-Duplicate**: Trava via `localStorage` com bypass via parâmetro `?debug=true`.
