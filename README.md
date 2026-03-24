#  Painel de Chamada de Senhas - Hospital Viver+

Sistema de gestão visual e sonora para chamadas de pacientes em Pronto Socorro, integrado ao sistema Tasy.

# Funcionalidades
- **Chamada Inteligente:** Interface dinâmica que destaca a senha atual e mantém o histórico das últimas chamadas.
- **Persistência de Dados:** Histórico que resiste ao reset de meia-noite e reinicializações do navegador.
- **Acessibilidade:** Síntese de voz em PT-BR para anúncio de senhas e nomes de pacientes.
- **Informações Úteis:** Letreiro dinâmico com cotação de moedas (Dólar/Euro) e clima em tempo real via API.
- **Visual Responsivo:** Layout vertical otimizado para monitores de recepção.

# Tecnologias Utilizadas
- **Frontend:** HTML5, CSS3 (Flexbox/Animations), JavaScript (Vanilla JS).
- **Backend:** PHP (Integração com Banco de Dados Oracle/Tasy).
- **APIs Externas:** AwesomeAPI (Economia) e Open-Meteo (Clima).

# Como usar
1. Clone o repositório.
2. Configure o arquivo `api.php` com as credenciais do seu banco de dados.
3. Certifique-se de que o servidor possui acesso à internet para as cotações.