# 💈 Narvalhando - Sistema de Gerenciamento de Barbearia

Sistema completo para gerenciamento de barbearia desenvolvido com React Native (Expo) no frontend e Node.js (Fastify) no backend. Permite controle total de agendamentos, clientes, serviços, com dashboard em tempo real, sistema de pagamentos e relatórios detalhados.

## 📑 Índice

- [✨ Destaques](#-destaques)
- [🚀 Tecnologias](#-tecnologias)
- [📋 Pré-requisitos](#-pré-requisitos)
- [⚙️ Configuração](#️-configuração-do-backend)
- [🔐 Autenticação](#-autenticação)
- [💾 Modelo de Dados](#-modelo-de-dados)
- [📊 Funcionalidades](#-funcionalidades)
- [📝 API Endpoints](#-api-endpoints)
- [🔄 Fluxo da Aplicação](#-fluxo-da-aplicação)
- [🛠️ Scripts Disponíveis](#️-scripts-disponíveis)
- [🔧 Troubleshooting](#-troubleshooting)
- [🏗️ Estrutura do Projeto](#️-estrutura-do-projeto)
- [⚡ Características Técnicas](#-características-técnicas)
- [🚀 Melhorias Futuras](#-melhorias-futuras)

## ✨ Destaques

- 📱 **App Mobile Nativo** com Expo
- 🔐 **Autenticação Segura** com JWT
- 📊 **Dashboard em Tempo Real** com estatísticas
- 💳 **Sistema de Pagamentos** (PIX, Cartão, Dinheiro)
- 📈 **Relatórios Detalhados** por período
- 🎯 **Onboarding Interativo** para novos usuários
- 📍 **Geolocalização** (funcionalidade nativa)
- ⚡ **Performance Otimizada** com cache local

## 🚀 Tecnologias

### Backend

- **Node.js** com **Fastify**
- **TypeScript**
- **Prisma ORM** (PostgreSQL)
- **JWT** para autenticação
- **Zod** para validação
- **bcrypt** para criptografia de senhas

### Frontend

- **React Native** com **Expo**
- **TypeScript**
- **Expo Router** para navegação baseada em arquivos
- **Axios** para requisições HTTP
- **AsyncStorage** para armazenamento local
- **Expo Location** para geolocalização (funcionalidade nativa)
- **Expo Haptics** para feedback tátil
- **React Native Swiper** para onboarding
- **Expo Linear Gradient** para gradientes visuais
- **Material Icons** para ícones

## 📋 Pré-requisitos

### Sistema

- **Node.js** v18 ou superior
- **PostgreSQL** v12 ou superior
- **npm** ou **yarn**

### Ferramentas

- **Expo CLI**: `npm install -g expo-cli`
- **Git** para controle de versão
- Um **dispositivo físico** (Android/iOS) ou **emulador**

### Conhecimentos Recomendados

- JavaScript/TypeScript
- React Native básico
- REST APIs
- SQL básico

## ⚙️ Configuração do Backend

1. **Navegue até a pasta do backend:**

   ```bash
   cd backend
   ```

2. **Instale as dependências:**

   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**

   - Copie o arquivo `.env.example` para `.env`
   - Configure a `DATABASE_URL` com suas credenciais do PostgreSQL
   - Configure o `JWT_SECRET` (em produção, use um valor seguro)

   ```env
   DATABASE_URL="postgresql://usuario:senha@localhost:5432/narvalhando_db"
   JWT_SECRET="seu-secret-super-seguro"
   PORT=3000
   NODE_ENV=development
   FRONTEND_URL="*"
   ```

4. **Execute as migrações do banco de dados:**

   ```bash
   npx prisma migrate dev
   ```

5. **Inicie o servidor:**

   ```bash
   npm run dev
   ```

   O servidor estará rodando em `http://localhost:3000`

## 📱 Configuração do Frontend

1. **Navegue até a pasta do frontend:**

   ```bash
   cd frontend
   ```

2. **Instale as dependências:**

   ```bash
   npm install
   ```

3. **Configure a URL da API:**

   - Abra o arquivo `src/services/api.ts`
   - Altere a constante `API_URL` para o IP da sua máquina na rede local:

   ```typescript
   const API_URL = "http://192.168.X.X:3000"; // Substitua pelo seu IP
   ```

   **Como descobrir seu IP:**

   - Windows: `ipconfig` no CMD
   - Mac/Linux: `ifconfig` no Terminal
   - Procure por "IPv4" ou "inet"

4. **Inicie o Expo:**

   ```bash
   npm start
   ```

5. **Execute o app:**
   - Pressione `a` para Android
   - Pressione `i` para iOS
   - Ou escaneie o QR code com o app Expo Go

## 🔐 Autenticação

O sistema usa JWT (JSON Web Tokens) para autenticação. As credenciais são armazenadas de forma segura:

- **Senhas criptografadas** com bcrypt (salt rounds: 10)
- **Token JWT** armazenado no AsyncStorage do dispositivo
- **Rotas protegidas** requerem token válido no header
- **Middleware de autenticação** em todas as rotas sensíveis
- **Validação automática** de token em cada requisição

### Segurança

- ✅ Validação de entrada com Zod em todas as rotas
- ✅ Sanitização de dados antes de inserir no banco
- ✅ CORS configurado para aceitar apenas origens permitidas
- ✅ Tratamento adequado de erros sem expor dados sensíveis
- ✅ Timestamps automáticos para auditoria
- ✅ Constraints de unicidade no banco de dados

## 💾 Modelo de Dados

### Principais Entidades

#### Barber (Barbeiro)

- `id`: Identificador único
- `name`: Nome do barbeiro
- `email`: Email (único)
- `password`: Senha criptografada
- `createdAt`: Data de criação

#### Client (Cliente)

- `id`: Identificador único
- `name`: Nome do cliente
- `phone`: Telefone (único, opcional)
- `createdAt`: Data de cadastro

#### Service (Serviço)

- `id`: Identificador único
- `name`: Nome do serviço
- `price`: Preço (Float)
- `duration`: Duração em minutos
- `createdAt`: Data de criação

#### Appointment (Agendamento)

- `id`: Identificador único
- `date`: Data e hora do agendamento
- `status`: SCHEDULED | COMPLETED | CANCELED
- `paymentType`: PENDING | PIX | CARD | CASH
- `clientId`: Referência ao cliente
- `serviceId`: Referência ao serviço
- `barberId`: Referência ao barbeiro
- `createdAt`: Data de criação

## 📊 Funcionalidades

### Backend

- ✅ Autenticação (Login/Registro) com JWT
- ✅ CRUD completo de Clientes
- ✅ CRUD completo de Serviços
- ✅ CRUD completo de Agendamentos
- ✅ Gestão de status de agendamentos (SCHEDULED, COMPLETED, CANCELED)
- ✅ Sistema de tipos de pagamento (PIX, CARD, CASH, PENDING)
- ✅ Dashboard com estatísticas em tempo real
- ✅ Relatórios detalhados (por serviço, barbeiro, data, período)
- ✅ Filtros avançados de agendamentos (por data, cliente, status)
- ✅ Todas as rotas protegidas com autenticação
- ✅ Validação de dados com Zod
- ✅ Tratamento robusto de erros

### Frontend

- ✅ Tela de Onboarding interativa com Swiper
- ✅ Sistema completo de autenticação (Login/Registro)
- ✅ Recuperação de senha (Esqueceu senha, Código de confirmação, Redefinição)
- ✅ Dashboard com visão geral e estatísticas
- ✅ Gestão completa de agendamentos (criar, editar, cancelar)
- ✅ Visualização de agendamentos do dia
- ✅ Sistema de pagamentos integrado (PIX, Cartão, Dinheiro)
- ✅ Feedback tátil (Haptics) para interações
- ✅ Relatórios por período (hoje, semana, mês, todos)
- ✅ Histórico detalhado de atendimentos
- ✅ Geolocalização (funcionalidade nativa)
- ✅ Tratamento de erros centralizado
- ✅ Interface responsiva e intuitiva
- ✅ Refresh manual de dados
- ✅ Modais para ações importantes

## 📝 API Endpoints

### Autenticação

- `POST /login` - Autenticação de usuário
- `POST /register` - Registro de novo barbeiro

### Clientes (Protegidas 🔒)

- `GET /clientes` - Listar todos os clientes
- `GET /clientes/:id` - Buscar cliente por ID
- `GET /clientes/nome/:name` - Buscar cliente por nome
- `POST /clientes` - Criar novo cliente
- `PUT /clientes/:id` - Atualizar dados do cliente
- `DELETE /clientes/:id` - Deletar cliente

### Serviços (Protegidas 🔒)

- `GET /service` - Listar todos os serviços
- `POST /service` - Criar novo serviço
- `PUT /service/:id` - Atualizar serviço
- `DELETE /service/:id` - Deletar serviço

### Agendamentos (Protegidas 🔒)

- `GET /appointment` - Listar todos os agendamentos
- `GET /appointment/:id` - Buscar agendamento por ID
- `GET /appointment/today` - Agendamentos do dia atual
- `GET /appointment/future` - Próximos agendamentos
- `GET /appointment/by-date?date=YYYY-MM-DD` - Agendamentos por data específica
- `GET /appointment/by-client/:id` - Agendamentos de um cliente
- `GET /appointment/status/:status` - Filtrar por status (SCHEDULED, COMPLETED, CANCELED)
- `POST /appointment` - Criar novo agendamento
- `PUT /appointment/:id` - Atualizar agendamento completo
- `PATCH /appointment/:id/status` - Atualizar apenas o status
- `PATCH /appointment/:id/payment` - Atualizar tipo de pagamento (PIX, CARD, CASH, PENDING)
- `PUT /appointment/:id/complete` - Marcar agendamento como concluído
- `DELETE /appointment/:id` - Cancelar/deletar agendamento

### Dashboard (Protegidas 🔒)

- `GET /dashboard/overview` - Visão geral com estatísticas gerais
- `GET /dashboard/revenue` - Dados de faturamento total e mensal
- `GET /dashboard/upcoming-appointments` - Próximos agendamentos
- `GET /dashboard/popular-services` - Serviços mais populares

### Relatórios (Protegidas 🔒)

- `GET /reports/appointments-by-service` - Relatório de agendamentos por serviço
- `GET /reports/appointments-by-barber` - Relatório de agendamentos por barbeiro
- `GET /reports/appointments-by-date?date=YYYY-MM-DD` - Relatório por data específica
- `GET /reports/total-appointments` - Total geral de agendamentos
- `GET /reports/weekly-summary` - Resumo da semana
- `GET /reports/monthly?year=YYYY&month=MM` - Relatório mensal detalhado

## 🛠️ Scripts Disponíveis

### Backend

```bash
npm run dev      # Inicia o servidor em modo desenvolvimento
```

### Frontend

```bash
npm start        # Inicia o Expo
npm run android  # Abre no emulador Android
npm run ios      # Abre no emulador iOS
npm run web      # Abre no navegador
```

## � Fluxo da Aplicação

### Primeiro Acesso

1. **Onboarding** - Apresentação do aplicativo em 3 slides
2. **Login/Registro** - Autenticação do barbeiro
3. **Dashboard** - Tela principal com visão geral

### Fluxo de Agendamento

1. **Criar Agendamento** - Selecionar cliente, serviço, data e hora
2. **Visualizar no Dashboard** - Agendamentos do dia aparecem na tela principal
3. **Marcar Pagamento** - Selecionar tipo de pagamento (PIX/Cartão/Dinheiro)
4. **Finalizar Atendimento** - Marcar como concluído
5. **Relatórios** - Visualizar histórico e estatísticas

### Funcionalidades Principais

- **Dashboard**: Estatísticas em tempo real, próximos agendamentos, receita
- **Agendamentos**: Criar, visualizar, editar e cancelar
- **Relatórios**: Filtrar por período, visualizar receita e atendimentos
- **Serviços**: Gerenciar catálogo de serviços com preços
- **Clientes**: Manter cadastro de clientes

## �🔧 Troubleshooting

### Backend não conecta ao banco de dados

- Verifique se o PostgreSQL está rodando
- Confirme as credenciais no arquivo `.env`
- Execute `npx prisma migrate dev` novamente

### Frontend não conecta ao backend

- Verifique se o backend está rodando
- Confirme o IP correto no arquivo `src/services/api.ts`
- Certifique-se de que o dispositivo e o computador estão na mesma rede Wi-Fi

### Erro de permissão de localização

- No Android: Vá em Configurações > Aplicativos > Permissões
- No iOS: Vá em Configurações > Privacidade > Serviços de Localização

## 📱 Funcionalidade Nativa

O app utiliza **expo-location** para acessar o GPS do dispositivo, permitindo:

- Obter coordenadas em tempo real
- Calcular distância até barbearias
- Mostrar barbearias próximas

Veja mais detalhes em [FUNCIONALIDADE_NATIVA.md](frontend/FUNCIONALIDADE_NATIVA.md)

## 🏗️ Estrutura do Projeto

```
Narvalhando/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── src/
│       ├── auth/
│       │   ├── login.ts
│       │   └── register.ts
│       ├── config/
│       │   ├── app.ts
│       │   └── prismaClient.ts
│       ├── controllers/
│       │   ├── appointmentController.ts
│       │   ├── clienteController.ts
│       │   ├── dashboardController.ts
│       │   ├── reportsController.ts
│       │   └── serviceController.ts
│       ├── middleware/
│       │   └── auth.ts
│       ├── schemas/
│       │   ├── appointmentSchema.ts
│       │   ├── clienteShema.ts
│       │   ├── reportsSchema.ts
│       │   └── serviceSchema.ts
│       ├── types/
│       │   └── fastify-jwt.d.ts
│       └── server.ts
└── frontend/
    └── src/
        ├── app/
        │   ├── onboarding/
        │   ├── login/
        │   ├── register/
        │   ├── forgotPassword/
        │   ├── confirmationCode/
        │   ├── resetPassword/
        │   ├── dashboard/
        │   ├── agendamentos/
        │   ├── novo-agendamento/
        │   ├── editar-agendamento/
        │   ├── agendamento-sucesso/
        │   ├── servicos/
        │   └── relatorios/
        ├── components/
        │   ├── button/
        │   ├── input/
        │   ├── passwordInput/
        │   ├── datePicker/
        │   └── timePicker/
        ├── services/
        │   ├── api.ts
        │   ├── authService.ts
        │   ├── appointmentService.ts
        │   ├── clientService.ts
        │   ├── dashboardService.ts
        │   ├── reportsService.ts
        │   ├── serviceService.ts
        │   └── errorHandler.ts
        └── styles/
            ├── authStyles.ts
            └── theme.ts
```

## ⚡ Características Técnicas

### Performance

- **Lazy Loading** de rotas no frontend
- **Queries otimizadas** com Prisma ORM
- **Cache local** com AsyncStorage
- **Refresh manual** para atualização de dados

### UX/UI

- **Design responsivo** adaptado para diferentes tamanhos de tela
- **Feedback visual** em todas as ações
- **Feedback tátil (Haptics)** para melhor experiência
- **Loading states** durante operações assíncronas
- **Tratamento de erros** com mensagens amigáveis
- **Modais** para confirmações importantes

### Arquitetura

- **Separação de responsabilidades** (controllers, services, schemas)
- **Validação centralizada** com Zod
- **Tratamento de erros** padronizado
- **Tipagem forte** com TypeScript
- **RESTful API** seguindo boas práticas
- **Migrations** versionadas com Prisma

## 🚀 Melhorias Futuras

### Funcionalidades Planejadas

- [ ] Notificações push para lembrar clientes de agendamentos
- [ ] Sistema de avaliações e feedback dos clientes
- [ ] Integração com calendário do dispositivo
- [ ] Modo escuro (dark mode)
- [ ] Múltiplos barbeiros por barbearia
- [ ] Sistema de fidelidade/pontos para clientes
- [ ] Exportação de relatórios em PDF
- [ ] Integração com WhatsApp Business
- [ ] Sistema de filas de espera
- [ ] Agendamento online pelo cliente

### Melhorias Técnicas

- [ ] Implementação de testes unitários e de integração
- [ ] CI/CD com GitHub Actions
- [ ] Monitoramento de erros com Sentry
- [ ] Analytics com Firebase
- [ ] Otimização de imagens e assets
- [ ] PWA (Progressive Web App) versão web

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é privado e de uso educacional.

## 👨‍💻 Desenvolvido por

**Vanderson Amaral**

## 📸 Screenshots

### Principais Telas

- **Onboarding**: Introdução ao app com slides interativos
- **Login/Registro**: Autenticação segura
- **Dashboard**: Visão geral com estatísticas em tempo real
- **Agendamentos**: Lista de agendamentos com filtros
- **Novo Agendamento**: Formulário completo para criar agendamentos
- **Sistema de Pagamentos**: Seleção de tipo de pagamento
- **Relatórios**: Análises detalhadas por período

## 🔗 Links Úteis

- [Documentação do Expo](https://docs.expo.dev/)
- [Documentação do Fastify](https://www.fastify.io/)
- [Documentação do Prisma](https://www.prisma.io/docs)
- [React Native](https://reactnative.dev/)

## 📝 Notas de Desenvolvimento

### Backend

- Todas as rotas são protegidas com autenticação exceto login e registro
- Prisma gera automaticamente os tipos TypeScript
- Validação em duas camadas: Zod + Prisma
- Logs detalhados para debugging

### Frontend

- Navegação baseada em arquivos com Expo Router
- Estado local gerenciado com React hooks
- Feedback imediato para todas as ações
- Tratamento de erros em todas as requisições
- AsyncStorage para persistência local

---

**Nota:** Este é um projeto educacional desenvolvido para fins de aprendizado em desenvolvimento mobile e arquitetura de sistemas completos.

**Status:** ✅ Em desenvolvimento ativo

**Última atualização:** Janeiro 2026

```

```
