# Roleta das Anas — O Oráculo dos Encantos

Um presente de Carol para Ana Flávia. “Minha gatinha, o destino preparou um carinho especial para você.”

Aplicação em português, mobile-first, com React, TypeScript, Vite, Lucide React, Motion, SVG, CSS e Web Audio API. Sem administração, autenticação, backend, banco externo ou credenciais.

## Rodar localmente

Requer Node.js 22.12 ou superior e npm.

```sh
npm ci
npm run dev
```

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm run preview
```

## A experiência

- **Meu Cantinho:** carta de Carol, sussurros e código de resgate. Não existe catálogo de prêmios nem prévia dos mimos.
- **Oráculo dos Encantos:** quatro cartas com o verso original nos cantos de um palco responsivo e roleta central com quatro setores: Sol/Carol, Lua/Ana Flávia, Força/Lana e Justiça/Bonnie.
- **Revelação:** o código válido inicia a rodada. Carta, prêmio e mensagem são escolhidos e persistidos antes do giro. A carta vencedora brilha, se move ao centro, vira em 3D e ocupa uma apresentação ampla com mensagem e mimo. A animação usa eventos de transição e Motion; temporizadores de contingência só recuperam eventos visuais suspensos.
- **Baú dos Encantos:** descrição, mensagem, data, status, miniatura da carta e histórico. Ana marca mimos recebidos e pode rever cartas em tamanho grande sem novo sorteio.
- **Configurações:** áudio opcional inicialmente desligado, redução de movimento e backups JSON. O movimento reduzido do sistema sempre é respeitado.

## Surpresa e prêmios sem repetição

As dezoito recompensas da coleção, incluindo os nove mimos originais e o Vale Sorvete, permanecem no código, sem aparecer na interface antes da revelação. Cada prêmio pode ser conquistado **uma única vez no histórico local**, independentemente de estar aguardando ou recebido.

Em 12 de outubro de 2026 foram adicionados oito mimos com IDs novos (11–18): saída para um lugar à sua escolha, café, iFood, favor de livre escolha, limpeza de xixi de cachorrinho, três dias sem ir ao mercado, cinco dias sem ir ao mercado e pizza. IDs e snapshots anteriores continuam intactos. Coleções antes completas voltam a oferecer somente os novos prêmios disponíveis, sem reiniciar resgates nem liberar códigos usados.

O sorteio da carta é independente do prêmio: cada carta tem 25% de chance e pode revelar qualquer mimo ainda elegível. As cartas podem reaparecer; os prêmios não. Os prêmios disponíveis têm inicialmente pesos iguais. A estrutura preserva ativação, pesos e limites no código-fonte.

Após conquistar todos os mimos disponíveis, o oráculo bloqueia novas rodadas e informa que a coleção foi completada. Nenhum novo código é consumido, não há reinício automático e não existe botão para apagar histórico ou liberar repetições.

Históricos anteriores e backups com repetições já existentes são preservados. Qualquer prêmio presente no histórico fica excluído de todos os próximos sorteios. Não são inventadas cartas para as conquistas antigas.

## As artes originais

As cinco ilustrações fornecidas por Carol estão em:

- `public/tarot/the-sun.png`
- `public/tarot/the-moon.png`
- `public/tarot/strength.png`
- `public/tarot/justice.png`
- `public/tarot/card-back.png`

Foram copiadas sem edição ou recorte. A aplicação preserva proporções e usa `object-fit: contain`. O verso é igual para as quatro cartas; a frente aparece somente após a seleção/virada. Imagens são preparadas para uso offline. Detalhes em `public/tarot/README.md`.

## Códigos, dados e migração

Os mesmos 100 códigos fixos estão em `src/data/redemptionCodes.ts`: 25 ANA, 25 CAROL, 25 LANA e 25 BONNIE. A lista numerada para Carol está em `CODIGOS-RESGATE.md`. Nenhum código foi modificado nesta atualização. Carol escolhe e informa os códigos manualmente.

**Os códigos são públicos, não são segredos.** Qualquer pessoa pode ler o repositório ou o JavaScript distribuído. O bloqueio vale apenas para o mesmo armazenamento. Limpar o armazenamento permite reutilização. Aparelhos, navegadores e perfis não compartilham dados.

O estado único segue na chave localStorage `roleta-das-anas:v1`, para manter os dados instalados. O esquema interno agora é **versão 2** e inclui o snapshot da carta. A leitura migra a versão 1 em memória, mantendo integralmente códigos, prêmios, mensagens, datas e status. Conquistas antigas usam `cardSnapshot: null`. A próxima gravação persiste a versão 2. Versões desconhecidas são recusadas.

Sorteios usam `crypto.getRandomValues`. Web Locks serializa leitura e gravação entre abas da mesma origem. Sem essa API, gravações são bloqueadas com orientação para atualizar o navegador. Use HTTPS em produção ou localhost em desenvolvimento. O resultado visual não é fonte de dados; uma recarga recupera o resultado salvo.

Prêmios: `src/data/rewards.ts`. Cartas e mensagens especiais: `src/data/tarot.ts`. Mensagens anteriores e sussurros: `src/data/messages.ts`. Alterações futuras são feitas no código-fonte e publicadas por novo deploy. Preserve IDs antigos para manter compatibilidade dos backups.

## Backups

Abra configurações e clique **Exportar backup JSON** antes de trocar de aparelho ou limpar o site. Na nova instalação, selecione o arquivo, revise a prévia e clique **Importar e mesclar memórias**.

Aceita backups v1 e v2, validando formato, datas, códigos, duplicidades, prêmios e cartas. A mescla preserva códigos consumidos, o resultado local nos conflitos e os status recebidos. Backups antigos não revertem entregas. As preferências vêm do arquivo. Não existe substituição destrutiva.

Dados inválidos não são importados; armazenamento corrompido nunca é sobrescrito silenciosamente. Os prêmios importados também são excluídos dos próximos sorteios.

## GitHub e Vercel

Repositório: `CarolGonzaga/Roleta-das-Anas`, branch `main`. Importe na Vercel como **Vite**, instale com `npm ci`, use build `npm run build` e saída `dist`. Nenhuma variável de ambiente é necessária.

O `vercel.json` preserva os arquivos estáticos, inclusive tarô, e inclui fallback SPA. A configuração está pronta; criar/conectar o projeto Vercel depende da conta Vercel.

## Acessibilidade e instalação

Foco visível, link para pular navegação, botões grandes, controles nativos, feedback anunciado, alternativas textuais das cartas e navegação por teclado. Com movimento reduzido, a revelação usa opacidade e dispensa deslocamento/virada 3D.

Manifest e service worker permitem instalação em navegadores compatíveis e funcionamento offline após completar o primeiro cache. O cache inclui artes e assets; sua versão deriva do HTML, do worker e dos bytes das cinco imagens. HTML usa rede primeiro e caches antigos do aplicativo são removidos na ativação. O histórico sempre fica no localStorage. Fontes Google têm fallback local.

## Verificação

`src/tests/game.test.ts` cobre códigos, consumo, sorteio ponderado, quatro cartas, ausência de repetição, esgotamento, recuperação, ângulos, histórico e backups/migração. Consulte `VALIDACAO.md` para verificações realmente executadas.
