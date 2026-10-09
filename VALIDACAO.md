# Validação — O Oráculo dos Encantos

Atualização de 9 de outubro de 2026.

## Verificações automatizadas

- TypeScript e build Vite aprovados.
- ESLint aprovado.
- **34 testes Vitest aprovados**, incluindo os quatro resultados de carta, independência entre carta/prêmio, mensagens por carta, nove prêmios distintos e bloqueio do décimo código sem consumo.
- Migração v1 para v2 mantém históricos, mensagens, códigos usados e status. Não inventa cartas.
- Auditoria npm: zero vulnerabilidades.
- Testes mantêm prêmio recebido fora do sorteio e preservam indisponibilidade após backup/mescla.
- Ângulos finais correspondem aos quatro setores.

## Navegador

Playwright com Microsoft Edge/Chromium e build de produção em localhost:

- Os nove nomes de prêmio não aparecem em Meu Cantinho, na roleta ou durante o giro.
- Quatro imagens de verso reais e quatro setores na roleta.
- Fluxo completo de animação: spinning, selecting-card, moving-card, flipping-card, revealing-reward e completed.
- Ponteiro coincide com a carta persistida.
- Imagem original correta e mensagem persistida na apresentação ampla do resultado.
- Nove rodadas produzem nove prêmios distintos. Depois, o formulário deixa de liberar novos sorteios.
- Recompensa pode ser marcada recebida e carta pode ser reaberta sem novo sorteio.
- Recarga durante o giro recupera exatamente carta, prêmio e mensagem.
- Backup v2 real exportado e importado em outro contexto preserva todos os dados.
- Histórico v1 real da aplicação anterior continua disponível e pode ser consultado.
- Capturas desktop e mobile revisadas visualmente.
- Sem rolagem horizontal ou cartas fora do palco em 320, 390, 768 e 1440 pixels.
- As quatro cartas do palco mobile ficam acima da navegação inferior em 390×844 e 320×740.
- As cinco artes originais foram encontradas no cache. Recarga e revelação funcionam offline com imagem real.
- Duas abas concorrendo pelo mesmo código geram uma só recompensa.
- Falha de gravação simulada não consome código nem inicia o sorteio visual.

## Limitações

A validação foi feita em Edge/Chromium; não em aparelhos físicos ou Safari/Firefox. A conta Vercel não foi utilizada para criar um deploy.

Scripts e capturas temporários estão na pasta local `qa/`, ignorada pelo Git por usar caminhos específicos desta máquina. Os testes de regras de negócio estão versionados.

Os códigos são públicos, o armazenamento é local e não existe exclusividade entre dispositivos. Repetições já presentes em histórias antigas são preservadas; não podem voltar a ser sorteadas em novas rodadas.
