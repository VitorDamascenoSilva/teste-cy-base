/// <reference types="cypress" />

describe('Login no hub de leitura', () => {

  beforeEach(() => {
    cy.visit('login.html')
    cy.setCookie('jwt_education_shown', 'true') 
  });

  it('Deve fazer login com sucesso com usuário comum - usando comando customizado', () => {
    cy.login('usuario@teste.com', 'user123')
    cy.get('h4').should('contain', 'Olá')
  })

  it('Deve fazer login com sucesso com usuário admin - usando comando customizado', () => {
    cy.login(Cypress.env('ADMIN_EMAIL'), Cypress.env('ADMIN_SENHA'))
    cy.get('h1').should('contain', 'Painel Administrativo')
  })

  it('Deve fazer login com sucesso com usuário comum - usando intercept', () => {
    cy.intercept('POST', 'api/login',
      {
        statusCode: 200,
        body: {
          token: 'token123',
          name: 'Usuário de teste'
        }
      }).as('loginMock')

    cy.login('usuario@usuario.com', 'testeuser123')
    cy.wait('@loginMock')
    cy.get('h4').should('contain', 'Olá')

  })

  it('Deve simular um erro do servidor - usando intercept', () => {
    cy.intercept('POST', 'api/login', {
      statusCode: 500
    }).as('erroServer')
    cy.loginErro('usuario@teste.com', 'user123')
    cy.wait('@erroServer')
    cy.get('#alert-container').should('contain', 'Erro de conexão. Tente novamente.')
  });

  it('Deve simular um erro do cliente - usando intercept', () => {
    cy.intercept('POST', 'api/login', {
      statusCode: 400, body: { erro: 'erro do cliente' }
    }).as('erroClient')
    cy.login('usuario@teste.com', 'user123', false)
    cy.wait('@erroClient')
    cy.get('#alert-container').should('contain', 'Erro ao fazer login')
  });


})