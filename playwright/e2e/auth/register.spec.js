import { test, expect } from '@playwright/test'
import { getUser } from '../../support/factories/user'
import { registerService } from '../../support/services/register'

test.describe('POST - auth/register', () => {

    let register

    test.beforeEach(({ request }) => {
        register = registerService(request)

    })

    test('deve cadastrar um novo usuario', async ({ request }) => {
        const user = getUser()

        const response = await register.createUser(user)
        expect(response.status()).toBe(201)

        const responseBody = await response.json()
        expect(responseBody).toHaveProperty('message', 'Usuário cadastrado com sucesso!')
        expect(responseBody.user).toHaveProperty('id')
        expect(responseBody.user).toHaveProperty('name', user.name)
        expect(responseBody.user).toHaveProperty('email', user.email)
        expect(responseBody.user).not.toHaveProperty('password')

    })

    test('não deve cadastrar quando um email já esta em cadastrado', async ({ request }) => {
        const user = getUser()

        const preCondition = await register.createUser(user)
        expect(preCondition.status()).toBe(201)

        const response = await register.createUser(user)
        expect(response.status()).toBe(400)

        const responseBody = await response.json()
        expect(responseBody).toHaveProperty('message', 'Este e-mail já está em uso. Por favor, tente outro.')
    })

    test('não deve cadastrar com email incorreto', async ({ request }) => {
        const user = {
            name: 'Enzo Teste',
            email: 'enzo#teste.com',
            password: 'pwd123'
        }

        const response = await register.createUser(user)
        expect(response.status()).toBe(400)

        const responseBody = await response.json()
        expect(responseBody).toHaveProperty('message', "O campo 'Email' deve ser um email válido")
    })

    test('não deve cadastrar quando o nome não é informado', async ({ request }) => {
        const user = {
            email: 'enzo@teste.com',
            password: 'pwd123'
        }

        const response = await register.createUser(user)
        expect(response.status()).toBe(400)

        const responseBody = await response.json()
        expect(responseBody).toHaveProperty('message', "O campo 'Name' é obrigatório")
    })

    test('não deve cadastrar quando o email não é informado', async ({ request }) => {
        const user = {
            name: 'Enzo Teste',
            password: 'pwd123'
        }

        const response = await register.createUser(user)
        expect(response.status()).toBe(400)

        const responseBody = await response.json()
        expect(responseBody).toHaveProperty('message', "O campo 'Email' é obrigatório")
    })

    test('não deve cadastrar quando a senha não for informada', async ({ request }) => {
        const user = {
            name: 'Enzo Teste',
            email: 'enzo@teste.com',
        }

        const response = await register.createUser(user)
        expect(response.status()).toBe(400)

        const responseBody = await response.json()
        expect(responseBody).toHaveProperty('message', "O campo 'Password' é obrigatório")
    })
})