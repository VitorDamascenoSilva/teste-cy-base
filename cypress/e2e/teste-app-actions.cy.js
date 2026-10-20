/// <reference types="cypress" />

import appActions from '../support/appActions'

describe('Login no hub de leitura', () => {

    beforeEach(() => {
        cy.visit('login.html')
        cy.setCookie('jwt_education_shown', 'true')
    });

    it('Deve fazer login com sucesso com usuário comum - sem App Actions', () => {
        cy.login('usuario@teste.com', 'user123')
        cy.get('h4').should('contain', 'Olá')
    })

    it('Deve fazer login com sucesso com usuário comum - via api', () => {
        cy.request({
            method: 'POST',
            url: 'api/login',
            body: {
                "email": "usuario@teste.com",
                "password": "user123"
            }
        }).then((response)=>{
            expect(response.status).to.equal(200)
            
            //Criar o estado da aplicação
            window.localStorage.setItem('authToken', response.body.token)
            window.localStorage.setItem('isAdmin', false)
            window.localStorage.setItem('userId', response.body.id)
            window.localStorage.setItem('userName', response.body.name)
            cy.visit('dashboard.html')
            cy.get('h4').should('contain', 'Olá')
        })

    });

    it('Deve fazer login com sucesso com usuário comum - setando o token', () => {
        let token = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ1c3VhcmlvQHRlc3RlLmNvbSIsImlzQWRtaW4iOmZhbHNlLCJpYXQiOjE3OTA4OTM4NzgsImV4cCI6MTc5MDkyMjY3OH0.Z2Y61dFzQkg6azCa_brelbOZA-gsZ4grfT4qer4NWhY"
        window.localStorage.setItem('authToken', token)
        cy.visit('dashboard.html')
        cy.get('h4').should('contain', 'Olá')
    });

    it('Deve fazer login com sucesso com usuário admin - usando comando customizado', () => {
        cy.setCookie('jwt_education_shown', 'true')

        cy.login(Cypress.env('ADMIN_EMAIL'), Cypress.env('ADMIN_SENHA'))
        cy.get('h1').should('contain', 'Painel Administrativo')

        /*cy.wait(10000)
        cy.clearCookie('jwt_education_shown')
        cy.reload()*/
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

    it('Deve fazer login com sucesso usando AppActions', () => {
    appActions.login('usuario@teste.com', 'user123')

    cy.url().should('include', 'dashboard')
    cy.get('h4').should('contain', 'Olá')
})


    const reservas = {
        "reservations": [
            {
                "id": 3,
                "status": "active",
                "reservation_date": "2026-09-29 22:08:40",
                "pickup_deadline": "2026-10-01T22:08:40.595Z",
                "pickup_date": null,
                "return_deadline": null,
                "return_date": null,
                "notes": "",
                "renewal_count": 0,
                "title": "Livro de testes com intercept",
                "author": "Markus Zusak",
                "category": "Ficção",
                "cover_image": "menina-que-roubava-livros.jpg",
                "isbn": "978-85-AUTO-0008-4",
                "editor": "Editora Intrínseca",
                "language": "Português",
                "calculated_status": "active",
                "hours_remaining": 47
            }
        ],
        "statistics": {
            "active": 1,
            "pickedUp": 0,
            "returned": 0,
            "cancelled": 0,
            "overdue": 0,
            "expired": 0
        },
        "pagination": {
            "total": 1,
            "limit": 20,
            "offset": 0,
            "hasNext": false,
            "hasPrev": false,
            "showing": 1
        },
        "filters": {
            "status": "all",
            "orderBy": "desc"
        }

    }

    it.skip('Deve mudar o idioma do site da EBAC via cookie', () => {
        cy.visit('https://lms.ebaconline.com.br/')
        cy.setCookie('i18n_redirected', 'en')
        cy.reload()
    });

})