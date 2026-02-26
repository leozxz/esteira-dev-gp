import * as http from 'http';
import { getCallbackPort } from '../utils/config';

export interface CallbackResult {
  code: string;
  state: string;
}

const SUCCESS_HTML = `<!DOCTYPE html>
<html><body style="font-family:system-ui;text-align:center;padding:60px">
<h2>Login realizado com sucesso!</h2>
<p>Pode fechar esta aba e voltar ao VS Code.</p>
<script>window.close()</script>
</body></html>`;

const ERROR_HTML = `<!DOCTYPE html>
<html><body style="font-family:system-ui;text-align:center;padding:60px">
<h2>Erro no login</h2>
<p>Algo deu errado. Tente novamente pelo VS Code.</p>
</body></html>`;

export function startCallbackServer(timeoutMs: number): Promise<CallbackResult> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url || '/', `http://localhost:${getCallbackPort()}`);

      if (url.pathname !== '/callback') {
        res.writeHead(404);
        res.end('Not found');
        return;
      }

      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      const error = url.searchParams.get('error');

      if (error || !code || !state) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(ERROR_HTML);
        cleanup();
        reject(new Error(url.searchParams.get('error_description') || error || 'Callback sem código de autorização'));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(SUCCESS_HTML);
      cleanup();
      resolve({ code, state });
    });

    const timer = setTimeout(() => {
      cleanup();
      reject(new Error('Login expirou. Tente novamente.'));
    }, timeoutMs);

    function cleanup() {
      clearTimeout(timer);
      server.close();
    }

    server.on('error', (err) => {
      cleanup();
      reject(new Error(`Não foi possível iniciar o servidor OAuth na porta ${getCallbackPort()}: ${err.message}`));
    });

    server.listen(getCallbackPort(), '127.0.0.1');
  });
}
