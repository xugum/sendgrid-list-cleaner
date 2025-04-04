# SendGrid List Cleaner

Um userscript para limpar a lista de unsubscribers no SendGrid e exportar os dados em CSV, com opções para exportar a página atual ou todas as páginas automaticamente.

## Descrição

O **SendGrid List Cleaner** é um script projetado para melhorar a experiência na página de supressões de grupo do SendGrid (`https://app.sendgrid.com/suppressions/group_unsubscribes`). Ele remove elementos desnecessários da interface (como avatares e checkboxes) e adiciona botões para exportar os dados em formato CSV. Inclui duas opções principais:

- **Exportar página atual**: Gera um CSV apenas com os dados da página visível.
- **Exportar todas as páginas**: Navega automaticamente por todas as páginas, acumula os dados e exporta um CSV completo.

## Funcionalidades

- Remove o cabeçalho da tabela (`thead`), avatares e células de checkbox para uma visualização mais limpa.
- Exporta os dados da página atual em CSV com um clique.
- Navega automaticamente pelas páginas de paginação, coletando todos os dados até o fim, e exporta tudo em um único CSV.
- Para a navegação quando o botão "Next" recebe a classe `invisible` ou quando a tabela não contém mais dados válidos.
- Evita duplicatas usando um `Set` para armazenar os dados acumulados.

## Requisitos

- Um gerenciador de userscripts, como [Tampermonkey](https://www.tampermonkey.net/) ou [Greasemonkey](https://www.greasespot.net/).
- Navegador compatível (Chrome, Firefox, etc.).
- Acesso à página de supressões do SendGrid (`https://app.sendgrid.com/suppressions/group_unsubscribes`).

## Instalação

1. Instale o Tampermonkey ou Greasemonkey no seu navegador:
   - [Tampermonkey para Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
   - [Tampermonkey para Firefox](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)
   - [Greasemonkey para Firefox](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/)
2. Crie um novo script no gerenciador:
   - No Tampermonkey, clique no ícone na barra de ferramentas > "Create a new script".
   - No Greasemonkey, clique em "New User Script".
3. Copie e cole o conteúdo do arquivo `script.js` neste repositório.
4. Salve o script (Ctrl+S ou botão "Save").

## Uso

1. Acesse a página de supressões do SendGrid: `https://app.sendgrid.com/suppressions/group_unsubscribes`.
2. O script será executado automaticamente, limpando a interface.
3. Você verá dois botões no canto inferior direito:
   - **⬇️ Export Current Page**: Clique para baixar um CSV com os dados da página atual.
   - **⬇️ Export All Pages**: Clique para navegar automaticamente por todas as páginas e baixar um CSV com todos os dados.
4. Durante a exportação de todas as páginas, o script clicará no botão "Next" até que ele receba a classe `invisible` ou a tabela fique vazia.

## Estrutura do CSV

- Cada linha do CSV representa uma entrada da tabela, com colunas separadas por vírgulas.
- Os dados são extraídos das células `<td>` (excluindo `.checkbox-cell`), com aspas duplas escapadas corretamente.
- Linhas ou células vazias são filtradas para evitar entradas inúteis.

## Notas Técnicas

- **Seletores**: O script usa seletores CSS para identificar elementos como a tabela (`.suppression-list`), o botão "Next" (`.pagination-next`), e a paginação (`.pagination`).
- **Parada**: A navegação para quando:
  - O botão "Next" ganha a classe `invisible`.
  - A tabela não contém mais dados válidos (linhas vazias ou sem conteúdo).
  - Um limite de segurança de 100 páginas é atingido.
- **Tempo de espera**: Há um delay de 1.5 segundos entre cliques no "Next" para garantir o carregamento da página. Ajuste o valor em `setTimeout(resolve, 1500)` se necessário.
- **Duplicatas**: Dados são armazenados em um `Set` para evitar repetições, assumindo que linhas idênticas em páginas diferentes são duplicatas.

## Limitações

- Requer que o SendGrid mantenha a estrutura atual de HTML e classes (`.suppression-list`, `.pagination-next`, etc.).
- Pode parar prematuramente se o carregamento da página for muito lento (ajuste o delay se isso ocorrer).
- O limite de 100 páginas é um mecanismo de segurança; listas maiores podem exigir ajustes no código.

## Contribuições

Sinta-se à vontade para abrir issues ou pull requests com melhorias, como:
- Suporte a diferentes layouts do SendGrid.
- Ajustes no tempo de espera entre páginas.
- Opções de configuração via interface.
