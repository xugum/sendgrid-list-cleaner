// ==UserScript==
// @name         SendGrid List Cleaner
// @namespace    https://app.sendgrid.com/
// @version      2025-04-04
// @description  Cleans SendGrid unsubscribe list, with options to export current page or all pages 🎯
// @author       Ronis
// @match        https://app.sendgrid.com/suppressions/group_unsubscribes*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const SELECTORS = {
        table: 'table.suppression-list',
        avatar: 'img.avatar, img[src*="avatar"], .avatar, img[src*="gravatar"], img[alt="avatar"]',
        checkbox: 'td.checkbox-cell, th.checkbox-cell',
        tbodyRows: 'tbody tr',
        pagination: '.pagination',
        nextButton: '.pagination-next'
    };

    const BUTTON_STYLES = {
        position: 'fixed',
        bottom: '20px',
        zIndex: '9999',
        padding: '10px 14px',
        fontSize: '14px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: '#28a745',
        color: '#fff',
        cursor: 'pointer',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    };

    let accumulatedData = new Set();

    function removeTableHeader(table) {
        const thead = table.querySelector('thead');
        if (thead) thead.remove();
    }

    function removeElements(selector) {
        document.querySelectorAll(selector).forEach(element => {
            element.remove();
        });
    }

    function cleanSuppressionList() {
        const table = document.querySelector(SELECTORS.table);
        if (!table) return;

        removeTableHeader(table);
        removeElements(SELECTORS.avatar);
        removeElements(SELECTORS.checkbox);
        table.querySelectorAll('td img').forEach(img => img.remove());
    }

    function collectTableData() {
        const table = document.querySelector(SELECTORS.table);
        if (!table) return false;

        const rows = table.querySelectorAll(SELECTORS.tbodyRows);
        let hasData = false;
        rows.forEach(row => {
            const cells = row.querySelectorAll('td:not(.checkbox-cell)');
            const rowData = Array.from(cells)
                .map(cell => cell.textContent.trim())
                .filter(text => text.length > 0)
                .join('|');
            if (rowData) {
                accumulatedData.add(rowData);
                hasData = true;
            }
        });
        return hasData;
    }

    function generateCsvContent(data) {
        const csvRows = [];
        data.forEach(row => {
            const cells = row.split('|').map(text =>
                `"${text.replace(/"/g, '""')}"`
            );
            csvRows.push(cells.join(','));
        });
        return csvRows.join('\n');
    }

    function downloadCsv(content, filename) {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }

    async function navigateAllPages() {
        let nextButton = document.querySelector(SELECTORS.nextButton);
        let pageCount = 0;
        const maxPages = 100; // Limite de segurança

        while (nextButton && !nextButton.classList.contains('invisible') && pageCount < maxPages) {
            const hasData = collectTableData(); // Coletar dados da página atual
            if (!hasData) {
                console.log('Parando: página sem dados detectada');
                break; // Para se a página não tiver dados válidos
            }

            nextButton.click();
            await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5s para carregamento
            nextButton = document.querySelector(SELECTORS.nextButton); // Atualizar referência
            pageCount++;
        }

        // Coletar dados da última página, se houver
        collectTableData();
    }

    function createButtons() {
        // Botão para exportar todas as páginas
        const exportAllButton = document.createElement('button');
        exportAllButton.textContent = '⬇️ Export All Pages';
        Object.assign(exportAllButton.style, BUTTON_STYLES, { right: '20px' });

        exportAllButton.addEventListener('click', async () => {
            try {
                accumulatedData.clear(); // Limpar dados anteriores
                await navigateAllPages();
                if (accumulatedData.size === 0) {
                    alert('Nenhum dado encontrado para exportar');
                    return;
                }
                const csvContent = generateCsvContent(accumulatedData);
                downloadCsv(csvContent, `sendgrid-all-pages-${new Date().toISOString().slice(0, 10)}.csv`);
                alert(`CSV com todas as páginas exportado com sucesso! (${accumulatedData.size} linhas)`);
            } catch (error) {
                console.error('Erro ao exportar todas as páginas:', error);
                alert('Erro ao processar todas as páginas');
            }
        });

        // Botão para exportar página atual
        const exportCurrentButton = document.createElement('button');
        exportCurrentButton.textContent = '⬇️ Export Current Page';
        Object.assign(exportCurrentButton.style, BUTTON_STYLES, { right: '180px' });

        exportCurrentButton.addEventListener('click', () => {
            const table = document.querySelector(SELECTORS.table);
            if (!table) {
                alert('Nenhuma tabela encontrada para exportar');
                return;
            }
            const rows = table.querySelectorAll(SELECTORS.tbodyRows);
            if (rows.length === 0) {
                alert('Nenhum dado na página atual para exportar');
                return;
            }
            const currentData = new Set();
            rows.forEach(row => {
                const cells = row.querySelectorAll('td:not(.checkbox-cell)');
                const rowData = Array.from(cells)
                    .map(cell => cell.textContent.trim())
                    .filter(text => text.length > 0)
                    .join('|');
                if (rowData) currentData.add(rowData);
            });
            const csvContent = generateCsvContent(currentData);
            downloadCsv(csvContent, `sendgrid-current-page-${new Date().toISOString().slice(0, 10)}.csv`);
        });

        document.body.appendChild(exportAllButton);
        document.body.appendChild(exportCurrentButton);
    }

    function setupMutationObserver() {
        const observer = new MutationObserver(() => {
            cleanSuppressionList();
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    function initialize() {
        try {
            cleanSuppressionList();
            createButtons();
            setupMutationObserver();
        } catch (error) {
            console.error('Erro ao inicializar SendGrid List Cleaner:', error);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
})();
