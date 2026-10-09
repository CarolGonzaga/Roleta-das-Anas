# Validação realizada em 9 de outubro de 2026

## Verificações executadas

- `npm run build`: TypeScript e build Vite aprovados.
- `npm run lint`: ESLint aprovado.
- `npm test`: 23 testes Vitest aprovados.
- `npm audit`: zero vulnerabilidades nas dependências finais.

## Fluxo real no navegador

Automação com Playwright em Microsoft Edge (Chromium), com build de produção servido localmente:

- Código inválido recusado; caixa e espaços nas extremidades normalizados.
- Um código válido desbloqueia um giro e registra uma recompensa.
- Recarga preserva histórico e status “Mimo recebido”.
- Código já utilizado não libera nova rodada.
- Exportação de arquivo JSON real, importação em outro contexto de navegador e nova importação sem duplicação.
- Backup inválido recusado antes de modificar dados.
- Recarga durante uma animação de seis segundos recupera a mesma rodada, prêmio e mensagem.
- Duas abas disputando o mesmo código geram somente uma recompensa.
- Diálogo mantém foco por teclado; Escape fecha configurações.
- Ausência de rolagem horizontal em larguras de 320, 390, 768 e 1440 pixels.
- Capturas desktop e mobile revisadas visualmente, incluindo roleta em 320 pixels.
- Service worker ativo, cache versionado e recarga sem rede.
- Resgate e persistência funcionam offline após o cache inicial completo.
- Preferência do sistema por movimento reduzido usa revelação curta, com áudio inicialmente desligado.
- Falha de gravação simulada impede o sorteio visual e não consome o código.
- Nenhuma exceção JavaScript no fluxo principal testado.

As capturas e scripts de QA locais estão em `qa/`, ignorado pelo Git por conter caminhos específicos desta máquina. Os testes de regras de negócio estão versionados em `src/tests/game.test.ts`.

## Limites da validação

Não foi executado teste em aparelhos físicos ou em Safari/Firefox. Não foi criado nem publicado um projeto na conta Vercel. A configuração de build e SPA está pronta para importação do repositório.

O armazenamento é local e depende das permissões e da disponibilidade do navegador. Os códigos são públicos; não existe exclusividade global nem sincronização entre dispositivos. Web Locks é necessário para proteger gravações concorrentes entre abas.
