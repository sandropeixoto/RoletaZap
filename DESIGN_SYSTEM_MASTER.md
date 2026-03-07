# Design System Master - Distribuidora Tancredi

Este documento define os padrões visuais, tipográficos e de layout para garantir a integridade luxuosa da experiência Distribuidora Tancredi.

## 🎨 Paleta de Cores (Premium Coffee & Gold)

| Elemento | Variável CSS | Hex Code | Descrição |
| :--- | :--- | :--- | :--- |
| **Café Profundo** | `--coffee-deep` | `#1A0F0A` | Fundo principal e textos escuros. |
| **Café Torrado** | `--coffee-dark` | `#2C1B12` | Tons médios da roleta e modais. |
| **Ouro Real** | `--gold` | `#D4AF37` | Títulos, bordas e detalhes premium. |
| **Ouro Brilhante** | `--gold-bright` | `#F9F295` | Brilhos reluzentes e texto do botão. |
| **Creme** | `--cream` | `#FDF5E6` | Textos secundários e fundos claros. |
| **Sucesso (WhatsApp)**| - | `#25D366` | Fundo do botão de compartilhar. |

## 📐 Layout & Iconografia Master

- **Padding Superior**: 5px (Otimizado para ocupação total da tela mobile).
- **Ícone do Topo**: 80px (Imponente, com sombra dourada).
- **Ícone Centro Roleta**: 80px de base com ícone interno de 35px.
- **Espaçamento Dinâmico**: Caso o subtítulo seja removido, utiliza-se um espaçador de 25px para evitar proximidade excessiva entre Título e Roleta.
- **Roleta**: 320px de diâmetro com 5 tonalidades de marrom.

## ✍️ Tipografia & Hierarquia

- **Site Principal**: Dinâmico via Admin (Playfair Display, Montserrat, Inter, Georgia).
- **Área Administrativa**: **Verdana** (Exclusiva para máxima legibilidade técnica).
- **Ticket de Premiação (Modal)**: Segue a fonte master escolhida.
  - **Descrição do Prêmio**: 17px (Destaque para o valor ganho).
  - **Código do Cupom**: 18px (Estilo "Selo de Autenticidade", discreto e elegante).
  - **Ticket ID**: 14px (Sutil).

## ✨ Efeitos de Luxo

- **GIRAR Button**: Pulsação com aura dourada expansiva (`luxuryPulse`) simulando reflexo metálico.
- **Backdrop**: Modais com 92% de opacidade e desfoque de fundo (*10px blur*).
- **Centralização**: Botão de compartilhamento com alinhamento `flex` absoluto para texto e ícones.

## 🛠️ Regras de Integridade e Segurança

1. **Sorteio Server-Side**: Realizado via Firebase Functions para impossibilitar manipulação de resultados.
2. **Anti-Duplicate**: Trava persistente via `localStorage` (Dispositivo) + Registro único no Firestore.
3. **Bypass de Teste**: Link com parâmetro `?debug=true` ignora as travas de cache local.
4. **Captura Viral**: Utilização de `html2canvas` para transformar o modal em imagem PNG real para compartilhamento direto.
