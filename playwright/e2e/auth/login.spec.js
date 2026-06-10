import { test, expect } from '@playwright/test'
import { getUser } from '../../support/factories/user'
import { authService } from '../../support/services/auth'

test.describe('POST - auth/login', () => {

    let auth

    test.beforeEach(({ request }) => {
        auth = authService(request)

    })

    test('deve fazer login com sucesso', async ({ request }) => {
        const user = getUser()
        const respCreate = await auth.createUser(user)
        expect(respCreate.status()).toBe(201)

        const response = await auth.login(user)
        expect(response.status()).toBe(200)

        const body = await response.json()
        expect(body).toHaveProperty('message', 'Login realizado com sucesso')
        expect(body.data).toHaveProperty('token')
        expect(body.data.user).toHaveProperty('id')
        expect(body.data.user).toHaveProperty('name', user.name)
        expect(body.data.user).toHaveProperty('email', user.email)

    })

    test('não deve fazer login com senha incorreta', async ({ request }) => {
        const user = getUser()
        const respCreate = await auth.createUser(user)
        expect(respCreate.status()).toBe(201)

        const response = await auth.login({...user, password: '1222222'})
        expect(response.status()).toBe(401)

        const body = await response.json()
        expect(body).toHaveProperty('message', 'Credenciais inválidas')
    })

    test('não deve fazer login com campo senha vazio', async ({ request }) => {
        const user = {
            email: 'joao@email.com',
            password: ''
        }

        const response = await auth.login(user)
        expect(response.status()).toBe(401)

        const body = await response.json()
        expect(body).toHaveProperty('message', 'O campo \'Password\' é obrigatório')
    })

    test('não deve fazer login com email incorreto', async ({ request }) => {
        const user = getUser()
        const respCreate = await auth.createUser(user)
        expect(respCreate.status()).toBe(201)

        const response = await auth.login({...user, email: 'joa2o@email.com'})
        expect(response.status()).toBe(401)

        const body = await response.json()
        expect(body).toHaveProperty('message', 'Credenciais inválidas')
    })

    test('não deve fazer login com email inválido', async ({ request }) => {
        const user = {
            email: 'joao#email.com',
            password: '123456'
        }

        const response = await auth.login(user)
        expect(response.status()).toBe(401)

        const body = await response.json()
        expect(body).toHaveProperty('message', 'O campo \'Email\' deve ser um email válido')
    })

    test('não deve fazer login com campo email vazio', async ({ request }) => {
        const user = {
            email: '',
            password: '123456'
        }

        const response = await auth.login(user)
        expect(response.status()).toBe(401)

        const body = await response.json()
        expect(body).toHaveProperty('message', 'O campo \'Email\' é obrigatório')
    })

})