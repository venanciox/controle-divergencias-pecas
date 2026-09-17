# Controle de Divergências de Peças

Este projeto foi desenvolvido para otimizar o controle de estoque no departamento de peças. O objetivo é oferecer uma ferramenta web acessível, leve e independente, que simplifique o registro e o acompanhamento de sobras, faltas e defeitos, sem a necessidade de infraestrutura complexa de servidores.

## Funcionalidades Principais

* **Gestão Intuitiva:** Adicione, edite, visualize e remova registros de peças de forma rápida e centralizada.
* **Organização Estruturada:** Classifique as divergências entre Faltas, Sobras e Defeitos. Para itens avariados ou fora de conformidade, o sistema permite o registro do valor financeiro da peça.
* **Relatórios Automatizados:** Exporte os dados diretamente para Excel. A planilha é gerada com formatação pronta para impressão, respeitando os filtros de busca aplicados na interface.
* **Acesso Seguro:** O sistema conta com uma tela de acesso restrito, senhas criptografadas e autenticação via token JWT, garantindo a proteção das informações internas.
* **Visão Geral (Dashboard):** Acompanhe o resumo e a contagem de todos os registros em tempo real diretamente na tela inicial.

## Tecnologias Utilizadas

* **Back-end:** Python, FastAPI e Uvicorn.
* **Banco de Dados:** SQLite integrado com SQLAlchemy (os dados são armazenados localmente e de forma segura, dispensando servidores externos).
* **Front-end:** HTML, JavaScript nativo e Tailwind CSS.
* **Segurança e Processamento:** PyJWT, bcrypt e openpyxl.

## Execução Local

Iniciar o sistema na sua máquina de trabalho é um processo direto. Certifique-se de ter o Python instalado e siga os passos abaixo no terminal:

**1. Instale as dependências:**
```bash
pip install -r requirements.txt