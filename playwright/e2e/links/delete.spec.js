import { test, expect } from '../../support/fixtures'
import { getUserWithLink } from '../../support/factories/user'

test.describe('DELETE - /api/links/{id}', () => {
    let token   
    const user = getUserWithLink()

    test.beforeEach( async ({ auth })=>{       
        await auth.createUser(user)
        token = await auth.getToken(user)
    })

    test('deve deletar um link com sucesso', async ({links}) => {
        const createLink = await links.createLink(user.link, token)
        expect(createLink.status()).toBe(201)

        const body = await createLink.json()        
        expect(body.data).toHaveProperty('id')
        const idLink = body.data.id

        const deleteLink = await links.deleteLink(idLink, token)
        expect(deleteLink.status()).toBe(200)

        const bodyDelete = await deleteLink.json()
        expect(bodyDelete).toHaveProperty('message', 'Link excluído com sucesso')
    })

    test('não deve deletar com ID de Link inexistente', async ({ links }) => {        
        const idLink = 'AWSDF134'
        const deleteLink = await links.deleteLink(idLink, token)
        expect(deleteLink.status()).toBe(400)

        const bodyDelete = await deleteLink.json()
        expect(bodyDelete).toHaveProperty('message', 'Link não encontrado')
    })

})