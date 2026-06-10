import { test, expect } from '../../support/fixtures'
import { getUserWithLink } from '../../support/factories/user'

test.describe('POST /api/links', () => {

    const user = getUserWithLink()    
    let token
    
    test.beforeEach(async ({ auth }) => {
        await auth.createUser(user)
        token = await auth.getToken(user)
    })

    test('deve encurtar um novo link com sucesso', async ({links}) => {      
        const response = await links.createLink(user.link, token)
        expect(response.status()).toBe(201)

        const { data, message } = await response.json()
        expect(data).toHaveProperty('id')
        expect(data).toHaveProperty('original_url', user.link.original_url)
        expect(data).toHaveProperty('title', user.link.title)
        expect(data.short_code).toMatch(/^[A-Za-z0-9]{5}$/)
        expect(message).toBe('Link criado com sucesso')
    })

    test('não deve encurtar um novo link com a url original vazia', async ({links}) => {
        const response = await links.createLink({ ...user.link, original_url: ''}, token)
        expect(response.status()).toBe(400)

        const body = await response.json()
        expect(body.message).toBe('O campo \'OriginalURL\' é obrigatório')
    })

    test('não deve encurtar um novo link com titulo vazio', async ({links}) => {
        const response = await links.createLink({ ...user.link, title: ''}, token)
        expect(response.status()).toBe(400)

        const body = await response.json()
        expect(body.message).toBe('O campo \'Title\' é obrigatório')
    })

     test('não deve encurtar um novo link com url em formato inválido', async ({links}) => {
        const response = await links.createLink({ ...user.link, original_url: 'wwwyoutube.com'}, token)
        expect(response.status()).toBe(400)

        const body = await response.json()
        expect(body.message).toBe('O campo \'OriginalURL\' deve ser uma URL válida')
    })
})