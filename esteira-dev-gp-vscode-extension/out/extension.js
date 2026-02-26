"use strict";var ze=Object.create;var V=Object.defineProperty;var He=Object.getOwnPropertyDescriptor;var Je=Object.getOwnPropertyNames;var De=Object.getPrototypeOf,Oe=Object.prototype.hasOwnProperty;var Ne=(i,e)=>{for(var t in e)V(i,t,{get:e[t],enumerable:!0})},ve=(i,e,t,r)=>{if(e&&typeof e=="object"||typeof e=="function")for(let o of Je(e))!Oe.call(i,o)&&o!==t&&V(i,o,{get:()=>e[o],enumerable:!(r=He(e,o))||r.enumerable});return i};var v=(i,e,t)=>(t=i!=null?ze(De(i)):{},ve(e||!i||!i.__esModule?V(t,"default",{value:i,enumerable:!0}):t,i)),Ue=i=>ve(V({},"__esModule",{value:!0}),i);var nt={};Ne(nt,{activate:()=>ot,deactivate:()=>st});module.exports=Ue(nt);var A=v(require("vscode"));var B=v(require("vscode"));var z=[{id:"produto",title:"Produto",description:"Idea\xE7\xE3o, requisitos e planejamento",icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 1 4 12.9V17H8v-2.1A7 7 0 0 1 12 2z"/></svg>',color:"#f59e0b"},{id:"desenvolvimento",title:"Desenvolvimento",description:"Codifica\xE7\xE3o e implementa\xE7\xE3o",icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/><line x1="14" y1="4" x2="10" y2="20"/></svg>',color:"#3b82f6"},{id:"qa",title:"QA",description:"Testes e valida\xE7\xE3o de qualidade",icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>',color:"#10b981"},{id:"deploy",title:"Deploy",description:"Publica\xE7\xE3o e entrega em produ\xE7\xE3o",icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>',color:"#8b5cf6"}];var P=v(require("vscode"));var J=[{id:1,title:"Brainstorming",description:"Explore ideias, descubra oportunidades e defina o problema a resolver com o Claude.",buttonLabel:"Iniciar Brainstorming",terminalCommand:'claude "/brainstorming"',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>'},{id:2,title:"Plano de Implementa\xE7\xE3o",description:"Gere um plano t\xE9cnico detalhado com etapas, depend\xEAncias e estimativas.",buttonLabel:"Gerar Plano",terminalCommand:'claude "/plan"',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>'},{id:3,title:"PRD",description:"Crie um Product Requirements Document completo baseado no brainstorming e plano.",buttonLabel:"Gerar PRD",terminalCommand:'claude "Gere um arquivo prd.md completo baseado no design document e no plano de implementa\xE7\xE3o discutidos anteriormente. Inclua: objetivo, escopo, requisitos funcionais e n\xE3o-funcionais, crit\xE9rios de aceite e m\xE9tricas de sucesso. Salve em docs/prd.md"',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>'},{id:4,title:"Issues",description:"Gere estrutura de issues organizadas em \xE9picos, tasks e subtasks.",buttonLabel:"Gerar Issues",terminalCommand:'claude "Gere estrutura de issues em \xE9picos > tasks > subtasks baseado no PRD (docs/prd.md). Para cada issue inclua: t\xEDtulo, descri\xE7\xE3o, crit\xE9rios de aceite e labels sugeridas. Salve em docs/issues.md"',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'},{id:5,title:"Criar no Jira",description:"Crie automaticamente todas as issues no Jira a partir do arquivo gerado.",buttonLabel:"Criar Issues no Jira",terminalCommand:"",icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>'}];var G=class{constructor(e){this._totalSteps=e}_currentStep=1;_completedSteps=new Set;_onChange;onStateChange(e){this._onChange=e}completeStep(e){this._completedSteps.add(e),e<this._totalSteps&&(this._currentStep=e+1),this._notify()}getCurrentStep(){return this._currentStep}getCompletedSteps(){return Array.from(this._completedSteps)}reset(){this._currentStep=1,this._completedSteps.clear(),this._notify()}_notify(){this._onChange?.(this._currentStep,this.getCompletedSteps())}};function he(i){return process.platform==="win32"?`"${i.replace(/[`$]/g,"\\$&")}"`:`'${i.replace(/'/g,"'\\''")}'`}function k(i){return`
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
            background: var(--vscode-editor-background);
            padding: 32px;
        }

        .stage-header {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 32px;
            padding-bottom: 24px;
            border-bottom: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
        }

        .stage-icon {
            width: 48px;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 12px;
            background: color-mix(in srgb, ${i} 15%, transparent);
            padding: 10px;
        }

        .stage-icon svg {
            width: 28px;
            height: 28px;
            stroke: ${i};
        }

        .stage-title h1 {
            font-size: 22px;
            font-weight: 700;
            margin-bottom: 4px;
        }

        .stage-title p {
            font-size: 14px;
            color: var(--vscode-descriptionForeground);
        }
    `}var fe=v(require("crypto"));function h(){return fe.randomBytes(16).toString("base64url")}function b(i){return`default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${i}';`}function x(i){let e=i.lang??"pt-BR",t=i.title??"",r=i.script&&i.nonce?`
    <script nonce="${i.nonce}">${i.script}</script>`:"";return`<!DOCTYPE html>
<html lang="${e}">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Security-Policy" content="${i.csp}">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${t}</title>
    <style>${i.styles}</style>
</head>
<body>
    ${i.body}${r}
</body>
</html>`}function be(i,e,t){let r=h(),o=b(r),s=e.map((d,l)=>{let p=l===0,m=l===e.length-1,g=d.id===5;return`
            <div class="step" data-step="${d.id}" data-status="${p?"active":"locked"}">
                <div class="step-indicator">
                    <div class="step-connector-top ${p?"hidden":""}"></div>
                    <div class="step-number">
                        <span class="step-number-text">${d.id}</span>
                        <span class="step-check hidden">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        </span>
                    </div>
                    <div class="step-connector-bottom ${m?"hidden":""}"></div>
                </div>
                <div class="step-content">
                    <div class="step-header">
                        <div class="step-icon">${d.icon}</div>
                        <div class="step-info">
                            <h3>${d.title}</h3>
                            <p>${d.description}</p>
                        </div>
                    </div>
                    <div class="step-actions">
                        <button class="btn-execute" data-step="${d.id}" ${g?'data-jira="true"':""}>
                            ${d.buttonLabel}
                        </button>
                        <button class="btn-complete" data-step="${d.id}">
                            Marcar como conclu\xEDdo
                        </button>
                    </div>
                </div>
            </div>`}).join(`
`),n=k(i.color)+`
        .stepper {
            display: flex;
            flex-direction: column;
            gap: 0;
        }

        .step {
            display: flex;
            gap: 16px;
            position: relative;
        }

        .step-indicator {
            display: flex;
            flex-direction: column;
            align-items: center;
            flex-shrink: 0;
            width: 36px;
        }

        .step-connector-top,
        .step-connector-bottom {
            width: 2px;
            flex: 1;
            min-height: 12px;
            background: var(--vscode-panel-border, var(--vscode-widget-border));
            transition: background 0.3s ease;
        }

        .step-connector-top.hidden,
        .step-connector-bottom.hidden {
            visibility: hidden;
        }

        .step-number {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: 700;
            border: 2px solid var(--vscode-panel-border, var(--vscode-widget-border));
            background: var(--vscode-editor-background);
            color: var(--vscode-descriptionForeground);
            transition: all 0.3s ease;
            flex-shrink: 0;
        }

        .step-check {
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .step-check svg {
            width: 18px;
            height: 18px;
        }

        .hidden {
            display: none;
        }

        .step[data-status="active"] .step-number {
            border-color: ${i.color};
            background: color-mix(in srgb, ${i.color} 15%, transparent);
            color: ${i.color};
        }

        .step[data-status="completed"] .step-number {
            border-color: #10b981;
            background: #10b981;
            color: white;
        }

        .step[data-status="completed"] .step-number .step-number-text {
            display: none;
        }

        .step[data-status="completed"] .step-number .step-check {
            display: flex;
        }

        .step[data-status="completed"] .step-connector-top,
        .step[data-status="completed"] .step-connector-bottom {
            background: #10b981;
        }

        .step[data-status="active"] .step-connector-top {
            background: #10b981;
        }

        .step[data-status="locked"] .step-content {
            opacity: 0.5;
        }

        .step[data-status="locked"] .btn-execute,
        .step[data-status="locked"] .btn-complete {
            pointer-events: none;
            opacity: 0.4;
        }

        .step-content {
            flex: 1;
            padding-bottom: 24px;
            transition: opacity 0.3s ease;
        }

        .step-header {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            margin-bottom: 12px;
        }

        .step-icon {
            width: 32px;
            height: 32px;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            background: color-mix(in srgb, ${i.color} 10%, transparent);
            padding: 6px;
        }

        .step-icon svg {
            width: 20px;
            height: 20px;
            stroke: ${i.color};
        }

        .step-info h3 {
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 4px;
        }

        .step-info p {
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
            line-height: 1.5;
        }

        .step-actions {
            display: flex;
            gap: 8px;
            margin-top: 12px;
        }

        .btn-execute {
            padding: 6px 14px;
            border: none;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            background: ${i.color};
            color: #fff;
            font-family: inherit;
            transition: opacity 0.15s ease;
        }

        .btn-execute:hover {
            opacity: 0.85;
        }

        .btn-complete {
            padding: 6px 14px;
            border: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            background: transparent;
            color: var(--vscode-foreground);
            font-family: inherit;
            transition: all 0.15s ease;
        }

        .btn-complete:hover {
            background: var(--vscode-list-hoverBackground);
        }

        .step[data-status="completed"] .btn-execute {
            display: none;
        }

        .step[data-status="completed"] .btn-complete {
            border-color: #10b981;
            color: #10b981;
            pointer-events: none;
        }

        .step[data-status="completed"] .btn-complete::before {
            content: "\\2713  ";
        }

        .progress-bar {
            margin-bottom: 24px;
            padding: 12px 16px;
            border-radius: 8px;
            background: var(--vscode-sideBar-background, var(--vscode-editor-background));
            border: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
        }

        .progress-bar .progress-text {
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
            margin-bottom: 8px;
        }

        .progress-bar .progress-track {
            height: 4px;
            border-radius: 2px;
            background: var(--vscode-panel-border, var(--vscode-widget-border));
            overflow: hidden;
        }

        .progress-bar .progress-fill {
            height: 100%;
            border-radius: 2px;
            background: ${i.color};
            transition: width 0.4s ease;
        }
    `,c=`
    <div class="stage-header">
        <div class="stage-icon">${i.icon}</div>
        <div class="stage-title">
            <h1>${i.title}</h1>
            <p>${i.description}</p>
        </div>
    </div>

    <div class="progress-bar">
        <div class="progress-text"><span id="progressCount">0</span> de ${t} etapas conclu\xEDdas</div>
        <div class="progress-track">
            <div class="progress-fill" id="progressFill" style="width: 0%"></div>
        </div>
    </div>

    <div class="stepper">
        ${s}
    </div>`,a=`
        const vscodeApi = acquireVsCodeApi();
        const totalSteps = ${t};

        let state = {
            currentStep: 1,
            completedSteps: []
        };

        function updateUI() {
            const steps = document.querySelectorAll('.step');
            steps.forEach(stepEl => {
                const stepNum = parseInt(stepEl.getAttribute('data-step'));
                if (state.completedSteps.includes(stepNum)) {
                    stepEl.setAttribute('data-status', 'completed');
                } else if (stepNum === state.currentStep) {
                    stepEl.setAttribute('data-status', 'active');
                } else if (stepNum < state.currentStep) {
                    stepEl.setAttribute('data-status', 'active');
                } else {
                    stepEl.setAttribute('data-status', 'locked');
                }
            });

            const completedCount = state.completedSteps.length;
            document.getElementById('progressCount').textContent = completedCount;
            document.getElementById('progressFill').style.width = (completedCount / totalSteps * 100) + '%';
        }

        document.querySelectorAll('.btn-execute').forEach(btn => {
            btn.addEventListener('click', () => {
                const stepNum = parseInt(btn.getAttribute('data-step'));
                const isJira = btn.getAttribute('data-jira') === 'true';
                if (isJira) {
                    vscodeApi.postMessage({ command: 'openJiraDialog', stepNumber: stepNum });
                } else {
                    vscodeApi.postMessage({ command: 'executeStep', stepNumber: stepNum });
                }
            });
        });

        document.querySelectorAll('.btn-complete').forEach(btn => {
            btn.addEventListener('click', () => {
                const stepNum = parseInt(btn.getAttribute('data-step'));
                vscodeApi.postMessage({ command: 'markStepComplete', stepNumber: stepNum });
            });
        });

        window.addEventListener('message', event => {
            const message = event.data;
            if (message.command === 'updateState') {
                state.currentStep = message.currentStep;
                state.completedSteps = message.completedSteps;
                updateUI();
            }
        });

        updateUI();
    `;return x({csp:o,styles:n,body:c,script:a,nonce:r,title:"Esteira - Produto"})}var W=class{constructor(e){this._terminalService=e;this._stateManager=new G(J.length)}_panel;_stateManager;open(e){if(this._panel){this._panel.reveal(P.ViewColumn.One);return}let t=P.window.createWebviewPanel("esteira.produto","Esteira - Produto",P.ViewColumn.One,{enableScripts:!0,retainContextWhenHidden:!0});this._panel=t,t.webview.html=be(e,J,J.length),this._stateManager.onStateChange((r,o)=>{t.webview.postMessage({command:"updateState",currentStep:r,completedSteps:o})}),t.webview.onDidReceiveMessage(r=>{try{switch(r.command){case"executeStep":this._executeProdutoStep(r.stepNumber);break;case"markStepComplete":this._stateManager.completeStep(r.stepNumber);break;case"openJiraDialog":this._handleJiraStep();break}}catch(o){let s=o instanceof Error?o.message:String(o);P.window.showErrorMessage(`Erro no painel Produto: ${s}`)}}),t.onDidDispose(()=>{this._panel=void 0})}_executeProdutoStep(e){let t=J.find(r=>r.id===e);t&&this._terminalService.sendCommand("Esteira - Produto",t.terminalCommand)}async _handleJiraStep(){try{let e=await P.window.showInputBox({prompt:"Digite a chave do projeto Jira (ex: PROJ, GROWTH, MYAPP)",placeHolder:"PROJ",validateInput:r=>{if(!r||r.trim().length===0)return"A chave do projeto \xE9 obrigat\xF3ria";if(!/^[A-Z][A-Z0-9_]+$/.test(r.trim()))return"Use letras mai\xFAsculas e n\xFAmeros (ex: PROJ, MY_APP)"}});if(!e)return;let t=he(e.trim());this._terminalService.sendCommand("Esteira - Produto",`claude "Leia docs/issues.md e crie as issues no Jira no projeto ${t}. Use a API do Jira via MCP. Crie primeiro os \xE9picos, depois as tasks vinculadas e por fim as subtasks. Mantenha a hierarquia definida no arquivo."`)}catch(e){let t=e instanceof Error?e.message:String(e);P.window.showErrorMessage(`Erro ao criar issues no Jira: ${t}`)}}};var _=v(require("fs")),Ce=v(require("os")),I=v(require("path")),u=v(require("vscode")),Ee=require("child_process");var qe=["Clean Code & Legibilidade","SOLID","DRY & Reutiliza\xE7\xE3o","Tratamento de Erros","Performance","Testabilidade","Arquitetura & Padr\xF5es"],Ve=["Injection","XSS","Auth & Autoriza\xE7\xE3o","Dados Sens\xEDveis","Depend\xEAncias","OWASP Top 10","Config Seguran\xE7a"];function F(i){return Math.round(Math.min(10,Math.max(0,i))*10)/10}function X(i){if(i.length===0)return 0;let e=i.reduce((t,r)=>t+r.score,0);return F(e/i.length)}function Ge(i){let e=i.match(/<!--\s*SCORES_JSON\s*([\s\S]*?)-->/);if(!e)return null;try{let t=JSON.parse(e[1].trim()),r=(t.qualityScores??[]).map(s=>({name:s.name??"",score:F(Number(s.score)||0),justification:s.justification??""})),o=(t.securityScores??[]).map(s=>({name:s.name??"",score:F(Number(s.score)||0),justification:s.justification??""}));return{qualityScores:r,securityScores:o,qualityAvg:F(Number(t.qualityAvg)||X(r)),securityAvg:F(Number(t.securityAvg)||X(o)),finalScore:F(Number(t.finalScore)||0),criticalProblems:Array.isArray(t.criticalProblems)?t.criticalProblems:[],recommendations:Array.isArray(t.recommendations)?t.recommendations:[]}}catch{return null}}function xe(i){let e=i.match(/(\d+(?:\.\d+)?)\s*\/\s*10/);return e?F(Number(e[1])):0}function we(i,e){let t=i.toLowerCase();for(let r of e)if(t.includes(r.toLowerCase()))return r;return null}function ye(i,e){let t=[],r=i.match(e);if(!r)return t;let o=r.index+r[0].length,n=i.substring(o).split(`
`);for(let c of n){let a=c.trim();if(a.startsWith("#"))break;let d=a.match(/^[-*\d.]+\s*\.?\s*\*{0,2}(.+)/);d&&t.push(d[1].replace(/\*{1,2}/g,"").trim())}return t}function We(i){let e=[],t=[],r=i.split(`
`);for(let d of r){if(!d.includes("/10"))continue;let l=we(d,qe);if(l){e.push({name:l,score:xe(d),justification:d.replace(/\|/g,"").trim()});continue}let p=we(d,Ve);p&&t.push({name:p,score:xe(d),justification:d.replace(/\|/g,"").trim()})}let o=X(e),s=X(t),n=F(o*.4+s*.6),c=ye(i,/###?\s*TOP\s*3\s*PROBLEMAS\s*CR[ÍI]TICOS/i),a=ye(i,/###?\s*RECOMENDA[ÇC][ÕO]ES\s*PRIORIT[ÁA]RIAS/i);return{qualityScores:e,securityScores:t,qualityAvg:o,securityAvg:s,finalScore:n,criticalProblems:c,recommendations:a}}function ke(i,e,t){let r={path:e,timestamp:Date.now(),durationMs:t,qualityScores:[],securityScores:[],qualityAvg:0,securityAvg:0,finalScore:0,criticalProblems:[],recommendations:[],rawOutput:i},o=Ge(i);if(o&&(o.qualityScores?.length||o.securityScores?.length))return{...r,...o};let s=We(i);return{...r,...s}}var H=require("child_process"),K=v(require("vscode")),D=class{_workspaceRoot;constructor(e){this._workspaceRoot=e??this._getDefaultWorkspaceRoot()}get workspaceRoot(){return this._workspaceRoot}_getDefaultWorkspaceRoot(){let e=K.workspace.workspaceFolders;if(!e||e.length===0)throw new Error("Nenhum workspace aberto.");return e[0].uri.fsPath}getWorkspaceRoot(){return this._workspaceRoot}getGitUser(){let e="",t="";try{e=this._exec("git config user.name").trim()}catch{}try{t=this._exec("git config user.email").trim()}catch{}return{name:e,email:t}}isGitRepo(){try{return this._exec("git rev-parse --is-inside-work-tree"),!0}catch{return!1}}initRepo(){this._exec("git init")}getRemoteUrl(){try{return this._exec("git remote get-url origin").trim()||null}catch{return null}}addRemote(e){if(/[;&|`$(){}!<>\\]/.test(e))throw new Error(`URL inv\xE1lida: "${e}"`);this._exec(`git remote add origin "${e.replace(/"/g,'\\"')}"`)}isGhAuthenticated(){try{return(0,H.execSync)("gh auth status",{cwd:this._workspaceRoot,encoding:"utf8",timeout:1e4,stdio:"pipe"}),!0}catch{return!1}}ghGetUser(){try{return(0,H.execSync)("gh api user -q .login",{cwd:this._workspaceRoot,encoding:"utf8",timeout:1e4,stdio:"pipe"}).trim()||null}catch{return null}}ghCreateRepo(e,t){if(/[;&|`$(){}!<>\\]/.test(e))throw new Error(`Nome de reposit\xF3rio inv\xE1lido: "${e}"`);let r=t?"--private":"--public";(0,H.execSync)(`gh repo create "${e.replace(/"/g,'\\"')}" ${r} --source=. --push`,{cwd:this._workspaceRoot,encoding:"utf8",timeout:3e4})}ghLogin(){let e=K.window.createTerminal({name:"GitHub Login",cwd:this._workspaceRoot});e.sendText("gh auth login"),e.show()}getCurrentBranch(){return this._exec("git branch --show-current").trim()}getBranches(){return this._exec("git branch --list").split(`
`).map(t=>t.replace(/^\*?\s+/,"").trim()).filter(t=>t.length>0)}switchBranch(e){this._exec(`git switch ${this._sanitize(e)}`)}createBranch(e){this._exec(`git switch -c ${this._sanitize(e)}`)}getStatus(){let e=this._exec("git status --porcelain");return e.trim()?e.split(`
`).filter(t=>t.length>0).map(t=>{let r=t[0],o=t[1],s=t.substring(3).trim(),n=r!==" "&&r!=="?",c;return n?c=r==="?"?"??":r:c=o==="?"?"??":o,{file:s,status:c,staged:n}}):[]}stageFile(e){this._exec(`git add -- ${this._sanitize(e)}`)}unstageFile(e){this._exec(`git restore --staged -- ${this._sanitize(e)}`)}stageAll(){this._exec("git add -A")}unstageAll(){this._exec("git reset HEAD")}commit(e){if(!e.trim())throw new Error("Mensagem de commit n\xE3o pode ser vazia.");(0,H.execSync)("git commit -F -",{cwd:this._workspaceRoot,encoding:"utf8",input:e})}getDiffCached(){return this._exec("git diff --cached")}_exec(e){try{return(0,H.execSync)(e,{cwd:this._workspaceRoot,encoding:"utf8",timeout:1e4})}catch(t){let r=t instanceof Error?t.message:String(t);throw new Error(`Erro ao executar "${e}": ${r}`)}}_sanitize(e){if(/[;&|`$(){}!<>\\]/.test(e))throw new Error(`Valor inv\xE1lido: "${e}"`);return`"${e.replace(/"/g,'\\"')}"`}};function Se(i){let e=h(),t=b(e),o=[{id:"desenvolver",title:"Desenvolver",description:"Implementa\xE7\xE3o e codifica\xE7\xE3o das features planejadas.",subtitle:"Funcionalidade dispon\xEDvel em breve",active:!1,icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',features:[]},{id:"codereview",title:"Code Review",description:"Revis\xE3o de c\xF3digo com an\xE1lise de qualidade e seguran\xE7a usando IA. Gera nota de 0 a 10.",subtitle:"Iniciar Review",active:!0,icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',features:[{icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 12 2 2 4-4"/></svg>',label:"Qualidade"},{icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',label:"Seguran\xE7a"},{icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>',label:"Nota 0-10"}]},{id:"commit",title:"Commit",description:"Gera\xE7\xE3o de commits sem\xE2nticos e padronizados.",subtitle:"Criar Commit",active:!0,icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><line x1="1.05" y1="12" x2="7" y2="12"/><line x1="17.01" y1="12" x2="22.96" y2="12"/></svg>',features:[{icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>',label:"Branches"},{icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',label:"Stage"},{icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><line x1="1.05" y1="12" x2="7" y2="12"/><line x1="17.01" y1="12" x2="22.96" y2="12"/></svg>',label:"Commit"}]}].map(a=>`
            <div class="dev-card ${a.active?"dev-card-active":""}" data-card="${a.id}">
                <div class="dev-card-icon">${a.icon}</div>
                <div class="dev-card-body">
                    <h3>${a.title}</h3>
                    <p class="dev-card-desc">${a.description}</p>
                    ${a.active&&a.features.length>0?`<div class="dev-card-features">
                            ${a.features.map(d=>`<span class="dev-card-feature-tag">${d.icon} ${d.label}</span>`).join(`
                            `)}
                        </div>`:a.active?"":`<span class="dev-card-badge">${a.subtitle}</span>`}
                </div>
            </div>
        `).join(`
`),s=k(i.color)+`
        .dev-cards-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
            gap: 16px;
        }

        .dev-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            padding: 28px 20px;
            border: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
            border-radius: 10px;
            background: var(--vscode-sideBar-background, var(--vscode-editor-background));
            transition: border-color 0.15s ease;
        }

        .dev-card:hover {
            border-color: ${i.color};
        }

        .dev-card-icon {
            width: 48px;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 12px;
            background: color-mix(in srgb, ${i.color} 12%, transparent);
            padding: 10px;
            margin-bottom: 16px;
        }

        .dev-card-icon svg {
            width: 28px;
            height: 28px;
            stroke: ${i.color};
        }

        .dev-card-body h3 {
            font-size: 15px;
            font-weight: 600;
            margin-bottom: 6px;
        }

        .dev-card-desc {
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
            line-height: 1.5;
            margin-bottom: 14px;
        }

        .dev-card-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
            background: color-mix(in srgb, ${i.color} 15%, transparent);
            color: ${i.color};
            letter-spacing: 0.3px;
        }

        .dev-card-active {
            cursor: pointer;
            border-color: color-mix(in srgb, ${i.color} 40%, transparent);
        }

        .dev-card-active:hover {
            border-color: ${i.color};
            box-shadow: 0 0 0 1px color-mix(in srgb, ${i.color} 30%, transparent);
        }

        .dev-card-btn {
            display: inline-block;
            padding: 8px 20px;
            border: none;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            background: ${i.color};
            color: #fff;
            font-family: inherit;
            transition: opacity 0.15s ease, transform 0.1s ease;
            letter-spacing: 0.3px;
        }

        .dev-card-btn:hover {
            opacity: 0.85;
        }

        .dev-card-btn:active {
            transform: scale(0.97);
        }

        .dev-card-features {
            display: flex;
            gap: 6px;
            margin-top: 8px;
            margin-bottom: 14px;
            flex-wrap: wrap;
            justify-content: center;
        }

        .dev-card-feature-tag {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 500;
            background: var(--vscode-badge-background, rgba(255,255,255,0.08));
            color: var(--vscode-badge-foreground, var(--vscode-descriptionForeground));
        }

        .dev-card-feature-tag svg {
            width: 10px;
            height: 10px;
        }
    `,n=`
    <div class="stage-header">
        <div class="stage-icon">${i.icon}</div>
        <div class="stage-title">
            <h1>${i.title}</h1>
            <p>${i.description}</p>
        </div>
    </div>

    <div class="dev-cards-grid">
        ${o}
    </div>`;return x({csp:t,styles:s,body:n,script:`
        const vscode = acquireVsCodeApi();

        document.querySelectorAll('.dev-card-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.getAttribute('data-action');
                if (action === 'codereview') {
                    vscode.postMessage({ command: 'openCodeReview' });
                }
            });
        });

        document.querySelectorAll('.dev-card-active').forEach(card => {
            card.addEventListener('click', () => {
                const cardId = card.getAttribute('data-card');
                if (cardId === 'codereview') {
                    vscode.postMessage({ command: 'openCodeReview' });
                } else if (cardId === 'commit') {
                    vscode.postMessage({ command: 'openCommit' });
                }
            });
        });
    `,nonce:e,title:"Esteira - Desenvolvimento"})}var w="#3b82f6",Xe='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><line x1="1.05" y1="12" x2="7" y2="12"/><line x1="17.01" y1="12" x2="22.96" y2="12"/></svg>';function y(i){return i.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function Ke(i){switch(i){case"M":return"Modificado";case"A":return"Adicionado";case"D":return"Deletado";case"R":return"Renomeado";case"??":return"N\xE3o rastreado";default:return i}}function Ye(i){switch(i){case"M":return"#eab308";case"A":return"#22c55e";case"D":return"#ef4444";case"R":return"#a78bfa";case"??":return"#6b7280";default:return"#9ca3af"}}function de(i){let e=h(),t=b(e),r=i.branches.map(p=>`<option value="${y(p)}" ${p===i.currentBranch?"selected":""}>${y(p)}</option>`).join(""),o=i.files.filter(p=>p.staged),s=i.files.filter(p=>!p.staged),n=(p,m)=>p.length===0?`<div class="empty-list">Nenhum arquivo ${m?"staged":"alterado"}</div>`:p.map(g=>`
            <label class="file-item" data-file="${y(g.file)}" data-staged="${m}">
                <input type="checkbox" ${m?"checked":""} data-action="${m?"unstage":"stage"}" data-file="${y(g.file)}" />
                <span class="file-status" style="color: ${Ye(g.status)}" title="${Ke(g.status)}">${y(g.status)}</span>
                <span class="file-name">${y(g.file)}</span>
            </label>
        `).join(""),c=k(w)+`
        .commit-container { max-width: 720px; margin: 0 auto; }

        .meta-card {
            border: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 16px;
            background: var(--vscode-sideBar-background, var(--vscode-editor-background));
            transition: border-color 0.15s ease;
        }
        .meta-card:hover {
            border-color: color-mix(in srgb, ${w} 50%, transparent);
        }

        .card-title {
            font-size: 13px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            color: ${w};
            margin-bottom: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .card-title svg {
            width: 14px; height: 14px; stroke: ${w};
        }

        /* \u2500\u2500 Branch Section \u2500\u2500 */
        .branch-row {
            display: flex;
            gap: 10px;
            align-items: center;
            flex-wrap: wrap;
        }
        .branch-select, .branch-input {
            flex: 1;
            min-width: 160px;
            padding: 8px 12px;
            border-radius: 6px;
            border: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
            background: var(--vscode-input-background, var(--vscode-editor-background));
            color: var(--vscode-input-foreground, var(--vscode-foreground));
            font-family: inherit;
            font-size: 13px;
        }
        .branch-select:focus, .branch-input:focus {
            outline: none;
            border-color: ${w};
        }
        .branch-current {
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .branch-current-name {
            font-weight: 600;
            color: ${w};
            font-family: var(--vscode-editor-font-family, monospace);
        }

        /* \u2500\u2500 Files Section \u2500\u2500 */
        .files-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        .files-actions {
            display: flex;
            gap: 6px;
        }
        .file-section-title {
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--vscode-descriptionForeground);
            margin: 12px 0 6px;
        }
        .file-section-title:first-child { margin-top: 0; }

        .file-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 5px 8px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            transition: background 0.1s ease;
        }
        .file-item:hover {
            background: color-mix(in srgb, var(--vscode-foreground) 6%, transparent);
        }
        .file-item input[type="checkbox"] {
            accent-color: ${w};
            cursor: pointer;
        }
        .file-status {
            font-family: var(--vscode-editor-font-family, monospace);
            font-size: 11px;
            font-weight: 700;
            min-width: 20px;
            text-align: center;
        }
        .file-name {
            font-family: var(--vscode-editor-font-family, monospace);
            font-size: 12px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .empty-list {
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
            opacity: 0.7;
            padding: 8px 0;
            font-style: italic;
        }
        .file-count {
            font-size: 11px;
            font-weight: 600;
            color: var(--vscode-descriptionForeground);
            background: color-mix(in srgb, var(--vscode-foreground) 8%, transparent);
            padding: 2px 8px;
            border-radius: 10px;
        }

        /* \u2500\u2500 Commit Section \u2500\u2500 */
        .commit-textarea {
            width: 100%;
            min-height: 100px;
            padding: 10px 12px;
            border-radius: 6px;
            border: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
            background: var(--vscode-input-background, var(--vscode-editor-background));
            color: var(--vscode-input-foreground, var(--vscode-foreground));
            font-family: var(--vscode-editor-font-family, monospace);
            font-size: 13px;
            resize: vertical;
            line-height: 1.5;
        }
        .commit-textarea:focus {
            outline: none;
            border-color: ${w};
        }
        .commit-textarea::placeholder {
            color: var(--vscode-descriptionForeground);
            opacity: 0.6;
        }
        .commit-actions {
            display: flex;
            gap: 8px;
            margin-top: 12px;
            justify-content: flex-end;
            flex-wrap: wrap;
        }

        /* \u2500\u2500 Buttons \u2500\u2500 */
        .btn-execute {
            padding: 8px 20px;
            border: none;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            font-family: inherit;
            background: ${w};
            color: #fff;
            transition: opacity 0.15s ease, transform 0.1s ease;
            letter-spacing: 0.3px;
        }
        .btn-execute:hover { opacity: 0.85; }
        .btn-execute:active { transform: scale(0.97); }
        .btn-execute:disabled {
            opacity: 0.4;
            cursor: not-allowed;
        }

        .btn-complete {
            padding: 8px 20px;
            border: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
            border-radius: 6px;
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            font-family: inherit;
            background: transparent;
            color: var(--vscode-foreground);
            transition: background 0.15s ease;
        }
        .btn-complete:hover {
            background: color-mix(in srgb, var(--vscode-foreground) 10%, transparent);
        }
        .btn-complete:disabled {
            opacity: 0.4;
            cursor: not-allowed;
        }

        .btn-small {
            padding: 4px 12px;
            font-size: 11px;
        }

        .btn-ai {
            background: linear-gradient(135deg, #8b5cf6, #6366f1);
            border: none;
            color: #fff;
        }
        .btn-ai:hover { opacity: 0.85; }

        /* \u2500\u2500 Back \u2500\u2500 */
        .back-link {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
            cursor: pointer;
            margin-bottom: 20px;
            border: none;
            background: none;
            font-family: inherit;
            padding: 4px 0;
        }
        .back-link:hover { color: var(--vscode-foreground); }
        .back-link svg { width: 14px; height: 14px; }

        /* \u2500\u2500 Error \u2500\u2500 */
        .error-banner {
            background: color-mix(in srgb, #ef4444 12%, transparent);
            border: 1px solid color-mix(in srgb, #ef4444 30%, transparent);
            border-radius: 8px;
            padding: 12px 16px;
            margin-bottom: 16px;
            font-size: 12px;
            color: #ef4444;
        }

        /* \u2500\u2500 Repo Section \u2500\u2500 */
        .repo-user-row {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 12px;
            margin-bottom: 12px;
            color: var(--vscode-foreground);
        }
        .repo-user-row .user-icon {
            width: 14px; height: 14px;
            opacity: 0.8;
        }
        .repo-user-row .gh-user {
            color: var(--vscode-descriptionForeground);
        }
        .repo-folder-row {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 12px;
        }
        .repo-folder-row .folder-icon { font-size: 14px; }
        .folder-select {
            flex: 1;
            padding: 6px 10px;
            border-radius: 6px;
            border: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
            background: var(--vscode-input-background, var(--vscode-editor-background));
            color: var(--vscode-input-foreground, var(--vscode-foreground));
            font-family: inherit;
            font-size: 12px;
        }
        .folder-select:focus {
            outline: none;
            border-color: ${w};
        }
        .repo-remote-row {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
            margin-bottom: 12px;
            word-break: break-all;
        }
        .repo-remote-row a {
            color: ${w};
            text-decoration: none;
        }
        .repo-remote-row a:hover {
            text-decoration: underline;
        }
        .repo-actions {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
        }
        .remote-input {
            flex: 1;
            min-width: 200px;
            padding: 6px 10px;
            border-radius: 6px;
            border: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
            background: var(--vscode-input-background, var(--vscode-editor-background));
            color: var(--vscode-input-foreground, var(--vscode-foreground));
            font-family: var(--vscode-editor-font-family, monospace);
            font-size: 12px;
        }
        .remote-input:focus {
            outline: none;
            border-color: ${w};
        }
        .remote-input-row {
            display: none;
            gap: 8px;
            align-items: center;
            margin-top: 10px;
        }
        .remote-input-row.visible {
            display: flex;
        }

        /* \u2500\u2500 Loading Indicator \u2500\u2500 */
        .ai-loading {
            display: none;
            align-items: center;
            gap: 8px;
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
            margin-top: 8px;
        }
        .ai-loading.visible { display: flex; }
        .ai-spinner {
            width: 14px; height: 14px;
            border: 2px solid color-mix(in srgb, ${w} 20%, transparent);
            border-top-color: ${w};
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
    `,a=i.error?`<div class="error-banner">${y(i.error)}</div>`:"",d=`
    <button class="back-link" id="backBtn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        Voltar ao menu
    </button>

    <div class="stage-header">
        <div class="stage-icon">${Xe}</div>
        <div class="stage-title">
            <h1>Commit</h1>
            <p>Gerencie branches, selecione arquivos e crie commits</p>
        </div>
    </div>

    ${a}

    <div class="commit-container">
        <!-- Repository Section -->
        <div class="meta-card">
            <div class="card-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65S8.93 17.38 9 18v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
                Reposit\xF3rio
            </div>

            ${i.gitUser.name||i.gitUser.email?`
            <div class="repo-user-row">
                <svg class="user-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <span>${y(i.gitUser.name)}${i.gitUser.email?` &lt;${y(i.gitUser.email)}&gt;`:""}</span>
                ${i.ghUser?`<span class="gh-user">&middot; @${y(i.ghUser)}</span>`:""}
            </div>`:""}

            ${i.workspaceFolders.length>1?`
            <div class="repo-folder-row">
                <span class="folder-icon">\u{1F4C1}</span>
                <select class="folder-select" id="folderSelect">
                    ${i.workspaceFolders.map(p=>`<option value="${y(p.path)}" ${p.path===i.selectedFolder?"selected":""}>${y(p.name)}</option>`).join("")}
                </select>
            </div>`:""}

            ${i.isGitRepo?i.remoteUrl?`
            <div class="repo-remote-row">
                <svg style="width:14px;height:14px;flex-shrink:0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                <span>${y(i.remoteUrl)}</span>
            </div>`:`
            <div class="repo-actions">
                <button class="btn-execute btn-small" id="ghCreateRepoBtn">Criar Repo no GitHub</button>
                <button class="btn-complete btn-small" id="showAddRemoteBtn">Vincular Repo Existente</button>
            </div>
            <div class="remote-input-row" id="addRemoteRow">
                <input type="text" class="remote-input" id="remoteUrlInput" placeholder="https://github.com/user/repo.git" />
                <button class="btn-execute btn-small" id="addRemoteBtn">Vincular</button>
            </div>`:`
            <div class="repo-actions">
                <button class="btn-execute btn-small" id="initRepoBtn">Inicializar Git</button>
            </div>`}
        </div>

        <!-- Branch Section -->
        <div class="meta-card">
            <div class="card-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>
                Branch
            </div>
            <div class="branch-current">
                Branch atual: <span class="branch-current-name">${y(i.currentBranch)}</span>
            </div>
            <div class="branch-row">
                <select class="branch-select" id="branchSelect">
                    ${r}
                </select>
                <button class="btn-execute btn-small" id="switchBranchBtn">Trocar</button>
            </div>
            <div class="branch-row" style="margin-top: 10px;">
                <input type="text" class="branch-input" id="newBranchInput" placeholder="Nome da nova branch..." />
                <button class="btn-complete btn-small" id="createBranchBtn">Criar Branch</button>
            </div>
        </div>

        <!-- Changed Files Section -->
        <div class="meta-card">
            <div class="files-header">
                <div class="card-title" style="margin-bottom: 0;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    Arquivos Alterados
                    <span class="file-count">${i.files.length}</span>
                </div>
                <div class="files-actions">
                    <button class="btn-complete btn-small" id="stageAllBtn">Marcar Todos</button>
                    <button class="btn-complete btn-small" id="unstageAllBtn">Desmarcar Todos</button>
                    <button class="btn-complete btn-small" id="refreshBtn" title="Atualizar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px;height:12px;vertical-align:middle"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
                    </button>
                </div>
            </div>

            <div class="file-section-title">Staged (${o.length})</div>
            ${n(o,!0)}

            <div class="file-section-title">Unstaged (${s.length})</div>
            ${n(s,!1)}
        </div>

        <!-- Commit Message Section -->
        <div class="meta-card">
            <div class="card-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Mensagem de Commit
            </div>
            <textarea class="commit-textarea" id="commitMessage" placeholder="Descreva suas altera\xE7\xF5es..."></textarea>
            <div class="ai-loading" id="aiLoading">
                <div class="ai-spinner"></div>
                Gerando mensagem com IA...
            </div>
            <div class="commit-actions">
                <button class="btn-execute btn-small btn-ai" id="generateMsgBtn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px;height:12px;vertical-align:middle;margin-right:4px"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                    Gerar com IA
                </button>
                <button class="btn-execute" id="commitBtn" ${o.length===0?"disabled":""}>Commit</button>
            </div>
        </div>
    </div>`,l=`
        const vscode = acquireVsCodeApi();

        // \u2500\u2500 Back \u2500\u2500
        document.getElementById('backBtn').addEventListener('click', () => {
            vscode.postMessage({ command: 'backToMenu' });
        });

        // \u2500\u2500 Repository \u2500\u2500
        const folderSelect = document.getElementById('folderSelect');
        if (folderSelect) {
            folderSelect.addEventListener('change', () => {
                vscode.postMessage({ command: 'selectFolder', path: folderSelect.value });
            });
        }

        const initRepoBtn = document.getElementById('initRepoBtn');
        if (initRepoBtn) {
            initRepoBtn.addEventListener('click', () => {
                vscode.postMessage({ command: 'initRepo' });
            });
        }

        const ghCreateRepoBtn = document.getElementById('ghCreateRepoBtn');
        if (ghCreateRepoBtn) {
            ghCreateRepoBtn.addEventListener('click', () => {
                vscode.postMessage({ command: 'ghCreateRepo' });
            });
        }

        const showAddRemoteBtn = document.getElementById('showAddRemoteBtn');
        if (showAddRemoteBtn) {
            showAddRemoteBtn.addEventListener('click', () => {
                const row = document.getElementById('addRemoteRow');
                if (row) { row.classList.toggle('visible'); }
            });
        }

        const addRemoteBtn = document.getElementById('addRemoteBtn');
        if (addRemoteBtn) {
            addRemoteBtn.addEventListener('click', () => {
                const input = document.getElementById('remoteUrlInput');
                const url = input ? input.value.trim() : '';
                if (url) {
                    vscode.postMessage({ command: 'addRemote', url });
                }
            });
        }

        const remoteUrlInput = document.getElementById('remoteUrlInput');
        if (remoteUrlInput) {
            remoteUrlInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && addRemoteBtn) { addRemoteBtn.click(); }
            });
        }

        // \u2500\u2500 Branch \u2500\u2500
        document.getElementById('switchBranchBtn').addEventListener('click', () => {
            const branch = document.getElementById('branchSelect').value;
            vscode.postMessage({ command: 'switchBranch', branch });
        });

        document.getElementById('createBranchBtn').addEventListener('click', () => {
            const name = document.getElementById('newBranchInput').value.trim();
            if (name) {
                vscode.postMessage({ command: 'createBranch', branch: name });
            }
        });

        document.getElementById('newBranchInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('createBranchBtn').click();
            }
        });

        // \u2500\u2500 Files \u2500\u2500
        document.querySelectorAll('.file-item input[type="checkbox"]').forEach(cb => {
            cb.addEventListener('change', () => {
                const action = cb.getAttribute('data-action');
                const file = cb.getAttribute('data-file');
                if (action === 'stage') {
                    vscode.postMessage({ command: 'stageFile', file });
                } else {
                    vscode.postMessage({ command: 'unstageFile', file });
                }
            });
        });

        document.getElementById('stageAllBtn').addEventListener('click', () => {
            vscode.postMessage({ command: 'stageAll' });
        });

        document.getElementById('unstageAllBtn').addEventListener('click', () => {
            vscode.postMessage({ command: 'unstageAll' });
        });

        document.getElementById('refreshBtn').addEventListener('click', () => {
            vscode.postMessage({ command: 'refreshGitStatus' });
        });

        // \u2500\u2500 Commit \u2500\u2500
        document.getElementById('commitBtn').addEventListener('click', () => {
            const message = document.getElementById('commitMessage').value.trim();
            if (!message) {
                return;
            }
            vscode.postMessage({ command: 'commitChanges', message });
        });

        // \u2500\u2500 AI Generate \u2500\u2500
        document.getElementById('generateMsgBtn').addEventListener('click', () => {
            document.getElementById('aiLoading').classList.add('visible');
            document.getElementById('generateMsgBtn').disabled = true;
            vscode.postMessage({ command: 'generateCommitMessage' });
        });

        // \u2500\u2500 Receive messages from extension \u2500\u2500
        window.addEventListener('message', (event) => {
            const msg = event.data;
            if (msg.command === 'setCommitMessage') {
                document.getElementById('commitMessage').value = msg.message;
                document.getElementById('aiLoading').classList.remove('visible');
                document.getElementById('generateMsgBtn').disabled = false;
            }
            if (msg.command === 'aiError') {
                document.getElementById('aiLoading').classList.remove('visible');
                document.getElementById('generateMsgBtn').disabled = false;
            }
        });

        // \u2500\u2500 Enable/disable commit button based on textarea \u2500\u2500
        const commitBtn = document.getElementById('commitBtn');
        const textarea = document.getElementById('commitMessage');
        const hasStagedFiles = ${o.length>0};

        textarea.addEventListener('input', () => {
            commitBtn.disabled = !textarea.value.trim() || !hasStagedFiles;
        });
    `;return x({csp:t,styles:c,body:d,script:l,nonce:e,title:"Esteira - Commit"})}var _e=500*1024,Q=class{constructor(e){this._claudeRunner=e}_panel;_stage;_process;_terminal;_promptFile;_lastReviewPath;_lastReviewContent;_gitService;_selectedFolder;open(e){if(this._stage=e,this._panel){this._panel.reveal(u.ViewColumn.One);return}let t=u.window.createWebviewPanel("esteira.desenvolvimento","Esteira - Desenvolvimento",u.ViewColumn.One,{enableScripts:!0,retainContextWhenHidden:!0});this._panel=t,this._showMenu(),t.webview.onDidReceiveMessage(r=>{switch(r.command){case"openCodeReview":this._handleCodeReview();break;case"cancelReview":this._cancelProcess(),this._showMenu();break;case"rerunReview":this._lastReviewPath&&this._lastReviewContent&&this._runReview(this._lastReviewPath,this._lastReviewContent);break;case"copyResult":r.text&&(u.env.clipboard.writeText(r.text),u.window.showInformationMessage("Resultado copiado!"));break;case"backToMenu":this._showMenu();break;case"openCommit":this._handleOpenCommit();break;case"switchBranch":this._handleSwitchBranch(r.branch);break;case"createBranch":this._handleCreateBranch(r.branch);break;case"stageFile":this._handleStageFile(r.file);break;case"unstageFile":this._handleUnstageFile(r.file);break;case"stageAll":this._handleStageAll();break;case"unstageAll":this._handleUnstageAll();break;case"commitChanges":this._handleCommit(r.message);break;case"generateCommitMessage":this._handleGenerateCommitMessage();break;case"refreshGitStatus":this._renderCommitView();break;case"selectFolder":this._handleSelectFolder(r.path);break;case"initRepo":this._handleInitRepo();break;case"ghCreateRepo":this._handleGhCreateRepo();break;case"addRemote":this._handleAddRemote(r.url);break;case"ghLogin":this._handleGhLogin();break}}),t.onDidDispose(()=>{this._cancelProcess(),this._panel=void 0})}_showMenu(){this._panel&&this._stage&&(this._panel.webview.html=Se(this._stage))}_cancelProcess(){if(this._process&&!this._process.killed&&(this._process.kill("SIGTERM"),this._process=void 0),this._promptFile){try{_.unlinkSync(this._promptFile)}catch{}this._promptFile=void 0}}async _handleCodeReview(){try{let e=await u.window.showOpenDialog({canSelectFiles:!0,canSelectFolders:!0,canSelectMany:!1,openLabel:"Selecionar arquivo ou pasta para Code Review",title:"Selecione o arquivo ou pasta para Code Review"});if(!e||e.length===0)return;let t=e[0].fsPath,r=_.statSync(t);if(r.isDirectory()){let o=this._collectCodeFiles(t);if(o.length===0){u.window.showErrorMessage("Nenhum arquivo de c\xF3digo encontrado na pasta.");return}let s="",n=0,c=[];for(let d of o){let l=_.statSync(d);if(n+l.size>_e)break;let p=_.readFileSync(d,"utf8");if(p.includes("\0")||p.trim().length===0)continue;let m=I.relative(t,d);s+=`
// \u2550\u2550\u2550\u2550\u2550\u2550 ${m} \u2550\u2550\u2550\u2550\u2550\u2550

${p}
`,n+=l.size,c.push(m)}if(c.length===0){u.window.showErrorMessage("Nenhum arquivo v\xE1lido encontrado na pasta.");return}let a=`Pasta: ${t}
Arquivos (${c.length}): ${c.join(", ")}`;this._runReview(t,a+`

`+s)}else{if(r.size>_e){u.window.showErrorMessage(`Arquivo muito grande (${(r.size/1024).toFixed(0)}KB). M\xE1ximo permitido: 500KB.`);return}if(r.size===0){u.window.showErrorMessage("O arquivo est\xE1 vazio.");return}let o=_.readFileSync(t,"utf8");if(o.includes("\0")){u.window.showErrorMessage("Arquivo bin\xE1rio n\xE3o suportado. Selecione um arquivo de c\xF3digo-fonte.");return}this._runReview(t,o)}}catch(e){let t=e instanceof Error?e.message:String(e);u.window.showErrorMessage(`Erro ao iniciar Code Review: ${t}`)}}_collectCodeFiles(e){let t=new Set([".ts",".tsx",".js",".jsx",".mjs",".cjs",".py",".java",".kt",".go",".rs",".rb",".cs",".cpp",".c",".h",".hpp",".swift",".m",".php",".vue",".svelte",".sql",".sh",".bash",".zsh",".yaml",".yml",".json",".xml",".html",".css",".scss"]),r=new Set(["node_modules",".git","dist","build","out",".next",".nuxt","__pycache__",".venv","vendor","coverage",".cache",".turbo"]),o=[],s=n=>{let c=_.readdirSync(n,{withFileTypes:!0});for(let a of c){let d=I.join(n,a.name);if(a.isDirectory())!r.has(a.name)&&!a.name.startsWith(".")&&s(d);else if(a.isFile()){let l=I.extname(a.name).toLowerCase();t.has(l)&&o.push(d)}}};return s(e),o.sort()}_runReview(e,t){if(!this._panel||!this._stage)return;this._lastReviewPath=e,this._lastReviewContent=t;let r=this._buildPrompt(e,t),o=this._stage.color,s=I.basename(e),n=I.join(Ce.tmpdir(),`esteira-review-${Date.now()}.txt`);_.writeFileSync(n,r,"utf8"),this._promptFile=n,this._panel.webview.html=this._getLoadingHtml(e,o);let c={...process.env};delete c.CLAUDECODE;let a="",d=!1,l=new u.EventEmitter,p=new u.EventEmitter,m={onDidWrite:l.event,onDidClose:p.event,open:()=>{let g=n.replace(/'/g,"'\\''"),R=`cat '${g}' | claude --max-turns 1 --verbose ; rm -f '${g}'`,C=(0,Ee.spawn)("sh",["-c",R],{env:c});this._process=C,l.fire(`[Esteira] Code Review: ${s}\r
\r
`),C.stdout?.on("data",f=>{let E=f.toString();a+=E,l.fire(E.replace(/\n/g,`\r
`))}),C.stderr?.on("data",f=>{l.fire(f.toString().replace(/\n/g,`\r
`))}),C.on("close",f=>{this._process=void 0,this._promptFile=void 0,d||(l.fire(`\r
[Finalizado com c\xF3digo ${f??0}]\r
`),p.fire(f??0)),this._panel&&this._stage&&a.trim()?this._panel.webview.html=this._getResultHtml(a.trim(),e,this._stage.color):this._panel&&(this._showMenu(),u.window.showWarningMessage("Code Review n\xE3o retornou resultado."))}),C.on("error",f=>{this._process=void 0,d||(l.fire(`\r
[Erro: ${f.message}]\r
`),p.fire(1)),u.window.showErrorMessage(`Erro ao iniciar Code Review: ${f.message}`),this._panel&&this._showMenu()})},close:()=>{d||(d=!0,this._cancelProcess())}};this._terminal&&this._terminal.dispose(),this._terminal=u.window.createTerminal({name:`Review - ${s}`,pty:m}),this._terminal.show()}_getGitService(e){return e&&(!this._gitService||this._gitService.workspaceRoot!==e)&&(this._gitService=new D(e),this._selectedFolder=e),this._gitService||(this._gitService=new D(this._selectedFolder)),this._gitService}_getCommitState(e){let t=this._getGitService(),r=t.isGitRepo(),s=(u.workspace.workspaceFolders??[]).map(g=>({name:g.name,path:g.uri.fsPath})),n=t.workspaceRoot,c="",a=[],d=[],l=null;if(r){try{c=t.getCurrentBranch()}catch{}try{a=t.getBranches()}catch{}try{d=t.getStatus()}catch{}try{l=t.getRemoteUrl()}catch{}}let p=t.getGitUser(),m=null;try{t.isGhAuthenticated()&&(m=t.ghGetUser())}catch{}return{currentBranch:c,branches:a,files:d,error:e,gitUser:p,ghUser:m,remoteUrl:l,isGitRepo:r,workspaceFolders:s,selectedFolder:n}}_renderCommitView(e){if(this._panel)try{let t=this._getCommitState(e);this._panel.webview.html=de(t)}catch(t){let r=t instanceof Error?t.message:String(t),o=u.workspace.workspaceFolders??[];this._panel.webview.html=de({currentBranch:"",branches:[],files:[],error:r,gitUser:{name:"",email:""},ghUser:null,remoteUrl:null,isGitRepo:!1,workspaceFolders:o.map(s=>({name:s.name,path:s.uri.fsPath})),selectedFolder:this._selectedFolder??o[0]?.uri.fsPath??""})}}_handleOpenCommit(){this._renderCommitView()}_handleSwitchBranch(e){try{this._getGitService().switchBranch(e),this._renderCommitView()}catch(t){let r=t instanceof Error?t.message:String(t);this._renderCommitView(r)}}_handleCreateBranch(e){if(e.trim())try{this._getGitService().createBranch(e.trim()),this._renderCommitView()}catch(t){let r=t instanceof Error?t.message:String(t);this._renderCommitView(r)}}_handleStageFile(e){try{this._getGitService().stageFile(e),this._renderCommitView()}catch(t){let r=t instanceof Error?t.message:String(t);this._renderCommitView(r)}}_handleUnstageFile(e){try{this._getGitService().unstageFile(e),this._renderCommitView()}catch(t){let r=t instanceof Error?t.message:String(t);this._renderCommitView(r)}}_handleStageAll(){try{this._getGitService().stageAll(),this._renderCommitView()}catch(e){let t=e instanceof Error?e.message:String(e);this._renderCommitView(t)}}_handleUnstageAll(){try{this._getGitService().unstageAll(),this._renderCommitView()}catch(e){let t=e instanceof Error?e.message:String(e);this._renderCommitView(t)}}_handleSelectFolder(e){this._gitService=void 0,this._getGitService(e),this._renderCommitView()}_handleInitRepo(){try{this._getGitService().initRepo(),u.window.showInformationMessage("Reposit\xF3rio Git inicializado!"),this._renderCommitView()}catch(e){let t=e instanceof Error?e.message:String(e);this._renderCommitView(t)}}async _handleGhCreateRepo(){let e=this._getGitService();if(!e.isGhAuthenticated()){await u.window.showWarningMessage("GitHub CLI n\xE3o est\xE1 autenticado. Fa\xE7a login primeiro.","Login no GitHub")==="Login no GitHub"&&e.ghLogin();return}let t=await u.window.showInputBox({prompt:"Nome do reposit\xF3rio no GitHub",placeHolder:"meu-projeto"});if(!t)return;let r=await u.window.showQuickPick([{label:"Privado",value:!0},{label:"P\xFAblico",value:!1}],{placeHolder:"Visibilidade do reposit\xF3rio"});if(r)try{e.ghCreateRepo(t,r.value),u.window.showInformationMessage(`Reposit\xF3rio "${t}" criado no GitHub!`),this._renderCommitView()}catch(o){let s=o instanceof Error?o.message:String(o);this._renderCommitView(s)}}_handleAddRemote(e){if(e.trim())try{this._getGitService().addRemote(e.trim()),u.window.showInformationMessage("Remote origin vinculado!"),this._renderCommitView()}catch(t){let r=t instanceof Error?t.message:String(t);this._renderCommitView(r)}}_handleGhLogin(){this._getGitService().ghLogin()}_handleCommit(e){try{this._getGitService().commit(e),u.window.showInformationMessage("Commit realizado com sucesso!"),this._showMenu()}catch(t){let r=t instanceof Error?t.message:String(t);this._renderCommitView(r)}}async _handleGenerateCommitMessage(){if(this._panel)try{let e=this._getGitService().getDiffCached();if(!e.trim()){this._panel.webview.postMessage({command:"aiError",error:"Nenhum arquivo staged para gerar mensagem."}),u.window.showWarningMessage("Fa\xE7a stage de arquivos antes de gerar a mensagem.");return}let t=`Analise o diff abaixo e gere uma mensagem de commit sem\xE2ntica em portugu\xEAs seguindo o padr\xE3o Conventional Commits (feat:, fix:, refactor:, docs:, style:, test:, chore:).

A mensagem deve ter:
- Linha 1: tipo(escopo): descri\xE7\xE3o curta (max 72 chars)
- Linha 3+: corpo explicando O QUE mudou e POR QU\xCA (se necess\xE1rio)

Responda APENAS com a mensagem de commit, sem explica\xE7\xF5es adicionais, sem markdown, sem code blocks.

\`\`\`diff
${e}
\`\`\``,r=await this._claudeRunner.run(t,void 0,{maxTurns:1,timeoutMs:3e4});if(this._panel&&r.output.trim()){let o=this._extractTextFromStreamJson(r.output);this._panel.webview.postMessage({command:"setCommitMessage",message:o})}else this._panel?.webview.postMessage({command:"aiError"}),u.window.showWarningMessage("IA n\xE3o retornou uma mensagem de commit.")}catch(e){let t=e instanceof Error?e.message:String(e);this._panel?.webview.postMessage({command:"aiError",error:t}),u.window.showErrorMessage(`Erro ao gerar mensagem: ${t}`)}}_extractTextFromStreamJson(e){let t=e.split(`
`).filter(o=>o.trim()),r="";for(let o of t)try{let s=JSON.parse(o);if(s.type==="result"&&s.result){r=s.result;break}if(s.type==="assistant"&&s.message?.content)for(let n of s.message.content)n.type==="text"&&(r+=n.text);s.type==="content_block_delta"&&s.delta?.text&&(r+=s.delta.text)}catch{o.startsWith("{")||(r+=o+`
`)}return r.trim()||e.trim()}_getLoadingHtml(e,t){let r=h(),o=b(r),s=I.basename(e),n=k(t)+`
            .loading-container {
                max-width: 520px;
                margin: 80px auto;
                text-align: center;
            }
            .spinner {
                width: 48px; height: 48px;
                border: 4px solid color-mix(in srgb, ${t} 20%, transparent);
                border-top-color: ${t};
                border-radius: 50%;
                animation: spin 0.8s linear infinite;
                margin: 0 auto 24px;
            }
            @keyframes spin { to { transform: rotate(360deg); } }
            h2 { font-size: 18px; font-weight: 600; margin-bottom: 8px; }
            .subtitle {
                font-size: 13px;
                color: var(--vscode-descriptionForeground);
                margin-bottom: 8px;
            }
            .file-path {
                font-size: 11px;
                color: var(--vscode-descriptionForeground);
                font-family: var(--vscode-editor-font-family, monospace);
                opacity: 0.7;
                word-break: break-all;
                margin-bottom: 24px;
            }
            .timer {
                font-size: 28px;
                font-weight: 600;
                font-variant-numeric: tabular-nums;
                color: ${t};
                font-family: var(--vscode-editor-font-family, monospace);
                margin-bottom: 24px;
            }
            .hint {
                font-size: 11px;
                color: var(--vscode-descriptionForeground);
                opacity: 0.6;
                margin-bottom: 24px;
            }
            .cancel-btn {
                padding: 8px 28px;
                border: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
                border-radius: 6px;
                background: transparent;
                color: var(--vscode-foreground);
                font-size: 12px; font-weight: 500;
                cursor: pointer; font-family: inherit;
            }
            .cancel-btn:hover {
                background: color-mix(in srgb, var(--vscode-foreground) 10%, transparent);
            }
        `,c=`
        <div class="loading-container">
            <div class="spinner"></div>
            <h2>Code Review em Andamento</h2>
            <div class="subtitle">Analisando: ${Y(s)}</div>
            <div class="file-path">${Y(e)}</div>
            <div class="timer" id="timer">00:00</div>
            <div class="hint">Acompanhe o output no terminal aberto ao lado</div>
            <button class="cancel-btn" id="cancelBtn">Cancelar</button>
        </div>`;return x({csp:o,styles:n,body:c,script:`
            const vscode = acquireVsCodeApi();
            const start = Date.now();
            setInterval(() => {
                const s = Math.floor((Date.now() - start) / 1000);
                document.getElementById('timer').textContent =
                    String(Math.floor(s/60)).padStart(2,'0') + ':' + String(s%60).padStart(2,'0');
            }, 1000);
            document.getElementById('cancelBtn').addEventListener('click', () => {
                vscode.postMessage({ command: 'cancelReview' });
            });
        `,nonce:r,title:"Code Review - Analisando..."})}_getResultHtml(e,t,r){let o=h(),s=b(o),n=I.basename(t),c=Y(e),a=ke(e,t,0);function d(f){return f>8?"#22c55e":f>=6?"#eab308":"#ef4444"}let l=d(a.qualityAvg),p=d(a.securityAvg),m=d(a.finalScore),g=k(r)+`
            .result-container { max-width: 820px; margin: 0 auto; }

            /* \u2500\u2500 Score Hero \u2500\u2500 */
            .score-hero {
                border-radius: 16px;
                padding: 32px 24px 28px;
                margin-bottom: 32px;
                background: var(--vscode-sideBar-background, var(--vscode-editor-background));
                border: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
            }

            .score-hero-title {
                text-align: center;
                font-size: 11px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 1.5px;
                color: var(--vscode-descriptionForeground);
                margin-bottom: 28px;
            }

            .score-cards {
                display: flex;
                justify-content: center;
                gap: 16px;
                flex-wrap: wrap;
            }

            .score-card {
                flex: 1;
                max-width: 220px;
                min-width: 140px;
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 20px 16px 18px;
                border-radius: 14px;
                background: color-mix(in srgb, var(--vscode-foreground) 3%, transparent);
                border: 1px solid color-mix(in srgb, var(--vscode-foreground) 8%, transparent);
                position: relative;
                overflow: hidden;
            }

            .score-card--main {
                border: 2px solid var(--card-color);
                background: color-mix(in srgb, var(--card-color) 6%, transparent);
                max-width: 240px;
                padding: 24px 20px 20px;
            }

            .score-card__icon {
                font-size: 22px;
                margin-bottom: 6px;
            }

            .score-card__value {
                font-size: 42px;
                font-weight: 900;
                line-height: 1;
                color: var(--card-color);
                font-variant-numeric: tabular-nums;
            }

            .score-card--main .score-card__value {
                font-size: 54px;
            }

            .score-card__of {
                font-size: 14px;
                color: var(--vscode-descriptionForeground);
                margin-bottom: 14px;
            }

            /* Thermometer bar */
            .thermo {
                width: 100%;
                height: 10px;
                border-radius: 5px;
                background: color-mix(in srgb, var(--vscode-foreground) 10%, transparent);
                overflow: hidden;
                margin-bottom: 14px;
            }

            .score-card--main .thermo {
                height: 14px;
                border-radius: 7px;
            }

            .thermo__fill {
                height: 100%;
                border-radius: inherit;
                background: linear-gradient(90deg, color-mix(in srgb, var(--card-color) 60%, transparent), var(--card-color));
                transition: width 1s cubic-bezier(0.22, 1, 0.36, 1);
                box-shadow: 0 0 8px color-mix(in srgb, var(--card-color) 40%, transparent);
            }

            .score-card__label {
                font-size: 11px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.8px;
                color: var(--vscode-descriptionForeground);
            }

            .score-card--main .score-card__label {
                font-size: 12px;
                color: var(--card-color);
            }

            /* \u2500\u2500 Header \u2500\u2500 */
            .result-header {
                display: flex; align-items: center; justify-content: space-between;
                margin-bottom: 24px; padding-bottom: 16px;
                border-bottom: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
            }
            .result-header h2 { font-size: 18px; font-weight: 600; }
            .header-actions { display: flex; gap: 8px; }

            .btn {
                padding: 6px 16px; border-radius: 6px; font-size: 12px;
                font-weight: 500; cursor: pointer; font-family: inherit; border: none;
            }
            .btn-primary { background: ${r}; color: #fff; }
            .btn-primary:hover { opacity: 0.85; }
            .btn-secondary {
                background: transparent; color: var(--vscode-foreground);
                border: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
            }
            .btn-secondary:hover {
                background: color-mix(in srgb, var(--vscode-foreground) 10%, transparent);
            }

            /* \u2500\u2500 Markdown \u2500\u2500 */
            .md-content { line-height: 1.7; font-size: 13px; }
            .md-content h1 {
                font-size: 20px; font-weight: 700; margin: 28px 0 12px;
                color: ${r};
                border-bottom: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
                padding-bottom: 8px;
            }
            .md-content h2 { font-size: 16px; font-weight: 600; margin: 24px 0 10px; color: ${r}; }
            .md-content h3 { font-size: 14px; font-weight: 600; margin: 20px 0 8px; }
            .md-content p { margin: 6px 0; }
            .md-content strong { color: var(--vscode-foreground); }
            .md-content ul, .md-content ol { margin: 8px 0; padding-left: 24px; }
            .md-content li { margin: 4px 0; }
            .md-content table {
                width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 12px;
            }
            .md-content th, .md-content td {
                padding: 8px 12px; text-align: left;
                border: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
            }
            .md-content th {
                background: color-mix(in srgb, ${r} 10%, transparent); font-weight: 600;
            }
            .md-content tr:nth-child(even) td {
                background: color-mix(in srgb, var(--vscode-foreground) 3%, transparent);
            }
            .md-content code {
                font-family: var(--vscode-editor-font-family, monospace); font-size: 12px;
                background: var(--vscode-textCodeBlock-background, rgba(0,0,0,0.15));
                padding: 2px 5px; border-radius: 3px;
            }
            .md-content pre {
                background: var(--vscode-textCodeBlock-background, rgba(0,0,0,0.15));
                padding: 12px; border-radius: 6px; overflow-x: auto; margin: 12px 0;
            }
            .md-content pre code { background: none; padding: 0; }
            .md-content hr {
                border: none; height: 1px; margin: 20px 0;
                background: var(--vscode-panel-border, var(--vscode-widget-border));
            }
        `,R=`
        <div class="result-container">
            <!-- Score Hero -->
            <div class="score-hero">
                <div class="score-hero-title">Resultado do Code Review</div>
                <div class="score-cards">
                    <div class="score-card" style="--card-color: ${l}">
                        <div class="score-card__value">${a.qualityAvg.toFixed(1)}</div>
                        <div class="score-card__of">/10</div>
                        <div class="thermo"><div class="thermo__fill" style="width:${a.qualityAvg*10}%"></div></div>
                        <div class="score-card__label">Qualidade</div>
                    </div>
                    <div class="score-card" style="--card-color: ${p}">
                        <div class="score-card__value">${a.securityAvg.toFixed(1)}</div>
                        <div class="score-card__of">/10</div>
                        <div class="thermo"><div class="thermo__fill" style="width:${a.securityAvg*10}%"></div></div>
                        <div class="score-card__label">Seguran&#231;a</div>
                    </div>
                    <div class="score-card score-card--main" style="--card-color: ${m}">
                        <div class="score-card__value">${a.finalScore.toFixed(1)}</div>
                        <div class="score-card__of">/10</div>
                        <div class="thermo"><div class="thermo__fill" style="width:${a.finalScore*10}%"></div></div>
                        <div class="score-card__label">Nota Final</div>
                    </div>
                </div>
            </div>

            <!-- Header + Actions -->
            <div class="result-header">
                <h2>${Y(n)}</h2>
                <div class="header-actions">
                    <button class="btn btn-secondary" id="rerunBtn">Rodar Novamente</button>
                    <button class="btn btn-secondary" id="copyBtn">Copiar</button>
                    <button class="btn btn-primary" id="backBtn">Voltar ao Menu</button>
                </div>
            </div>

            <!-- Markdown Content -->
            <div class="md-content" id="mdContent"></div>
        </div>
        <script type="text/plain" id="rawMarkdown">${c}</script>`;return x({csp:s,styles:g,body:R,script:`
            const vscode = acquireVsCodeApi();
            const rawMd = document.getElementById('rawMarkdown').textContent;
            document.getElementById('mdContent').innerHTML = renderMarkdown(rawMd);

            document.getElementById('backBtn').addEventListener('click', () => {
                vscode.postMessage({ command: 'backToMenu' });
            });
            document.getElementById('copyBtn').addEventListener('click', () => {
                vscode.postMessage({ command: 'copyResult', text: rawMd });
            });
            document.getElementById('rerunBtn').addEventListener('click', () => {
                vscode.postMessage({ command: 'rerunReview' });
            });

            function renderMarkdown(md) {
                var lines = md.split('\\n');
                var html = '';
                var inTable = false;
                var tableRowIdx = 0;
                var inCodeBlock = false;
                var codeBlockContent = '';
                var inUl = false;
                var inOl = false;

                for (var i = 0; i < lines.length; i++) {
                    var line = lines[i];

                    if (line.trim().indexOf('\`\`\`') === 0) {
                        if (inCodeBlock) {
                            html += '<pre><code>' + esc(codeBlockContent) + '</code></pre>';
                            codeBlockContent = '';
                            inCodeBlock = false;
                        } else {
                            inCodeBlock = true;
                        }
                        continue;
                    }
                    if (inCodeBlock) {
                        codeBlockContent += (codeBlockContent ? '\\n' : '') + line;
                        continue;
                    }

                    if (inUl && !/^\\s*[-*] /.test(line)) { html += '</ul>'; inUl = false; }
                    if (inOl && !/^\\s*\\d+\\. /.test(line)) { html += '</ol>'; inOl = false; }

                    if (line.trim().indexOf('|') === 0 && line.trim().lastIndexOf('|') === line.trim().length - 1) {
                        if (/^\\|[\\s:\\-|]+\\|$/.test(line.trim())) continue;
                        if (!inTable) { html += '<table>'; inTable = true; tableRowIdx = 0; }
                        var cells = line.split('|').slice(1, -1);
                        var tag = tableRowIdx === 0 ? 'th' : 'td';
                        html += '<tr>' + cells.map(function(c) { return '<' + tag + '>' + inline(c.trim()) + '</' + tag + '>'; }).join('') + '</tr>';
                        tableRowIdx++;
                        continue;
                    }
                    if (inTable) { html += '</table>'; inTable = false; }

                    var hMatch = line.match(/^(#{1,3}) (.+)$/);
                    if (hMatch) {
                        var level = hMatch[1].length;
                        html += '<h' + level + '>' + inline(hMatch[2]) + '</h' + level + '>';
                        continue;
                    }

                    if (/^---+$/.test(line.trim())) { html += '<hr>'; continue; }

                    var ulMatch = line.match(/^\\s*[-*] (.+)$/);
                    if (ulMatch) {
                        if (!inUl) { html += '<ul>'; inUl = true; }
                        html += '<li>' + inline(ulMatch[1]) + '</li>';
                        continue;
                    }

                    var olMatch = line.match(/^\\s*\\d+\\. (.+)$/);
                    if (olMatch) {
                        if (!inOl) { html += '<ol>'; inOl = true; }
                        html += '<li>' + inline(olMatch[1]) + '</li>';
                        continue;
                    }

                    if (!line.trim()) { html += '<br>'; continue; }
                    html += '<p>' + inline(line) + '</p>';
                }

                if (inTable) html += '</table>';
                if (inUl) html += '</ul>';
                if (inOl) html += '</ol>';
                return html;
            }

            function inline(text) {
                return esc(text)
                    .replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>')
                    .replace(/\`(.+?)\`/g, '<code>$1</code>');
            }

            function esc(text) {
                var d = document.createElement('div');
                d.textContent = text;
                return d.innerHTML;
            }
        `,nonce:o,title:"Code Review - Resultado"})}_buildPrompt(e,t){let r=e.split(".").pop()??"";return`Fa\xE7a um Code Review completo e uma An\xE1lise de Seguran\xE7a do arquivo abaixo.

## ARQUIVO: ${e}

\`\`\`${r}
${t}
\`\`\`

## INSTRU\xC7\xD5ES
- N\xC3O use nenhuma ferramenta. O conte\xFAdo do arquivo j\xE1 est\xE1 acima.
- Analise APENAS o c\xF3digo fornecido acima.
- Responda diretamente com a an\xE1lise.

## PARTE 1 - CODE REVIEW (Qualidade do C\xF3digo)
Avalie cada crit\xE9rio de 0 a 10 e justifique:

1. **Clean Code & Legibilidade** - Nomes claros, fun\xE7\xF5es pequenas, c\xF3digo auto-documentado
2. **Princ\xEDpios SOLID** - Single Responsibility, Open/Closed, Liskov, Interface Segregation, Dependency Inversion
3. **DRY & Reutiliza\xE7\xE3o** - C\xF3digo duplicado, abstra\xE7\xF5es adequadas
4. **Tratamento de Erros** - Try/catch, error boundaries, mensagens claras
5. **Performance** - Complexidade algor\xEDtmica, memory leaks, otimiza\xE7\xF5es
6. **Testabilidade** - C\xF3digo test\xE1vel, separation of concerns, inje\xE7\xE3o de depend\xEAncias
7. **Arquitetura & Padr\xF5es** - Design patterns, organiza\xE7\xE3o de pastas, modularidade

## PARTE 2 - SECURITY REVIEW (An\xE1lise de Seguran\xE7a)
Avalie cada crit\xE9rio de 0 a 10 e justifique:

1. **Injection (SQL/NoSQL/Command)** - Inputs sanitizados, prepared statements, valida\xE7\xE3o
2. **XSS (Cross-Site Scripting)** - Escape de output, Content Security Policy
3. **Autentica\xE7\xE3o & Autoriza\xE7\xE3o** - Tokens seguros, sess\xF5es, RBAC, JWT
4. **Dados Sens\xEDveis** - Secrets hardcoded, .env expostos, logs com dados sens\xEDveis
5. **Depend\xEAncias** - Pacotes vulner\xE1veis, vers\xF5es desatualizadas
6. **OWASP Top 10** - Verifica\xE7\xE3o geral das 10 vulnerabilidades mais cr\xEDticas
7. **Configura\xE7\xE3o de Seguran\xE7a** - CORS, headers HTTP, HTTPS, rate limiting

## FORMATO DE SA\xCDDA

Para cada item, use este formato:
- **Crit\xE9rio**: [Nota]/10 - [Justificativa breve com exemplos do c\xF3digo]

### RESUMO FINAL

| Categoria | Nota |
|-----------|------|
| Clean Code & Legibilidade | X/10 |
| SOLID | X/10 |
| DRY & Reutiliza\xE7\xE3o | X/10 |
| Tratamento de Erros | X/10 |
| Performance | X/10 |
| Testabilidade | X/10 |
| Arquitetura & Padr\xF5es | X/10 |
| Injection | X/10 |
| XSS | X/10 |
| Auth & Autoriza\xE7\xE3o | X/10 |
| Dados Sens\xEDveis | X/10 |
| Depend\xEAncias | X/10 |
| OWASP Top 10 | X/10 |
| Config Seguran\xE7a | X/10 |

**NOTA GERAL DE QUALIDADE**: X.X/10 (m\xE9dia das notas de Code Review)
**NOTA GERAL DE SEGURAN\xC7A**: X.X/10 (m\xE9dia das notas de Security Review)
**NOTA FINAL**: X.X/10 (m\xE9dia ponderada: 40% qualidade + 60% seguran\xE7a)

### TOP 3 PROBLEMAS CR\xCDTICOS
Liste os 3 problemas mais urgentes encontrados.

### RECOMENDA\xC7\xD5ES PRIORIT\xC1RIAS
Liste as 5 a\xE7\xF5es mais importantes para melhorar o c\xF3digo.`}};function Y(i){return i.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function le(i,e){let t=h(),r=b(t),o=i.map(l=>`
            <button class="stage-card" data-stage="${l.id}" style="--accent: ${l.color}">
                <div class="card-icon">${l.icon}</div>
                <div class="card-content">
                    <h3>${l.title}</h3>
                    <p>${l.description}</p>
                </div>
                <div class="card-arrow">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
            </button>`).join(`
`),s=i.map((l,p)=>{let m=`<div class="pipeline-dot" style="background: ${l.color}"></div>`,g=p<i.length-1?'<div class="pipeline-connector"></div>':"";return m+g}).join(""),n=Qe(e),c=`
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
            background: transparent;
            padding: 12px 8px;
        }

        .header {
            text-align: center;
            padding: 8px 0 16px;
            border-bottom: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
            margin-bottom: 16px;
        }

        .header h1 {
            font-size: 14px;
            font-weight: 600;
            color: var(--vscode-foreground);
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }

        .header .subtitle {
            font-size: 11px;
            color: var(--vscode-descriptionForeground);
            margin-top: 4px;
        }

        .pipeline-flow {
            display: flex;
            justify-content: center;
            gap: 4px;
            margin-top: 10px;
        }

        .pipeline-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            opacity: 0.8;
        }

        .pipeline-connector {
            width: 16px;
            height: 2px;
            background: var(--vscode-descriptionForeground);
            align-self: center;
            opacity: 0.4;
        }

        .stages {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .stage-card {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 12px;
            border: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
            border-radius: 6px;
            background: var(--vscode-editor-background);
            cursor: pointer;
            transition: all 0.15s ease;
            width: 100%;
            text-align: left;
            color: var(--vscode-foreground);
            font-family: inherit;
            font-size: inherit;
            border-left: 3px solid var(--accent);
        }

        .stage-card:hover {
            background: var(--vscode-list-hoverBackground);
            border-color: var(--accent);
        }

        .stage-card:active {
            transform: scale(0.98);
        }

        .card-icon {
            flex-shrink: 0;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
            background: color-mix(in srgb, var(--accent) 15%, transparent);
            padding: 5px;
        }

        .card-icon svg {
            width: 18px;
            height: 18px;
            stroke: var(--accent);
        }

        .card-content {
            flex: 1;
            min-width: 0;
        }

        .card-content h3 {
            font-size: 13px;
            font-weight: 600;
            margin-bottom: 2px;
        }

        .card-content p {
            font-size: 11px;
            color: var(--vscode-descriptionForeground);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .card-arrow {
            flex-shrink: 0;
            width: 16px;
            height: 16px;
            opacity: 0.4;
            transition: opacity 0.15s ease;
        }

        .card-arrow svg {
            width: 16px;
            height: 16px;
        }

        .stage-card:hover .card-arrow {
            opacity: 0.8;
        }

        /* Jira section */
        .jira-separator {
            border: none;
            border-top: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
            margin: 20px 0 16px;
        }

        .jira-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 12px;
        }

        .jira-header h2 {
            font-size: 13px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .jira-header h2 svg {
            width: 16px;
            height: 16px;
        }

        .jira-user-email {
            font-size: 11px;
            color: var(--vscode-descriptionForeground);
            margin-bottom: 10px;
        }

        .jira-actions {
            display: flex;
            gap: 6px;
            margin-bottom: 10px;
        }

        .jira-btn {
            padding: 5px 10px;
            border: none;
            border-radius: 4px;
            font-size: 11px;
            cursor: pointer;
            font-weight: 500;
            font-family: inherit;
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            transition: background 0.15s ease;
        }

        .jira-btn:hover {
            background: var(--vscode-button-hoverBackground);
        }

        .jira-btn.secondary {
            background: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }

        .jira-btn.secondary:hover {
            background: var(--vscode-button-secondaryHoverBackground);
        }

        .jira-btn.full-width {
            width: 100%;
            padding: 8px;
            font-size: 12px;
        }

        .jira-issues {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .jira-issue {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 7px 10px;
            border: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
            border-radius: 5px;
            background: var(--vscode-editor-background);
            cursor: pointer;
            transition: all 0.15s ease;
            width: 100%;
            text-align: left;
            color: var(--vscode-foreground);
            font-family: inherit;
            font-size: inherit;
            border-left: 3px solid #0065FF;
        }

        .jira-issue:hover {
            background: var(--vscode-list-hoverBackground);
            border-color: #0065FF;
        }

        .jira-issue-key {
            font-size: 11px;
            font-weight: 600;
            color: var(--vscode-textLink-foreground);
            white-space: nowrap;
        }

        .jira-issue-summary {
            font-size: 11px;
            flex: 1;
            min-width: 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .jira-issue-status {
            font-size: 10px;
            padding: 1px 5px;
            border-radius: 3px;
            font-weight: 600;
            color: white;
            white-space: nowrap;
        }

        .jira-loading {
            text-align: center;
            padding: 12px;
            color: var(--vscode-descriptionForeground);
            font-size: 11px;
        }

        .jira-error {
            font-size: 11px;
            color: var(--vscode-errorForeground);
            padding: 8px;
            background: var(--vscode-inputValidation-errorBackground, rgba(255,0,0,0.1));
            border-radius: 4px;
            margin-bottom: 8px;
        }

        .jira-empty {
            text-align: center;
            padding: 12px;
            color: var(--vscode-descriptionForeground);
            font-size: 11px;
        }

        .jira-logout-link {
            font-size: 10px;
            color: var(--vscode-descriptionForeground);
            cursor: pointer;
            background: none;
            border: none;
            font-family: inherit;
            text-decoration: underline;
            padding: 0;
        }

        .jira-logout-link:hover {
            color: var(--vscode-foreground);
        }

        .jira-filter {
            margin-bottom: 10px;
        }

        .jira-filter select {
            width: 100%;
            padding: 5px 8px;
            border: 1px solid var(--vscode-input-border);
            background: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border-radius: 4px;
            font-family: var(--vscode-font-family);
            font-size: 11px;
        }

        .jira-filter select:focus {
            outline: none;
            border-color: var(--vscode-focusBorder);
        }
    `,a=`
    <div class="header">
        <h1>Esteira Growth</h1>
        <p class="subtitle">Pipeline de desenvolvimento</p>
        <div class="pipeline-flow">
            ${s}
        </div>
    </div>

    <div class="stages">
        ${o}
    </div>

    <hr class="jira-separator">

    <div id="jiraSection">
        ${n}
    </div>`;return x({csp:r,styles:c,body:a,script:`
        const vscode = acquireVsCodeApi();

        document.querySelectorAll('.stage-card').forEach(card => {
            card.addEventListener('click', () => {
                const stageId = card.getAttribute('data-stage');
                vscode.postMessage({ command: 'openStage', stageId });
            });
        });

        // Jira event delegation
        const jiraSection = document.getElementById('jiraSection');
        jiraSection.addEventListener('click', (e) => {
            const target = e.target.closest('[data-action]');
            if (!target) { return; }

            const action = target.getAttribute('data-action');
            switch (action) {
                case 'jiraLogin':
                    vscode.postMessage({ command: 'jiraLogin' });
                    break;
                case 'jiraLogout':
                    vscode.postMessage({ command: 'jiraLogout' });
                    break;
                case 'jiraRefresh':
                    vscode.postMessage({ command: 'jiraRefresh' });
                    break;
                case 'jiraCreateIssue':
                    vscode.postMessage({ command: 'jiraCreateIssue' });
                    break;
                case 'jiraOpenIssue':
                    vscode.postMessage({ command: 'jiraOpenIssue', issueKey: target.getAttribute('data-key') });
                    break;
            }
        });

        jiraSection.addEventListener('change', (e) => {
            if (e.target && e.target.id === 'jiraFilterSelect') {
                vscode.postMessage({ command: 'jiraFilterChange', filter: e.target.value });
            }
        });

        // Listen for Jira state updates from the extension
        window.addEventListener('message', (event) => {
            const msg = event.data;
            if (msg.command === 'jiraState') {
                document.getElementById('jiraSection').innerHTML = msg.html;
            }
        });
    `,nonce:t,title:"Esteira Growth"})}function Qe(i){let e='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>';if(!i||!i.loggedIn)return`
            <button class="stage-card" data-action="jiraLogin" style="--accent: #0065FF">
                <div class="card-icon">${e}</div>
                <div class="card-content">
                    <h3>Jira</h3>
                    <p>Conectar ao Jira</p>
                </div>
                <div class="card-arrow">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
            </button>`;let t=i.userEmail?`<div class="jira-user-email">${O(i.userEmail)}</div>`:"",r=i.error?`<div class="jira-error">${O(i.error)}</div>`:"",o=i.filter||"mine",s=`
        <div class="jira-filter">
            <select id="jiraFilterSelect">
                <option value="mine"${o==="mine"?" selected":""}>Minhas issues</option>
                <option value="all"${o==="all"?" selected":""}>Todas do projeto</option>
            </select>
        </div>`,n;return i.loading?n='<div class="jira-loading">Carregando issues...</div>':!i.issues||i.issues.length===0?n='<div class="jira-empty">Nenhuma issue encontrada</div>':n=`<div class="jira-issues">${i.issues.map(a=>`
            <button class="jira-issue" data-action="jiraOpenIssue" data-key="${Ze(a.key)}">
                <span class="jira-issue-key">${O(a.key)}</span>
                <span class="jira-issue-summary">${O(a.summary)}</span>
                <span class="jira-issue-status" style="background:${a.statusColor}">${O(a.statusName)}</span>
            </button>`).join(`
`)}</div>`,`
        <div class="jira-header">
            <h2>${e} Jira</h2>
            <button class="jira-logout-link" data-action="jiraLogout">Desconectar</button>
        </div>
        ${t}
        ${r}
        <div class="jira-actions">
            <button class="jira-btn" data-action="jiraCreateIssue">Criar Issue</button>
            <button class="jira-btn secondary" data-action="jiraRefresh">Atualizar</button>
        </div>
        ${s}
        ${n}`}function O(i){return i.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function Ze(i){return i.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function Ie(i){let e=h(),t=b(e),r=k(i.color)+`
        .content-placeholder {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 48px 24px;
            text-align: center;
            border: 2px dashed var(--vscode-panel-border, var(--vscode-widget-border));
            border-radius: 12px;
            background: var(--vscode-sideBar-background, var(--vscode-editor-background));
        }

        .content-placeholder .icon-large {
            width: 64px;
            height: 64px;
            opacity: 0.3;
            margin-bottom: 16px;
        }

        .content-placeholder .icon-large svg {
            width: 64px;
            height: 64px;
            stroke: var(--vscode-foreground);
        }

        .content-placeholder h2 {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 8px;
        }

        .content-placeholder p {
            font-size: 13px;
            color: var(--vscode-descriptionForeground);
            max-width: 360px;
            line-height: 1.5;
        }

        .badge {
            display: inline-block;
            margin-top: 16px;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
            background: color-mix(in srgb, ${i.color} 20%, transparent);
            color: ${i.color};
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
    `,o=`
    <div class="stage-header">
        <div class="stage-icon">${i.icon}</div>
        <div class="stage-title">
            <h1>${i.title}</h1>
            <p>${i.description}</p>
        </div>
    </div>

    <div class="content-placeholder">
        <div class="icon-large">${i.icon}</div>
        <h2>Em breve</h2>
        <p>O conte\xFAdo da etapa <strong>${i.title}</strong> ser\xE1 implementado aqui. Esta \xE1rea exibir\xE1 ferramentas, status e a\xE7\xF5es espec\xEDficas desta fase da esteira.</p>
        <span class="badge">Placeholder</span>
    </div>`;return x({csp:t,styles:r,body:o,title:`Esteira - ${i.title}`})}function Z(){return"bcM1zlzfKBklIzJ6wvM9ifnmh1BDfQa4"}function pe(){return"ATOAA9SL3YvexOpFdMtMLbvcJlKqHJjHXAEhKaWhteVmf7HT4kNlH6o2kUkzjID_-AfX62199EBB"}var $e="https://auth.atlassian.com/authorize",ue="https://auth.atlassian.com/oauth/token",Me="https://api.atlassian.com/oauth/token/accessible-resources",je="https://api.atlassian.com/ex/jira",Be=["read:jira-work","write:jira-work","read:jira-user","offline_access"].join(" ");function N(){return parseInt("53417",10)}function me(){return`http://localhost:${N()}/callback`}var S={accessToken:"jira.accessToken",refreshToken:"jira.refreshToken",expiresAt:"jira.expiresAt",cloudId:"jira.cloudId",userEmail:"jira.userEmail"};var ee=class{constructor(e){this.secrets=e}async saveTokens(e){await Promise.all([this.secrets.store(S.accessToken,e.accessToken),this.secrets.store(S.refreshToken,e.refreshToken),this.secrets.store(S.expiresAt,String(e.expiresAt)),this.secrets.store(S.cloudId,e.cloudId),e.userEmail?this.secrets.store(S.userEmail,e.userEmail):Promise.resolve()])}async getTokens(){let e=await this.secrets.get(S.accessToken),t=await this.secrets.get(S.refreshToken),r=await this.secrets.get(S.expiresAt),o=await this.secrets.get(S.cloudId);if(!e||!t||!r||!o)return null;let s=await this.secrets.get(S.userEmail);return{accessToken:e,refreshToken:t,expiresAt:Number(r),cloudId:o,userEmail:s??void 0}}async clearTokens(){await Promise.all(Object.values(S).map(e=>this.secrets.delete(e)))}async isTokenExpired(){let e=await this.secrets.get(S.expiresAt);return e?Date.now()>=Number(e)-6e4:!0}};var j=v(require("vscode")),U=v(require("crypto"));var Ae=v(require("http"));var et=`<!DOCTYPE html>
<html><body style="font-family:system-ui;text-align:center;padding:60px">
<h2>Login realizado com sucesso!</h2>
<p>Pode fechar esta aba e voltar ao VS Code.</p>
<script>window.close()</script>
</body></html>`,tt=`<!DOCTYPE html>
<html><body style="font-family:system-ui;text-align:center;padding:60px">
<h2>Erro no login</h2>
<p>Algo deu errado. Tente novamente pelo VS Code.</p>
</body></html>`;function Re(i){return new Promise((e,t)=>{let r=Ae.createServer((n,c)=>{let a=new URL(n.url||"/",`http://localhost:${N()}`);if(a.pathname!=="/callback"){c.writeHead(404),c.end("Not found");return}let d=a.searchParams.get("code"),l=a.searchParams.get("state"),p=a.searchParams.get("error");if(p||!d||!l){c.writeHead(200,{"Content-Type":"text/html"}),c.end(tt),s(),t(new Error(a.searchParams.get("error_description")||p||"Callback sem c\xF3digo de autoriza\xE7\xE3o"));return}c.writeHead(200,{"Content-Type":"text/html"}),c.end(et),s(),e({code:d,state:l})}),o=setTimeout(()=>{s(),t(new Error("Login expirou. Tente novamente."))},i);function s(){clearTimeout(o),r.close()}r.on("error",n=>{s(),t(new Error(`N\xE3o foi poss\xEDvel iniciar o servidor OAuth na porta ${N()}: ${n.message}`))}),r.listen(N(),"127.0.0.1")})}var te=class{constructor(e){this.tokenManager=e}_onDidLogin=new j.EventEmitter;onDidLogin=this._onDidLogin.event;_onDidLogout=new j.EventEmitter;onDidLogout=this._onDidLogout.event;async login(){let e=this.generateCodeVerifier(),t=this.generateCodeChallenge(e),r=U.randomBytes(16).toString("hex"),o=new URL($e);o.searchParams.set("audience","api.atlassian.com"),o.searchParams.set("client_id",Z()),o.searchParams.set("scope",Be),o.searchParams.set("redirect_uri",me()),o.searchParams.set("state",r),o.searchParams.set("response_type","code"),o.searchParams.set("prompt","consent"),o.searchParams.set("code_challenge",t),o.searchParams.set("code_challenge_method","S256");let s=Re(5*60*1e3);await j.env.openExternal(j.Uri.parse(o.toString()));let n=await s;if(n.state!==r)throw new Error("State mismatch \u2014 poss\xEDvel ataque CSRF.");let c=await this.exchangeCodeForTokens(n.code,e);return await this.tokenManager.saveTokens(c),this._onDidLogin.fire(c),c}async logout(){await this.tokenManager.clearTokens(),this._onDidLogout.fire()}async refreshAccessToken(){let e=await this.tokenManager.getTokens();if(!e)return null;try{let t=await fetch(ue,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({grant_type:"refresh_token",client_id:Z(),client_secret:pe(),refresh_token:e.refreshToken})});if(!t.ok)throw new Error(`Token refresh failed: ${t.status}`);let r=await t.json(),o={accessToken:r.access_token,refreshToken:r.refresh_token,expiresAt:Date.now()+r.expires_in*1e3,cloudId:e.cloudId,userEmail:e.userEmail};return await this.tokenManager.saveTokens(o),o}catch{return await this.tokenManager.clearTokens(),this._onDidLogout.fire(),null}}async getValidAccessToken(){return await this.tokenManager.isTokenExpired()?(await this.refreshAccessToken())?.accessToken??null:(await this.tokenManager.getTokens())?.accessToken??null}async isLoggedIn(){return await this.tokenManager.getTokens()!==null}async exchangeCodeForTokens(e,t){let r=await fetch(ue,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({grant_type:"authorization_code",client_id:Z(),client_secret:pe(),code:e,redirect_uri:me(),code_verifier:t})});if(!r.ok){let d=await r.text();throw new Error(`Erro ao trocar c\xF3digo por token: ${r.status} ${d}`)}let o=await r.json(),s=await fetch(Me,{headers:{Authorization:`Bearer ${o.access_token}`}});if(!s.ok)throw new Error("Erro ao buscar recursos acess\xEDveis do Atlassian");let n=await s.json();if(n.length===0)throw new Error("Nenhum site Jira encontrado para sua conta.");let c;if(n.length===1)c=n[0];else{let d=await j.window.showQuickPick(n.map(l=>({label:l.name,description:l.url,resource:l})),{placeHolder:"Selecione o site Jira"});if(!d)throw new Error("Nenhum site selecionado.");c=d.resource}let a;try{let d=await fetch("https://api.atlassian.com/me",{headers:{Authorization:`Bearer ${o.access_token}`}});d.ok&&(a=(await d.json()).email)}catch{}return{accessToken:o.access_token,refreshToken:o.refresh_token,expiresAt:Date.now()+o.expires_in*1e3,cloudId:c.id,userEmail:a}}generateCodeVerifier(){return U.randomBytes(64).toString("base64url")}generateCodeChallenge(e){return U.createHash("sha256").update(e).digest("base64url")}dispose(){this._onDidLogin.dispose(),this._onDidLogout.dispose()}};var re=class{constructor(e,t){this.authProvider=e;this.tokenManager=t}async request(e,t={}){let r=await this.authProvider.getValidAccessToken();if(!r)throw new Error("N\xE3o autenticado. Fa\xE7a login primeiro.");let o=await this.tokenManager.getTokens();if(!o)throw new Error("Tokens n\xE3o encontrados.");let s=`${je}/${o.cloudId}${e}`,n=await fetch(s,{...t,headers:{Authorization:`Bearer ${r}`,"Content-Type":"application/json",Accept:"application/json",...t.headers}});if(!n.ok){let a=await n.text();throw new Error(`Jira API error ${n.status}: ${a}`)}if(n.status===204||n.headers.get("content-length")==="0")return;let c=await n.text();if(c)return JSON.parse(c)}async getMyIssues(e=50,t){let r;return t&&t.length>0?r=`project in (${t.map(n=>`"${n}"`).join(", ")}) AND resolution = Unresolved ORDER BY updated DESC`:r="assignee = currentUser() AND resolution = Unresolved ORDER BY updated DESC",(await this.request("/rest/api/3/search/jql",{method:"POST",body:JSON.stringify({jql:r,maxResults:e,fields:["summary","status","priority","assignee","reporter","project","issuetype","created","updated","labels","description"]})})).issues}async getIssue(e){return this.request(`/rest/api/3/issue/${e}`)}async createIssue(e){return this.request("/rest/api/3/issue",{method:"POST",body:JSON.stringify(e)})}async getProjects(){let e=[],t=0,r=50;for(;;){let o=await this.request(`/rest/api/3/project/search?startAt=${t}&maxResults=${r}`);if(e.push(...o.values),t+o.values.length>=o.total)break;t+=o.values.length}return e}async getIssueTypes(e){return(await this.request(`/rest/api/3/project/${e}`)).issueTypes.filter(r=>!r.subtask)}async getCreateMeta(e,t){let r=[],o=0,s=50;for(;;){let c=await this.request(`/rest/api/3/issue/createmeta/${e}/issuetypes/${t}?startAt=${o}&maxResults=${s}`);if(r.push(...c.values),o+c.values.length>=c.total)break;o+=c.values.length}let n=new Set(["project","issuetype","summary","description","reporter","attachment","issuelinks"]);return r.filter(c=>c.required&&!n.has(c.fieldId))}async searchIssues(e,t=50){return(await this.request("/rest/api/3/search/jql",{method:"POST",body:JSON.stringify({jql:e,maxResults:t,fields:["summary","status","priority","assignee","reporter","project","issuetype","created","updated","labels","description"]})})).issues}async getTransitions(e){return(await this.request(`/rest/api/3/issue/${e}/transitions`)).transitions}async transitionIssue(e,t){await this.request(`/rest/api/3/issue/${e}/transitions`,{method:"POST",body:JSON.stringify({transition:{id:t}})})}async updateIssue(e,t){await this.request(`/rest/api/3/issue/${e}`,{method:"PUT",body:JSON.stringify({fields:t})})}async getPriorities(){return this.request("/rest/api/3/priority")}async getAssignableUsers(e){return this.request(`/rest/api/3/user/assignable/search?project=${encodeURIComponent(e)}`)}};var L=v(require("vscode"));var ie=class i{constructor(e,t,r,o){this.issue=e;this.extensionUri=t;this.jiraClient=r;this.onUpdated=o;this.panel=L.window.createWebviewPanel("jiraIssueDetail",`${e.key}: ${e.fields.summary}`,L.ViewColumn.One,{enableScripts:!0,localResourceRoots:[t]}),this.panel.iconPath=new L.ThemeIcon("issue-opened"),this.panel.webview.html=this.getHtml(e),this.panel.webview.onDidReceiveMessage(s=>this.handleMessage(s)),this.panel.onDidDispose(()=>{this.disposed=!0,i.panels.delete(e.key)})}static panels=new Map;panel;disposed=!1;static show(e,t,r,o){let s=i.panels.get(e.key);if(s&&!s.disposed)return s.panel.reveal(),s.update(e),s;let n=new i(e,t,r,o);return i.panels.set(e.key,n),n}update(e){this.issue=e,this.panel.webview.html=this.getHtml(e)}async handleMessage(e){switch(e.command){case"loadTransitions":{try{let t=await this.jiraClient.getTransitions(this.issue.key);this.panel.webview.postMessage({command:"transitionsLoaded",transitions:t.map(r=>({id:r.id,name:r.name}))})}catch(t){this.postError(`Erro ao carregar transi\xE7\xF5es: ${t instanceof Error?t.message:t}`)}break}case"loadPriorities":{try{let t=await this.jiraClient.getPriorities();this.panel.webview.postMessage({command:"prioritiesLoaded",priorities:t.map(r=>({id:r.id,name:r.name}))})}catch(t){this.postError(`Erro ao carregar prioridades: ${t instanceof Error?t.message:t}`)}break}case"loadAssignableUsers":{try{let t=await this.jiraClient.getAssignableUsers(this.issue.fields.project.key);this.panel.webview.postMessage({command:"assignableUsersLoaded",users:t.map(r=>({accountId:r.accountId,displayName:r.displayName}))})}catch(t){this.postError(`Erro ao carregar usu\xE1rios: ${t instanceof Error?t.message:t}`)}break}case"updateStatus":{if(!e.transitionId)return;try{this.panel.webview.postMessage({command:"updating",field:"status"}),await this.jiraClient.transitionIssue(this.issue.key,e.transitionId),await this.refreshIssue()}catch(t){this.postError(`Erro ao atualizar status: ${t instanceof Error?t.message:t}`),this.panel.webview.postMessage({command:"updateDone"})}break}case"updatePriority":{if(!e.priorityId)return;try{this.panel.webview.postMessage({command:"updating",field:"priority"}),await this.jiraClient.updateIssue(this.issue.key,{priority:{id:e.priorityId}}),await this.refreshIssue()}catch(t){this.postError(`Erro ao atualizar prioridade: ${t instanceof Error?t.message:t}`),this.panel.webview.postMessage({command:"updateDone"})}break}case"updateAssignee":{try{this.panel.webview.postMessage({command:"updating",field:"assignee"});let t=e.accountId?{accountId:e.accountId}:null;await this.jiraClient.updateIssue(this.issue.key,{assignee:t}),await this.refreshIssue()}catch(t){this.postError(`Erro ao atualizar respons\xE1vel: ${t instanceof Error?t.message:t}`),this.panel.webview.postMessage({command:"updateDone"})}break}case"develop":{this.openClaudeWithIssue();break}}}openClaudeWithIssue(){let e=this.issue.fields,t=this.extractPlainText(e.description),r=["Desenvolva a seguinte tarefa do Jira:","",`Issue: ${this.issue.key}`,`T\xEDtulo: ${e.summary}`,`Tipo: ${e.issuetype.name}`,`Prioridade: ${e.priority.name}`,...t?["","Descri\xE7\xE3o:",t]:[]].join(`
`),o=L.window.createTerminal(`Desenvolver ${this.issue.key}`);o.show();let s=r.replace(/'/g,"'\\''");o.sendText(`claude '${s}'`)}extractPlainText(e){if(!e||typeof e!="object")return"";let t=e;if(!t.content)return"";let r=[];for(let o of t.content)if(o.content){let s=o.content.filter(n=>n.type==="text"&&n.text).map(n=>n.text).join("");s&&r.push(s)}return r.join(`
`)}async refreshIssue(){try{this.issue=await this.jiraClient.getIssue(this.issue.key),this.panel.webview.html=this.getHtml(this.issue),this.onUpdated()}catch(e){this.postError(`Erro ao recarregar issue: ${e instanceof Error?e.message:e}`)}}postError(e){this.panel.webview.postMessage({command:"error",message:e})}getHtml(e){let t=h(),r=b(t),o="#0065FF",s=e.fields,n=this.renderDescription(s.description),c=this.getStatusColor(s.status.statusCategory.key),a=this.getPriorityEmoji(s.priority.name),d=new Date(s.created).toLocaleDateString("pt-BR"),l=new Date(s.updated).toLocaleDateString("pt-BR"),p=s.labels.length>0?s.labels.map(E=>`<span class="tag">${this.escapeHtml(E)}</span>`).join(""):'<span class="muted">Nenhuma</span>',m=s.assignee?this.escapeHtml(s.assignee.displayName):'<span class="muted">N\xE3o atribu\xEDdo</span>',g=this.getIssueTypeIcon(s.issuetype.name),R=k(o)+`
        .error-banner {
            display: none;
            background: var(--vscode-inputValidation-errorBackground, #5a1d1d);
            border: 1px solid var(--vscode-inputValidation-errorBorder, #be1100);
            color: var(--vscode-errorForeground, #f48771);
            padding: 10px 14px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 12px;
            word-break: break-word;
        }
        .error-banner.visible { display: block; }

        .issue-key {
            font-size: 13px;
            font-weight: 600;
            color: ${o};
            letter-spacing: 0.3px;
        }

        .header-actions {
            display: flex;
            gap: 8px;
            margin-top: 16px;
        }

        .btn-develop {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 20px;
            border: none;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            background: ${o};
            color: #fff;
            font-family: inherit;
            transition: opacity 0.15s ease, transform 0.1s ease;
            letter-spacing: 0.3px;
        }
        .btn-develop:hover { opacity: 0.85; }
        .btn-develop:active { transform: scale(0.97); }
        .btn-develop svg { width: 14px; height: 14px; }

        .meta-section {
            margin-top: 24px;
        }

        .meta-section-title {
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--vscode-descriptionForeground);
            margin-bottom: 12px;
        }

        .meta-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }

        .meta-card {
            display: flex;
            flex-direction: column;
            gap: 6px;
            padding: 12px 14px;
            border: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
            border-radius: 8px;
            background: var(--vscode-sideBar-background, var(--vscode-editor-background));
            transition: border-color 0.15s ease;
        }

        .meta-card:hover {
            border-color: color-mix(in srgb, ${o} 40%, transparent);
        }

        .meta-label {
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.4px;
            color: var(--vscode-descriptionForeground);
        }

        .meta-value {
            font-size: 13px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 6px;
            min-height: 22px;
        }

        .status-badge {
            display: inline-block;
            padding: 3px 10px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
            color: white;
            letter-spacing: 0.2px;
        }

        .editable {
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 4px;
            border-radius: 4px;
            padding: 1px 4px;
            margin: -1px -4px;
            transition: background 0.15s ease;
        }
        .editable:hover {
            background: color-mix(in srgb, ${o} 10%, transparent);
        }
        .editable .edit-icon {
            opacity: 0;
            font-size: 11px;
            transition: opacity 0.15s;
            color: ${o};
        }
        .editable:hover .edit-icon { opacity: 0.8; }

        .inline-select {
            padding: 4px 8px;
            border: 1px solid color-mix(in srgb, ${o} 40%, transparent);
            background: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border-radius: 6px;
            font-family: var(--vscode-font-family);
            font-size: 12px;
            max-width: 200px;
            width: 100%;
        }
        .inline-select:focus {
            outline: none;
            border-color: ${o};
            box-shadow: 0 0 0 1px color-mix(in srgb, ${o} 30%, transparent);
        }

        .updating-text {
            font-style: italic;
            opacity: 0.6;
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
        }

        .tag {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 500;
            background: color-mix(in srgb, ${o} 15%, transparent);
            color: ${o};
            margin-right: 4px;
        }

        .muted { color: var(--vscode-descriptionForeground); font-size: 12px; }

        .description-section {
            margin-top: 24px;
        }

        .description-card {
            padding: 16px 18px;
            border: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
            border-radius: 10px;
            background: var(--vscode-sideBar-background, var(--vscode-editor-background));
            font-size: 13px;
            line-height: 1.7;
        }

        .description-card p {
            margin-bottom: 8px;
        }
        .description-card p:last-child {
            margin-bottom: 0;
        }

        .description-card h3 {
            font-size: 14px;
            font-weight: 600;
            margin: 16px 0 8px;
        }
        .description-card h3:first-child {
            margin-top: 0;
        }

        .description-card ul, .description-card ol {
            padding-left: 20px;
            margin-bottom: 8px;
        }

        .description-card li {
            margin-bottom: 4px;
        }

        .description-card pre {
            padding: 12px 14px;
            border-radius: 6px;
            background: var(--vscode-editor-background);
            border: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
            overflow-x: auto;
            margin: 8px 0;
        }

        .description-card code {
            font-family: var(--vscode-editor-font-family, monospace);
            font-size: 12px;
        }

        .description-card strong {
            font-weight: 600;
        }

        .dates-row {
            display: flex;
            gap: 16px;
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
        }

        .date-item {
            font-size: 11px;
            color: var(--vscode-descriptionForeground);
        }

        .date-item strong {
            font-weight: 600;
            margin-right: 4px;
        }
    `,C=`
    <div id="errorBanner" class="error-banner"></div>

    <div class="stage-header">
        <div class="stage-icon">${g}</div>
        <div class="stage-title">
            <p class="issue-key">${this.escapeHtml(e.key)}</p>
            <h1>${this.escapeHtml(s.summary)}</h1>
        </div>
    </div>

    <div class="header-actions">
        <button class="btn-develop" id="developBtn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
            Desenvolver
        </button>
    </div>

    <div class="meta-section">
        <div class="meta-section-title">Detalhes</div>
        <div class="meta-grid">
            <div class="meta-card">
                <span class="meta-label">Status</span>
                <span class="meta-value" id="statusField">
                    <span class="editable" id="editStatusBtn">
                        <span class="status-badge" style="background:${c}">${this.escapeHtml(s.status.name)}</span>
                        <span class="edit-icon">\u270E</span>
                    </span>
                </span>
            </div>
            <div class="meta-card">
                <span class="meta-label">Prioridade</span>
                <span class="meta-value" id="priorityField">
                    <span class="editable" id="editPriorityBtn">
                        <span>${a} ${this.escapeHtml(s.priority.name)}</span>
                        <span class="edit-icon">\u270E</span>
                    </span>
                </span>
            </div>
            <div class="meta-card">
                <span class="meta-label">Tipo</span>
                <span class="meta-value">${this.escapeHtml(s.issuetype.name)}</span>
            </div>
            <div class="meta-card">
                <span class="meta-label">Respons\xE1vel</span>
                <span class="meta-value" id="assigneeField">
                    <span class="editable" id="editAssigneeBtn">
                        <span>${m}</span>
                        <span class="edit-icon">\u270E</span>
                    </span>
                </span>
            </div>
            <div class="meta-card">
                <span class="meta-label">Projeto</span>
                <span class="meta-value">${this.escapeHtml(s.project.name)}</span>
            </div>
            <div class="meta-card">
                <span class="meta-label">Labels</span>
                <span class="meta-value">${p}</span>
            </div>
        </div>

        <div class="dates-row">
            <span class="date-item"><strong>Criado:</strong> ${d}</span>
            <span class="date-item"><strong>Atualizado:</strong> ${l}</span>
        </div>
    </div>

    <div class="description-section">
        <div class="meta-section-title">Descri\xE7\xE3o</div>
        <div class="description-card">${n||'<span class="muted">Sem descri\xE7\xE3o</span>'}</div>
    </div>`;return x({csp:r,styles:R,body:C,script:`
        const vscode = acquireVsCodeApi();
        const errorBanner = document.getElementById('errorBanner');

        function showError(message) {
            errorBanner.textContent = message;
            errorBanner.classList.add('visible');
            setTimeout(() => { errorBanner.classList.remove('visible'); }, 8000);
        }

        function hideError() {
            errorBanner.classList.remove('visible');
            errorBanner.textContent = '';
        }

        function setUpdating(fieldId) {
            const el = document.getElementById(fieldId);
            if (el) { el.innerHTML = '<span class="updating-text">Atualizando...</span>'; }
        }

        function editStatus() {
            hideError();
            const field = document.getElementById('statusField');
            field.innerHTML = '<span class="updating-text">Carregando...</span>';
            vscode.postMessage({ command: 'loadTransitions' });
        }

        function editPriority() {
            hideError();
            const field = document.getElementById('priorityField');
            field.innerHTML = '<span class="updating-text">Carregando...</span>';
            vscode.postMessage({ command: 'loadPriorities' });
        }

        function editAssignee() {
            hideError();
            const field = document.getElementById('assigneeField');
            field.innerHTML = '<span class="updating-text">Carregando...</span>';
            vscode.postMessage({ command: 'loadAssignableUsers' });
        }

        window.addEventListener('message', (event) => {
            const msg = event.data;

            if (msg.command === 'transitionsLoaded') {
                const field = document.getElementById('statusField');
                if (!msg.transitions || msg.transitions.length === 0) {
                    field.innerHTML = '<span class="muted">Nenhuma transi\xE7\xE3o dispon\xEDvel</span>';
                    return;
                }
                const options = msg.transitions.map(
                    t => '<option value="' + t.id + '">' + t.name + '</option>'
                ).join('');
                field.innerHTML =
                    '<select class="inline-select" id="statusSelect">' +
                    '<option value="">Selecione...</option>' + options +
                    '</select>';
                const statusSel = document.getElementById('statusSelect');
                statusSel.addEventListener('change', onStatusChange);
                statusSel.focus();
            }

            if (msg.command === 'prioritiesLoaded') {
                const field = document.getElementById('priorityField');
                const options = msg.priorities.map(
                    p => '<option value="' + p.id + '">' + p.name + '</option>'
                ).join('');
                field.innerHTML =
                    '<select class="inline-select" id="prioritySelect">' +
                    '<option value="">Selecione...</option>' + options +
                    '</select>';
                const prioritySel = document.getElementById('prioritySelect');
                prioritySel.addEventListener('change', onPriorityChange);
                prioritySel.focus();
            }

            if (msg.command === 'assignableUsersLoaded') {
                const field = document.getElementById('assigneeField');
                const options = msg.users.map(
                    u => '<option value="' + u.accountId + '">' + u.displayName + '</option>'
                ).join('');
                field.innerHTML =
                    '<select class="inline-select" id="assigneeSelect">' +
                    '<option value="">Selecione...</option>' +
                    '<option value="__unassigned__">N\xE3o atribu\xEDdo</option>' +
                    options +
                    '</select>';
                const assigneeSel = document.getElementById('assigneeSelect');
                assigneeSel.addEventListener('change', onAssigneeChange);
                assigneeSel.focus();
            }

            if (msg.command === 'updating') {
                if (msg.field === 'status') { setUpdating('statusField'); }
                if (msg.field === 'priority') { setUpdating('priorityField'); }
                if (msg.field === 'assignee') { setUpdating('assigneeField'); }
            }

            if (msg.command === 'error') {
                showError(msg.message);
            }
        });

        function onStatusChange() {
            const sel = document.getElementById('statusSelect');
            if (sel.value) {
                vscode.postMessage({ command: 'updateStatus', transitionId: sel.value });
            }
        }

        function onPriorityChange() {
            const sel = document.getElementById('prioritySelect');
            if (sel.value) {
                vscode.postMessage({ command: 'updatePriority', priorityId: sel.value });
            }
        }

        function onAssigneeChange() {
            const sel = document.getElementById('assigneeSelect');
            if (sel.value) {
                const accountId = sel.value === '__unassigned__' ? null : sel.value;
                vscode.postMessage({ command: 'updateAssignee', accountId: accountId });
            }
        }

        document.getElementById('editStatusBtn').addEventListener('click', editStatus);
        document.getElementById('editPriorityBtn').addEventListener('click', editPriority);
        document.getElementById('editAssigneeBtn').addEventListener('click', editAssignee);
        document.getElementById('developBtn').addEventListener('click', () => {
            vscode.postMessage({ command: 'develop' });
        });
    `,nonce:t,title:`${e.key} - ${s.summary}`})}renderDescription(e){if(!e||typeof e!="object")return"";let t=e;if(!t.content)return"";let r=[];for(let o of t.content)if(o.type==="paragraph"&&o.content){let s=o.content.map(n=>{if(n.type==="text"&&n.text){let c=this.escapeHtml(n.text);if(n.marks)for(let a of n.marks)a.type==="strong"&&(c=`<strong>${c}</strong>`),a.type==="em"&&(c=`<em>${c}</em>`),a.type==="code"&&(c=`<code>${c}</code>`);return c}return""}).join("");r.push(`<p>${s}</p>`)}else if(o.type==="heading"&&o.content){let s=o.content.map(n=>n.text?this.escapeHtml(n.text):"").join("");r.push(`<h3>${s}</h3>`)}else if(o.type==="bulletList"||o.type==="orderedList"){let s=o.type==="bulletList"?"ul":"ol",c=o.content.map(a=>`<li>${a.content?.flatMap(l=>l.content?.map(p=>p.text?this.escapeHtml(p.text):"")??[]).join("")??""}</li>`).join("");r.push(`<${s}>${c}</${s}>`)}else if(o.type==="codeBlock"&&o.content){let s=o.content.map(n=>n.text?this.escapeHtml(n.text):"").join("");r.push(`<pre><code>${s}</code></pre>`)}return r.join(`
`)}getStatusColor(e){switch(e){case"done":return"#36B37E";case"indeterminate":return"#0065FF";case"new":return"#6B778C";default:return"#6B778C"}}getIssueTypeIcon(e){let t=e.toLowerCase();return t.includes("bug")?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2l1.88 1.88"/><path d="M14.12 3.88L16 2"/><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"/><path d="M12 20v-9"/><path d="M6.53 9C4.6 8.8 3 7.1 3 5"/><path d="M6 13H2"/><path d="M3 21c0-2.1 1.7-3.9 3.8-4"/><path d="M20.97 5c0 2.1-1.6 3.8-3.5 4"/><path d="M22 13h-4"/><path d="M17.2 17c2.1.1 3.8 1.9 3.8 4"/></svg>':t.includes("story")||t.includes("hist\xF3ria")?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>':t.includes("epic")?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>':t.includes("sub")?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="7 8 3 12 7 16"/><line x1="21" y1="12" x2="3" y2="12"/></svg>':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>'}getPriorityEmoji(e){let t=e.toLowerCase();return t.includes("highest")||t.includes("critical")?"\u{1F534}":t.includes("high")?"\u{1F7E0}":t.includes("medium")?"\u{1F7E1}":t.includes("low")?"\u{1F7E2}":(t.includes("lowest"),"\u26AA")}escapeHtml(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}};var M=v(require("vscode")),oe=class i{constructor(e,t,r){this.jiraClient=e;this.onCreated=r;this.panel=M.window.createWebviewPanel("jiraCreateIssue","Criar Issue \u2014 Jira",M.ViewColumn.One,{enableScripts:!0,localResourceRoots:[t]}),this.panel.iconPath=new M.ThemeIcon("new-file"),this.panel.onDidDispose(()=>{i.instance=void 0}),this.panel.webview.onDidReceiveMessage(o=>this.handleMessage(o))}static instance;panel;projects=[];issueTypes=[];customFieldsMeta=[];static async show(e,t,r){if(i.instance){i.instance.panel.reveal();return}let o=new i(e,t,r);i.instance=o,await o.initialize()}async initialize(){try{this.projects=await this.jiraClient.getProjects(),this.panel.webview.html=this.getHtml()}catch(e){M.window.showErrorMessage(`Erro ao carregar projetos: ${e}`),this.panel.dispose()}}async handleMessage(e){switch(e.command){case"loadIssueTypes":{if(!e.projectKey)return;try{this.issueTypes=await this.jiraClient.getIssueTypes(e.projectKey),this.panel.webview.postMessage({command:"issueTypesLoaded",issueTypes:this.issueTypes.map(t=>({id:t.id,name:t.name}))})}catch(t){M.window.showErrorMessage(`Erro ao carregar tipos: ${t}`)}break}case"loadCustomFields":{if(!e.projectKey||!e.issueTypeId)return;try{let t=await this.jiraClient.getCreateMeta(e.projectKey,e.issueTypeId);this.customFieldsMeta=t,this.panel.webview.postMessage({command:"customFieldsLoaded",fields:t.map(r=>({fieldId:r.fieldId,name:r.name,required:r.required,type:r.schema.type,allowedValues:r.allowedValues?.map(o=>({id:o.id,label:o.name||o.value||o.id}))}))})}catch{this.panel.webview.postMessage({command:"customFieldsLoaded",fields:[]})}break}case"createIssue":{if(!e.projectKey||!e.issueType||!e.summary){this.panel.webview.postMessage({command:"createError",errorMessage:"Preencha todos os campos obrigat\xF3rios."});return}try{this.panel.webview.postMessage({command:"creating"});let t={fields:{project:{key:e.projectKey},issuetype:{name:e.issueType},summary:e.summary}};if(e.description?.trim()&&(t.fields.description={type:"doc",version:1,content:[{type:"paragraph",content:[{type:"text",text:e.description.trim()}]}]}),e.customFields){for(let[o,s]of Object.entries(e.customFields))if(s){let n=this.customFieldsMeta.find(c=>c.fieldId===o);n?.allowedValues&&n.allowedValues.length>0?n.schema.type==="array"?t.fields[o]=[{id:s}]:t.fields[o]={id:s}:n?.schema.type==="number"?t.fields[o]=Number(s):t.fields[o]=s}}let r=await this.jiraClient.createIssue(t);M.window.showInformationMessage(`Issue ${r.key} criada com sucesso!`),this.onCreated(),this.panel.dispose()}catch(t){let r=t instanceof Error?t.message:String(t);M.window.showErrorMessage(`Erro ao criar issue: ${r}`),this.panel.webview.postMessage({command:"createError",errorMessage:r})}break}}}getHtml(){let e=rt(),t=this.projects.map(r=>`<option value="${it(r.key)}">${Te(r.name)} (${Te(r.key)})</option>`).join(`
`);return`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${e}';">
  <style>
    body {
      font-family: var(--vscode-font-family);
      color: var(--vscode-foreground);
      background: var(--vscode-editor-background);
      padding: 20px;
      max-width: 600px;
      margin: 0 auto;
    }
    h1 { font-size: 1.3em; margin-bottom: 20px; }
    .form-group { margin-bottom: 16px; }
    label {
      display: block;
      font-size: 0.85em;
      font-weight: 600;
      margin-bottom: 4px;
      color: var(--vscode-descriptionForeground);
    }
    label .required { color: var(--vscode-errorForeground); }
    select, input, textarea {
      width: 100%;
      padding: 8px;
      border: 1px solid var(--vscode-input-border);
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border-radius: 4px;
      font-family: var(--vscode-font-family);
      font-size: 0.95em;
      box-sizing: border-box;
    }
    select:focus, input:focus, textarea:focus {
      outline: none;
      border-color: var(--vscode-focusBorder);
    }
    textarea { resize: vertical; min-height: 100px; }
    button {
      padding: 8px 20px;
      border: none;
      border-radius: 4px;
      font-size: 0.95em;
      cursor: pointer;
      font-weight: 600;
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
    }
    button:hover { background: var(--vscode-button-hoverBackground); }
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .btn-row { margin-top: 20px; display: flex; gap: 8px; }
    .error-banner {
      display: none;
      background: var(--vscode-inputValidation-errorBackground, #5a1d1d);
      border: 1px solid var(--vscode-inputValidation-errorBorder, #be1100);
      color: var(--vscode-errorForeground, #f48771);
      padding: 10px 14px;
      border-radius: 4px;
      margin-bottom: 16px;
      font-size: 0.9em;
      word-break: break-word;
    }
    .error-banner.visible { display: block; }
  </style>
</head>
<body>
  <h1>Criar Nova Issue</h1>
  <div id="errorBanner" class="error-banner"></div>

  <div class="form-group">
    <label>Projeto <span class="required">*</span></label>
    <select id="project">
      <option value="">Selecione um projeto...</option>
      ${t}
    </select>
  </div>

  <div class="form-group">
    <label>Tipo <span class="required">*</span></label>
    <select id="issueType" disabled>
      <option value="">Selecione o projeto primeiro...</option>
    </select>
  </div>

  <div class="form-group">
    <label>T\xEDtulo <span class="required">*</span></label>
    <input type="text" id="summary" placeholder="Resumo da issue..." />
  </div>

  <div class="form-group">
    <label>Descri\xE7\xE3o</label>
    <textarea id="description" placeholder="Descreva a issue (opcional)..."></textarea>
  </div>

  <div id="customFieldsContainer"></div>

  <div class="btn-row">
    <button id="submitBtn" disabled>Criar Issue</button>
  </div>

  <script nonce="${e}">
    const vscode = acquireVsCodeApi();
    const projectEl = document.getElementById('project');
    const typeEl = document.getElementById('issueType');
    const summaryEl = document.getElementById('summary');
    const descEl = document.getElementById('description');
    const submitBtn = document.getElementById('submitBtn');
    const customFieldsContainer = document.getElementById('customFieldsContainer');
    const errorBanner = document.getElementById('errorBanner');

    function showError(message) {
      errorBanner.textContent = message;
      errorBanner.classList.add('visible');
    }

    function hideError() {
      errorBanner.classList.remove('visible');
      errorBanner.textContent = '';
    }

    let currentIssueTypes = [];
    let currentCustomFields = [];

    function validateForm() {
      const baseValid = projectEl.value && typeEl.value && summaryEl.value.trim();
      if (!baseValid) { submitBtn.disabled = true; return; }
      const allRequiredFilled = currentCustomFields.every(f => {
        const el = document.getElementById('cf_' + f.fieldId);
        return el && el.value;
      });
      submitBtn.disabled = !allRequiredFilled;
    }

    projectEl.addEventListener('change', () => {
      if (projectEl.value) {
        typeEl.disabled = true;
        typeEl.innerHTML = '<option value="">Carregando...</option>';
        customFieldsContainer.innerHTML = '';
        currentCustomFields = [];
        vscode.postMessage({ command: 'loadIssueTypes', projectKey: projectEl.value });
      } else {
        typeEl.disabled = true;
        typeEl.innerHTML = '<option value="">Selecione o projeto primeiro...</option>';
        customFieldsContainer.innerHTML = '';
        currentCustomFields = [];
      }
      validateForm();
    });

    typeEl.addEventListener('change', () => {
      const selected = currentIssueTypes.find(t => t.name === typeEl.value);
      if (selected && projectEl.value) {
        customFieldsContainer.innerHTML = '<p style="opacity:0.6;font-size:0.85em;">Carregando campos obrigat\xF3rios...</p>';
        vscode.postMessage({
          command: 'loadCustomFields',
          projectKey: projectEl.value,
          issueTypeId: selected.id,
        });
      } else {
        customFieldsContainer.innerHTML = '';
        currentCustomFields = [];
      }
      validateForm();
    });

    summaryEl.addEventListener('input', validateForm);

    submitBtn.addEventListener('click', () => {
      hideError();
      const customFields = {};
      for (const f of currentCustomFields) {
        const el = document.getElementById('cf_' + f.fieldId);
        if (el && el.value) {
          customFields[f.fieldId] = el.value;
        }
      }
      vscode.postMessage({
        command: 'createIssue',
        projectKey: projectEl.value,
        issueType: typeEl.value,
        summary: summaryEl.value.trim(),
        description: descEl.value,
        customFields: customFields,
      });
    });

    window.addEventListener('message', (event) => {
      const msg = event.data;
      if (msg.command === 'issueTypesLoaded') {
        currentIssueTypes = msg.issueTypes;
        typeEl.innerHTML = '<option value="">Selecione...</option>' +
          msg.issueTypes.map(t => '<option value="' + t.name + '" data-id="' + t.id + '">' + t.name + '</option>').join('');
        typeEl.disabled = false;
        validateForm();
      }
      if (msg.command === 'customFieldsLoaded') {
        currentCustomFields = msg.fields;
        if (msg.fields.length === 0) {
          customFieldsContainer.innerHTML = '';
        } else {
          customFieldsContainer.innerHTML = msg.fields.map(f => {
            if (f.allowedValues && f.allowedValues.length > 0) {
              const options = f.allowedValues.map(v =>
                '<option value="' + v.id + '">' + v.label + '</option>'
              ).join('');
              return '<div class="form-group">' +
                '<label>' + f.name + ' <span class="required">*</span></label>' +
                '<select id="cf_' + f.fieldId + '">' +
                '<option value="">Selecione...</option>' + options +
                '</select></div>';
            }
            return '<div class="form-group">' +
              '<label>' + f.name + ' <span class="required">*</span></label>' +
              '<input type="text" id="cf_' + f.fieldId + '" placeholder="' + f.name + '..." /></div>';
          }).join('');
          for (const f of msg.fields) {
            const el = document.getElementById('cf_' + f.fieldId);
            if (el) { el.addEventListener('change', validateForm); el.addEventListener('input', validateForm); }
          }
        }
        validateForm();
      }
      if (msg.command === 'creating') {
        hideError();
        submitBtn.disabled = true;
        submitBtn.textContent = 'Criando...';
      }
      if (msg.command === 'createError') {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Criar Issue';
        if (msg.errorMessage) {
          showError(msg.errorMessage);
        }
      }
    });
  </script>
</body>
</html>`}};function rt(){let i="",e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";for(let t=0;t<32;t++)i+=e.charAt(Math.floor(Math.random()*e.length));return i}function Te(i){return i.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function it(i){return i.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}var se=class{constructor(e,t,r,o){this._extensionUri=e;this._context=t;this._produtoPanel=new W(r),this._desenvolvimentoPanel=new Q(o),this._stageHandlers={produto:()=>{let s=z.find(n=>n.id==="produto");this._produtoPanel.open(s)},desenvolvimento:()=>{let s=z.find(n=>n.id==="desenvolvimento");this._desenvolvimentoPanel.open(s)}},this._tokenManager=new ee(this._context.secrets),this._jiraAuth=new te(this._tokenManager),this._jiraClient=new re(this._jiraAuth,this._tokenManager)}_produtoPanel;_desenvolvimentoPanel;_stageHandlers;_tokenManager;_jiraAuth;_jiraClient;_jiraState={loggedIn:!1};_jiraFilter="mine";_webviewView;resolveWebviewView(e,t,r){this._webviewView=e,e.webview.options={enableScripts:!0,localResourceRoots:[this._extensionUri]},e.webview.html=le(z,this._jiraState),e.webview.onDidReceiveMessage(o=>{switch(o.command){case"openStage":this._openStagePanel(o.stageId);break;case"jiraLogin":this._handleJiraLogin();break;case"jiraLogout":this._handleJiraLogout();break;case"jiraRefresh":this._loadJiraIssues();break;case"jiraOpenIssue":this._handleJiraOpenIssue(o.issueKey);break;case"jiraCreateIssue":this._handleJiraCreateIssue();break;case"jiraFilterChange":this._jiraFilter=o.filter,this._loadJiraIssues();break}}),this._initJiraState()}async _initJiraState(){if(await this._jiraAuth.isLoggedIn()){let t=await this._tokenManager.getTokens();this._jiraState={loggedIn:!0,userEmail:t?.userEmail,loading:!0},this._sendJiraState(),await this._loadJiraIssues()}}async _handleJiraLogin(){try{this._jiraState={loggedIn:!1,loading:!0},this._sendJiraState();let e=await this._jiraAuth.login();this._jiraState={loggedIn:!0,userEmail:e.userEmail,loading:!0},this._sendJiraState(),await this._loadJiraIssues()}catch(e){let t=e instanceof Error?e.message:String(e);this._jiraState={loggedIn:!1,error:t},this._sendJiraState(),B.window.showErrorMessage(`Jira login falhou: ${t}`)}}async _handleJiraLogout(){await this._jiraAuth.logout(),this._jiraState={loggedIn:!1},this._sendJiraState()}async _loadJiraIssues(){try{this._jiraState={...this._jiraState,loggedIn:!0,loading:!0,error:void 0,filter:this._jiraFilter},this._sendJiraState();let e=B.workspace.getConfiguration("jira").get("trackedProjects",[]),t;this._jiraFilter==="mine"?t=await this._jiraClient.getMyIssues(20,void 0):t=await this._jiraClient.getMyIssues(20,e.length>0?e:void 0),this._jiraState={loggedIn:!0,userEmail:this._jiraState.userEmail,filter:this._jiraFilter,issues:t.map(r=>({key:r.key,summary:r.fields.summary,statusName:r.fields.status.name,statusColor:this._getStatusColor(r.fields.status.statusCategory.key),priorityName:r.fields.priority.name,typeName:r.fields.issuetype.name}))},this._sendJiraState()}catch(e){let t=e instanceof Error?e.message:String(e);this._jiraState={...this._jiraState,loading:!1,error:t},this._sendJiraState()}}async _handleJiraOpenIssue(e){try{let t=await this._jiraClient.getIssue(e);ie.show(t,this._extensionUri,this._jiraClient,()=>{this._loadJiraIssues()})}catch(t){B.window.showErrorMessage(`Erro ao abrir issue: ${t instanceof Error?t.message:t}`)}}async _handleJiraCreateIssue(){try{await oe.show(this._jiraClient,this._extensionUri,()=>{this._loadJiraIssues()})}catch(e){B.window.showErrorMessage(`Erro ao abrir formul\xE1rio: ${e instanceof Error?e.message:e}`)}}_sendJiraState(){this._webviewView&&(this._webviewView.webview.html=le(z,this._jiraState))}_getStatusColor(e){switch(e){case"done":return"#36B37E";case"indeterminate":return"#0065FF";case"new":return"#6B778C";default:return"#6B778C"}}_openStagePanel(e){let t=z.find(s=>s.id===e);if(!t)return;let r=this._stageHandlers[e];if(r){r();return}let o=B.window.createWebviewPanel(`esteira.${e}`,`Esteira - ${t.title}`,B.ViewColumn.One,{enableScripts:!0});o.webview.html=Ie(t)}};var ge=v(require("vscode")),ne=class{terminals=new Map;getOrCreateTerminal(e){let t=this.terminals.get(e);if(t&&t.exitStatus===void 0)return t;let r=ge.window.createTerminal(e);return this.terminals.set(e,r),r}sendCommand(e,t){try{let r=this.getOrCreateTerminal(e);r.show(),r.sendText(t)}catch(r){let o=r instanceof Error?r.message:String(r);ge.window.showErrorMessage(`Erro ao executar comando no terminal: ${o}`)}}dispose(){for(let e of this.terminals.values())e.exitStatus===void 0&&e.dispose();this.terminals.clear()}};var q=v(require("vscode")),ce=v(require("fs")),Pe=v(require("os")),Fe=v(require("path")),Le=require("child_process"),ae=class{_process;_terminal;_promptFile;_timeoutHandle;async run(e,t,r){this.cancel();let o=r?.maxTurns??25,s=r?.timeoutMs??5*60*1e3;return new Promise((n,c)=>{let a="",d=!1,l=new q.EventEmitter,p=new q.EventEmitter,m=()=>{let R=Fe.join(Pe.tmpdir(),`esteira-prompt-${Date.now()}.txt`);ce.writeFileSync(R,e,"utf8"),this._promptFile=R,l.fire(`[Esteira] Prompt salvo em arquivo tempor\xE1rio\r
`);let C={...process.env};delete C.CLAUDECODE;let f=["-p",e,"--output-format","stream-json","--max-turns",String(o),"--verbose"];l.fire(`[Esteira] Executando: claude -p <prompt> --output-format stream-json --max-turns ${o}\r
`);let E=(0,Le.spawn)("claude",f,{env:C});this._process=E,l.fire(`[Esteira] Processo iniciado (PID ${E.pid})\r
`),l.fire(`[Esteira] Timeout: ${Math.round(s/1e3)}s | Max turns: ${o}\r
\r
`),this._timeoutHandle=setTimeout(()=>{this._process&&!this._process.killed&&(l.fire(`\r
[Esteira] Timeout atingido \u2014 encerrando processo.\r
`),this._process.kill("SIGTERM"))},s),E.stdout?.on("data",T=>{let $=T.toString();a+=$,l.fire($.replace(/\n/g,`\r
`)),t?.($,a)}),E.stderr?.on("data",T=>{let $=T.toString();l.fire(`[stderr] ${$.replace(/\n/g,`\r
`)}`),t?.($,a)}),E.on("close",T=>{this._timeoutHandle&&(clearTimeout(this._timeoutHandle),this._timeoutHandle=void 0),this._process=void 0,this._cleanupPromptFile();let $=T??1;d||(l.fire(`\r
[Processo finalizado com c\xF3digo ${$}]\r
`),p.fire($)),n({exitCode:$,output:a})}),E.on("error",T=>{this._timeoutHandle&&(clearTimeout(this._timeoutHandle),this._timeoutHandle=void 0),this._process=void 0,this._cleanupPromptFile(),d||(l.fire(`\r
[Erro ao iniciar: ${T.message}]\r
`),l.fire(`[Verifique se "claude" est\xE1 instalado e no PATH]\r
`),p.fire(1)),c(T)})},g={onDidWrite:l.event,onDidClose:p.event,open:()=>m(),close:()=>{d||(d=!0,this.cancel())}};this._terminal=q.window.createTerminal({name:"Esteira - Code Review",pty:g}),this._terminal.show()})}cancel(){this._process&&!this._process.killed&&(this._process.kill("SIGTERM"),this._process=void 0),this._timeoutHandle&&(clearTimeout(this._timeoutHandle),this._timeoutHandle=void 0),this._cleanupPromptFile()}dispose(){this.cancel(),this._terminal?.dispose(),this._terminal=void 0}_cleanupPromptFile(){if(this._promptFile){try{ce.unlinkSync(this._promptFile)}catch{}this._promptFile=void 0}}};function ot(i){let e=new ne,t=new ae,r=new se(i.extensionUri,i,e,t);i.subscriptions.push(A.window.registerWebviewViewProvider("esteira.sidebarView",r)),i.subscriptions.push(A.commands.registerCommand("esteira.openPanel",()=>{A.commands.executeCommand("esteira.sidebarView.focus")})),i.subscriptions.push(A.commands.registerCommand("esteira.jiraLogin",()=>{A.commands.executeCommand("esteira.sidebarView.focus")})),i.subscriptions.push(A.commands.registerCommand("esteira.jiraLogout",()=>{A.commands.executeCommand("esteira.sidebarView.focus")})),i.subscriptions.push({dispose:()=>e.dispose()}),i.subscriptions.push(t)}function st(){}0&&(module.exports={activate,deactivate});
