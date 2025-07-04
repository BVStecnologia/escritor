#!/usr/bin/env python3
"""
Servidor simples para testar a landing page estática
Execute com: python3 serve-static.py
Depois acesse: http://localhost:8080/index-static.html
"""

import http.server
import socketserver
import os

# Porta do servidor
PORT = 8080

# Muda para o diretório public
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# Cria o servidor
Handler = http.server.SimpleHTTPRequestHandler

print(f"🚀 Servidor iniciado!")
print(f"📁 Servindo arquivos de: {os.getcwd()}")
print(f"🌐 Acesse: http://localhost:{PORT}/index-static.html")
print(f"✋ Pressione Ctrl+C para parar\n")

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n👋 Servidor encerrado!")