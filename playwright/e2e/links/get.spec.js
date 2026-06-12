import { test, expect } from '../../support/fixtures'
import { getUserWithLink } from '../../support/factories/user'
import { faker } from '@faker-js/faker'

test.describe('GET /api/links', () => {
    let token
    const user = getUserWithLink()

    test.beforeEach(async ({auth}) =>{       
        await auth.createUser(user) //cadastra um usuario          
        token = await auth.getToken(user)//logar com o usuario cadastrado e guardar seu token
    })

    test('deve retornar os links gerados pelo usuário', async ({ links }) => {             
        //gerar 1 link e valida status 
        const createLinkResponse = await links.createLink(user.link, token)   
        expect(createLinkResponse.status()).toBe(201)
        //passa o body para json e valida se retornar id e shortcode do link criado
        const body = await createLinkResponse.json()        
        expect(body.data).toHaveProperty('id')
        expect(body.data).toHaveProperty('short_code')
        //salva o id e shortcode do link criado
        const idLink = body.data.id
        const shortCode = body.data.short_code

        //get links e valida status
        const response = await links.getLink(token)
        expect(response.status()).toBe(200)
        //passa o response para json e valida propriedades    
        const bodyGetLink = await response.json()
        expect(bodyGetLink).toHaveProperty('message', 'Links Encurtados')
        expect(bodyGetLink).toHaveProperty('count', 1)
        expect(bodyGetLink.data[0]).toHaveProperty('id', idLink)
        expect(bodyGetLink.data[0]).toHaveProperty('original_url', user.link.original_url)
        expect(bodyGetLink.data[0]).toHaveProperty('title', user.link.title)
        expect(bodyGetLink.data[0]).toHaveProperty('short_code', shortCode)

    })

    test('deve retornar os links gerados pelo usuário quando tem mais de um', async ({ links }) => {
        const createFirstLink = await links.createLink(user.link, token)
        //valida esse link gerado e guarda infos
        expect(createFirstLink.status()).toBe(201)
        const firstBody = await createFirstLink.json()
        expect(firstBody.data).toHaveProperty('id')
        expect(firstBody.data).toHaveProperty('short_code')
        const idFirstLink = firstBody.data.id
        const shortCodeFirstLink = firstBody.data.short_code

        //cria o segundo link
        const secondLink = {
            original_url: faker.internet.url(),
            title: faker.music.songName()
        }

        //cria o segundo link, valida e guarda as infos
        const createSecondLink = await links.createLink(secondLink, token)
        expect(createSecondLink.status()).toBe(201)
        const secondBody = await createSecondLink.json()
        expect(secondBody.data).toHaveProperty('id')
        expect(secondBody.data).toHaveProperty('short_code')
        const idSecondLink = secondBody.data.id
        const shortCodeSecondLink = secondBody.data.short_code

        //get links e validaçoes
        const getLink = await links.getLink(token)    
        expect(getLink.status()).toBe(200)

        const bodyGetLink = await getLink.json()
        expect(bodyGetLink).toHaveProperty('message', 'Links Encurtados')
        expect(bodyGetLink).toHaveProperty('count', 2)
        expect(bodyGetLink.data[0]).toHaveProperty('id', idFirstLink)
        expect(bodyGetLink.data[0]).toHaveProperty('original_url', user.link.original_url)
        expect(bodyGetLink.data[0]).toHaveProperty('title', user.link.title)
        expect(bodyGetLink.data[0]).toHaveProperty('short_code', shortCodeFirstLink)

        expect(bodyGetLink.data[1]).toHaveProperty('id', idSecondLink)
        expect(bodyGetLink.data[1]).toHaveProperty('original_url', secondLink.original_url)
        expect(bodyGetLink.data[1]).toHaveProperty('title', secondLink.title)
        expect(bodyGetLink.data[1]).toHaveProperty('short_code', shortCodeSecondLink)


    })

    test('deve retornar lista vazia quando usuario ainda não gerou links', async ({ links }) => {
        const getLink = await links.getLink(token)
        expect(getLink.status()).toBe(200)

        const bodyGetLink = await getLink.json()
        expect(bodyGetLink).toHaveProperty('message', 'Links Encurtados')
        expect(bodyGetLink).toHaveProperty('count', 0)
        expect(bodyGetLink.data).not.toHaveProperty('id')
        expect(bodyGetLink.data).not.toHaveProperty('original_url')
        expect(bodyGetLink.data).not.toHaveProperty('title')
        expect(bodyGetLink.data).not.toHaveProperty('short_code')
    })

    test('não deve retornar links sem logar ', async ({ links, request }) => {
        const getLink = await request.get('http://localhost:3333/api/links', {                   
        })
        expect(getLink.status()).toBe(401)

        const bodyGetLink = await getLink.json()
        expect(bodyGetLink).toHaveProperty('message', 'Header Authorization é obrigatório')
    })

})