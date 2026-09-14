# Bloco 12 — Home social em três colunas

## Relatório do laboratório

A proposta do Gemini foi localizada na `main` remota do `intentNew`, commit
`95001bc`. Ela organiza a Home em três áreas no desktop: perfil, feed e
descoberta. Também propõe compositor rápido, cartões de condição, categorias e
destaques calculados a partir do feed.

Os arquivos de referência são:

- `src/components/MvpHomeFeed.tsx`;
- `src/App.tsx`.

O documento original não existia nos checkouts locais e foi recuperado do mesmo
commit remoto. Esta versão preserva a intenção do relatório e registra que a
migração depende de revisão contra o projeto oficial.

## Elementos propostos

- grid responsivo com três colunas a partir do desktop;
- resumo do usuário com `currentUser` e `getSocialProfile`;
- feed central com criação, abas e cards reforçados;
- descoberta baseada em Intents do feed e categorias do MVP;
- atalhos que abrem criação, perfil ou detalhe reais;
- ícones de `lucide-react`.

## Restrições para migração

A busca local do protótipo não substitui `GET /v1/search`. Apoio direto exige
estado individual confiável no contrato do feed. Contagem de comentários não
pode ser exibida enquanto o feed não fornecer esse dado. O shell experimental
do `App.tsx` não pode substituir notificações, badge, filtros ou propriedades de
componentes existentes no oficial.

Nenhum dado demonstrativo, Material Symbols, CDN, imagem fixa ou marcador do
Stitch faz parte da migração.
