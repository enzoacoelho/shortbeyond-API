import { test, expect } from '../../support/fixtures'
import { getUserWithLink } from '../../support/factories/user'
import { generateULID } from '../../support/utils'

test.describe('DELETE - /api/links/:id', () => {
    let token   
    const user = getUserWithLink()

    test.beforeEach( async ({ auth })=>{       
        await auth.createUser(user)
        token = await auth.getToken(user)
    })

    test('deve deletar um link com sucesso', async ({links}) => {
        const linkId = await links.createAndReturnLinkId(user.links[0], token)

        const response = await links.removeLink(linkId, token)   
        expect(response.status()).toBe(200)

        const body = await response.json()
        expect(body.message).toBe('Link excluído com sucesso')
    })

    test('não deve deletar com ID de Link inexistente', async ({ links }) => {        
        const idLink = generateULID()
        const deleteLink = await links.removeLink(idLink, token)
        expect(deleteLink.status()).toBe(404)

        const bodyDelete = await deleteLink.json()
        expect(bodyDelete).toHaveProperty('message', 'Link não encontrado')
    })

})