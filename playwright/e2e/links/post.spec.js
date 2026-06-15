import { test, expect } from '../../support/fixtures'
import { getUserWithLink } from '../../support/factories/user'

test.describe('POST /api/links', () => {

    const user = getUserWithLink()
    let token

    test.beforeEach(async ({ auth }) => {
        await auth.createUser(user)
        token = await auth.getToken(user)
    })

    test('deve encurtar um novo link com sucesso', async ({ links }) => {
        for (const link of user.links) {
            const response = await links.createLink(link, token)
            expect(response.status()).toBe(201)

            const body = await response.json()
            expect(body.message).toBe('Link criado com sucesso')

            expect(body.data).toHaveProperty('id')
            expect(body.data).toHaveProperty('short_code')
            expect(body.data.original_url).toBe(link.original_url)
            expect(body.data.title).toBe(link.title)

            expect(body.data.short_code).toMatch(/^[a-zA-Z0-9]{5}$/)
        }
    })

    test('não deve encurtar um novo link com a url original vazia', async ({ links }) => {
        const response = await links.createLink({ ...user.link, original_url: '' }, token)
        expect(response.status()).toBe(400)

        const body = await response.json()
        expect(body.message).toBe('O campo \'OriginalURL\' é obrigatório')
    })

    test('não deve encurtar um novo link com titulo vazio', async ({ links }) => {
        for (const link of user.links) {
            const response = await links.createLink({ ...link, title: '' }, token)
            expect(response.status()).toBe(400)

            const body = await response.json()
            expect(body.message).toBe('O campo \'Title\' é obrigatório')
        }
    })

    test('não deve encurtar um novo link com url em formato inválido', async ({ links }) => {
        const response = await links.createLink({ ...user.link, original_url: 'wwwyoutube.com' }, token)
        expect(response.status()).toBe(400)

        const body = await response.json()
        expect(body.message).toBe('O campo \'OriginalURL\' deve ser uma URL válida')
    })
})
