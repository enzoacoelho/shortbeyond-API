import { test, expect } from '../../support/fixtures'
import { getUserWithLink } from '../../support/factories/user'
import { faker } from '@faker-js/faker'

test.describe('GET /api/links', () => {
    let token

    test('deve retornar lista de links gerados pelo usuário', async ({ auth, links }) => {
        const user = getUserWithLink(5)
        await auth.createUser(user)
        token = await auth.getToken(user)

        for (const link of user.links) {
            await links.createLink(link, token)
        }

        const response = await links.getLinks(token)
        expect(response.status()).toBe(200)

        const body = await response.json()
        expect(body.message).toBe('Links Encurtados')
        expect(body.count).toBe(user.links.length)
        expect(Array.isArray(body.data)).toBeTruthy()

        for (const [index, link] of body.data.entries()) {
            expect(link).toHaveProperty('id')
            expect(link).toHaveProperty('original_url', user.links[index].original_url)
            expect(link).toHaveProperty('short_code')
            expect(link).toHaveProperty('title', user.links[index].title)

            expect(link.short_code).toMatch(/^[a-zA-Z0-9]{5}$/)
        }

    })

    test('deve retornar lista vazia quando usuario ainda não gerou links', async ({ auth, links }) => {
        const user = getUserWithLink(0)
        await auth.createUser(user)
        token = await auth.getToken(user)

        const response = await links.getLinks(token)
        expect(response.status()).toBe(200)

        const body = await response.json()
        expect(body.count).toBe(0)
        expect(body.data).toHaveLength(0)
        expect(body.message).toBe('Links Encurtados')
    })
})