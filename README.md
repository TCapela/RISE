# R.I.S.E — Requalificação, Inclusão, Sustentabilidade e Empregabilidade

## 🚀 Visão Geral do Projeto
O **R.I.S.E.** é um ecossistema completo criado para apoiar pessoas em processo de reintegração ao mercado de trabalho.  
A solução integra:

- Aplicativo Mobile (React Native + Expo)  
- API .NET 8  
- Banco Oracle  
- IA Generativa (Gemini Flash 2.5)  
- Arquitetura unificada Web/Mobile + Deep Learning  

Seu objetivo é oferecer uma jornada guiada por IA, com currículo inteligente, trilhas de requalificação e ferramentas de acompanhamento de progresso.

---

# 🔥 Funcionalidades Principais

## 🧠 Currículo Inteligente (IA Generativa)
Após preencher o currículo, o usuário recebe:

- Nota de empregabilidade (0–100)  
- Pontos de melhoria  
- Resumo reescrito  
- Sugestões de bullet points  
- Preparação para entrevista  
- Cursos recomendados com base nos gaps  
- Explicação da nota (“raw”)  

A API retorna tudo em **JSON estruturado**, consumido de forma direta pelo app.

---

## 📄 Geração de PDF
- Geração de currículo em PDF usando Expo Print  
- Layout limpo e profissional  
- Exportação direta do dispositivo  

---

## 📱 Telas do Aplicativo

- **Home** — atalhos, trilhas, cursos e progresso  
- **Trilhas** — caminhos de requalificação com etapas e metas  
- **Cursos** — catálogo FIAP integrado ao painel Admin  
- **Bem-estar** — registro diário de humor e estudo  
- **Perfil** — dados pessoais, skills e completude  
- **Currículo Inteligente** — CRUD completo, IA, persistência Oracle  
- **Sobre** — visão geral do app + hash do commit  
- **Admin** (separado) — cursos, usuários e currículos  

---

# 🧩 Arquitetura da Solução

## 📱 Mobile (React Native + Expo)
- Expo Router  
- Zustand (store global)  
- Axios (API)  
- Expo Print (PDF)  
- Identidade visual customizada  
- Variáveis de ambiente via `EXPO_PUBLIC_API_URL`  
- Script automatizado para hash do commit  

---

## 🔧 Backend (.NET 8)
- API REST com versionamento: `/api/v1`  
- EF Core + Oracle  
- Camada de serviços e controllers  
- Serviço **AiCurriculoService** com prompt engineering  
- Swagger  
- CORS configurado  
- Persistência de currículo, trilhas, cursos e bem-estar  

Github DOTNET:
https://github.com/raphatatto/gs_rise_dotnet.git

---

## 🗄 Banco Oracle
Tabelas principais:

- **TB_RISE_USUARIO**  
- **TB_RISE_CURRICULO**  
- **TB_RISE_CURSO**  
- **TB_RISE_BEM_ESTAR**  
- **TB_RISE_TRILHA**  
- **TB_RISE_TRILHA_OBJETIVO**  

---

# 🧠 Fluxo da IA — End-to-End

1. Usuário preenche o currículo no app  
2. App envia JSON para o endpoint `/AiCurriculo/feedback`  
3. API monta prompt avançado (prompt engineering)  
4. Envio para **Gemini Flash 2.5**  
5. IA retorna JSON estruturado  
6. Backend valida e devolve ao app  
7. App exibe insights, nota e recomendações  

---

# ▶️ Como Executar

## Backend (.NET)
```
dotnet restore
dotnet build
dotnet run
```
Swagger:  
`http://localhost:5106/swagger`

Ajustar a connection string no `appsettings.json`.

---

## Mobile (Expo)
```
npm install
```

Criar `.env`:
```
EXPO_PUBLIC_API_URL=http://SEU_IP:5106/api/v1
```

Rodar:
```
npm start
```
ou:
```
expo start
```

---

# 🎥 Demonstração
Link Vídeo Apresentação:
https://youtu.be/Z1gAPlWt6ms

---

# 🌍 Conexão com o Tema FIAP: Futuro do Trabalho
O projeto atende diretamente os ODS:

- **ODS 4 — Educação de Qualidade**  
- **ODS 8 — Trabalho Decente e Crescimento Econômico**  
- **ODS 9 — Inovação e Infraestrutura**  
- **ODS 10 — Redução das Desigualdades**

A solução reforça requalificação, empregabilidade e inclusão.

---

## 👤 Autores
- Tiago Capela RM 558021
- Raphaella Tatto RM 554983