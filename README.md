# Controle de Divergências de Peças

Este projeto foi desenvolvido para otimizar o controle de estoque no departamento de peças. O objetivo é oferecer uma ferramenta web acessível, leve e independente, que simplifique o registro e o acompanhamento de sobras, faltas e defeitos, sem a necessidade de infraestrutura complexa de servidores.

## Funcionalidades Principais

* **Gestão Intuitiva:** Adicione, edite, visualize e remova registros de peças de forma rápida e centralizada.
* **Organização Estruturada:** Classifique as divergências entre Faltas, Sobras e Defeitos. Para itens avariados ou fora de conformidade, o sistema permite o registro do valor financeiro da peça.
* **Relatórios Automatizados:** Exporte os dados diretamente para Excel. A planilha é gerada com formatação pronta para impressão, respeitando os filtros de busca aplicados na interface.
* **Acesso Seguro:** O sistema conta com Rate Limiting contra ataques de força bruta, senhas criptografadas e autenticação nativa via HttpOnly Cookies, garantindo a proteção das informações internas.
* **Visão Geral (Dashboard):** Acompanhe o resumo e a contagem de todos os registros em tempo real diretamente na tela inicial.

## Tecnologias Utilizadas

* **Back-end:** Python, FastAPI e Uvicorn.
* **Banco de Dados:** SQLite integrado com SQLAlchemy (os dados são armazenados localmente e de forma segura, dispensando servidores externos).
* **Front-end:** HTML, JavaScript nativo e Tailwind CSS.
* **Segurança e Processamento:** PyJWT, bcrypt, slowapi (Rate Limiting), python-dotenv e openpyxl.

## Execução Local

Iniciar o sistema na sua máquina de trabalho é um processo direto. Certifique-se de ter o Python instalado e siga os passos abaixo no terminal:

**1. Instale as dependências:**
```bash
pip install -r requirements.txt
```

**2. Configure as Variáveis de Ambiente:**
Crie um arquivo chamado .env na raiz do projeto (baseado no .env.example) e defina as suas configurações de segurança:
```bash
ENVIRONMENT=development
JWT_SECRET_KEY=sua_chave_secreta_super_segura
FIRST_SUPERUSER_USERNAME=admin
FIRST_SUPERUSER_PASSWORD=sua_senha_forte
```

**3. Inicie o servidor:**
```bash
uvicorn main:app --reload
```

**4. Acesse o sistema:**
Abra o navegador e acesse `http://127.0.0.1:8000`. Durante o primeiro acesso, o sistema criará automaticamente o banco de dados e configurará o usuário administrador padrão.