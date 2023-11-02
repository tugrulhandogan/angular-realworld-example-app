/// <reference types="cypress" />

const { tokenToString } = require("typescript")

//const { method } = require("cypress/types/bluebird")

describe('Test with backend', () => {

    beforeEach('login to application', () => {
        cy.loginToApplication()
        cy.intercept({ method: 'Get', path: 'tags' }, { fixture: 'tags.json' })
    })

    it('verify correct request and response', () => {

        cy.intercept('POST', 'https://api.realworld.io/api/articles/').as('postArticles')

        cy.contains('New Article').click()
        cy.get('[formcontrolname="title"]').type('This is the title 5')
        cy.get('[formcontrolname="description"]').type('This is a description')
        cy.get('[formcontrolname="body"]').type('This is a body of the article')
        cy.contains('Publish Article').click()

        cy.wait('@postArticles').then(xhr => {
            console.log(xhr)
            expect(xhr.response.statusCode).to.equal(201)
            expect(xhr.request.body.article.body).to.equal('This is a body of the article')
            expect(xhr.response.body.article.description).to.equal('This is a description')
            cy.url()
        })

    })

    it('should gave tags with routing object', () => {
        cy.get('[class="col-md-3"] [class="tag-list"]')
            .should('contain', 'cypress')
            .and('contain', 'automation')
            .and('contain', 'testing')
    })

    it('Verify global feed likes count', () => {
        cy.intercept('GET', 'https://api.realworld.io/api/articles/feed*', { "articles": [], "articlesCount": 0 })
        cy.intercept('GET', 'https://api.realworld.io/api/articles*', { fixture: 'articles.json' })

        cy.contains('Global Feed').click()
        cy.get('app-article-list button').then(heartList => {
            expect(heartList[0]).to.contain('1')
            expect(heartList[1]).to.contain('5')
        })

        cy.fixture('articles').then(file => {
            const articleLink = file.articles[1].slug
            file.articles[1].favoritesCount = 6
            cy.intercept('POST', 'https://api.realworld.io/api/articles/' + articleLink + '/favorite', file)

        })

        cy.get('app-article-list button').eq(1).click().should('contain', '6')

    })

    it('intercepting and modifying the request and response', () => {

        // cy.intercept('POST', '**articles/', (req) => {
        //     req.body.article.description = "This is a description 2"
        // }).as('postArticles')

        cy.intercept('POST', '**articles/', (req) => {
            req.reply(res => {
                expect(res.body.article.description).to.equal('This is a description')
                res.body.article.description = "This is a description 2"
            })
        }).as('postArticles')

        cy.contains('New Article').click()
        cy.get('[formcontrolname="title"]').type('This is the title 010')
        cy.get('[formcontrolname="description"]').type('This is a description')
        cy.get('[formcontrolname="body"]').type('This is a body of the article')
        cy.contains('Publish Article').click()

        cy.wait('@postArticles')
        cy.get('@postArticles').then(xhr => {
            console.log(xhr)
            expect(xhr.response.statusCode).to.equal(201)
            expect(xhr.response.body.article.body).to.equal('This is a body of the article')
            expect(xhr.response.body.article.description).to.equal('This is a description 2')
        })

    })

    it.only('delete a new article in a global feed', () => {

        // const userCredentials = {
        //     "user":
        //     {
        //         "email": "dogantugrulhan@gmail.com",
        //         "password": "Baklava1."
        //     }
        // }

        const bodyRequest = {
            "article": {
                "body": "Angular is cool",
                "description": "Tugrulhan",
                "tagList": [],
                "title": "Request from APII1nn"
            }
        }

        cy.get('@token').then(token => {
            //const token = body.user.token

            cy.request({
                url: Cypress.env('apiUrl') + '/api/articles/',
                headers: { 'Authorization': 'Token ' + token },
                method: 'POST',
                body: bodyRequest
            }).then(response => {
                expect(response.status).to.equal(201)
            })

            cy.contains('Global Feed').click()
            cy.wait(3000)
            cy.get('.article-preview').first().click()
            cy.get('.article-actions').contains('Delete Article').click()

            cy.request({
                url: Cypress.env('apiUrl') + '/api/articles?limit=10&offset=0',
                headers: { 'Authorization': 'Token ' + token },
                method: 'GET'
            }).its('body').then(body => {
                expect(body.articles[0].title).not.to.equal('Request from APII')
            })
        })
    })
})

