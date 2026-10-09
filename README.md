# Roleta das Anas — O Grimório das Recompensas

Um presente de Carol para Ana Flávia. “Cada pequena conquista merece um pouquinho de magia.”

Aplicação em português, mobile-first, com React, TypeScript, Vite, Lucide React, SVG, CSS e Web Audio API. Não há administração, autenticação, backend, banco externo ou credenciais.

## Rodar localmente

Requer Node.js 22.12 ou superior e npm.

```sh
npm install
npm run dev
```

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm run preview
```

## Experiência

- **Meu Cantinho:** carta de Carol, sussurros carinhosos e campo de código.
- **Roleta Mágica:** validação antes do giro, nove prêmios com probabilidade igual, animação de seis segundos e revelação. Os dados são gravados antes da animação; rodadas interrompidas recuperam o resultado original.
- **Baú dos Encantos:** descrição, mensagem, data, histórico e filtros. Ana pode marcar cada mimo como recebido.
- **Configurações:** áudio opcional inicialmente desligado, redução de movimento e backups JSON. A preferência do sistema por movimento reduzido sempre é respeitada.

## GitHub e Vercel

Envie estes arquivos ao repositório `CarolGonzaga/Roleta-das-Anas`, branch `main`. Na Vercel, importe esse repositório, selecione **Vite**, comando de build `npm run build`, diretório de saída `dist` e instale com `npm ci`. Nenhuma variável de ambiente é necessária. O `vercel.json` inclui fallback de rotas para a SPA. A navegação interna funciona sem bibliotecas de roteamento.

O projeto está preparado para deploy; criar o projeto da Vercel e conectar o GitHub exige acesso à conta Vercel. A publicação não é feita apenas por ter o código local.

## Códigos e prêmios

Os 100 códigos fixos estão em `src/data/redemptionCodes.ts`: 25 ANA, 25 CAROL, 25 LANA e 25 BONNIE. A lista numerada de consulta para Carol está em `CODIGOS-RESGATE.md`. Carol escolhe um deles e entrega manualmente à Ana. Não há geração nem edição pela interface.

**Os códigos são públicos, não são segredos.** Qualquer pessoa pode ler o repositório ou o JavaScript distribuído. O bloqueio de reutilização vale apenas para o mesmo armazenamento local. Limpar esse armazenamento permite reutilização. Navegadores, perfis e aparelhos diferentes não compartilham os dados.

Os nove prêmios e descrições estão em `src/data/rewards.ts`. Alterações futuras são feitas no código-fonte, seguidas de novo deploy. A estrutura suporta pesos positivos, ativação e limites de concessão. Históricos usam snapshots, preservando nome, descrição e mensagem originais. Nunca remova IDs antigos: eles também validam os backups. As mensagens ficam em `src/data/messages.ts`.

## Armazenamento e backups

Um estado versionado único é salvo no `localStorage` na chave `roleta-das-anas:v1`, com códigos consumidos, rodadas/recompensas e preferências. Sorteios usam `crypto.getRandomValues`; o registro identificável usa `crypto.randomUUID`. Prêmio, mensagem e código são persistidos juntos antes do giro. Falhas de gravação impedem a animação e não consomem o código.

Transações usam **Web Locks** para coordenar abas da mesma origem. Sem suporte a essa API, operações de gravação são bloqueadas com uma mensagem orientando a atualização do navegador. Use HTTPS em produção ou localhost em desenvolvimento. Não há garantia global entre dispositivos e o armazenamento pode ser editado manualmente pelo usuário.

Abra o botão de configurações no cabeçalho e clique **Exportar backup JSON**. Faça isso antes de limpar dados ou trocar de aparelho. No novo navegador, selecione o JSON, confira a prévia e clique **Importar e mesclar memórias**. Importações validam esquema, datas, códigos, duplicidades e snapshots. A mescla preserva códigos consumidos, o resultado local em conflitos e status recebido; backups antigos não revertem entregas. As preferências são recuperadas do arquivo importado. Não há substituição destrutiva de dados.

Arquivos inválidos não são importados e estados corrompidos não são sobrescritos automaticamente. Versões futuras do esquema devem acrescentar migrações explícitas antes de modificar a chave/versão; a versão inicial é 1 e versões desconhecidas são recusadas.

## Acessibilidade e instalação

Foco visível, controles nativos, diálogos com foco contido e Escape, feedback anunciado, fontes legíveis, navegação por teclado, alvos grandes e respeito a `prefers-reduced-motion`. Ícones funcionais exclusivamente Lucide; decoração vetorial em CSS/SVG. Fontes Google Fonts têm fallback local.

Manifest e service worker permitem instalação nos navegadores compatíveis e funcionamento offline após a primeira visita completa. HTML consulta a rede primeiro; assets Vite com nomes versionados usam cache. O histórico não depende do service worker. O navegador define se e como exibe a instalação.

## Verificações

Os testes Vitest verificam códigos, consumo consistente, recuperação, sorteio e pesos, disponibilidade, alinhamento da roleta, persistência e mescla de backups. Consulte `VALIDACAO.md` para os comandos e cenários realmente executados nesta implementação.
