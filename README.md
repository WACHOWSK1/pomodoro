# FOCUS MESTRADO | Sistema de Alta Produtividade

Sistema web baseado na metodologia oficial de **Francesco Cirillo** (*The Pomodoro Technique*) e nas técnicas de neuroaprendizagem do **Guia de Estudos 2024** (*IFRS*).

## Funcionalidades Principais

- ⏱️ **Três Temporizadores Especializados**:
  - **Foco Profundo (25 min)**: Gradiente coral neon, feedback sonoro e visual.
  - **Intervalo Curto (5 min)**: Gradiente menta esmeralda, relaxamento consciente.
  - **Intervalo Longo (15 min)**: Gradiente azul azure, ativado a cada ciclo de 4 pomodoros.
  - **Modo Overlearning (Superaprendizagem)**: Ao terminar a tarefa antes do fim do bloco, o sistema orienta a revisão contínua sem quebrar o pomodoro.
- 📋 **Tarefas de Hoje (To Do Today)**:
  - Estimativa de pomodoros (`○ ○ ○`).
  - Pomodoros concluídos (`●`).
  - Pomodoros adicionais (`■`).
  - Rastreamento de interrupções internas (`'`) e externas (`-`).
  - Seção de Atividades Não Planejadas & Urgentes.
- 📦 **Inventário de Atividades (Activity Inventory)**:
  - Backlog de projetos, artigos e leituras com botão de transferência para o dia.
- 🧠 **Guia & Ambiente de Estudos**:
  - Checklist cognitivo pré-foco (mesa limpa, água, celular afastado, etc.).
  - Ferramenta da Execução Máxima e Recordação Ativa (Active Recall).
- 🎧 **Sons Ambientais & Áudio Sintetizado**:
  - Ruído Marrom, Ruído Branco, Chuva Sintética e Ondas Alfa (10Hz).
  - Tique-taque mecânico Cirillo e sino de término harmônico.
- 📊 **Métricas, Histórico & Exportação JSON**.

## Executando o Projeto

### Modo Web (Navegador)
```powershell
npm install
npm run dev
```
Abra no navegador: `http://localhost:5173/`

---

## 💻 Instalador para Windows (.EXE)

O projeto foi configurado com **Electron** e **electron-builder** para gerar executáveis nativos para Windows (10/11 x64).

Os arquivos já foram gerados e estão prontos na pasta:
`C:\Users\Nitro5 R7\pomodoro_release\`

1. **Instalador Oficial (Setup)**:
   - Arquivo: `Focus Mestrado Setup 1.0.0.exe`
   - Permite instalar no Windows com atalho na Área de Trabalho, atalho no Menu Iniciar e desinstalador no Painel de Controle. Pode ser copiado em um pendrive ou enviado para qualquer computador com Windows.

2. **Versão Portátil (Sem Instalação)**:
   - Arquivo: `Focus Mestrado 1.0.0.exe`
   - Basta dar dois cliques para rodar imediatamente, sem precisar instalar nada nem exigir privilégios de administrador.

### Para gerar novamente o instalador .exe:
```powershell
npm run build:exe
```
