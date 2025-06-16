# {Nome do seu Projeto}

Este repositório contém um projeto desenvolvido utilizando Angular. Neste arquivo README, você encontrará um guia passo a passo para abrir o projeto em seu ambiente local.

## Pré-requisitos

Antes de começar, verifique se você possui as seguintes ferramentas instaladas em sua máquina:

- Node.js (versão 12 ou superior)
- npm (gerenciador de pacotes do Node.js)
- Angular Instalado
- NestJS Instalado
- Docker Instalado

## Passo 1: Clonar o Front End

Comece clonando o front end para sua máquina local. Abra o terminal e execute o seguinte comando:

```bash
git clone https://github.com/gustavodcdamas/TrabalhoFrontEnd
```

Isso criará uma cópia local do repositório em seu ambiente.

Extraia o arquivo zip.


## Passo 2: Fazer o build da imagem

Navegue até o diretório raiz do projeto e execute o seguinte comando para buildar a imagem:

```bash
cd nome-do-repositorio
npm install
```

Esse comando irá ler o arquivo `package.json` e instalar todas as dependências necessárias para o projeto.

## Passo 3: Opção de fazer sem buildar a imagem

Use o arquivo Docker compose do repositório com a versão mais atualizada no repositório oficial, neste caso, pule para o próximo passo:

## Passo 4: Configurar variáveis de ambiente

O projeto pode exigir algumas variáveis de ambiente para funcionar corretamente. Verifique se existe um arquivo `.env.example` no diretório raiz do projeto. Se existir, faça uma cópia desse arquivo e renomeie-o para `.env`. Em seguida, atualize as variáveis de ambiente de acordo com as configurações do seu ambiente local.

## Passo 5: Iniciar o servidor

Para iniciar o servidor Docker, execute o seguinte comando:

```bash
docker compose up -d
```

Isso iniciará o servidor e você poderá acessá-lo através do seu navegador no endereço `http://localhost:3000`.

## Passo 5: Iniciar o cliente React

O projeto pode conter um diretório separado para o cliente React. Nesse caso, navegue até o diretório do cliente e execute o seguinte comando:

```bash
cd client
npm install
npm start
```

Isso iniciará o cliente React e você poderá acessá-lo através do seu navegador no endereço `http://localhost:3000`.

## Passo 6: Modificar o projeto

Agora que você tem o projeto em execução, você pode fazer modificações no código conforme necessário. Sinta-se à vontade para explorar e adaptar o projeto de acordo com suas necessidades.

## Passo 7: Publicar suas modificações

Se desejar publicar suas modificações em um repositório remoto no GitHub, siga estes passos:

1. Crie um novo repositório vazio no GitHub.
2. No terminal, navegue até o diretório raiz do projeto.
3. Execute os seguintes comandos:

```bash
git remote set-url origin https://github.com/seu-usuario/nome-do-novo-repositorio.git
git add .
git commit -m "Adicionar minhas modificações"
git push -u origin master
```

Isso configurará o repositório remoto e enviará suas modificações para lá.

---
