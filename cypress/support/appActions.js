
class AppActions {
    login(email, senha) {
        cy.visit('login.html')
        cy.get('#email').type(email)
        cy.get('#password').type(senha)
        cy.get('#login-btn').click()
    }
}

export default new AppActions()
